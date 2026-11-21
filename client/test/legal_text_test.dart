import 'package:flutter_test/flutter_test.dart';
import 'package:red_pen/engine/engine.dart';

void main() {
  test('rule library and legal references contain complete text', () {
    for (final rule in ruleLibrary) {
      expect(rule.name.trim().isEmpty, isFalse, reason: '${rule.id} name');
      expect(rule.cite.trim().isEmpty, isFalse, reason: '${rule.id} cite');
      expect(rule.gist.trim().isEmpty, isFalse, reason: '${rule.id} gist');
      expect(rule.cite.contains('需核对'), isFalse, reason: '${rule.id} cite still uncertain');
      expect(rule.cite.contains('以最新'), isFalse, reason: '${rule.id} cite still provisional');
    }

    for (final entry in law.entries) {
      final ref = entry.value;
      expect(ref.law.trim().isEmpty, isFalse, reason: '${entry.key} law');
      expect(ref.article.trim().isEmpty, isFalse, reason: '${entry.key} article');
      expect(ref.text.trim().isEmpty, isFalse, reason: '${entry.key} text');
      expect(ref.article.contains('需核对'), isFalse, reason: '${entry.key} article still uncertain');
      expect(ref.text.contains('……'), isFalse, reason: '${entry.key} text is truncated');
      expect(ref.text.contains('以最新有效文本为准'), isFalse, reason: '${entry.key} text is provisional');
      expect(ref.text.contains('以最新有效版本为准'), isFalse, reason: '${entry.key} text is provisional');
    }
  });
}
