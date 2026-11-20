import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

import '../engine/engine.dart';

/// Builds the printed version of a review report.
///
/// The PDF keeps the same reading order as the on-screen report: one-line
/// verdict, counts, then every finding with its quote, legal basis,
/// consequence, question and counter-proposal, and finally the items that
/// still need to be confirmed.
class PdfExporter {
  PdfExporter._();

  static const _ink = PdfColor.fromInt(0xFF101820);
  static const _ink2 = PdfColor.fromInt(0xFF475666);
  static const _muted = PdfColor.fromInt(0xFF6B7A88);
  static const _faint = PdfColor.fromInt(0xFF9AA7B4);
  static const _rule = PdfColor.fromInt(0xFFE3E8EE);
  static const _rule2 = PdfColor.fromInt(0xFFEDF1F5);
  static const _sheet = PdfColor.fromInt(0xFFFFFFFF);
  static const _sheet2 = PdfColor.fromInt(0xFFF7F9FB);

  static const _verdictColors = {
    Verdict.red: PdfColor.fromInt(0xFFB23A2F),
    Verdict.yellow: PdfColor.fromInt(0xFF946200),
    Verdict.gray: PdfColor.fromInt(0xFF51616F),
    Verdict.green: PdfColor.fromInt(0xFF2F6B4F),
  };

  static const _verdictSoft = {
    Verdict.red: PdfColor.fromInt(0xFFFBEBE8),
    Verdict.yellow: PdfColor.fromInt(0xFFFFF5DC),
    Verdict.gray: PdfColor.fromInt(0xFFEFF3F6),
    Verdict.green: PdfColor.fromInt(0xFFE9F3ED),
  };

  static PdfColor _color(Verdict v) => _verdictColors[v] ?? _ink;

  /// Generates the PDF and hands it to the platform: a save dialog on desktop,
  /// the share sheet on mobile. Returns the file name, or null when the user
  /// cancelled the save dialog.
  static Future<String?> export(
    Analysis analysis, {
    String sourceName = '',
    bool ocrUsed = false,
  }) async {
    final bytes = await build(analysis, sourceName: sourceName, ocrUsed: ocrUsed);
    final name = fileName(analysis);

    if (!kIsWeb &&
        (defaultTargetPlatform == TargetPlatform.windows ||
            defaultTargetPlatform == TargetPlatform.linux ||
            defaultTargetPlatform == TargetPlatform.macOS)) {
      final target = await FilePicker.saveFile(
        dialogTitle: '保存审阅报告',
        fileName: name,
        bytes: bytes,
        mimeType: 'application/pdf',
      );
      return target == null ? null : name;
    }

    await Printing.sharePdf(bytes: bytes, filename: name);
    return name;
  }

  static String fileName(Analysis analysis) {
    final now = DateTime.now();
    final stamp = '${now.year}'
        '${now.month.toString().padLeft(2, '0')}'
        '${now.day.toString().padLeft(2, '0')}';
    return '红笔-${analysis.docType}-$stamp.pdf';
  }

  static Future<Uint8List> build(
    Analysis analysis, {
    String sourceName = '',
    bool ocrUsed = false,
  }) async {
    final data = await rootBundle.load('assets/fonts/NotoSansSC-Regular.ttf');
    final font = pw.Font.ttf(data);
    final doc = pw.Document(
      title: '红笔审阅报告 · ${analysis.title}',
      author: '红笔',
      creator: '红笔 · 签约前 5 分钟',
      subject: analysis.docType,
    );
    final now = DateTime.now();
    final date = '${now.year} 年 ${now.month} 月 ${now.day} 日';

    pw.Widget text(
      String value, {
      double size = 10,
      PdfColor color = _ink,
      double height = 1.5,
      double spacing = 0,
      pw.TextAlign align = pw.TextAlign.left,
    }) =>
        pw.Text(
          value,
          textAlign: align,
          style: pw.TextStyle(
            font: font,
            fontSize: size,
            color: color,
            lineSpacing: (size * (height - 1)).clamp(1, 6),
            letterSpacing: spacing,
            wordSpacing: 0,
          ),
          lineSplitter: _splitCjk,
        );

    pw.Widget label(String value) => text(value, size: 8.5, color: _faint, spacing: 0.8);

    pw.Widget field(String title, String value) {
      if (value.trim().isEmpty) return pw.SizedBox();
      return pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.SizedBox(height: 9),
          label(title),
          pw.SizedBox(height: 2),
          text(value, size: 10, color: _ink2),
        ],
      );
    }

    // A horizontal Row cannot be split by MultiPage, which keeps each finding
    // on one page instead of leaving an empty coloured bar at a page break.
    pw.Widget finding(Finding f) {
      final color = _color(f.verdict);
      final soft = _verdictSoft[f.verdict] ?? _sheet2;
      return pw.Row(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Expanded(
            child: pw.Container(
              margin: const pw.EdgeInsets.only(bottom: 12),
              padding: const pw.EdgeInsets.fromLTRB(10, 9, 10, 10),
              decoration: pw.BoxDecoration(
                border: pw.Border(left: pw.BorderSide(color: color, width: 2.4)),
              ),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Row(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Container(
                        padding: const pw.EdgeInsets.symmetric(horizontal: 4, vertical: 1.5),
                        color: soft,
                        child: text(verdictLabel[f.verdict] ?? '', size: 8, color: color),
                      ),
                      pw.SizedBox(width: 6),
                      pw.Expanded(
                        child: text(f.ruleName, size: 11.5, color: _ink, height: 1.4),
                      ),
                      pw.SizedBox(width: 6),
                      text(f.location, size: 9, color: _faint, height: 1.4),
                    ],
                  ),
                  if (f.quote.trim().isNotEmpty) ...[
                    pw.SizedBox(height: 7),
                    pw.Container(
                      width: double.infinity,
                      padding: const pw.EdgeInsets.fromLTRB(8, 6, 8, 7),
                      color: _sheet2,
                      child: text(f.quote, size: 9.5, color: _ink2, height: 1.6),
                    ),
                  ],
                  if (f.basis != null) ...[
                    pw.SizedBox(height: 9),
                    label('法律依据'),
                    pw.SizedBox(height: 2),
                    text(
                      '${f.basis!.law}${f.basis!.article.isEmpty ? '' : ' ${f.basis!.article}'}',
                      size: 10,
                      color: _ink2,
                    ),
                    pw.SizedBox(height: 2),
                    text(f.basis!.text, size: 9, color: _muted, height: 1.6),
                  ],
                  field(_consequenceLabel(f.verdict), f.consequence),
                  field('问谁 · 问什么', f.ask),
                  field('可以怎么改', f.counter),
                  pw.SizedBox(height: 7),
                  text('规则 ${f.ruleId} · 把握：${f.confidence}', size: 8.5, color: _faint),
                ],
              ),
            ),
          ),
        ],
      );
    }

    pw.Widget countCell(Verdict verdict, int value) => pw.Expanded(
          child: pw.Container(
            padding: const pw.EdgeInsets.symmetric(vertical: 7, horizontal: 8),
            decoration: pw.BoxDecoration(
              border: pw.Border(
                top: pw.BorderSide(color: _rule, width: 0.6),
                bottom: pw.BorderSide(color: _rule, width: 0.6),
                right: pw.BorderSide(color: _rule2, width: 0.6),
              ),
            ),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                text(
                  '$value',
                  size: 17,
                  color: _color(verdict),
                  height: 1.1,
                ),
                pw.SizedBox(height: 1),
                text(verdictLabel[verdict] ?? '', size: 8.5, color: _muted, spacing: 0.6),
              ],
            ),
          ),
        );

    doc.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.fromLTRB(44, 42, 44, 46),
        theme: pw.ThemeData.withFont(base: font),
        header: (context) {
          if (context.pageNumber == 1) return pw.SizedBox();
          return pw.Container(
            margin: const pw.EdgeInsets.only(bottom: 12),
            padding: const pw.EdgeInsets.only(bottom: 6),
            decoration: const pw.BoxDecoration(
              border: pw.Border(bottom: pw.BorderSide(color: _rule, width: 0.6)),
            ),
            child: pw.Row(
              children: [
                text('红笔 · 签约前风险提示', size: 8.5, color: _faint, spacing: 1),
                pw.Spacer(),
                text(analysis.docType, size: 8.5, color: _faint),
              ],
            ),
          );
        },
        footer: (context) => pw.Container(
          margin: const pw.EdgeInsets.only(top: 14),
          padding: const pw.EdgeInsets.only(top: 6),
          decoration: const pw.BoxDecoration(
            border: pw.Border(top: pw.BorderSide(color: _rule, width: 0.6)),
          ),
          child: pw.Row(
            children: [
              text('规则在本机运行，正文没有上传，也没有保存到磁盘。', size: 8, color: _faint),
              pw.Spacer(),
              text('${context.pageNumber} / ${context.pagesCount}', size: 8, color: _faint),
            ],
          ),
        ),
        build: (context) => [
          pw.Container(
            padding: const pw.EdgeInsets.only(bottom: 10),
            child: pw.Row(
              crossAxisAlignment: pw.CrossAxisAlignment.end,
              children: [
                pw.Expanded(
                  child: pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      text('签约前风险提示', size: 9, color: _faint, spacing: 2.2),
                      pw.SizedBox(height: 4),
                      text(analysis.title, size: 19, color: _ink, height: 1.35),
                    ],
                  ),
                ),
                text(date, size: 9, color: _faint),
              ],
            ),
          ),
          pw.Container(
            padding: const pw.EdgeInsets.only(bottom: 8),
            child: text(
              [
                analysis.docType,
                '共 ${analysis.clauseCount} 条',
                '约 ${analysis.charCount} 字',
                if (sourceName.trim().isNotEmpty) '来源：$sourceName',
              ].join(' · '),
              size: 9,
              color: _muted,
            ),
          ),
          pw.Container(
            width: double.infinity,
            padding: const pw.EdgeInsets.fromLTRB(10, 9, 12, 10),
            decoration: pw.BoxDecoration(
              border: pw.Border(
                left: pw.BorderSide(color: _color(analysis.topVerdict), width: 3),
              ),
            ),
            child: text(analysis.oneLiner, size: 13, color: _ink, height: 1.55),
          ),
          if (analysis.packLabels.isNotEmpty) ...[
            pw.SizedBox(height: 6),
            text('应用规则：${analysis.packLabels.join(' / ')}', size: 8.5, color: _muted),
          ],
          if (ocrUsed) ...[
            pw.SizedBox(height: 6),
            pw.Container(
              width: double.infinity,
              padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 6),
              color: _verdictSoft[Verdict.yellow],
              child: text('正文来自本机 OCR。请对照原件核对金额、日期和条款编号。', size: 9, color: _ink2),
            ),
          ],
          pw.SizedBox(height: 12),
          pw.Row(
            children: [
              countCell(Verdict.red, analysis.countOf(Verdict.red)),
              countCell(Verdict.yellow, analysis.countOf(Verdict.yellow)),
              countCell(Verdict.gray, analysis.countOf(Verdict.gray)),
              countCell(Verdict.green, analysis.countOf(Verdict.green)),
            ],
          ),
          pw.SizedBox(height: 16),
          for (final f in analysis.items) finding(f),
          if (analysis.pending.isNotEmpty) ...[
            pw.SizedBox(height: 4),
            pw.Container(
              padding: const pw.EdgeInsets.fromLTRB(10, 9, 10, 11),
              decoration: pw.BoxDecoration(
                border: pw.Border.all(color: _rule, width: 0.6),
                color: _sheet,
              ),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  text('还要确认 ${analysis.pending.length} 件事', size: 12, color: _ink),
                  pw.SizedBox(height: 6),
                  for (var i = 0; i < analysis.pending.length; i++)
                    pw.Padding(
                      padding: const pw.EdgeInsets.only(bottom: 3),
                      child: pw.Row(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          pw.SizedBox(
                            width: 16,
                            child: text('${i + 1}', size: 9.5, color: _faint),
                          ),
                          pw.Expanded(
                            child: text(analysis.pending[i], size: 10, color: _ink2),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ],
          pw.SizedBox(height: 16),
          pw.Container(
            padding: const pw.EdgeInsets.only(top: 8),
            decoration: const pw.BoxDecoration(
              border: pw.Border(top: pw.BorderSide(color: _rule, width: 0.6)),
            ),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                text(
                  '以上为签约前风险提示，基于你提供的文本和通用规定，不构成法律意见。涉及金额较大或已产生争议，请拨打 12348 公共法律服务热线，或联系学校法律援助中心。',
                  size: 8.5,
                  color: _muted,
                  height: 1.7,
                ),
                pw.SizedBox(height: 4),
                text('规则 ${analysis.items.length} 条判定 · 规则库 20 类 · 红笔 · 签约前 5 分钟', size: 8, color: _faint),
              ],
            ),
          ),
        ],
      ),
    );

    return doc.save();
  }

  static String _consequenceLabel(Verdict verdict) => switch (verdict) {
        Verdict.red => '最坏会发生',
        Verdict.yellow => '可能吃亏',
        Verdict.gray => '需要确认',
        Verdict.green => '规则核对',
      };

  /// Line breaker for Chinese text: every CJK character can start a new line,
  /// but closing punctuation sticks to the character before it and opening
  /// punctuation sticks to the character after it.
  static List<String> _splitCjk(String line) {
    const closing = '，。！？；：、）》」』】〉…—·%％”’';
    const opening = '（《「『【〈“‘';
    final out = <String>[];
    final buffer = StringBuffer();

    void flush() {
      if (buffer.isNotEmpty) {
        out.add(buffer.toString());
        buffer.clear();
      }
    }

    final chars = line.runes.map(String.fromCharCode).toList();
    for (var i = 0; i < chars.length; i++) {
      final ch = chars[i];
      if (!_isCjk(ch)) {
        buffer.write(ch);
        continue;
      }
      if (closing.contains(ch) && out.isNotEmpty) {
        flush();
        out[out.length - 1] = out[out.length - 1] + ch;
        continue;
      }
      if (opening.contains(ch)) {
        flush();
        final next = i + 1 < chars.length ? chars[i + 1] : '';
        out.add(ch + next);
        i++;
        continue;
      }
      flush();
      out.add(ch);
    }
    flush();
    return out;
  }

  static bool _isCjk(String ch) {
    final code = ch.runes.first;
    return (code >= 0x2E80 && code <= 0x303F) ||
        (code >= 0x3400 && code <= 0x4DBF) ||
        (code >= 0x4E00 && code <= 0x9FFF) ||
        (code >= 0xF900 && code <= 0xFAFF) ||
        (code >= 0xFF00 && code <= 0xFF60);
  }
}
