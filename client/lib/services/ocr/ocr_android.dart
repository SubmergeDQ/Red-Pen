import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';
import 'package:image/image.dart' as img;
import 'package:path_provider/path_provider.dart';

import 'ocr_postprocess.dart';
import 'ocr_service.dart';

/// Android OCR through the bundled ML Kit Chinese model.
///
/// ML Kit takes either a file URI or raw pixels. The file route throws a
/// platform-side null pointer when the path or the decoded bitmap handed to it
/// is unusable, and that error surfaces as
/// `Attempt to invoke virtual method 'java.lang.Class java.lang.Object.getClass()'
/// on a null object reference`. So the default route here is raw RGBA pixels,
/// which we always own and can validate, with the file route kept only as a
/// second attempt.
class MlKitOcrService implements OcrService {
  @override
  String get engineLabel => 'ML Kit 中文离线模型';

  @override
  Future<OcrCapability> probe() async => const OcrCapability(
        available: true,
        detail: 'Google ML Kit 中文模型，离线运行，图片不会离开设备。',
      );

  @override
  Future<OcrResult> recognize(
    Uint8List imageBytes, {
    String languageTag = 'zh-Hans',
  }) async {
    if (imageBytes.isEmpty) {
      throw const OcrException('这张图片是空的，请重新选择或拍一张。');
    }

    final payload = await compute(_decodeForMlKit, imageBytes);
    if (payload == null) {
      throw const OcrException('无法读取这张图片，请换一张更清晰的截图或照片。');
    }

    final width = payload['width'] as int;
    final height = payload['height'] as int;
    final pixels = payload['pixels'] as Uint8List;
    if (width <= 0 || height <= 0 || pixels.length != width * height * 4) {
      throw const OcrException('这张图片的尺寸异常，请换一张再试。');
    }

    RecognizedText? recognized;
    PlatformException? failure;

    for (var attempt = 0; attempt < 2 && recognized == null; attempt++) {
      final recognizer = TextRecognizer(script: TextRecognitionScript.chinese);
      try {
        final input = attempt == 0
            ? InputImage.fromBitmap(bitmap: pixels, width: width, height: height)
            : await _fileInput(pixels, width, height);
        if (input == null) break;
        recognized = await recognizer.processImage(input);
      } on PlatformException catch (error) {
        failure = error;
        debugPrint('[ocr] ml kit attempt ${attempt + 1} failed: '
            '${error.code} ${error.message}');
      } on Object catch (error) {
        debugPrint('[ocr] ml kit attempt ${attempt + 1} threw: $error');
      } finally {
        try {
          await recognizer.close();
        } on Object {
          // Closing a recognizer that never initialized must not mask the
          // original error.
        }
      }
    }

    if (recognized == null) {
      final detail = failure?.code == 'TextRecognizerError'
          ? '本机识别模型没有准备好'
          : '本机识别没有完成';
      throw OcrException('$detail。请重试一次；如果仍然失败，改用「导入文件」。');
    }

    final lines = <String>[
      for (final block in recognized.blocks)
        for (final line in block.lines) line.text,
    ];
    final raw = lines.isEmpty ? recognized.text : lines.join('\n');
    final text = normalizeOcrText(raw);
    if (text.isEmpty) {
      throw const OcrException('没有识别到文字，请调亮光线或换一张更清晰的照片。');
    }
    return OcrResult(
      text: text,
      lines: ocrLines(text),
      engine: engineLabel,
      languageTag: 'zh-Hans',
    );
  }

  /// Second route: re-encode the pixels and hand ML Kit a file path.
  Future<InputImage?> _fileInput(Uint8List pixels, int width, int height) async {
    try {
      final dir = await getTemporaryDirectory();
      final stamp = DateTime.now().microsecondsSinceEpoch;
      final file = File('${dir.path}${Platform.pathSeparator}red_pen_ocr_$stamp.png');
      final encoded = await compute(_encodePng, {
        'width': width,
        'height': height,
        'pixels': pixels,
      });
      if (encoded == null) return null;
      await file.writeAsBytes(encoded, flush: true);
      if (!await file.exists() || await file.length() == 0) return null;
      final input = InputImage.fromFilePath(file.absolute.path);
      return input;
    } on Object catch (error) {
      debugPrint('[ocr] file fallback failed: $error');
      return null;
    }
  }

  @override
  Future<void> dispose() async {}
}

/// Decodes to straight RGBA on a worker isolate and caps the long side, so the
/// platform channel never carries more than ~10 MB.
Map<String, Object>? _decodeForMlKit(Uint8List bytes) {
  final decoded = img.decodeImage(bytes);
  if (decoded == null) return null;
  var image = img.bakeOrientation(decoded);
  const maxSide = 1600;
  final longSide = image.width > image.height ? image.width : image.height;
  if (longSide > maxSide) {
    final scale = maxSide / longSide;
    image = img.copyResize(
      image,
      width: (image.width * scale).round(),
      height: (image.height * scale).round(),
      interpolation: img.Interpolation.average,
    );
  }
  return {
    'width': image.width,
    'height': image.height,
    'pixels': image.getBytes(order: img.ChannelOrder.rgba),
  };
}

Uint8List? _encodePng(Map<String, Object> data) {
  final width = data['width'] as int;
  final height = data['height'] as int;
  final pixels = data['pixels'] as Uint8List;
  final image = img.Image.fromBytes(
    width: width,
    height: height,
    bytes: pixels.buffer,
    order: img.ChannelOrder.rgba,
  );
  return Uint8List.fromList(img.encodePng(image, level: 4));
}
