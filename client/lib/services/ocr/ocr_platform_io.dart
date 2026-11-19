import 'dart:io';

import 'ocr_android.dart';
import 'ocr_service.dart';
import 'ocr_unavailable.dart';
import 'ocr_windows.dart';

OcrService createPlatformOcrService() {
  if (Platform.isAndroid) return MlKitOcrService();
  if (Platform.isWindows) return WindowsOcrService();
  return const UnavailableOcrService('当前平台暂不支持本机 OCR，请在 Android 或 Windows 客户端中使用。');
}