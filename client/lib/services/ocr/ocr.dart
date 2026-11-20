import 'dart:math' as math;

import 'package:flutter/foundation.dart';

import 'ocr_image.dart';
import 'ocr_platform_stub.dart' if (dart.library.io) 'ocr_platform_io.dart' as platform;
import 'ocr_postprocess.dart';
import 'ocr_service.dart';

export 'ocr_image.dart' show prepareOcrTiles;

/// App entry point for on-device OCR.
///
/// The returned service prepares images (rotation, contrast, tiling) before
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
    final List<Uint8List> tiles;
    try {
      tiles = await compute(prepareOcrTiles, imageBytes);
    } on FormatException {
      throw const OcrException('无法读取这张图片，请换一张更清晰的截图或照片。');
    }
    if (tiles.isEmpty) {
      throw const OcrException('这张图片是空的，请重新选择或拍一张。');
    }

    final parts = <String>[];
    OcrResult? last;
    OcrException? firstError;
    for (final tile in tiles) {
      try {
        final result = await _inner.recognize(tile, languageTag: languageTag);
        if (result.text.trim().isNotEmpty) parts.add(result.text);
        last = result;
      } on OcrException catch (error) {
        // A blank tile (page margin, stamp area) must not abort the page.
        firstError ??= error;
      }
    }

    if (parts.isEmpty) {
      throw firstError ?? const OcrException('没有识别到文字，请调亮光线或换一张更清晰的照片。');
    }

    final text = mergeOcrTiles(parts);
    return OcrResult(
      text: text,
      lines: ocrLines(text),
      engine: engineLabel,
      languageTag: last?.languageTag ?? languageTag,
    );
  }

  @override
  Future<void> dispose() => _inner.dispose();
}

/// Joins per-tile text, dropping the lines that the 8% vertical overlap made
/// both tiles report.
String mergeOcrTiles(List<String> parts) {
  final merged = <String>[];
  for (final part in parts) {
    final lines = part
        .split('\n')
        .map((line) => line.trim())
        .where((line) => line.isNotEmpty)
        .toList();
    if (lines.isEmpty) continue;

    var skip = 0;
    final maxCompare = math.min(12, math.min(merged.length, lines.length));
    for (var count = maxCompare; count > 0; count--) {
      var same = true;
      for (var i = 0; i < count; i++) {
        if (_lineKey(merged[merged.length - count + i]) != _lineKey(lines[i])) {
          same = false;
          break;
        }
      }
      if (same) {
        skip = count;
        break;
      }
    }
    merged.addAll(lines.skip(skip));
  }
  return merged.join('\n');
}

String _lineKey(String line) => line.replaceAll(RegExp(r'\s'), '');
