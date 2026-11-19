import 'dart:typed_data';

import 'ocr_service.dart';

class UnavailableOcrService implements OcrService {
  const UnavailableOcrService(this.reason);

  final String reason;

  @override
  String get engineLabel => '本机 OCR 不可用';

  @override
  Future<OcrCapability> probe() async => OcrCapability(available: false, detail: reason);

  @override
  Future<OcrResult> recognize(Uint8List imageBytes, {String languageTag = 'zh-Hans'}) async {
    throw OcrException(reason);
  }

  @override
  Future<void> dispose() async {}
}