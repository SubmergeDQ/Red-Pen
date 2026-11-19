import 'dart:convert';
import 'dart:io';

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

String _diff(String where, Object? actual, Object? expected) {
  final a = const JsonEncoder.withIndent('  ').convert(actual);
  final e = const JsonEncoder.withIndent('  ').convert(expected);
  if (a == e) return '';
  final aLines = a.split('\n');
  final eLines = e.split('\n');
  final out = StringBuffer('✗ $where\n');
  final max = aLines.length > eLines.length ? aLines.length : eLines.length;
  var shown = 0;
  for (var i = 0; i < max && shown < 12; i++) {
    final al = i < aLines.length ? aLines[i] : '<missing>';
    final el = i < eLines.length ? eLines[i] : '<missing>';
    if (al != el) {
      out.writeln('  line ${i + 1}:');
      out.writeln('    dart: $al');
      out.writeln('    js:   $el');
      shown++;
    }
  }
  return out.toString();
}

void main() {
  final file = File('test/golden/golden.json');
  final cases = (jsonDecode(file.readAsStringSync()) as List).cast<Map<String, dynamic>>();
  var failures = 0;
  for (final c in cases) {
    final where = c['name'] as String;
    final analysis = analyzeContract(c['text'] as String, docType: c['docType'] as String?);
    final g = c['analysis'] as Map<String, dynamic>;
    final diffs = <String>[];
    void check(String label, Object? actual, Object? expected) {
      final d = _diff('$where · $label', actual, expected);
      if (d.isNotEmpty) diffs.add(d);
    }

    check('docKey', analysis.docKey, g['docKey']);
    check('docType', analysis.docType, g['docType']);
    check('detectedDocKey', analysis.detectedDocKey, g['detectedDocKey']);
    check('detectedDocType', analysis.detectedDocType, g['detectedDocType']);
    check('forced', analysis.forced, g['forced']);
    check('packs', analysis.packs, g['packs']);
    check('packLabels', analysis.packLabels, g['packLabels']);
    check('extraPackLabels', analysis.extraPackLabels, g['extraPackLabels']);
    check('title', analysis.title, g['title']);
    check('numberedCount', analysis.numberedCount, g['numberedCount']);
    check('clauseCount', analysis.clauseCount, g['clauseCount']);
    check('charCount', analysis.charCount, g['charCount']);
    check('pending', analysis.pending, g['pending']);
    check('oneLiner', analysis.oneLiner, g['oneLiner']);
    check('topVerdict', analysis.topVerdict.name, g['topVerdict']);
    check('insufficient', analysis.insufficient, g['insufficient']);
    check('counts', {
      'red': analysis.countOf(Verdict.red),
      'yellow': analysis.countOf(Verdict.yellow),
      'gray': analysis.countOf(Verdict.gray),
      'green': analysis.countOf(Verdict.green),
    }, g['counts']);
    check('clauses', analysis.clauses.map(_clauseMap).toList(), g['clauses']);
    final gItems = (g['items'] as List).cast<Map<String, dynamic>>();
    check('items', analysis.items.map(_findingMap).toList(), gItems.map(_expectedFinding).toList());

    if (diffs.isEmpty) {
      stdout.writeln('✓ $where');
    } else {
      failures++;
      stderr.writeln(diffs.join());
    }
  }
  stdout.writeln('\n${cases.length - failures}/${cases.length} cases match');
  if (failures > 0) exitCode = 1;
}