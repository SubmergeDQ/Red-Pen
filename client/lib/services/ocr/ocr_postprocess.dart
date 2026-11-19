import 'dart:math' as math;

/// One word-level OCR box. Coordinates are in image pixels, origin top-left.
class OcrWord {
  const OcrWord({
    required this.text,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
  });

  final String text;
  final double x;
  final double y;
  final double width;
  final double height;

  double get centerY => y + height / 2;
  double get right => x + width;
}

class _Line {
  _Line(this.centerY);
  double centerY;
  final List<OcrWord> words = [];

  void add(OcrWord word) {
    centerY = (centerY * words.length + word.centerY) / (words.length + 1);
    words.add(word);
  }
}

bool _isLatinAt(String text, {required bool last}) {
  if (text.isEmpty) return false;
  final ch = last ? text[text.length - 1] : text[0];
  return RegExp(r'[A-Za-z0-9]').hasMatch(ch);
}

/// Rebuilds reading order from word boxes. Windows OCR returns lines in an
/// unstable order and pads Chinese words with spaces, so we cluster by
/// vertical centre and join with CJK-aware spacing.
String rebuildOcrText(List<OcrWord> words) {
  final items = words.where((w) => w.text.trim().isNotEmpty).toList();
  if (items.isEmpty) return '';

  final heights = items.map((w) => w.height).where((h) => h > 0).toList()
    ..sort();
  final medianHeight = heights.isEmpty ? 12.0 : heights[heights.length ~/ 2];

  items.sort((a, b) {
    final byY = a.centerY.compareTo(b.centerY);
    return byY != 0 ? byY : a.x.compareTo(b.x);
  });

  final lines = <_Line>[];
  for (final word in items) {
    _Line? best;
    var bestDistance = double.infinity;
    for (final line in lines.reversed.take(3)) {
      final distance = (word.centerY - line.centerY).abs();
      final tolerance = math.max(word.height, medianHeight) * 0.6;
      if (distance <= tolerance && distance < bestDistance) {
        best = line;
        bestDistance = distance;
      }
    }
    if (best == null) {
      lines.add(_Line(word.centerY)..add(word));
    } else {
      best.add(word);
    }
  }

  lines.sort((a, b) => a.centerY.compareTo(b.centerY));
  final buffer = StringBuffer();
  for (final line in lines) {
    line.words.sort((a, b) => a.x.compareTo(b.x));
    OcrWord? previous;
    for (final word in line.words) {
      if (previous != null) {
        final gap = word.x - previous.right;
        final needsSpace = gap > medianHeight * 0.35 &&
            _isLatinAt(previous.text, last: true) &&
            _isLatinAt(word.text, last: false);
        if (needsSpace) buffer.write(' ');
      }
      buffer.write(word.text);
      previous = word;
    }
    buffer.write('\n');
  }
  return buffer.toString();
}

final _spacesBesideCjk =
    RegExp(r'(?<=[\u2E80-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF])[ \t]+|[ \t]+(?=[\u2E80-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF])');
final _spacesInsideNumber = RegExp(r'(?<=\d)[ \t]+(?=[\d])');
final _brokenHeading = RegExp(r'^(?<!第)([一二三四五六七八九十百]+)条');

/// Normalizes OCR output without touching digits or punctuation: OCR inserts
/// spaces between every Chinese glyph, which breaks rule matching.
///
/// Digital PDF extraction often has the same glyph-spacing artifact, so the
/// PDF parser reuses this with [repairHeadings] off.
String normalizeOcrText(String raw, {bool repairHeadings = true}) {
  final normalized = raw
      .replaceAll('\r\n', '\n')
      .replaceAll('\r', '\n')
      .replaceAll('\u00A0', ' ')
      .replaceAll('\u200B', '');

  final out = <String>[];
  for (final rawLine in normalized.split('\n')) {
    var line = rawLine.trim().replaceAll(RegExp(r'[ \t]+'), ' ');
    line = line.replaceAll(_spacesBesideCjk, '');
    line = line.replaceAll(_spacesInsideNumber, '');
    if (repairHeadings) {
      line = line.replaceAllMapped(_brokenHeading, (m) => '第${m[1]}条');
    }
    if (line.isEmpty) {
      out.add('');
    } else if (RegExp(r'[A-Za-z0-9\u4e00-\u9fff]').hasMatch(line)) {
      out.add(line);
    }
  }

  final text = out.join('\n');
  return text.replaceAll(RegExp(r'\n{3,}'), '\n\n').trim();
}

/// Splits normalized text into display lines, dropping empty ones.
List<String> ocrLines(String text) => text
    .split('\n')
    .map((line) => line.trim())
    .where((line) => line.isNotEmpty)
    .toList();