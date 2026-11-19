import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:charset/charset.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:red_pen/services/document_parser.dart';

void main() {
  group('txt', () {
    test('reads UTF-8 with BOM', () async {
      final bytes = <int>[0xEF, 0xBB, 0xBF, ...utf8.encode('劳动合同\n第一条 试用期')];
      final doc = await parseDocument(
        fileName: 'a.txt',
        bytes: Uint8List.fromList(bytes),
      );
      expect(doc.kind, DocumentKind.txt);
      expect(doc.text, '劳动合同\n第一条 试用期');
    });

    test('falls back to GBK for legacy Chinese text', () async {
      final bytes = gbk.encode('劳动合同\n试用期 6 个月');
      final doc = await parseDocument(
        fileName: 'b.TXT',
        bytes: Uint8List.fromList(bytes),
      );
      expect(doc.text, contains('试用期'));
    });

    test('rejects an empty text file', () async {
      expect(
        () => parseDocument(fileName: 'empty.txt', bytes: Uint8List(0)),
        throwsA(isA<DocumentParseException>()),
      );
    });
  });

  group('docx', () {
    test('extracts paragraphs from word/document.xml', () async {
      final bytes = File('test/fixtures/sample-labor-contract.docx').readAsBytesSync();
      final doc = await parseDocument(fileName: 'sample-labor-contract.docx', bytes: bytes);
      expect(doc.kind, DocumentKind.docx);
      expect(doc.text, contains('第四条 劳动报酬'));
      expect(doc.text, contains('乙方试用期工资为每月4800元'));
      expect(doc.text, contains('第六条 离职与违约金'));
      expect(doc.charCount, greaterThan(300));
    });

    test('rejects a legacy .doc with instructions', () async {
      expect(
        () => parseDocument(fileName: 'old.doc', bytes: Uint8List.fromList(const [1, 2, 3])),
        throwsA(isA<DocumentParseException>().having(
          (e) => e.message,
          'message',
          contains('另存为'),
        )),
      );
    });

    test('rejects unknown extensions', () async {
      expect(
        () => parseDocument(fileName: 'scan.rtf', bytes: Uint8List.fromList(const [1])),
        throwsA(isA<DocumentParseException>()),
      );
    });
  });
}