import 'package:flutter/foundation.dart';
import 'package:material_ui/material_ui.dart';

import '../engine/engine.dart';
import '../state/review_controller.dart';
import '../theme.dart';
import '../ui/common.dart';

class IntakePage extends StatefulWidget {
  const IntakePage({super.key, required this.controller});

  final ReviewController controller;

  @override
  State<IntakePage> createState() => _IntakePageState();
}

class _IntakePageState extends State<IntakePage> {
  final ScrollController _scroll = ScrollController();
  final GlobalKey _editorKey = GlobalKey();

  ReviewController get c => widget.controller;

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _revealEditor() async {
    if (!mounted) return;
    if (MediaQuery.sizeOf(context).width >= 1100) return;
    await Future<void>.delayed(const Duration(milliseconds: 80));
    if (!mounted) return;
    final targetContext = _editorKey.currentContext;
    if (targetContext == null || !targetContext.mounted) return;
    await Scrollable.ensureVisible(
      targetContext,
      duration: const Duration(milliseconds: 380),
      curve: Curves.easeOutCubic,
      alignment: 0.02,
    );
  }

  Future<void> _loadSample(SampleDoc sample) async {
    c.loadSample(sample);
    await _revealEditor();
  }

  Future<void> _importFile() async {
    await c.importFile();
    if (c.hasText) _revealEditor();
  }

  Future<void> _readClipboard() async {
    await c.readClipboard();
    if (c.hasText) _revealEditor();
  }

  Future<void> _importImage() async {
    final mobile = !kIsWeb &&
        (defaultTargetPlatform == TargetPlatform.android ||
            defaultTargetPlatform == TargetPlatform.iOS);
    if (!mobile) {
      await c.importImage(camera: false);
      if (c.hasText) _revealEditor();
      return;
    }
    final choice = await showModalBottomSheet<_ImageSource>(
      context: context,
      backgroundColor: Colors.transparent,
      barrierColor: const Color(0x661D201A),
      builder: (context) => const _ImageSourceSheet(),
    );
    if (choice == null) return;
    await c.importImage(camera: choice == _ImageSource.camera);
    if (c.hasText) _revealEditor();
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final wide = width >= 1100;

    return Container(
      color: R.desk,
      child: Scrollbar(
        controller: _scroll,
        child: SingleChildScrollView(
          controller: _scroll,
          padding: EdgeInsets.fromLTRB(
            wide ? 32 : 16,
            wide ? 48 : 28,
            wide ? 32 : 16,
            32,
          ),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1140),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Eyebrow('签约前自查 · 学生与应届生'),
                  SizedBox(height: wide ? 18 : 16),
                  _Header(wide: wide),
                  SizedBox(height: wide ? 34 : 24),
                  if (wide)
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          flex: 16,
                          child: _EditorCard(
                            key: _editorKey,
                            controller: c,
                            onImportFile: _importFile,
                            onClipboard: _readClipboard,
                            onImage: _importImage,
                          ),
                        ),
                        const SizedBox(width: 40),
                        SizedBox(
                          width: 390,
                          child: _SampleRail(
                            onPick: _loadSample,
                            activeId: c.activeSample,
                          ),
                        ),
                      ],
                    )
                  else ...[
                    _EditorCard(
                      key: _editorKey,
                      controller: c,
                      onImportFile: _importFile,
                      onClipboard: _readClipboard,
                      onImage: _importImage,
                    ),
                    const SizedBox(height: 36),
                    _SampleRail(
                      onPick: _loadSample,
                      activeId: c.activeSample,
                    ),
                  ],
                  SizedBox(height: wide ? 44 : 30),
                  const Divider(height: 1, color: R.rule),
                  const SizedBox(height: 15),
                  Text(
                    '以上为签约前风险提示，基于你提供的文本和通用规定，不构成法律意见。涉及金额较大或已产生争议，请拨打 12348 公共法律服务热线，或联系学校法律援助中心。',
                    style: R.sans(size: 11, color: R.muted, height: 1.8),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.wide});

  final bool wide;

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final size = width >= 1300 ? 52.0 : (width >= 1000 ? 46.0 : (width >= 520 ? 40.0 : 33.0));
    final style = R.serif(
      size: size,
      weight: FontWeight.w600,
      color: R.ink,
      height: 1.18,
      letterSpacing: 0.4,
    );

    final title = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('签下去之前，', style: style),
        Stack(
          clipBehavior: Clip.none,
          children: [
            Text('先看清最坏会怎样。', style: style),
            Positioned(
              left: size * 3.98,
              width: size * 2.12,
              bottom: size * 0.07,
              height: size * 0.16,
              child: Transform.rotate(
                angle: -0.012,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        R.vermilion.withValues(alpha: 0.2),
                        R.vermilion.withValues(alpha: 0.07),
                      ],
                    ),
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(8),
                      bottomRight: Radius.circular(8),
                      topRight: Radius.circular(20),
                      bottomLeft: Radius.circular(20),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );

    final lede = Container(
      constraints: const BoxConstraints(maxWidth: 340),
      padding: const EdgeInsets.only(left: 18, top: 2, bottom: 4),
      decoration: const BoxDecoration(
        border: Border(left: BorderSide(color: R.ruleStrong, width: 2)),
      ),
      child: Text(
        '把合同法条粘贴进来，按 ${ruleLibrary.length} 类常见规则逐条核对：哪条是红线、哪条能谈、该问谁、要改成什么。',
        style: R.sans(size: 13.5, color: R.muted, height: 1.85),
      ),
    );

    if (!wide) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          title,
          const SizedBox(height: 20),
          lede,
        ],
      );
    }
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Expanded(child: title),
        const SizedBox(width: 56),
        Padding(padding: const EdgeInsets.only(bottom: 4), child: lede),
      ],
    );
  }
}

class _EditorCard extends StatefulWidget {
  const _EditorCard({
    super.key,
    required this.controller,
    required this.onImportFile,
    required this.onClipboard,
    required this.onImage,
  });

  final ReviewController controller;
  final Future<void> Function() onImportFile;
  final Future<void> Function() onClipboard;
  final Future<void> Function() onImage;

  @override
  State<_EditorCard> createState() => _EditorCardState();
}

class _EditorCardState extends State<_EditorCard> {
  final FocusNode _focus = FocusNode();
  final ScrollController _textScroll = ScrollController();
  bool _focused = false;

  ReviewController get c => widget.controller;

  void _start() {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    c.startReview();
  }

  @override
  void initState() {
    super.initState();
    _focus.addListener(() {
      if (_focused != _focus.hasFocus) setState(() => _focused = _focus.hasFocus);
    });
  }

  @override
  void dispose() {
    _focus.dispose();
    _textScroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final wide = width >= 700;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      padding: EdgeInsets.fromLTRB(wide ? 22 : 17, 20, wide ? 22 : 17, 18),
      decoration: BoxDecoration(
        color: R.sheet,
        border: Border.all(color: _focused ? const Color(0xFFB5AA90) : R.rule),
        borderRadius: BorderRadius.circular(6),
        boxShadow: _focused
            ? const [
                BoxShadow(color: Color(0x14214C3E), blurRadius: 0, spreadRadius: 3),
                ...R.shadowSheet,
              ]
            : R.shadowSheet,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 6,
                height: 6,
                transform: Matrix4.rotationZ(0.785398),
                decoration: const BoxDecoration(color: R.vermilion),
              ),
              const SizedBox(width: 10),
              Text(
                '协议正文',
                style: R.serif(size: 15, weight: FontWeight.w600, letterSpacing: 0.6, height: 1.3),
              ),
              const Spacer(),
              _DocTypeButton(controller: c),
              const SizedBox(width: 12),
              Text(
                '${c.charCount} 字',
                style: R.sans(size: 11.5, color: R.faint, height: 1.3),
              ),
            ],
          ),
          const SizedBox(height: 13),
          const Divider(height: 1, color: R.rule2),
          Scrollbar(
            controller: _textScroll,
            thumbVisibility: true,
            thickness: 3,
            radius: const Radius.circular(2),
            child: TextField(
              controller: c.editor,
              focusNode: _focus,
              scrollController: _textScroll,
              minLines: wide ? 9 : 7,
              maxLines: wide ? 9 : 7,
              keyboardType: TextInputType.multiline,
              textInputAction: TextInputAction.newline,
              enableSuggestions: false,
              autocorrect: false,
              cursorColor: R.vermilion,
              style: R.serif(size: wide ? 15 : 14.5, weight: FontWeight.w400, color: R.ink, height: 1.9),
              decoration: InputDecoration(
                isCollapsed: true,
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 14, horizontal: 2),
                hintMaxLines: 8,
                hintText: '把要签的条款贴到这里，例如：\n\n第一条 合同期限\n本合同为固定期限劳动合同，合同期限自……\n\n第二条 劳动报酬\n乙方试用期工资为每月……',
                hintStyle: R.serif(
                  size: wide ? 15 : 14.5,
                  weight: FontWeight.w400,
                  color: R.faint,
                  height: 1.9,
                ),
              ),
            ),
          ),
          const Divider(height: 1, color: R.rule2),
          AnimatedSize(
            duration: const Duration(milliseconds: 220),
            alignment: Alignment.topCenter,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (c.busy) ...[
                  const SizedBox(height: 14),
                  _BusyBlock(controller: c),
                ],
                if (!c.busy && c.ocrUsed) ...[
                  const SizedBox(height: 14),
                  const InfoNote(
                    tone: NoteTone.pine,
                    icon: Icons.shield_outlined,
                    message: '识别文字已填入正文，可以直接修改。请对照原件核对金额、日期和条款编号，再开始核对。',
                  ),
                ],
                if (!c.busy && c.notes.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  InfoNote(
                    tone: NoteTone.warning,
                    icon: Icons.description_outlined,
                    message: c.notes.join('\n'),
                    onClose: c.clearNotes,
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 14),
          LayoutBuilder(
            builder: (context, constraints) {
              final actions = Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  DeskButton(
                    label: '导入文件',
                    icon: Icons.file_upload_outlined,
                    kind: DeskButtonKind.outline,
                    height: 38,
                    compact: true,
                    onPressed: c.busy ? null : widget.onImportFile,
                  ),
                  DeskButton(
                    label: '读取剪贴板',
                    icon: Icons.content_paste,
                    kind: DeskButtonKind.outline,
                    height: 38,
                    compact: true,
                    onPressed: c.busy ? null : widget.onClipboard,
                  ),
                  DeskButton(
                    label: '图片识别',
                    icon: Icons.image_outlined,
                    kind: DeskButtonKind.outline,
                    height: 38,
                    compact: true,
                    onPressed: c.busy ? null : widget.onImage,
                  ),
                ],
              );
              if (constraints.maxWidth >= 520) {
                return Row(
                  children: [
                    actions,
                    const Spacer(),
                    Text(
                      'PDF / Word / TXT',
                      style: R.sans(size: 11, color: R.faint, height: 1.4),
                    ),
                  ],
                );
              }
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  actions,
                  const SizedBox(height: 7),
                  Text(
                    'PDF / Word / TXT，也可以直接粘贴。',
                    style: R.sans(size: 11, color: R.faint, height: 1.4),
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 16),
          const Divider(height: 1, color: R.rule2),
          const SizedBox(height: 14),
          if (width < 560) ...[
            Row(
              children: [
                const Icon(Icons.lock_outline, size: 13, color: R.muted),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    '只在本机核对，不上传、不保留',
                    style: R.sans(size: 11.5, color: R.muted, height: 1.4),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                DeskButton(
                  label: '清空',
                  kind: DeskButtonKind.quiet,
                  height: 42,
                  onPressed: c.hasText && !c.busy ? c.clearText : null,
                ),
                const SizedBox(width: 8),
                DeskButton(
                  label: c.analysis != null ? '重新核对' : '开始核对',
                  icon: Icons.arrow_forward,
                  kind: DeskButtonKind.primary,
                  height: 44,
                  onPressed: c.canReview ? _start : null,
                ),
              ],
            ),
          ] else
            Row(
              children: [
                const Icon(Icons.lock_outline, size: 13, color: R.muted),
                const SizedBox(width: 6),
                Text(
                  '只在本机核对，不上传、不保留',
                  style: R.sans(size: 11.5, color: R.muted, height: 1.4),
                ),
                const Spacer(),
                DeskButton(
                  label: '清空',
                  kind: DeskButtonKind.quiet,
                  height: 42,
                  onPressed: c.hasText && !c.busy ? c.clearText : null,
                ),
                const SizedBox(width: 8),
                DeskButton(
                  label: c.analysis != null ? '重新核对' : '开始核对',
                  icon: Icons.arrow_forward,
                  kind: DeskButtonKind.primary,
                  height: 44,
                  onPressed: c.canReview ? _start : null,
                ),
              ],
            ),
          if (c.error != null) ...[
            const SizedBox(height: 12),
            InfoNote(tone: NoteTone.danger, message: c.error!),
          ],
          const SizedBox(height: 12),
          Text(
            '支持劳动合同、实习协议、三方协议、培训贷。导入的扫描件会用本机 OCR 识别，文字先进入上方编辑框，确认后再核对。',
            style: R.sans(size: 11.5, color: R.muted, height: 1.7),
          ),
        ],
      ),
    );
  }
}

class _DocTypeButton extends StatefulWidget {
  const _DocTypeButton({required this.controller});

  final ReviewController controller;

  @override
  State<_DocTypeButton> createState() => _DocTypeButtonState();
}

class _DocTypeButtonState extends State<_DocTypeButton> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final c = widget.controller;
    return PopupMenuButton<String>(
      tooltip: '选择合同类型',
      initialValue: c.docTypeChoice,
      onSelected: c.setDocType,
      position: PopupMenuPosition.under,
      color: R.sheet,
      elevation: 8,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(6),
        side: const BorderSide(color: R.rule),
      ),
      itemBuilder: (context) {
        final entries = <(String, String)>[
          ('auto', '自动识别类型'),
          for (final entry in docLabel.entries) (entry.key, entry.value),
        ];
        return [
          for (final entry in entries)
            PopupMenuItem<String>(
              value: entry.$1,
              height: 42,
              child: Row(
                children: [
                  SizedBox(
                    width: 20,
                    child: entry.$1 == c.docTypeChoice
                        ? const Icon(Icons.check, size: 15, color: R.pine)
                        : null,
                  ),
                  Text(entry.$2, style: R.sans(size: 12.5, color: R.ink2)),
                ],
              ),
            ),
        ];
      },
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        onEnter: (_) => setState(() => _hover = true),
        onExit: (_) => setState(() => _hover = false),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 140),
          height: 28,
          padding: const EdgeInsets.only(left: 8, right: 5),
          decoration: BoxDecoration(
            color: _hover ? R.sheet2 : R.sheet,
            border: Border.all(color: R.ruleStrong),
            borderRadius: BorderRadius.circular(3),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                c.docTypeLabel,
                style: R.sans(size: 11.5, color: R.ink2, height: 1.3),
              ),
              const SizedBox(width: 3),
              const Icon(Icons.expand_more, size: 14, color: R.faint),
            ],
          ),
        ),
      ),
    );
  }
}

class _BusyBlock extends StatelessWidget {
  const _BusyBlock({required this.controller});

  final ReviewController controller;

  @override
  Widget build(BuildContext context) {
    final c = controller;
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 11),
      decoration: BoxDecoration(
        color: R.sheet2,
        border: Border.all(color: R.rule),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        children: [
          Row(
            children: [
              const SizedBox(
                width: 14,
                height: 14,
                child: CircularProgressIndicator(strokeWidth: 2, color: R.pine),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  c.busyNote ?? c.busyTitle,
                  style: R.sans(size: 12.5, color: R.ink2, height: 1.5),
                ),
              ),
              if (c.progress != null)
                Text(
                  '${(c.progress!.clamp(0, 1) * 100).round()}%',
                  style: R.num(size: 12, color: R.muted),
                ),
            ],
          ),
          const SizedBox(height: 9),
          ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: LinearProgressIndicator(
              value: c.progress?.clamp(0.02, 1),
              minHeight: 3,
              backgroundColor: R.rule,
              color: R.vermilion,
            ),
          ),
        ],
      ),
    );
  }
}

class _SampleRail extends StatelessWidget {
  const _SampleRail({required this.onPick, this.activeId});

  final Future<void> Function(SampleDoc sample) onPick;
  final String? activeId;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(height: 1.5, color: R.ink),
        const SizedBox(height: 16),
        Text(
          '没有在手边的合同？',
          style: R.serif(size: 20, weight: FontWeight.w600, height: 1.5, letterSpacing: 0.2),
        ),
        const SizedBox(height: 4),
        Text(
          '载入一份试用文本，走一遍完整审阅。',
          style: R.sans(size: 12.5, color: R.muted, height: 1.7),
        ),
        const SizedBox(height: 14),
        for (final sample in samples)
          _SampleRow(
            sample: sample,
            active: sample.id == activeId,
            onTap: () => onPick(sample),
          ),
        const Divider(height: 1, color: R.rule),
        const SizedBox(height: 20),
        Text(
          '核对范围',
          style: R.sans(
            size: 11,
            weight: FontWeight.w500,
            color: R.faint,
            letterSpacing: 1.3,
            height: 1.4,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          '试用期 · 违约金 · 服务期 · 竞业 · 押金扣押 · 工时加班 · 工资社保 · 休假 · 保密 · 离职手续 · 合同签订 · 实习 · 培训贷',
          style: R.sans(size: 11.5, color: R.muted, height: 1.9),
        ),
      ],
    );
  }
}

class _SampleRow extends StatefulWidget {
  const _SampleRow({required this.sample, required this.onTap, this.active = false});

  final SampleDoc sample;
  final VoidCallback onTap;
  final bool active;

  @override
  State<_SampleRow> createState() => _SampleRowState();
}

class _SampleRowState extends State<_SampleRow> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: widget.onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            padding: const EdgeInsets.symmetric(vertical: 13, horizontal: 4),
            decoration: BoxDecoration(
              border: const Border(top: BorderSide(color: R.rule)),
              color: _hover ? R.sheet.withValues(alpha: 0.65) : Colors.transparent,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5),
                      height: 19,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: R.sheet,
                        border: Border.all(color: R.ruleStrong),
                        borderRadius: BorderRadius.circular(2),
                      ),
                      child: Text(
                        widget.sample.type,
                        style: R.sans(size: 10.5, color: R.muted, height: 1),
                      ),
                    ),
                    const SizedBox(width: 9),
                    Expanded(
                      child: Text(
                        widget.sample.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: R.serif(
                          size: 15.5,
                          weight: FontWeight.w600,
                          color: widget.active ? R.vermilion : R.ink,
                          height: 1.4,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      width: 30,
                      height: 30,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _hover ? R.pine : R.sheet,
                        border: Border.all(color: _hover ? R.pine : R.ruleStrong),
                      ),
                      child: Icon(
                        Icons.arrow_forward,
                        size: 14,
                        color: _hover ? R.cream : R.muted,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 5),
                Padding(
                  padding: const EdgeInsets.only(left: 4),
                  child: Text(
                    widget.sample.sub,
                    style: R.sans(size: 11.5, color: R.muted, height: 1.55),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

enum _ImageSource { camera, gallery }

class _ImageSourceSheet extends StatelessWidget {
  const _ImageSourceSheet();

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.paddingOf(context).bottom;
    return Container(
      decoration: const BoxDecoration(
        color: R.sheet,
        borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
      ),
      padding: EdgeInsets.fromLTRB(20, 18, 20, 16 + bottom),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 6,
                height: 6,
                transform: Matrix4.rotationZ(0.785398),
                decoration: const BoxDecoration(color: R.vermilion),
              ),
              const SizedBox(width: 10),
              Text('识别图片文字', style: R.serif(size: 17, weight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            '图片只在本机识别，不会上传。',
            style: R.sans(size: 12, color: R.muted, height: 1.6),
          ),
          const SizedBox(height: 16),
          _SourceOption(
            icon: Icons.photo_camera_outlined,
            title: '拍照识别',
            subtitle: '把合同放平，让文字占满画面',
            onTap: () => Navigator.of(context).pop(_ImageSource.camera),
          ),
          const SizedBox(height: 8),
          _SourceOption(
            icon: Icons.image_outlined,
            title: '从相册选择',
            subtitle: '可一次选择多页，按顺序拼接',
            onTap: () => Navigator.of(context).pop(_ImageSource.gallery),
          ),
          const SizedBox(height: 12),
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            style: TextButton.styleFrom(
              foregroundColor: R.muted,
              minimumSize: const Size.fromHeight(40),
            ),
            child: const Text('取消'),
          ),
        ],
      ),
    );
  }
}

class _SourceOption extends StatelessWidget {
  const _SourceOption({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: R.sheet2,
      borderRadius: BorderRadius.circular(6),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(6),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            border: Border.all(color: R.rule),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Row(
            children: [
              Container(
                width: 38,
                height: 38,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: R.sheet,
                  border: Border.all(color: R.rule),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Icon(icon, size: 18, color: R.pine),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: R.serif(size: 14.5, weight: FontWeight.w600)),
                    const SizedBox(height: 2),
                    Text(subtitle, style: R.sans(size: 11.5, color: R.muted, height: 1.5)),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, size: 18, color: R.faint),
            ],
          ),
        ),
      ),
    );
  }
}