import 'package:flutter_test/flutter_test.dart';
import 'package:red_pen/services/ocr/ocr_postprocess.dart';

void main() {
  test('rebuilds reading order from shuffled Windows OCR words', () {
    final words = [
      const OcrWord(text: '违约金', x: 120, y: 150, width: 78, height: 28),
      const OcrWord(text: '第二条', x: 0, y: 10, width: 104, height: 28),
      const OcrWord(text: '乙方', x: 0, y: 150, width: 52, height: 28),
      const OcrWord(text: '合同', x: 110, y: 10, width: 52, height: 28),
      const OcrWord(text: '应支付', x: 60, y: 152, width: 78, height: 26),
    ];
    final text = rebuildOcrText(words);
    expect(text.trim().split('\n'), ['第二条合同', '乙方应支付违约金']);
  });

  test('keeps a space between latin words but not next to Chinese', () {
    final words = [
      const OcrWord(text: 'Office', x: 0, y: 0, width: 60, height: 20),
      const OcrWord(text: 'Excel', x: 84, y: 0, width: 46, height: 20),
      const OcrWord(text: '考核', x: 140, y: 0, width: 40, height: 20),
      const OcrWord(text: 'KPI', x: 190, y: 0, width: 30, height: 20),
    ];
    expect(rebuildOcrText(words).trim(), 'Office Excel考核KPI');
  });

  test('normalizes glyph spacing and repairs headings missing 第', () {
    const raw = '第 一 条 合 同 期 限\n'
        '本 合 同 期 限 自 2026 年 7 月 1 日 起 。\n'
        '一 条 工 作 内 容\n'
        '每 月 1 0 日 前 支 付 4800 元 。';
    expect(
      normalizeOcrText(raw),
      '第一条合同期限\n本合同期限自2026年7月1日起。\n第一条工作内容\n每月10日前支付4800元。',
    );
  });

  test('does not touch headings when repair is off', () {
    expect(
      normalizeOcrText('一 条 合 同 期 限', repairHeadings: false),
      '一条合同期限',
    );
  });

  test('drops punctuation-only lines and collapses blank runs', () {
    const raw = '劳动合同\n\n\n\n。\n\n第一条 期限\n';
    expect(normalizeOcrText(raw), '劳动合同\n\n第一条期限');
  });
}