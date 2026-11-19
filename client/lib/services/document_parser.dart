import 'dart:convert';
import 'dart:math' as math;
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:archive/archive.dart';
import 'package:charset/charset.dart';
import 'package:image/image.dart' as img;
import 'package:pdfrx/pdfrx.dart';
import 'package:xml/xml.dart';

import 'ocr/ocr_postprocess.dart';
import 'ocr/ocr_service.dart';

enum DocumentKind { txt, docx, pdf }

class ParsedDocument {
  const ParsedDocument({
    required this.fileName,
    required this.kind,
    required this.text,
    required this.charCount,
    this.pageCount,
    this.ocrUsed = false,
    this.needsOcr = false,
    this.notes = const [],
  });

  final String fileName;
  final DocumentKind kind;
  final String text;
  final int charCount;
  final int? pageCount;
  final bool ocrUsed;

  /// True when a PDF looks scanned but no OCR backend was available.
  final bool needsOcr;
  final List<String> notes;
}

class DocumentParseException implements Exception {
  const DocumentParseException(this.message);

  final String message;

  @override
  String toString() => message;
}

typedef ParseProgress = void Function(double value, String label);

Future<ParsedDocument> parseDocument({
  required String fileName,
  required Uint8List bytes,
  OcrService? ocr,
  ParseProgress? onProgress,
}) async {
  final ext = _extension(fileName);
  switch (ext) {
    case 'txt':
    case 'md':
    case 'markdown':
      onProgress?.call(0.4, '正在读取文本…');
      final text = normalizePlainText(decodeTextBytes(bytes));
      if (text.trim().isEmpty) {
        throw const DocumentParseException('这个文本文件是空的，换一份再试。');
      }
      onProgress?.call(1, '读取完成');
      return ParsedDocument(
        fileName: fileName,
        kind: DocumentKind.txt,
        text: text,
        charCount: _countChars(text),
      );
    case 'docx':
      onProgress?.call(0.3, '正在解析 Word 文档…');
      final text = normalizePlainText(extractDocxText(bytes));
      if (text.trim().isEmpty) {
        throw const DocumentParseException('这份 Word 文档没有可提取的文字，可能是纯图片排版。');
      }
      onProgress?.call(1, '解析完成');
      return ParsedDocument(
        fileName: fileName,
        kind: DocumentKind.docx,
        text: text,
        charCount: _countChars(text),
      );
    case 'pdf':
      return _parsePdf(fileName: fileName, bytes: bytes, ocr: ocr, onProgress: onProgress);
    case 'doc':
      throw const DocumentParseException(
        '旧版 .doc 格式无法在设备上直接解析。请在 Word 里“另存为” .docx 或 PDF 后再导入。',
      );
    default:
      throw DocumentParseException(
        ext.isEmpty ? '无法识别这个文件类型，请选择 PDF、Word(.docx)、TXT。' : '暂不支持 .$ext 文件，请选择 PDF、Word(.docx)、TXT。',
      );
  }
}

String _extension(String fileName) {
  final dot = fileName.lastIndexOf('.');
  if (dot < 0 || dot == fileName.length - 1) return '';
  return fileName.substring(dot + 1).toLowerCase();
}

int _countChars(String text) => text.replaceAll(RegExp(r'\s'), '').length;

String normalizePlainText(String raw) {
  final text = raw
      .replaceAll('\r\n', '\n')
      .replaceAll('\r', '\n')
      .replaceAll('\u00A0', ' ')
      .replaceAll('\u200B', '')
      .split('\n')
      .map((line) => line.replaceAll(RegExp(r'[ \t]+$'), ''))
      .join('\n')
      .replaceAll(RegExp(r'\n{3,}'), '\n\n')
      .trim();
  return text;
}

String decodeTextBytes(Uint8List bytes) {
  if (bytes.length >= 3 && bytes[0] == 0xEF && bytes[1] == 0xBB && bytes[2] == 0xBF) {
    return utf8.decode(bytes.sublist(3), allowMalformed: true);
  }
  if (bytes.length >= 2 && bytes[0] == 0xFF && bytes[1] == 0xFE) {
    return utf16.decode(bytes);
  }
  if (bytes.length >= 2 && bytes[0] == 0xFE && bytes[1] == 0xFF) {
    return utf16.decode(bytes);
  }
  try {
    return utf8.decode(bytes);
  } on FormatException {
    return gbk.decode(bytes);
  }
}

String extractDocxText(Uint8List bytes) {
  final Archive archive;
  try {
    archive = ZipDecoder().decodeBytes(bytes);
  } on Object {
    throw const DocumentParseException('这个 .docx 文件打不开，可能已损坏或被加密。');
  }
  ArchiveFile? entry;
  for (final file in archive.files) {
    if (file.name == 'word/document.xml') {
      entry = file;
      break;
    }
  }
  if (entry == null) {
    throw const DocumentParseException('这个 .docx 文件缺少正文内容，可能不是 Word 文档。');
  }

  final XmlDocument document;
  try {
    document = XmlDocument.parse(utf8.decode(entry.content, allowMalformed: true));
  } on XmlException {
    throw const DocumentParseException('Word 文档的正文结构无法解析，请用 Word 另存一份再试。');
  }

  final buffer = StringBuffer();
  for (final element in document.descendants.whereType<XmlElement>()) {
    if (element.name.local != 'p') continue;
    final prefix = element.name.prefix ?? '';
    if (prefix.isNotEmpty && prefix != 'w') continue;
    final parts = <String>[];
    for (final node in element.descendants) {
      if (node is! XmlElement) continue;
      switch (node.name.local) {
        case 't':
          parts.add(node.innerText);
        case 'tab':
          parts.add('\t');
        case 'br':
        case 'cr':
          parts.add('\n');
      }
    }
    buffer.writeln(parts.join());
  }
  return buffer.toString();
}

Future<ParsedDocument> _parsePdf({
  required String fileName,
  required Uint8List bytes,
  OcrService? ocr,
  ParseProgress? onProgress,
}) async {
  onProgress?.call(0.02, '正在打开 PDF…');
  PdfDocument document;
  try {
    document = await PdfDocument.openData(bytes);
  } on Object {
    throw const DocumentParseException('这个 PDF 打不开，可能设置了密码或文件已损坏。');
  }

  try {
    final totalPages = document.pages.length;
    final pageCount = math.min(totalPages, 60);
    final pagesText = <String>[];
    for (var i = 0; i < pageCount; i++) {
      onProgress?.call(0.04 + 0.5 * (i + 1) / pageCount, '正在提取第 ${i + 1} / $pageCount 页文字…');
      final pageText = (await document.pages[i].loadText()).fullText;
      pagesText.add(normalizeOcrText(pageText, repairHeadings: false));
    }

    final notes = <String>[];
    if (pageCount < totalPages) {
      notes.add('PDF 共 $totalPages 页，本次只读取前 $pageCount 页。');
    }

    final digitalText = pagesText.where((page) => page.trim().isNotEmpty).join('\n\n').trim();
    final digitalChars = _countChars(digitalText);
    final looksScanned = digitalChars < math.max(40, pageCount * 8);

    if (!looksScanned) {
      onProgress?.call(1, '解析完成');
      return ParsedDocument(
        fileName: fileName,
        kind: DocumentKind.pdf,
        text: digitalText,
        charCount: digitalChars,
        pageCount: totalPages,
        notes: notes,
      );
    }

    if (ocr == null) {
      onProgress?.call(1, '已读取，但需要 OCR');
      notes.add('这份 PDF 几乎没有可复制的文字，像是扫描件。请改用照片或截图导入，才能识别文字。');
      return ParsedDocument(
        fileName: fileName,
        kind: DocumentKind.pdf,
        text: digitalText,
        charCount: digitalChars,
        pageCount: totalPages,
        needsOcr: true,
        notes: notes,
      );
    }

    final capability = await ocr.probe();
    if (!capability.available) {
      onProgress?.call(1, '已读取，但 OCR 不可用');
      notes.add('这份 PDF 像是扫描件，但本机 OCR 不可用：${capability.detail}');
      return ParsedDocument(
        fileName: fileName,
        kind: DocumentKind.pdf,
        text: digitalText,
        charCount: digitalChars,
        pageCount: totalPages,
        needsOcr: true,
        notes: notes,
      );
    }

    const maxOcrPages = 12;
    final ocrPageCount = math.min(pageCount, maxOcrPages);
    if (ocrPageCount < pageCount) {
      notes.add('扫描件识别只处理前 $ocrPageCount 页，其余页面请拆分后再识别。');
    }

    final mergedPages = <String>[];
    var ocrPages = 0;
    for (var i = 0; i < ocrPageCount; i++) {
      final existing = pagesText[i].trim();
      if (existing.length >= 20) {
        mergedPages.add(existing);
        continue;
      }
      onProgress?.call(
        0.55 + 0.44 * (i + 1) / ocrPageCount,
        '正在识别第 ${i + 1} / $ocrPageCount 页（${ocr.engineLabel}）…',
      );
      try {
        final pageImage = await _renderPagePng(document.pages[i]);
        final result = await ocr.recognize(pageImage);
        mergedPages.add(result.text);
        ocrPages++;
      } on OcrException catch (error) {
        notes.add('第 ${i + 1} 页识别失败：${error.message}');
      }
    }

    final mergedText = mergedPages.where((page) => page.trim().isNotEmpty).join('\n\n').trim();
    if (mergedText.isEmpty) {
      throw const DocumentParseException('扫描件识别没有成功，请换一份更清晰的 PDF，或用照片单独识别。');
    }
    if (ocrPages > 0) {
      notes.insert(0, '扫描页已在本机用 ${ocr.engineLabel} 识别，请对照原文检查关键数字。');
    }
    onProgress?.call(1, '识别完成');
    return ParsedDocument(
      fileName: fileName,
      kind: DocumentKind.pdf,
      text: mergedText,
      charCount: _countChars(mergedText),
      pageCount: totalPages,
      ocrUsed: ocrPages > 0,
      notes: notes,
    );
  } finally {
    await document.dispose();
  }
}

Future<Uint8List> _renderPagePng(PdfPage page) async {
  const targetWidth = 2000.0;
  final ratio = page.height / page.width;
  final rendered = await page.render(
    fullWidth: targetWidth,
    fullHeight: targetWidth * ratio,
    backgroundColor: const ui.Color(0xFFFFFFFF),
  );
  if (rendered == null) {
    throw const OcrException('PDF 页面渲染失败。');
  }
  try {
    final order = rendered.format == ui.PixelFormat.bgra8888
        ? img.ChannelOrder.bgra
        : img.ChannelOrder.rgba;
    final image = img.Image.fromBytes(
      width: rendered.width,
      height: rendered.height,
      bytes: rendered.pixels.buffer,
      numChannels: 4,
      order: order,
    );
    return Uint8List.fromList(img.encodePng(image, level: 4));
  } finally {
    rendered.dispose();
  }
}