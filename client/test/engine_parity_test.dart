import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:red_pen/engine/engine.dart';

Map<String, dynamic> _findingMap(Finding f) => {
      'id': f.id,
      'seq': f.seq,
      'ruleId': f.ruleId,
      'verdict': f.verdict.name,
      'ruleName': f.ruleName,
      'short': f.short,
      'clauseIndex': f.clauseIndex,
      'location': f.location,
      'quote': f.quote,
      'consequence': f.consequence,
      'ask': f.ask,
      'counter': f.counter,
      'confidence': f.confidence,
      'loss': f.loss,
      'basis': f.basis == null
          ? null
          : {'law': f.basis!.law, 'article': f.basis!.article, 'text': f.basis!.text},
      'range': f.range == null
          ? null
          : {
              'quote': f.range!.quote,
              'raw': f.range!.raw,
              'start': f.range!.start,
              'end': f.range!.end,
              'headingOnly': f.range!.headingOnly,
            },
    };

Map<String, dynamic> _expectedFinding(Map<String, dynamic> e) => {
      'id': e['id'],
      'seq': e['seq'],
      'ruleId': e['ruleId'],
      'verdict': e['verdict'],
      'ruleName': e['ruleName'],
      'short': e['short'],
      'clauseIndex': e['clauseIndex'],
      'location': e['location'],
      'quote': e['quote'],
      'consequence': e['consequence'],
      'ask': e['ask'],
      'counter': e['counter'],
      'confidence': e['confidence'],
      'loss': (e['loss'] as num?)?.toDouble() ?? 0.0,
      'basis': e['basis'],
      'range': e['range'] == null
          ? null
          : {
              'quote': e['range']['quote'],
              'raw': e['range']['raw'],
              'start': e['range']['start'],
              'end': e['range']['end'],
              'headingOnly': e['range']['headingOnly'] ?? false,
            },
    };

Map<String, dynamic> _clauseMap(Clause c) => {
      'kind': c.kind,
      'heading': c.heading,
      'body': c.body,
      'text': c.text,
      'start': c.start,
      'end': c.end,
      'numbered': c.numbered,
      'index': c.index,
    };

void main() {
  final raw = File('test/golden/golden.json').readAsStringSync();
  final cases = (jsonDecode(raw) as List).cast<Map<String, dynamic>>();

  for (final c in cases) {
    test('golden · ${c['name']}', () {
      final analysis = analyzeContract(
        c['text'] as String,
        docType: c['docType'] as String?,
      );
      final g = c['analysis'] as Map<String, dynamic>;
      final where = c['name'];

      expect(analysis.docKey, g['docKey'], reason: '$where docKey');
      expect(analysis.docType, g['docType'], reason: '$where docType');
      expect(analysis.detectedDocKey, g['detectedDocKey'], reason: '$where detectedDocKey');
      expect(analysis.detectedDocType, g['detectedDocType'], reason: '$where detectedDocType');
      expect(analysis.forced, g['forced'], reason: '$where forced');
      expect(analysis.packs, g['packs'], reason: '$where packs');
      expect(analysis.packLabels, g['packLabels'], reason: '$where packLabels');
      expect(analysis.extraPackLabels, g['extraPackLabels'], reason: '$where extraPackLabels');
      expect(analysis.title, g['title'], reason: '$where title');
      expect(analysis.numberedCount, g['numberedCount'], reason: '$where numberedCount');
      expect(analysis.clauseCount, g['clauseCount'], reason: '$where clauseCount');
      expect(analysis.charCount, g['charCount'], reason: '$where charCount');
      expect(analysis.pending, g['pending'], reason: '$where pending');
      // oneLiner 是覆盖口径文案，会随两端规则快照不同而变化；判定结构仍需逐项一致。
      expect(analysis.topVerdict.name, g['topVerdict'], reason: '$where topVerdict');
      expect(analysis.insufficient, g['insufficient'], reason: '$where insufficient');

      final gCounts = g['counts'] as Map<String, dynamic>;
      expect(
        {
          'red': analysis.countOf(Verdict.red),
          'yellow': analysis.countOf(Verdict.yellow),
          'gray': analysis.countOf(Verdict.gray),
          'green': analysis.countOf(Verdict.green),
        },
        gCounts,
        reason: '$where counts',
      );

      final gClauses = (g['clauses'] as List).cast<Map<String, dynamic>>();
      expect(analysis.clauses.map(_clauseMap).toList(), gClauses, reason: '$where clauses');

      final gItems = (g['items'] as List).cast<Map<String, dynamic>>();
      expect(analysis.items.map(_findingMap).toList(), gItems.map(_expectedFinding).toList(),
          reason: '$where items');
    });
  }
}