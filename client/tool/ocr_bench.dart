import 'dart:convert';
import 'dart:io';
import 'dart:math' as math;
import 'dart:typed_data';

import 'package:image/image.dart' as img;
import 'package:red_pen/services/ocr/ocr_image.dart';
import 'package:red_pen/services/ocr/ocr_postprocess.dart';

/// Measures OCR accuracy on a real page with the Windows engine.
///
/// `dart run tool/ocr_bench.dart <image> [--old] [--ground-truth <txt>]`
///
/// `--old` reproduces the previous preparation (single image, long side capped
/// at 2400, PNG) so the two pipelines can be compared on the same engine.
Future<void> main(List<String> args) async {
  if (args.isEmpty) {
    stderr.writeln('usage: dart run tool/ocr_bench.dart <image> [--old] [--ground-truth <txt>]');
    exit(64);
  }

  final imagePath = args.first;
  final oldMode = args.contains('--old');
  final gtIndex = args.indexOf('--ground-truth');
  final gtPath = gtIndex >= 0 && gtIndex + 1 < args.length ? args[gtIndex + 1] : null;

  final bytes = File(imagePath).readAsBytesSync();
  final tiles = oldMode ? _prepareOld(bytes) : prepareOcrTiles(bytes);
  final workDir = Directory('${Directory.systemTemp.path}/red_pen_bench');
  if (workDir.existsSync()) workDir.deleteSync(recursive: true);
  workDir.createSync(recursive: true);

  final parts = <String>[];
  final stopwatch = Stopwatch()..start();
  for (var i = 0; i < tiles.length; i++) {
    final tilePath = '${workDir.path}/tile_$i.jpg';
    File(tilePath).writeAsBytesSync(tiles[i]);
    final words = await _runWindowsOcr(tilePath);
    final raw = rebuildOcrText(words);
    final text = normalizeOcrText(raw);
    if (text.trim().isNotEmpty) parts.add(text);
    stdout.writeln('tile ${i + 1}/${tiles.length}: ${words.length} words, ${tiles[i].length ~/ 1024} KB');
  }
  stopwatch.stop();

  final merged = _merge(parts);
  File('${workDir.path}/result.txt').writeAsStringSync(merged);
  stdout.writeln('elapsed: ${stopwatch.elapsedMilliseconds} ms');
  stdout.writeln('result: ${workDir.path}/result.txt (${merged.length} chars)');
  stdout.writeln('--- first 220 chars ---');
  stdout.writeln(merged.substring(0, math.min(220, merged.length)));

  if (gtPath != null) {
    final gt = File(gtPath).readAsStringSync();
    final report = _cer(gt, merged);
    stdout.writeln('--- accuracy ---');
    stdout.writeln('ground truth chars: ${report.gtLength}');
    stdout.writeln('compared chars: ${report.compared}');
    stdout.writeln('edits: ${report.edits}');
    stdout.writeln('CER: ${(report.cer * 100).toStringAsFixed(2)}%');
    stdout.writeln('accuracy: ${((1 - report.cer) * 100).toStringAsFixed(2)}%');
  }
}

List<Uint8List> _prepareOld(Uint8List bytes) {
  final decoded = img.decodeImage(bytes);
  if (decoded == null) throw const FormatException('decode failed');
  var image = img.bakeOrientation(decoded);
  const maxSide = 2400;
  final longSide = math.max(image.width, image.height);
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
  return [
    Uint8List.fromList(
      isJpeg ? img.encodeJpg(image, quality: 95) : img.encodePng(image, level: 4),
    ),
  ];
}

Future<List<OcrWord>> _runWindowsOcr(String path) async {
  final result = await Process.run(
    'powershell.exe',
    [
      '-NoProfile',
      '-NonInteractive',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      'assets/ocr/win_ocr.ps1',
      '-Path',
      path,
      '-Language',
      'zh-Hans-CN',
    ],
    stdoutEncoding: const Utf8Codec(allowMalformed: true),
    stderrEncoding: const Utf8Codec(allowMalformed: true),
  );
  final output = result.stdout as String;
  final start = output.indexOf('{');
  final end = output.lastIndexOf('}');
  if (start < 0 || end <= start) {
    throw StateError('OCR returned no JSON: ${result.stderr}');
  }
  final payload = jsonDecode(output.substring(start, end + 1)) as Map<String, dynamic>;
  if (payload['ok'] != true) throw StateError('OCR failed: ${payload['error']}');
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
  return words;
}

String _merge(List<String> parts) {
  final merged = <String>[];
  for (final part in parts) {
    final lines = part.split('\n').map((l) => l.trim()).where((l) => l.isNotEmpty).toList();
    var skip = 0;
    final maxCompare = math.min(12, math.min(merged.length, lines.length));
    for (var count = maxCompare; count > 0; count--) {
      var same = true;
      for (var i = 0; i < count; i++) {
        if (_key(merged[merged.length - count + i]) != _key(lines[i])) {
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

String _key(String line) => line.replaceAll(RegExp(r'\s'), '');

String _normalizeForCompare(String text) =>
    text.replaceAll(RegExp(r'[\s_]'), '').replaceAll('　', '');

({int gtLength, int compared, int edits, double cer}) _cer(String gt, String output) {
  final expected = _normalizeForCompare(gt);
  final actual = _normalizeForCompare(output);
  final compared = math.min(expected.length, actual.length);
  final edits = _levenshtein(expected, actual.substring(0, compared));
  return (
    gtLength: expected.length,
    compared: compared,
    edits: edits,
    cer: expected.isEmpty ? 0 : edits / expected.length,
  );
}

int _levenshtein(String a, String b) {
  if (a.isEmpty) return b.length;
  if (b.isEmpty) return a.length;
  var previous = List<int>.generate(b.length + 1, (i) => i);
  var current = List<int>.filled(b.length + 1, 0);
  for (var i = 1; i <= a.length; i++) {
    current[0] = i;
    for (var j = 1; j <= b.length; j++) {
      final cost = a.codeUnitAt(i - 1) == b.codeUnitAt(j - 1) ? 0 : 1;
      current[j] = math.min(
        math.min(current[j - 1] + 1, previous[j] + 1),
        previous[j - 1] + cost,
      );
    }
    final swap = previous;
    previous = current;
    current = swap;
  }
  return previous[b.length];
}
