import 'dart:io';

import 'package:flutter/services.dart';
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';
import 'package:path_provider/path_provider.dart';

import 'ocr_postprocess.dart';
import 'ocr_service.dart';

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
    final dir = await getTemporaryDirectory();
    final stamp = DateTime.now().microsecondsSinceEpoch;
    final file = File('${dir.path}${Platform.pathSeparator}red_pen_ocr_$stamp.png');
    await file.writeAsBytes(imageBytes, flush: true);
    final recognizer = TextRecognizer(script: TextRecognitionScript.chinese);
    try {
      final input = InputImage.fromFilePath(file.path);
      final recognized = await recognizer.processImage(input);
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
    } on PlatformException catch (e) {
      throw OcrException('ML Kit 识别失败：${e.message ?? e.code}');
    } finally {
      await recognizer.close();
      if (await file.exists()) {
        await file.delete();
      }
    }
  }

  @override
  Future<void> dispose() async {}
}