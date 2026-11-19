import 'dart:convert';
import 'dart:io';

import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';

import 'ocr_postprocess.dart';
import 'ocr_service.dart';

class WindowsOcrService implements OcrService {
  String? _scriptPath;

  @override
  String get engineLabel => 'Windows 本机 OCR';

  Future<String> _script() async {
    final cached = _scriptPath;
    if (cached != null && File(cached).existsSync()) return cached;
    final dir = await getTemporaryDirectory();
    final file = File('${dir.path}${Platform.pathSeparator}red_pen_ocr.ps1');
    final source = await rootBundle.loadString('assets/ocr/win_ocr.ps1');
    await file.writeAsString(source, flush: true);
    _scriptPath = file.path;
    return file.path;
  }

  Future<Map<String, dynamic>> _run(List<String> args) async {
    final script = await _script();
    final result = await Process.run(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script, ...args],
      stdoutEncoding: const Utf8Codec(allowMalformed: true),
      stderrEncoding: const Utf8Codec(allowMalformed: true),
    );
    final stdout = result.stdout as String;
    final start = stdout.indexOf('{');
    final end = stdout.lastIndexOf('}');
    if (start < 0 || end <= start) {
      throw OcrException('Windows OCR 没有返回结果，请确认系统 PowerShell 可用。');
    }
    final payload = jsonDecode(stdout.substring(start, end + 1));
    if (payload is! Map<String, dynamic>) {
      throw const OcrException('Windows OCR 返回了无法识别的结果。');
    }
    return payload;
  }

  @override
  Future<OcrCapability> probe() async {
    try {
      final payload = await _run(['-ListLanguages']);
      final languages = (payload['languages'] as List?)?.cast<String>() ?? const [];
      final hasChinese = languages.any((tag) => tag.toLowerCase().startsWith('zh'));
      return OcrCapability(
        available: hasChinese,
        detail: hasChinese
            ? 'Windows 本机识别：${languages.join(' / ')}'
            : '系统未安装中文 OCR 语言包，请在“设置 → 时间和语言 → 语言”中添加中文。',
      );
    } on OcrException catch (e) {
      return OcrCapability(available: false, detail: e.message);
    } on ProcessException {
      return const OcrCapability(
        available: false,
        detail: '未找到 Windows PowerShell，无法启用本机 OCR。',
      );
    }
  }

  @override
  Future<OcrResult> recognize(
    Uint8List imageBytes, {
    String languageTag = 'zh-Hans-CN',
  }) async {
    final dir = await getTemporaryDirectory();
    final stamp = DateTime.now().microsecondsSinceEpoch;
    final image = File('${dir.path}${Platform.pathSeparator}red_pen_ocr_$stamp.png');
    await image.writeAsBytes(imageBytes, flush: true);
    try {
      final payload = await _run([
        '-Path',
        image.path,
        '-Language',
        languageTag.isEmpty ? 'zh-Hans-CN' : languageTag,
      ]);
      if (payload['ok'] != true) {
        if (payload['code'] == 'no_language') {
          throw const OcrException(
            'Windows 没有中文 OCR 语言包。请在“设置 → 时间和语言 → 语言”中添加中文(简体)，再重试。',
          );
        }
        throw OcrException('Windows OCR 失败：${payload['error'] ?? '未知错误'}');
      }
      final words = <OcrWord>[];
      for (final raw in (payload['words'] as List?) ?? const []) {
        if (raw is! Map) continue;
        final text = raw['t']?.toString() ?? '';
        if (text.isEmpty) continue;
        words.add(OcrWord(
          text: text,
          x: (raw['x'] as num?)?.toDouble() ?? 0,
          y: (raw['y'] as num?)?.toDouble() ?? 0,
          width: (raw['w'] as num?)?.toDouble() ?? 0,
          height: (raw['h'] as num?)?.toDouble() ?? 0,
        ));
      }
      final rawText = words.isEmpty
          ? ((payload['lines'] as List?) ?? const []).join('\n')
          : rebuildOcrText(words);
      final text = normalizeOcrText(rawText);
      if (text.isEmpty) {
        throw const OcrException('没有识别到文字，请调亮光线或换一张更清晰的照片。');
      }
      return OcrResult(
        text: text,
        lines: ocrLines(text),
        engine: engineLabel,
        languageTag: payload['language']?.toString() ?? 'zh-Hans-CN',
      );
    } finally {
      if (await image.exists()) {
        await image.delete();
      }
    }
  }

  @override
  Future<void> dispose() async {}
}