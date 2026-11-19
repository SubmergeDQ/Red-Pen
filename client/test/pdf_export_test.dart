import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:red_pen/engine/engine.dart';
import 'package:red_pen/services/pdf_export.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('builds a PDF report with every finding', () async {
    for (final sample in samples) {
      final analysis = analyzeContract(sample.text);
      final bytes = await PdfExporter.build(analysis, sourceName: '示例 · ${sample.name}');

      expect(String.fromCharCodes(bytes.take(5)), '%PDF-', reason: sample.id);
      expect(bytes.length, greaterThan(30000), reason: sample.id);
      expect(PdfExporter.fileName(analysis), endsWith('.pdf'));

      final dir = Directory('build/pdf')..createSync(recursive: true);
      File('${dir.path}/${sample.id}.pdf').writeAsBytesSync(bytes);
    }
  });
}
