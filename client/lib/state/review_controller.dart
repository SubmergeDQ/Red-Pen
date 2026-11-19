import 'dart:async';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:material_ui/material_ui.dart';

import '../engine/engine.dart';
import '../services/document_parser.dart';
import '../services/ocr/ocr.dart';
import '../services/ocr/ocr_service.dart';

enum Phase { intake, analyzing, report }

typedef NoticeSink = void Function(String message);

class ReviewController extends ChangeNotifier {
  ReviewController() {
    editor.addListener(_onEditorChanged);
  }

  final TextEditingController editor = TextEditingController();
  final OcrService ocr = createOcrService();

  NoticeSink? onNotice;

  Phase phase = Phase.intake;
  String docTypeChoice = 'auto';
  Analysis? analysis;
  String sourceName = '';
  bool busy = false;
  String busyTitle = '';
  String? busyNote;
  double? progress;
  String? error;
  List<String> notes = const [];
  bool ocrUsed = false;
  String? activeSample;

  Verdict? filter;
  String? expandedId;
  String? activeFindingId;
  int mobileTab = 0;
  int analyzingStep = 0;

  int _opId = 0;
  int _runId = 0;

  bool get canReview => editor.text.trim().isNotEmpty && !busy && phase == Phase.intake;
  bool get hasText => editor.text.trim().isNotEmpty;
  int get charCount => editor.text.replaceAll(RegExp(r'\s'), '').length;
  int get riskCount => analysis?.items.where((f) => f.verdict != Verdict.green).length ?? 0;

  String get docTypeLabel => docTypeChoice == 'auto' ? '自动识别类型' : (docLabel[docTypeChoice] ?? '自动识别类型');

  List<Finding> get visibleFindings {
    final a = analysis;
    if (a == null) return const [];
    if (filter == null) return a.items;
    return a.items.where((f) => f.verdict == filter).toList();
  }

  Finding? get activeFinding {
    final a = analysis;
    if (a == null) return null;
    for (final f in a.items) {
      if (f.id == activeFindingId) return f;
    }
    return null;
  }

  void _onEditorChanged() {
    notifyListeners();
  }

  void _notice(String message) {
    onNotice?.call(message);
    notifyListeners();
  }

  void setDocType(String value) {
    if (docTypeChoice == value) return;
    docTypeChoice = value;
    notifyListeners();
  }

  void setFilter(Verdict? value) {
    filter = value;
    final active = activeFinding;
    if (active != null && value != null && active.verdict != value) {
      activeFindingId = null;
      expandedId = null;
    }
    notifyListeners();
  }

  void setMobileTab(int value) {
    if (mobileTab == value) return;
    mobileTab = value;
    notifyListeners();
  }

  void toggleExpanded(String id) {
    expandedId = expandedId == id ? null : id;
    activeFindingId = id;
    notifyListeners();
  }

  void selectFinding(String id) {
    activeFindingId = id;
    expandedId = id;
    notifyListeners();
  }

  void clearNotes() {
    notes = const [];
    notifyListeners();
  }

  void clearText() {
    _opId++;
    editor.clear();
    sourceName = '';
    notes = const [];
    ocrUsed = false;
    activeSample = null;
    error = null;
    busy = false;
    notifyListeners();
  }

  void loadSample(SampleDoc sample) {
    if (busy) return;
    _opId++;
    editor.text = sample.text;
    docTypeChoice = 'auto';
    sourceName = '示例 · ${sample.name}';
    notes = const [];
    ocrUsed = false;
    activeSample = sample.id;
    error = null;
    _notice('已载入「${sample.name}」，可以直接核对，也可以先改两处再试。');
  }

  Future<void> readClipboard() async {
    if (busy) return;
    try {
      final data = await Clipboard.getData(Clipboard.kTextPlain);
      final text = data?.text?.trim() ?? '';
      if (text.isEmpty) {
        error = '剪贴板里没有可用的文字。先复制合同正文，再点一次。';
        notifyListeners();
        return;
      }
      _opId++;
      editor.text = normalizePlainText(text);
      sourceName = '剪贴板';
      notes = const [];
      ocrUsed = false;
      activeSample = null;
      error = null;
      _notice('已从剪贴板读取正文。');
    } on Object {
      error = '读不到剪贴板内容，请改用文件导入或直接粘贴。';
      notifyListeners();
    }
  }

  Future<void> importFile() async {
    if (busy) return;
    final op = ++_opId;
    busy = true;
    busyTitle = '读取文件';
    busyNote = '正在打开文件…';
    progress = null;
    error = null;
    notes = const [];
    notifyListeners();

    try {
      final files = await FilePicker.pickFiles(
        dialogTitle: '选择合同文件',
        type: FileType.custom,
        allowedExtensions: const ['pdf', 'docx', 'doc', 'txt', 'md'],
      );
      if (op != _opId) return;
      if (files.isEmpty) {
        busy = false;
        notifyListeners();
        return;
      }
      final file = files.first;
      busyNote = '正在读取 ${file.name}…';
      notifyListeners();

      Uint8List bytes;
      try {
        bytes = await file.readAsBytes();
      } on Object {
        throw const DocumentParseException('读不到这个文件的内容，请把它复制到本机磁盘后再试。');
      }
      if (op != _opId) return;

      final parsed = await parseDocument(
        fileName: file.name,
        bytes: bytes,
        ocr: ocr,
        onProgress: (value, label) {
          if (op != _opId) return;
          progress = value;
          busyNote = label;
          notifyListeners();
        },
      );
      if (op != _opId) return;

      if (parsed.text.trim().isEmpty) {
        notes = parsed.notes;
        error = parsed.needsOcr
            ? '这份文件里没有可复制的文字。请改用「图片识别」导入扫描页。'
            : '这份文件里没有读到文字，换一份再试。';
        busy = false;
        progress = null;
        notifyListeners();
        return;
      }

      editor.text = parsed.text;
      sourceName = file.name;
      notes = parsed.notes;
      ocrUsed = parsed.ocrUsed;
      docTypeChoice = 'auto';
      activeSample = null;
      error = null;
      busy = false;
      progress = null;
      notifyListeners();
    } on DocumentParseException catch (e) {
      if (op != _opId) return;
      error = e.message;
      busy = false;
      progress = null;
      notifyListeners();
    } on OcrException catch (e) {
      if (op != _opId) return;
      error = e.message;
      busy = false;
      progress = null;
      notifyListeners();
    } on Object {
      if (op != _opId) return;
      error = '这个文件没有读出来。PDF 如果设置了密码，请先解除后再导入。';
      busy = false;
      progress = null;
      notifyListeners();
    }
  }

  Future<void> importImage({required bool camera}) async {
    if (busy) return;
    final op = ++_opId;
    busy = true;
    busyTitle = camera ? '拍照识别' : '图片识别';
    busyNote = '正在准备图片…';
    progress = null;
    error = null;
    notes = const [];
    notifyListeners();

    try {
      final List<Uint8List> images;
      final List<String> names;
      if (camera) {
        final file = await ImagePicker().pickImage(
          source: ImageSource.camera,
          imageQuality: 97,
          maxWidth: 3200,
        );
        if (op != _opId) return;
        if (file == null) {
          busy = false;
          notifyListeners();
          return;
        }
        images = [await file.readAsBytes()];
        names = ['相机拍摄'];
      } else if (kIsWeb || defaultTargetPlatform == TargetPlatform.windows || defaultTargetPlatform == TargetPlatform.macOS || defaultTargetPlatform == TargetPlatform.linux) {
        final files = await FilePicker.pickFiles(
          dialogTitle: '选择合同照片或截图',
          type: FileType.image,
        );
        if (op != _opId) return;
        if (files.isEmpty) {
          busy = false;
          notifyListeners();
          return;
        }
        images = [];
        names = [];
        for (final file in files.take(6)) {
          images.add(await file.readAsBytes());
          names.add(file.name);
        }
      } else {
        final files = await ImagePicker().pickMultiImage(
          imageQuality: 97,
          maxWidth: 3200,
          limit: 6,
        );
        if (op != _opId) return;
        if (files.isEmpty) {
          busy = false;
          notifyListeners();
          return;
        }
        images = [];
        names = [];
        for (final file in files) {
          images.add(await file.readAsBytes());
          names.add(file.name);
        }
      }
      if (op != _opId) return;

      busyNote = '正在检查本机识别引擎…';
      notifyListeners();
      final capability = await ocr.probe();
      if (op != _opId) return;
      if (!capability.available) {
        error = capability.detail;
        busy = false;
        progress = null;
        notifyListeners();
        return;
      }

      final parts = <String>[];
      for (var i = 0; i < images.length; i++) {
        if (op != _opId) return;
        busyNote = images.length == 1
            ? '正在本机识别文字（${ocr.engineLabel}）…'
            : '正在识别第 ${i + 1} / ${images.length} 张（${ocr.engineLabel}）…';
        progress = (i + 0.2) / images.length;
        notifyListeners();
        final result = await ocr.recognize(images[i]);
        if (op != _opId) return;
        if (result.text.trim().isNotEmpty) parts.add(result.text.trim());
        progress = (i + 1) / images.length;
        notifyListeners();
      }

      if (parts.isEmpty) {
        error = '没有从图片里识别到文字。请把合同放平、光线调亮，或换成更清晰的截图。';
        busy = false;
        progress = null;
        notifyListeners();
        return;
      }

      editor.text = parts.join('\n\n');
      sourceName = names.length == 1 ? names.first : '${names.length} 张图片';
      docTypeChoice = 'auto';
      activeSample = null;
      ocrUsed = true;
      notes = [
        '识别引擎：${ocr.engineLabel}，全程在本机运行，图片没有上传。',
        if (images.length > 1) '共识别 ${images.length} 张图片，已按选择顺序拼接，请检查页与页的衔接。',
        '识别结果可以直接修改。请对照原件核对金额、日期和条款编号。',
      ];
      error = null;
      busy = false;
      progress = null;
      notifyListeners();
    } on PlatformException catch (e) {
      if (op != _opId) return;
      error = _imageError(e);
      busy = false;
      progress = null;
      notifyListeners();
    } on OcrException catch (e) {
      if (op != _opId) return;
      error = e.message;
      busy = false;
      progress = null;
      notifyListeners();
    } on Object {
      if (op != _opId) return;
      error = '图片没有读出来，请重试或换一张截图。';
      busy = false;
      progress = null;
      notifyListeners();
    }
  }

  String _imageError(PlatformException e) {
    if (e.code.contains('camera') || e.code == 'camera_access_denied') {
      return '打不开相机。请到系统设置里允许红笔使用相机，或从相册选择照片。';
    }
    if (e.code.contains('photo') || e.code.contains('permission')) {
      return '打不开相册。请到系统设置里允许红笔访问照片。';
    }
    return '图片没有读出来，请重试或换一张截图。';
  }

  Future<void> startReview() async {
    if (busy) return;
    final text = editor.text.trim();
    if (text.isEmpty) {
      error = '先把合同正文粘贴进来，或者载入一份示例。';
      notifyListeners();
      return;
    }
    final run = ++_runId;
    error = null;
    phase = Phase.analyzing;
    analyzingStep = 0;
    filter = null;
    expandedId = null;
    activeFindingId = null;
    mobileTab = 0;
    notifyListeners();

    try {
      await Future<void>.delayed(const Duration(milliseconds: 260));
      if (run != _runId) return;
      analyzingStep = 1;
      notifyListeners();
      await Future<void>.delayed(const Duration(milliseconds: 240));
      if (run != _runId) return;
      analyzingStep = 2;
      notifyListeners();
      await Future<void>.delayed(const Duration(milliseconds: 280));
      if (run != _runId) return;

      final result = analyzeContract(
        text,
        docType: docTypeChoice == 'auto' ? null : docTypeChoice,
      );
      if (run != _runId) return;
      analysis = result;
      analyzingStep = 3;
      notifyListeners();
      await Future<void>.delayed(const Duration(milliseconds: 360));
      if (run != _runId) return;
      phase = Phase.report;
      notifyListeners();
    } on Object {
      if (run != _runId) return;
      phase = Phase.intake;
      error = '审阅时出了点问题，请检查正文后再试一次。';
      notifyListeners();
    }
  }

  void editText() {
    _runId++;
    phase = Phase.intake;
    busy = false;
    error = null;
    notifyListeners();
  }

  void backToIntake() => editText();

  void resetAll() {
    _opId++;
    _runId++;
    editor.clear();
    phase = Phase.intake;
    analysis = null;
    docTypeChoice = 'auto';
    sourceName = '';
    notes = const [];
    ocrUsed = false;
    activeSample = null;
    busy = false;
    progress = null;
    busyNote = null;
    error = null;
    filter = null;
    expandedId = null;
    activeFindingId = null;
    mobileTab = 0;
    notifyListeners();
  }

  Future<void> copy(String text, String label) async {
    if (text.trim().isEmpty) return;
    await Clipboard.setData(ClipboardData(text: text));
    _notice('$label已复制。');
  }

  Future<void> copyReport() async {
    final a = analysis;
    if (a == null) return;
    final buffer = StringBuffer()
      ..writeln('红笔 · 签约前风险提示')
      ..writeln('${a.title}（${a.docType}）')
      ..writeln(a.oneLiner)
      ..writeln(
        '红线 ${a.countOf(Verdict.red)} · 黄线 ${a.countOf(Verdict.yellow)} · 灰线 ${a.countOf(Verdict.gray)} · 绿线 ${a.countOf(Verdict.green)}',
      );
    if (a.packLabels.isNotEmpty) buffer.writeln('应用规则：${a.packLabels.join(' / ')}');
    if (ocrUsed) buffer.writeln('正文来源：本机 OCR 识别，请对照原件核对数字与条款编号。');
    buffer.writeln();

    for (final f in a.items) {
      buffer
        ..writeln('[${verdictLabel[f.verdict]}] ${f.ruleName}（${f.location}）')
        ..writeln('最坏会发生：${f.consequence}');
      if (f.quote.isNotEmpty) buffer.writeln('原文：${f.quote}');
      if (f.basis != null) {
        final article = f.basis!.article == '需核对' ? '（条文序号需核对）' : f.basis!.article;
        buffer
          ..writeln('依据：${f.basis!.law} $article')
          ..writeln(f.basis!.text);
      }
      if (f.ask.isNotEmpty) buffer.writeln('问谁 · 问什么：${f.ask}');
      if (f.counter.isNotEmpty) buffer.writeln('可以怎么改：${f.counter}');
      buffer
        ..writeln('规则 ${f.ruleId} · 把握：${f.confidence}')
        ..writeln();
    }

    if (a.pending.isNotEmpty) {
      buffer.writeln('还要确认 ${a.pending.length} 件事');
      for (var i = 0; i < a.pending.length; i++) {
        buffer.writeln('${i + 1}. ${a.pending[i]}');
      }
      buffer.writeln();
    }
    buffer
      ..writeln('以上为签约前风险提示，基于你提供的文本和通用规定，不构成法律意见。')
      ..writeln('涉及金额较大或已产生争议，请拨打 12348 公共法律服务热线，或联系学校法律援助中心。')
      ..writeln('规则在本机运行，正文没有上传，也没有保存到磁盘。');
    await copy(buffer.toString(), '审阅报告');
  }

  @override
  void dispose() {
    editor.removeListener(_onEditorChanged);
    editor.dispose();
    ocr.dispose();
    super.dispose();
  }
}