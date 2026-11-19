import 'dart:typed_data';

class OcrResult {
  const OcrResult({
    required this.text,
    required this.lines,
    required this.engine,
    required this.languageTag,
  });

  final String text;
  final List<String> lines;
  final String engine;
  final String languageTag;
}

class OcrCapability {
  const OcrCapability({required this.available, required this.detail});

  final bool available;
  final String detail;
}

class OcrException implements Exception {
  const OcrException(this.message);

  final String message;

  @override
  String toString() => message;
}

/// On-device OCR contract. Implementations must never upload the image.
abstract class OcrService {
  String get engineLabel;

  Future<OcrCapability> probe();

  Future<OcrResult> recognize(Uint8List imageBytes, {String languageTag});

  Future<void> dispose();
}