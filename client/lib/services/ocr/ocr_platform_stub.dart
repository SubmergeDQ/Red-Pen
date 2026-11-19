import 'ocr_service.dart';
import 'ocr_unavailable.dart';

OcrService createPlatformOcrService() => const UnavailableOcrService(
      '网页预览版不提供本机 OCR；请在 Windows 或 Android 客户端识别图片文字。',
    );