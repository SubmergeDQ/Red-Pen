import 'package:flutter/foundation.dart';
import 'package:material_ui/material_ui.dart';

import '../design/design.dart';
import '../engine/engine.dart';
import '../state/review_controller.dart';

class IntakePage extends StatefulWidget {
  const IntakePage({super.key, required this.controller});

  final ReviewController controller;

  @override
  State<IntakePage> createState() => _IntakePageState();
}

class _IntakePageState extends State<IntakePage> {
  final ScrollController _scroll = ScrollController(keepScrollOffset: false);
  final GlobalKey _editorKey = GlobalKey();

  ReviewController get c => widget.controller;

  @override
  void initState() {
    super.initState();
    // 首次进入固定从页面顶部开始，避免窗口尺寸变化后继承旧的滚动偏移
    // 把「签约前 5 分钟」徽标裁掉。
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) _scroll.jumpTo(0);
    });
  }

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _revealEditor() async {
    if (!mounted) return;
    if (MediaQuery.sizeOf(context).width >= 1000) return;
    await Future<void>.delayed(const Duration(milliseconds: 80));
    if (!mounted) return;
    final targetContext = _editorKey.currentContext;
    if (targetContext == null || !targetContext.mounted) return;
    await Scrollable.ensureVisible(
      targetContext,
      duration: AppDuration.slow,
      curve: AppDuration.curve,
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
    final choice = await showAppSheet<_ImageSource>(
      context: context,
      builder: (context) => const _ImageSourceSheet(),
    );
    if (choice == null) return;
    await c.importImage(camera: choice == _ImageSource.camera);
    if (c.hasText) _revealEditor();
  }

  void _start() {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    c.startReview();
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final dense = constraints.maxHeight < 780;
        return _buildPage(context, dense);
      },
    );
  }

  Widget _buildPage(BuildContext context, bool dense) {
    final width = MediaQuery.sizeOf(context).width;
    final twoColumn = width >= 1000;
    final horizontal = width >= 760 ? AppSpace.x8 : AppSpace.x4;
    final vertical = dense ? AppSpace.x6 : AppSpace.x8;

    final editor = _EditorCard(
      key: _editorKey,
      controller: c,
      compact: !twoColumn,
      dense: dense,
      fillHeight: twoColumn,
      onImportFile: _importFile,
      onClipboard: _readClipboard,
      onImage: _importImage,
      onStart: _start,
    );
    final samplesPanel = _SamplePanel(
      controller: c,
      onPick: _loadSample,
      fillHeight: twoColumn,
    );
    final disclaimer = Text(
      '以上为签约前风险提示，基于你提供的文本和通用规定，不构成法律意见。涉及金额较大或已产生争议，请拨打 12348 公共法律服务热线，或联系学校法律援助中心。',
      style: AppType.caption(color: AppColors.inkTertiary),
    );

    if (twoColumn) {
      return Column(
        children: [
          Expanded(
            child: Padding(
              padding: EdgeInsets.fromLTRB(horizontal, vertical, horizontal, vertical),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 1180),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _Hero(compact: false, dense: dense),
                      SizedBox(height: dense ? AppSpace.x4 : AppSpace.x6),
                      Expanded(
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Expanded(child: editor),
                            const SizedBox(width: AppSpace.x6),
                            SizedBox(width: 340, child: samplesPanel),
                          ],
                        ),
                      ),
                      SizedBox(height: dense ? AppSpace.x5 : AppSpace.x8),
                      disclaimer,
                    ],
                  ),
                ),
              ),
            ),
          ),
          _DesktopActionBar(controller: c, onStart: _start),
        ],
      );
    }

    final body = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _Hero(compact: true, dense: dense),
        const SizedBox(height: AppSpace.x6),
        editor,
        const SizedBox(height: AppSpace.x6),
        samplesPanel,
        SizedBox(height: dense ? AppSpace.x5 : AppSpace.x8),
        disclaimer,
      ],
    );

    return Column(
      children: [
        Expanded(
          child: Scrollbar(
            controller: _scroll,
            child: SingleChildScrollView(
              controller: _scroll,
              padding: EdgeInsets.fromLTRB(horizontal, vertical, horizontal, vertical),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 1180),
                  child: body,
                ),
              ),
            ),
          ),
        ),
        _MobileActionBar(controller: c, onStart: _start),
      ],
    );
  }
}

class _Hero extends StatelessWidget {
  const _Hero({required this.compact, required this.dense});

  final bool compact;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    final titleStyle = (compact || dense ? AppType.h1() : AppType.display()).copyWith(height: 1.22);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Text.rich(
                TextSpan(
                  children: [
                    const TextSpan(text: '签之前，\n先看清'),
                    TextSpan(
                      text: '每一行',
                      style: TextStyle(color: AppColors.accent),
                    ),
                    const TextSpan(text: '。'),
                  ],
                ),
                style: titleStyle,
              ),
            ),
            const SizedBox(width: AppSpace.x3),
            const Padding(
              padding: EdgeInsets.only(top: 2),
              child: SignBadge(),
            ),
          ],
        ),
        SizedBox(height: dense ? AppSpace.x2 : AppSpace.x3),
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 620),
          child: Text(
            compact
                ? '粘贴合同条款，逐条核对风险、依据与谈判说法。'
                : '粘贴合同条款，按 ${ruleLibrary.length} 类规则逐条核对：哪条是红线、哪条能谈、该问谁。',
            style: AppType.body(color: AppColors.inkSecondary).copyWith(
              fontSize: compact ? 14 : 15,
            ),
          ),
        ),
        SizedBox(height: dense ? AppSpace.x2 + 2 : AppSpace.x4),
        Wrap(
          spacing: AppSpace.x2,
          runSpacing: AppSpace.x2,
          children: [
            AppTag(label: '${ruleLibrary.length} 类规则', tone: AppTone.neutral),
            const AppTag(label: '4 类合同', tone: AppTone.neutral),
            const AppTag(label: '本机 OCR', tone: AppTone.neutral),
            const AppTag(label: '合同不上传', tone: AppTone.neutral),
          ],
        ),
      ],
    );
  }
}

class _EditorCard extends StatefulWidget {
  const _EditorCard({
    super.key,
    required this.controller,
    required this.compact,
    required this.dense,
    required this.fillHeight,
    required this.onImportFile,
    required this.onClipboard,
    required this.onImage,
    required this.onStart,
  });

  final ReviewController controller;
  final bool compact;
  final bool dense;
  final bool fillHeight;
  final Future<void> Function() onImportFile;
  final Future<void> Function() onClipboard;
  final Future<void> Function() onImage;
  final VoidCallback onStart;

  @override
  State<_EditorCard> createState() => _EditorCardState();
}

class _EditorHeader extends StatelessWidget {
  const _EditorHeader({required this.controller, required this.narrow});

  final ReviewController controller;
  final bool narrow;

  ReviewController get c => controller;

  @override
  Widget build(BuildContext context) {
    final title = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '合同正文',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: AppType.h3(),
        ),
        const SizedBox(height: 1),
        Text(
          '粘贴、导入或拍照识别',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: AppType.caption(),
        ),
      ],
    );
    final select = AppSelect<String>(
      value: c.docTypeChoice,
      compact: true,
      icon: AppIcons.filter,
      options: [
        const AppSelectOption(value: 'auto', label: '自动识别类型'),
        for (final entry in docLabel.entries)
          AppSelectOption(value: entry.key, label: entry.value),
      ],
      onChanged: c.setDocType,
    );
    final count = Text(
      c.hasText ? '${c.charCount} 字' : '0 字',
      maxLines: 1,
      softWrap: false,
      style: AppType.num(
        color: c.hasText ? AppColors.ink : AppColors.inkDisabled,
        size: 12,
      ).copyWith(fontWeight: FontWeight.w600),
    );
    final clear = c.hasText
        ? AppIconButton(
            icon: AppIcons.close,
            tooltip: '清空正文',
            onPressed: c.busy ? null : c.clearText,
          )
        : null;

    if (!narrow) {
      return Row(
        children: [
          const IconTile(icon: AppIcons.edit, size: 36),
          const SizedBox(width: AppSpace.x3),
          Expanded(child: title),
          const SizedBox(width: AppSpace.x2),
          select,
          const SizedBox(width: AppSpace.x2),
          count,
          ?clear,
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            const IconTile(icon: AppIcons.edit, size: 36),
            const SizedBox(width: AppSpace.x3),
            Expanded(child: title),
            ?clear,
          ],
        ),
        const SizedBox(height: AppSpace.x2 + 2),
        Row(
          children: [
            select,
            const Spacer(),
            count,
          ],
        ),
      ],
    );
  }
}

class _EditorCardState extends State<_EditorCard> {
  final FocusNode _focus = FocusNode();
  final ScrollController _textScroll = ScrollController();
  bool _focused = false;

  ReviewController get c => widget.controller;

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
    return AppCard(
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.fromLTRB(
              AppSpace.x5,
              widget.dense ? AppSpace.x3 : AppSpace.x4,
              AppSpace.x3,
              widget.dense ? AppSpace.x2 : AppSpace.x3,
            ),
            child: LayoutBuilder(
              builder: (context, constraints) => _EditorHeader(
                controller: c,
                narrow: constraints.maxWidth < 520,
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.fromLTRB(
              AppSpace.x5,
              0,
              AppSpace.x5,
              widget.dense ? AppSpace.x1 : AppSpace.x2,
            ),
            child: Row(
              children: [
                Text(
                  c.hasText ? '已载入 · ${c.sourceName.isEmpty ? '正文' : c.sourceName}' : '等待输入',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppType.caption(color: AppColors.inkTertiary),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpace.x2),
          if (widget.fillHeight)
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpace.x4),
                child: _buildTextArea(),
              ),
            )
          else
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpace.x4),
              child: _buildTextArea(),
            ),
          if (c.busy || c.ocrUsed || c.notes.isNotEmpty || c.error != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(AppSpace.x4, AppSpace.x3, AppSpace.x4, 0),
              child: Column(
                children: [
                  if (c.busy) _BusyBanner(controller: c),
                  if (!c.busy && c.ocrUsed)
                    const AppBanner(
                      tone: AppTone.brand,
                      icon: AppIcons.image,
                      message: '识别文字已填入正文，可以直接修改。请对照原件核对金额、日期和条款编号，再开始核对。',
                    ),
                  if (!c.busy && c.ocrUsed && c.notes.isNotEmpty) const SizedBox(height: AppSpace.x2),
                  if (!c.busy && c.notes.isNotEmpty)
                    AppBanner(
                      tone: AppTone.amber,
                      message: c.notes.join('\n'),
                      onClose: c.clearNotes,
                    ),
                  if (c.error != null) ...[
                    if (c.busy || c.ocrUsed || c.notes.isNotEmpty) const SizedBox(height: AppSpace.x2),
                    AppBanner(tone: AppTone.red, message: c.error!),
                  ],
                ],
              ),
            ),
          Padding(
            padding: EdgeInsets.fromLTRB(
              AppSpace.x4,
              widget.dense ? AppSpace.x2 + 2 : AppSpace.x4,
              AppSpace.x4,
              widget.dense ? AppSpace.x2 : AppSpace.x3,
            ),
            child: Wrap(
              spacing: AppSpace.x2,
              runSpacing: AppSpace.x2,
              children: [
                AppButton(
                  label: '导入文件',
                  icon: AppIcons.upload,
                  tone: AppButtonTone.secondary,
                  size: AppButtonSize.sm,
                  onPressed: c.busy ? null : widget.onImportFile,
                ),
                AppButton(
                  label: '读取剪贴板',
                  icon: AppIcons.paste,
                  tone: AppButtonTone.secondary,
                  size: AppButtonSize.sm,
                  onPressed: c.busy ? null : widget.onClipboard,
                ),
                AppButton(
                  label: '图片识别',
                  icon: AppIcons.image,
                  tone: AppButtonTone.secondary,
                  size: AppButtonSize.sm,
                  onPressed: c.busy ? null : widget.onImage,
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 2, top: 6),
                  child: Text('PDF / Word / TXT', style: AppType.caption()),
                ),
              ],
            ),
          ),
          Container(
            padding: EdgeInsets.fromLTRB(
              AppSpace.x5,
              widget.dense ? AppSpace.x2 : AppSpace.x3,
              AppSpace.x4,
              widget.dense ? AppSpace.x2 : AppSpace.x3,
            ),
            decoration: const BoxDecoration(
              color: AppColors.surfaceMuted,
              border: Border(top: BorderSide(color: AppColors.border)),
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(AppRadius.lg)),
            ),
            child: Row(
              children: [
                const Icon(AppIcons.lock, size: 14, color: AppColors.inkTertiary),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    '合同只在本机核对，不上传、不留存',
                    style: AppType.caption().copyWith(fontSize: 11.5),
                  ),
                ),
                if (!widget.compact)
                  Text('Ctrl + Enter 开始核对', style: AppType.caption(color: AppColors.inkDisabled)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextArea() {
    return AppField(
      focused: _focused,
      padding: const EdgeInsets.symmetric(horizontal: AppSpace.x3, vertical: AppSpace.x2),
      child: Scrollbar(
        controller: _textScroll,
        thumbVisibility: true,
        child: TextField(
          controller: c.editor,
          focusNode: _focus,
          scrollController: _textScroll,
          expands: widget.fillHeight,
          minLines: widget.fillHeight ? null : 7,
          maxLines: widget.fillHeight ? null : 7,
          keyboardType: TextInputType.multiline,
          textInputAction: TextInputAction.newline,
          enableSuggestions: false,
          autocorrect: false,
          cursorColor: AppColors.accent,
          style: AppType.body(color: AppColors.ink).copyWith(height: 1.85),
          decoration: InputDecoration(
            isCollapsed: true,
            border: InputBorder.none,
            hintMaxLines: 8,
            hintText: '把要签的条款贴到这里，例如：\n\n第一条 合同期限\n本合同为固定期限劳动合同，合同期限自……\n\n第二条 劳动报酬\n乙方试用期工资为每月……',
            hintStyle: AppType.body(color: AppColors.inkDisabled).copyWith(height: 1.85),
          ),
        ),
      ),
    );
  }
}

class _DesktopActionBar extends StatelessWidget {
  const _DesktopActionBar({required this.controller, required this.onStart});

  final ReviewController controller;
  final VoidCallback onStart;

  @override
  Widget build(BuildContext context) {
    final c = controller;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpace.x8, vertical: AppSpace.x3),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1180),
          child: Row(
            children: [
              const Icon(AppIcons.lock, size: 14, color: AppColors.inkTertiary),
              const SizedBox(width: 6),
              Text(
                '合同只在本机核对，不上传、不留存',
                style: AppType.caption().copyWith(fontSize: 11.5),
              ),
              const SizedBox(width: AppSpace.x3),
              Text(
                c.hasText ? '${c.charCount} 字' : '等待输入',
                style: AppType.caption(color: AppColors.inkDisabled),
              ),
              const Spacer(),
              AppButton(
                label: '清空',
                tone: AppButtonTone.ghost,
                onPressed: c.hasText && !c.busy ? c.clearText : null,
              ),
              const SizedBox(width: AppSpace.x2),
              AppButton(
                label: c.analysis != null ? '重新核对' : '开始核对',
                icon: AppIcons.forward,
                size: AppButtonSize.lg,
                onPressed: c.canReview ? onStart : null,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BusyBanner extends StatelessWidget {
  const _BusyBanner({required this.controller});

  final ReviewController controller;

  @override
  Widget build(BuildContext context) {
    final c = controller;
    return Container(
      padding: const EdgeInsets.fromLTRB(AppSpace.x3, AppSpace.x3, AppSpace.x3, AppSpace.x3),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Column(
        children: [
          Row(
            children: [
              const PulseDots(),
              const SizedBox(width: AppSpace.x3),
              Expanded(
                child: Text(
                  c.busyNote ?? c.busyTitle,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: AppType.bodySm(color: AppColors.inkSecondary),
                ),
              ),
              if (c.progress != null)
                Text(
                  '${(c.progress!.clamp(0, 1) * 100).round()}%',
                  style: AppType.num(color: AppColors.inkSecondary, size: 12)
                      .copyWith(fontWeight: FontWeight.w600),
                ),
            ],
          ),
          const SizedBox(height: AppSpace.x2),
          AppProgressBar(value: c.progress?.clamp(0.02, 1), height: 3),
        ],
      ),
    );
  }
}

class _SamplePanel extends StatefulWidget {
  const _SamplePanel({
    required this.controller,
    required this.onPick,
    required this.fillHeight,
  });

  final ReviewController controller;
  final Future<void> Function(SampleDoc sample) onPick;
  final bool fillHeight;

  @override
  State<_SamplePanel> createState() => _SamplePanelState();
}

class _SamplePanelState extends State<_SamplePanel> {
  final ScrollController _scroll = ScrollController();

  ReviewController get controller => widget.controller;

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.fillHeight) return _card(context, compact: false);
    // 桌面右栏高度随窗口变化：空间不足时收紧行距并收起「覆盖范围」说明，
    // 保证卡片内容完整落在可视区域内，而不是被卡片底边裁掉。
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxHeight < 520;
        return Scrollbar(
          controller: _scroll,
          child: SingleChildScrollView(
            controller: _scroll,
            physics: const ClampingScrollPhysics(),
            child: _card(context, compact: compact),
          ),
        );
      },
    );
  }

  Widget _card(BuildContext context, {required bool compact}) {
    return AppCard(
      padding: EdgeInsets.fromLTRB(
        AppSpace.x3,
        compact ? AppSpace.x3 : AppSpace.x4,
        AppSpace.x3,
        compact ? AppSpace.x3 : AppSpace.x4,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpace.x2),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(AppIcons.article, size: 17, color: AppColors.inkTertiary),
                    const SizedBox(width: 6),
                    Text('试用文本', style: AppType.h3()),
                  ],
                ),
                const SizedBox(height: 3),
                Text('没有合同在手边？载入一份走完整流程。', style: AppType.caption()),
              ],
            ),
          ),
          const SizedBox(height: AppSpace.x2),
          for (final sample in samples)
            _SampleRow(
              sample: sample,
              compact: compact,
              active: sample.id == controller.activeSample,
              onTap: () => widget.onPick(sample),
            ),
          if (!compact) ...[
            const SizedBox(height: AppSpace.x3),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpace.x2),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('覆盖范围', style: AppType.label()),
                  const SizedBox(height: AppSpace.x1 + 2),
                  Text(
                    '试用期 · 违约金 · 服务期 · 竞业 · 押金扣押 · 工时加班 · 工资社保 · 休假 · 保密 · 离职手续 · 合同签订 · 实习 · 培训贷',
                    style: AppType.caption(color: AppColors.inkTertiary).copyWith(height: 1.75),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _SampleRow extends StatefulWidget {
  const _SampleRow({
    required this.sample,
    required this.active,
    required this.onTap,
    this.compact = false,
  });

  final SampleDoc sample;
  final VoidCallback onTap;
  final bool active;
  final bool compact;

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
          borderRadius: BorderRadius.circular(AppRadius.sm),
          child: AnimatedContainer(
            duration: AppDuration.fast,
            padding: EdgeInsets.symmetric(
              horizontal: AppSpace.x2,
              vertical: widget.compact ? AppSpace.x2 : AppSpace.x3,
            ),
            decoration: BoxDecoration(
              color: _hover ? AppColors.surfaceMuted : Colors.transparent,
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
            child: Row(
              children: [
                Container(
                  width: widget.compact ? 30 : 34,
                  height: widget.compact ? 30 : 34,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: widget.active ? AppColors.accentSoft : AppColors.surfaceSunken,
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                  child: Icon(
                    AppIcons.article,
                    size: 17,
                    color: widget.active ? AppColors.accent : AppColors.inkTertiary,
                  ),
                ),
                const SizedBox(width: AppSpace.x3),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              widget.sample.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: AppType.strong(
                                color: widget.active ? AppColors.accent : AppColors.ink,
                                size: 13.5,
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          AppTag(label: widget.sample.type, compact: true),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        widget.sample.sub,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppType.caption(),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: AppSpace.x2),
                Icon(AppIcons.chevronRight, size: 18, color: AppColors.inkDisabled),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _MobileActionBar extends StatelessWidget {
  const _MobileActionBar({required this.controller, required this.onStart});

  final ReviewController controller;
  final VoidCallback onStart;

  @override
  Widget build(BuildContext context) {
    final c = controller;
    final bottom = MediaQuery.paddingOf(context).bottom;
    return Container(
      padding: EdgeInsets.fromLTRB(AppSpace.x4, AppSpace.x3, AppSpace.x4, AppSpace.x3 + bottom),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppColors.border)),
        boxShadow: AppShadow.card,
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  c.hasText ? '${c.charCount} 字' : '还没有载入合同',
                  style: AppType.strong(size: 12.5),
                ),
                Text('合同只在本机处理', style: AppType.caption().copyWith(fontSize: 11)),
              ],
            ),
          ),
          const SizedBox(width: AppSpace.x3),
          AppButton(
            label: c.analysis != null ? '重新核对' : '开始核对',
            icon: AppIcons.forward,
            size: AppButtonSize.lg,
            onPressed: c.canReview ? onStart : null,
          ),
        ],
      ),
    );
  }
}

enum _ImageSource { camera, gallery }

class _ImageSourceSheet extends StatelessWidget {
  const _ImageSourceSheet();

  @override
  Widget build(BuildContext context) {
    return AppDialogSurface(
      onlyTop: true,
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(AppSpace.x5, 0, AppSpace.x5, AppSpace.x5),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Center(child: SheetHandle()),
              Text('识别图片文字', style: AppType.h3()),
              const SizedBox(height: 3),
              Text('图片只在本机识别，不会上传。', style: AppType.caption()),
              const SizedBox(height: AppSpace.x4),
              _SourceOption(
                icon: AppIcons.camera,
                title: '拍照识别',
                subtitle: '把合同放平，让文字占满画面',
                onTap: () => Navigator.of(context).pop(_ImageSource.camera),
              ),
              const SizedBox(height: AppSpace.x2),
              _SourceOption(
                icon: AppIcons.image,
                title: '从相册选择',
                subtitle: '可一次选择多页，按顺序拼接',
                onTap: () => Navigator.of(context).pop(_ImageSource.gallery),
              ),
              const SizedBox(height: AppSpace.x3),
              AppButton(
                label: '取消',
                tone: AppButtonTone.ghost,
                expand: true,
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
        ),
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
    return AppCard(
      padding: const EdgeInsets.all(AppSpace.x3),
      onTap: onTap,
      flat: true,
      child: Row(
        children: [
          IconTile(icon: icon, size: 40, tone: IconTileTone.brand),
          const SizedBox(width: AppSpace.x3),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppType.strong(size: 14)),
                const SizedBox(height: 1),
                Text(subtitle, style: AppType.caption()),
              ],
            ),
          ),
          const Icon(AppIcons.chevronRight, size: 18, color: AppColors.inkDisabled),
        ],
      ),
    );
  }
}
