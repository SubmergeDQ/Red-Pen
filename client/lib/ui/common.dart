import 'dart:math' as math;

import 'package:material_ui/material_ui.dart';

import '../engine/engine.dart';
import '../state/review_controller.dart';
import '../theme.dart';

Color verdictColor(Verdict v) => switch (v) {
      Verdict.red => R.vermilion,
      Verdict.yellow => R.amber,
      Verdict.gray => R.slate,
      Verdict.green => R.moss,
    };

Color verdictSoft(Verdict v) => switch (v) {
      Verdict.red => R.vermilionSoft,
      Verdict.yellow => R.amberSoft,
      Verdict.gray => R.slateSoft,
      Verdict.green => R.mossSoft,
    };

class SealMark extends StatelessWidget {
  const SealMark({super.key, this.size = 32});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: '红笔',
      child: Transform.rotate(
        angle: -3 * math.pi / 180,
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            color: R.vermilion,
            borderRadius: BorderRadius.circular(3),
            border: Border.all(color: const Color(0x3DFFFFFF)),
            boxShadow: const [
              BoxShadow(color: Color(0x38101B16), offset: Offset(0, 2), blurRadius: 8),
            ],
          ),
          alignment: Alignment.center,
          child: Text(
            '签',
            style: R.serif(size: size * 0.6, weight: FontWeight.w700, color: R.cream, height: 1),
          ),
        ),
      ),
    );
  }
}

enum DeskButtonKind { primary, outline, quiet }

/// Vertical offset that puts an icon on the first line of a text block.
double iconTopOffset(TextStyle style, double iconSize) {
  final fontSize = style.fontSize ?? 14;
  final height = style.height ?? 1.2;
  return ((fontSize * height) - iconSize) / 2;
}

/// Icon + label on one shared line box.
///
/// The icon is centred inside a box exactly as tall as the label's line, so a
/// 12px label and a 18px label both keep the glyph on the same optical line.
class IconLabel extends StatelessWidget {
  const IconLabel({
    super.key,
    required this.icon,
    required this.label,
    this.iconSize = RI.dense,
    this.gap = RI.gapDense,
    this.color = R.muted,
    this.style,
    this.maxLines = 1,
    this.overflow = TextOverflow.ellipsis,
  });

  final IconData icon;
  final String label;
  final double iconSize;
  final double gap;
  final Color color;
  final TextStyle? style;
  final int maxLines;
  final TextOverflow overflow;

  @override
  Widget build(BuildContext context) {
    final textStyle = style ?? R.sans(size: 11.5, color: color, height: 1.45);
    final lineHeight = (textStyle.fontSize ?? 11.5) * (textStyle.height ?? 1.2);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: iconSize,
          height: lineHeight,
          child: Center(child: Icon(icon, size: iconSize, color: color)),
        ),
        SizedBox(width: gap),
        Flexible(
          child: Text(
            label,
            style: textStyle,
            maxLines: maxLines,
            overflow: overflow,
          ),
        ),
      ],
    );
  }
}

class DeskButton extends StatefulWidget {
  const DeskButton({
    super.key,
    required this.label,
    this.icon,
    this.onPressed,
    this.kind = DeskButtonKind.outline,
    this.height = 42,
    this.compact = false,
    this.expand = false,
  });

  final String label;
  final IconData? icon;
  final VoidCallback? onPressed;
  final DeskButtonKind kind;
  final double height;
  final bool compact;
  final bool expand;

  @override
  State<DeskButton> createState() => _DeskButtonState();
}

class _DeskButtonState extends State<DeskButton> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final enabled = widget.onPressed != null;
    final (bg, border, fg) = switch (widget.kind) {
      DeskButtonKind.primary => (
          _hover && enabled ? R.brand2 : R.brand,
          _hover && enabled ? R.brand2 : R.brand,
          R.cream,
        ),
      DeskButtonKind.outline => (
          _hover && enabled ? R.sheet2 : R.sheet,
          _hover && enabled ? R.focusBorder : R.ruleStrong,
          enabled ? R.ink2 : R.faint,
        ),
      DeskButtonKind.quiet => (
          _hover && enabled ? R.sheet2 : Colors.transparent,
          Colors.transparent,
          enabled ? R.muted : R.faint,
        ),
    };
    final labelStyle = R.sans(
      size: widget.compact ? 12.5 : 13.5,
      weight: FontWeight.w500,
      color: enabled ? fg : fg.withValues(alpha: 0.7),
      height: 1.2,
    );

    return MouseRegion(
      cursor: enabled ? SystemMouseCursors.click : SystemMouseCursors.basic,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 140),
        height: widget.height,
        width: widget.expand ? double.infinity : null,
        decoration: BoxDecoration(
          color: bg,
          border: Border.all(color: border),
          borderRadius: BorderRadius.circular(6),
          boxShadow: widget.kind == DeskButtonKind.primary && enabled ? R.shadowButton : null,
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: widget.onPressed,
            borderRadius: BorderRadius.circular(6),
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: widget.compact ? 12 : 16),
              child: Row(
                mainAxisSize: widget.expand ? MainAxisSize.max : MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (widget.icon != null) ...[
                    Icon(
                      widget.icon,
                      size: widget.compact ? RI.inline : RI.control,
                      color: enabled ? fg : fg.withValues(alpha: 0.7),
                    ),
                    const SizedBox(width: RI.gap),
                  ],
                  Flexible(
                    child: Text(
                      widget.label,
                      style: labelStyle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
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

class Eyebrow extends StatelessWidget {
  const Eyebrow(this.label, {super.key, this.dark = false});

  final String label;
  final bool dark;

  @override
  Widget build(BuildContext context) {
    final line = dark ? R.cream.withValues(alpha: 0.35) : R.ruleStrong;
    final text = dark ? R.cream.withValues(alpha: 0.62) : R.muted;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 26, height: 1, color: line),
        const SizedBox(width: 10),
        Container(
          width: 5,
          height: 5,
          decoration: BoxDecoration(color: R.accent.withValues(alpha: 0.9), shape: BoxShape.circle),
        ),
        const SizedBox(width: 9),
        Flexible(
          child: Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: R.sans(
              size: 11.5,
              weight: FontWeight.w500,
              color: text,
              letterSpacing: 1.6,
              height: 1.3,
            ),
          ),
        ),
      ],
    );
  }
}

class TagPill extends StatelessWidget {
  const TagPill({
    super.key,
    required this.label,
    required this.color,
    this.background,
    this.border,
  });

  final String label;
  final Color color;
  final Color? background;
  final Color? border;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: background ?? Colors.transparent,
        border: Border.all(color: border ?? Colors.transparent),
        borderRadius: BorderRadius.circular(2),
      ),
      child: Text(
        label,
        style: R.sans(
          size: 11,
          weight: FontWeight.w600,
          color: color,
          letterSpacing: 0.8,
          height: 1.45,
        ),
      ),
    );
  }
}

class InfoNote extends StatelessWidget {
  const InfoNote({
    super.key,
    required this.message,
    this.tone = NoteTone.warning,
    this.icon,
    this.onClose,
  });

  final String message;
  final NoteTone tone;
  final IconData? icon;
  final VoidCallback? onClose;

  @override
  Widget build(BuildContext context) {
    final (bg, border, fg) = switch (tone) {
      NoteTone.warning => (R.amberSoft, R.amberBorder, R.amberInk),
      NoteTone.danger => (R.vermilionSoft, R.vermilionBorder, R.vermilionInk),
      NoteTone.success => (R.mossSoft, R.mossBorder, R.mossInk),
      NoteTone.pine => (R.brandSoft, R.brandBorder, R.brandInk),
      NoteTone.neutral => (R.sheet2, R.rule, R.ink2),
    };
    return Container(
      padding: const EdgeInsets.fromLTRB(11, 9, 10, 9),
      decoration: BoxDecoration(
        color: bg,
        border: Border.all(color: border),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.only(top: iconTopOffset(R.sans(size: 12, height: 1.65), 15)),
            child: Icon(
              icon ?? (tone == NoteTone.danger ? Icons.error_outline : Icons.info_outline),
              size: 15,
              color: fg.withValues(alpha: 0.8),
            ),
          ),
          const SizedBox(width: RI.gap),
          Expanded(
            child: Text(
              message,
              style: R.sans(size: 12, color: fg, height: 1.65),
            ),
          ),
          if (onClose != null) ...[
            const SizedBox(width: 6),
            InkWell(
              onTap: onClose,
              borderRadius: BorderRadius.circular(3),
              child: Padding(
                padding: const EdgeInsets.all(2),
                child: Icon(Icons.close, size: 13, color: fg.withValues(alpha: 0.6)),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

enum NoteTone { warning, danger, success, pine, neutral }

class TopBarButton extends StatefulWidget {
  const TopBarButton({
    super.key,
    required this.icon,
    this.label,
    required this.onPressed,
    this.tooltip,
    this.height = 36,
    this.minWidth = 0,
  });

  final IconData icon;
  final String? label;
  final VoidCallback? onPressed;
  final String? tooltip;
  final double height;
  final double minWidth;

  @override
  State<TopBarButton> createState() => _TopBarButtonState();
}

class _TopBarButtonState extends State<TopBarButton> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final enabled = widget.onPressed != null;
    final button = MouseRegion(
      cursor: enabled ? SystemMouseCursors.click : SystemMouseCursors.basic,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 140),
        height: widget.height,
        constraints: BoxConstraints(minWidth: widget.minWidth),
        decoration: BoxDecoration(
          color: _hover && enabled ? R.cream.withValues(alpha: 0.08) : Colors.transparent,
          border: Border.all(color: R.cream.withValues(alpha: _hover && enabled ? 0.34 : 0.18)),
          borderRadius: BorderRadius.circular(5),
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: widget.onPressed,
            borderRadius: BorderRadius.circular(5),
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: widget.label == null ? 9 : 12),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(widget.icon, size: RI.control, color: R.cream.withValues(alpha: enabled ? 0.92 : 0.4)),
                  if (widget.label != null) ...[
                    const SizedBox(width: RI.gap),
                    Text(
                      widget.label!,
                      style: R.sans(
                        size: 12.5,
                        weight: FontWeight.w500,
                        color: R.cream.withValues(alpha: enabled ? 0.92 : 0.4),
                        height: 1.2,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
    return widget.tooltip == null ? button : Tooltip(message: widget.tooltip!, child: button);
  }
}

class DeskTopBar extends StatelessWidget {
  const DeskTopBar({
    super.key,
    required this.controller,
    required this.onHome,
    required this.onRules,
    required this.onCopyReport,
    required this.onNewDocument,
  });

  final ReviewController controller;
  final VoidCallback onHome;
  final VoidCallback onRules;
  final VoidCallback onCopyReport;
  final VoidCallback onNewDocument;

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final compact = width < 900;
    final showSub = width >= 560;
    final showPrivacy = width >= 1080;
    final a = controller.analysis;
    final metaText = a == null
        ? null
        : controller.riskCount == 0
            ? '${a.docType} · 未发现明显红线'
            : '${a.docType} · ${controller.riskCount} 处需看';
    final touch = width < 760;

    TopBarButton barButton({
      required IconData icon,
      String? label,
      String? tooltip,
      VoidCallback? onPressed,
    }) =>
        TopBarButton(
          icon: icon,
          label: label,
          tooltip: tooltip,
          onPressed: onPressed,
          height: touch ? 44 : 36,
          minWidth: touch ? 44 : 0,
        );

    return Container(
      decoration: const BoxDecoration(
        color: R.brand,
        boxShadow: [BoxShadow(color: R.topBarEdge, offset: Offset(0, 2), blurRadius: 8)],
      ),
      child: SafeArea(
        bottom: false,
        child: SizedBox(
          height: 60,
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1560),
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: width < 760 ? 16 : 28),
                child: Row(
                  children: [
                    InkWell(
                      onTap: onHome,
                      borderRadius: BorderRadius.circular(4),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 2),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const SealMark(),
                            const SizedBox(width: 12),
                            Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '红笔',
                                  style: R.serif(
                                    size: 17.5,
                                    weight: FontWeight.w600,
                                    color: R.cream,
                                    letterSpacing: 1.5,
                                    height: 1.2,
                                  ),
                                ),
                                if (showSub) ...[
                                  const SizedBox(height: 3),
                                  Text(
                                    '签约前 5 分钟 · 签约审阅台',
                                    style: R.sans(
                                      size: 10.5,
                                      color: R.cream.withValues(alpha: 0.55),
                                      letterSpacing: 1.8,
                                      height: 1.2,
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    if (!compact && metaText != null) ...[
                      const SizedBox(width: 22),
                      Container(width: 1, height: 26, color: R.cream.withValues(alpha: 0.16)),
                      const SizedBox(width: 18),
                      Container(
                        width: 5,
                        height: 5,
                        decoration: const BoxDecoration(color: R.gold, shape: BoxShape.circle),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          metaText,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: R.sans(
                            size: 12.5,
                            color: R.cream.withValues(alpha: 0.72),
                            height: 1.3,
                          ),
                        ),
                      ),
                    ] else
                      const Spacer(),
                    if (showPrivacy) ...[
                      IconLabel(
                        icon: Icons.lock_outline,
                        label: '仅本机处理',
                        iconSize: RI.dense,
                        gap: RI.gapDense,
                        color: R.cream.withValues(alpha: 0.6),
                        style: R.sans(
                          size: 11.5,
                          color: R.cream.withValues(alpha: 0.6),
                          letterSpacing: 0.4,
                          height: 1.2,
                        ),
                      ),
                      const SizedBox(width: 18),
                    ],
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        barButton(
                          icon: Icons.menu_book_outlined,
                          label: compact ? null : '核对依据',
                          tooltip: '核对依据',
                          onPressed: onRules,
                        ),
                        const SizedBox(width: 8),
                        if (controller.phase == Phase.report) ...[
                          barButton(
                            icon: Icons.picture_as_pdf_outlined,
                            label: compact ? null : '导出 PDF',
                            tooltip: '导出 PDF 报告',
                            onPressed: controller.exporting ? null : controller.exportPdf,
                          ),
                          const SizedBox(width: 8),
                          barButton(
                            icon: Icons.copy,
                            label: compact ? null : '复制报告',
                            tooltip: '复制核对报告',
                            onPressed: onCopyReport,
                          ),
                          const SizedBox(width: 8),
                          barButton(
                            icon: Icons.refresh,
                            label: width >= 1180 ? '换一份' : null,
                            tooltip: '换一份合同',
                            onPressed: onNewDocument,
                          ),
                        ] else if (controller.phase == Phase.analyzing)
                          barButton(
                            icon: Icons.close,
                            label: compact ? null : '取消',
                            tooltip: '取消核对',
                            onPressed: onNewDocument,
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

Future<void> showRulesPanel(BuildContext context) {
  final size = MediaQuery.sizeOf(context);
  final isNarrow = size.width < 760;
  if (isNarrow) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      barrierColor: R.barrier,
      builder: (context) => SizedBox(
        height: size.height * 0.92,
        child: const _RulesCard(roundedTop: true),
      ),
    );
  }
  return showDialog<void>(
    context: context,
    barrierColor: R.barrier,
    builder: (context) => Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.all(24),
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: 660, maxHeight: size.height * 0.86),
        child: const _RulesCard(),
      ),
    ),
  );
}

class _RulesCard extends StatelessWidget {
  const _RulesCard({this.roundedTop = false});

  final bool roundedTop;

  @override
  Widget build(BuildContext context) {
    final radius = roundedTop
        ? const BorderRadius.vertical(top: Radius.circular(12))
        : BorderRadius.circular(8);
    return Container(
      decoration: BoxDecoration(
        color: R.sheet,
        borderRadius: radius,
        border: Border.all(color: R.rule),
        boxShadow: R.shadowFloat,
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(22, 20, 16, 16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Eyebrow('核对依据'),
                      const SizedBox(height: 10),
                      Text(
                        '${ruleLibrary.length} 类规则与法律出处',
                        style: R.serif(size: 21, weight: FontWeight.w600, letterSpacing: 0.3, height: 1.4),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  tooltip: '关闭',
                  icon: const Icon(Icons.close, size: RI.leading),
                  color: R.muted,
                  style: IconButton.styleFrom(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(4),
                      side: const BorderSide(color: R.rule),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: R.rule),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(vertical: 4),
              itemCount: ruleLibrary.length,
              separatorBuilder: (_, _) => const Divider(height: 1, color: R.rule2, indent: 22, endIndent: 22),
              itemBuilder: (context, index) {
                final rule = ruleLibrary[index];
                return Padding(
                  padding: const EdgeInsets.fromLTRB(22, 14, 22, 14),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 32,
                        height: 20,
                        margin: const EdgeInsets.only(top: 2),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: R.sheet2,
                          border: Border.all(color: R.rule),
                          borderRadius: BorderRadius.circular(2),
                        ),
                        child: Text(
                          rule.id,
                          style: R.serif(size: 11.5, color: R.brand, weight: FontWeight.w600, height: 1),
                        ),
                      ),
                      const SizedBox(width: 13),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(rule.name, style: R.serif(size: 14.5, weight: FontWeight.w600, height: 1.45)),
                            const SizedBox(height: 2),
                            Text(rule.cite, style: R.sans(size: 11.5, color: R.muted, height: 1.5)),
                            const SizedBox(height: 5),
                            Text(rule.gist, style: R.sans(size: 12.5, color: R.ink2, height: 1.7)),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(22, 13, 22, 15),
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: R.rule)),
              color: R.sheet2,
            ),
            child: Text(
              '规则覆盖常见条款，不替代律师。条文序号无法确认的，会标注「需核对」而不是猜测。界面与规则都在本机运行。',
              style: R.sans(size: 11, color: R.muted, height: 1.7),
            ),
          ),
        ],
      ),
    );
  }
}