import 'dart:typed_data';

import 'ocr_service.dart';

/// Reserved seam for an optional cloud OCR vendor.
///
/// 红笔 never uploads a contract by itself. A future build can inject a
/// [CloudOcrProvider] only after the user opts in and supplies their own
/// vendor credentials; the UI must show a clear "图片将上传" warning first.
class CloudOcrConfig {
  const CloudOcrConfig({
    required this.endpoint,
    required this.apiKey,
    this.enabled = false,
  });

  const CloudOcrConfig.disabled()
      : endpoint = null,
        apiKey = null,
        enabled = false;

  final Uri? endpoint;
  final String? apiKey;
  final bool enabled;

  bool get isReady => enabled && endpoint != null && apiKey != null;
}

abstract class CloudOcrProvider {
  String get vendor;

  Future<OcrResult> recognize(Uint8List imageBytes, {String languageTag = 'zh-Hans'});
}

class CloudOcrNotConfigured implements Exception {
  const CloudOcrNotConfigured();

  @override
  String toString() => '云端 OCR 未配置。红笔默认只在本机识别，合同内容不会上传。';
}