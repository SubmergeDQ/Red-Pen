
import 'package:flutter/foundation.dart';
import 'package:image/image.dart' as img;

import 'ocr_platform_stub.dart' if (dart.library.io) 'ocr_platform_io.dart' as platform;
import 'ocr_service.dart';

/// App entry point for on-device OCR.
///
/// The returned service prepares images (EXIF rotation, downscale) before
/// handing them to the platform engine, and never performs network calls.
OcrService createOcrService() => PreprocessedOcrService(platform.createPlatformOcrService());

class PreprocessedOcrService implements OcrService {
  PreprocessedOcrService(this._inner);

  final OcrService _inner;

  @override
  String get engineLabel => _inner.engineLabel;

  @override
  Future<OcrCapability> probe() => _inner.probe();

  @override
  Future<OcrResult> recognize(
    Uint8List imageBytes, {
    String languageTag = 'zh-Hans',
  }) async {
    final prepared = await compute(prepareOcrImage, imageBytes);
    return _inner.recognize(prepared, languageTag: languageTag);
  }

  @override
  Future<void> dispose() => _inner.dispose();
}

/// Bakes EXIF orientation, caps the long side and re-encodes so every OCR
/// backend receives pixels in a known orientation and resolution.
Uint8List prepareOcrImage(Uint8List bytes) {
  final decoded = img.decodeImage(bytes);
  if (decoded == null) {
    throw const OcrException('无法读取这张图片，请换一张更清晰的截图或照片。');
  }
  var image = img.bakeOrientation(decoded);
  const maxSide = 2400;
  final longSide = image.width > image.height ? image.width : image.height;
  if (longSide > maxSide) {
    final scale = maxSide / longSide;
    image = img.copyResize(
      image,
      width: (image.width * scale).round(),
      height: (image.height * scale).round(),
      interpolation: img.Interpolation.linear,
    );
  }
  final isJpeg = bytes.length > 2 && bytes[0] == 0xFF && bytes[1] == 0xD8;
  final encoded = isJpeg ? img.encodeJpg(image, quality: 95) : img.encodePng(image, level: 4);
  return Uint8List.fromList(encoded);
}