import 'package:material_ui/material_ui.dart';

import '../tokens.dart';
import '../icons.dart';

/// 统一卡片：白底、1px 边界、14 圆角，只有可点击时才响应悬停。
class AppCard extends StatefulWidget {
  const AppCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(AppSpace.x5),
    this.onTap,
    this.selected = false,
    this.flat = false,
    this.radius = AppRadius.lg,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final bool selected;
  final bool flat;
  final double radius;

  @override
  State<AppCard> createState() => _AppCardState();
}

class _AppCardState extends State<AppCard> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final clickable = widget.onTap != null;
    final borderColor = widget.selected
        ? AppColors.accent
        : _hover && clickable
            ? AppColors.borderStrong
            : AppColors.border;
    final content = AnimatedContainer(
      duration: AppDuration.fast,
      padding: widget.padding,
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border.all(color: borderColor, width: widget.selected ? 1.5 : 1),
        borderRadius: BorderRadius.circular(widget.radius),
        boxShadow: widget.flat ? null : AppShadow.card,
      ),
      child: widget.child,
    );
    if (!clickable) return content;
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: widget.onTap,
          borderRadius: BorderRadius.circular(widget.radius),
          child: content,
        ),
      ),
    );
  }
}

/// 区块标题：小号标签 + 标题 + 说明，右侧放一个次要动作。
class SectionHeader extends StatelessWidget {
  const SectionHeader({
    super.key,
    required this.title,
    this.eyebrow,
    this.subtitle,
    this.trailing,
    this.padding = EdgeInsets.zero,
  });

  final String title;
  final String? eyebrow;
  final String? subtitle;
  final Widget? trailing;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (eyebrow != null) ...[
                  Text(eyebrow!.toUpperCase(), style: AppType.label()),
                  const SizedBox(height: AppSpace.x2),
                ],
                Text(title, style: AppType.h2()),
                if (subtitle != null) ...[
                  const SizedBox(height: AppSpace.x1 + 2),
                  Text(subtitle!, style: AppType.bodySm()),
                ],
              ],
            ),
          ),
          if (trailing != null) ...[
            const SizedBox(width: AppSpace.x4),
            trailing!,
          ],
        ],
      ),
    );
  }
}

/// 指标块：一个大数字 + 说明，用于报告摘要与关于页环境。
class StatTile extends StatelessWidget {
  const StatTile({
    super.key,
    required this.value,
    required this.label,
    this.tone,
    this.icon,
    this.active = false,
    this.onTap,
  });

  final String value;
  final String label;
  final Color? tone;
  final IconData? icon;
  final bool active;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final color = tone ?? AppColors.ink;
    final tile = AnimatedContainer(
      duration: AppDuration.fast,
      padding: const EdgeInsets.symmetric(horizontal: AppSpace.x3, vertical: AppSpace.x3),
      decoration: BoxDecoration(
        color: active ? color.withValues(alpha: 0.07) : AppColors.surfaceMuted,
        border: Border.all(
          color: active ? color.withValues(alpha: 0.45) : AppColors.border,
        ),
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              if (icon != null) ...[
                Icon(icon, size: 14, color: color),
                const SizedBox(width: 5),
              ],
              Flexible(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppType.label(color: active ? color : AppColors.inkTertiary),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpace.x1 + 2),
          Text(value, style: AppType.num(color: color, size: 24)),
        ],
      ),
    );
    if (onTap == null) return tile;
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(onTap: onTap, behavior: HitTestBehavior.opaque, child: tile),
    );
  }
}

/// 键值行，用于运行环境与发行版元数据。
class KeyValueRow extends StatelessWidget {
  const KeyValueRow({
    super.key,
    required this.label,
    required this.value,
    this.labelWidth = 92,
  });

  final String label;
  final String value;
  final double labelWidth;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: labelWidth,
            child: Text(label, style: AppType.caption()),
          ),
          const SizedBox(width: AppSpace.x3),
          Expanded(
            child: SelectableText(
              value,
              style: AppType.bodySm(color: AppColors.inkSecondary),
            ),
          ),
        ],
      ),
    );
  }
}

/// 空状态：图标、标题、说明和一个可选动作。
class EmptyState extends StatelessWidget {
  const EmptyState({
    super.key,
    required this.title,
    this.message,
    this.icon = AppIcons.article,
    this.action,
    this.compact = false,
  });

  final String title;
  final String? message;
  final IconData icon;
  final Widget? action;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: compact ? AppSpace.x6 : AppSpace.x14),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: compact ? 40 : 56,
              height: compact ? 40 : 56,
              decoration: BoxDecoration(
                color: AppColors.surfaceMuted,
                borderRadius: BorderRadius.circular(compact ? 12 : 16),
              ),
              child: Icon(icon, size: compact ? 20 : 26, color: AppColors.inkTertiary),
            ),
            const SizedBox(height: AppSpace.x3),
            Text(title, style: AppType.strong(color: AppColors.ink, size: compact ? 13.5 : 15)),
            if (message != null) ...[
              const SizedBox(height: AppSpace.x1 + 2),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 320),
                child: Text(
                  message!,
                  textAlign: TextAlign.center,
                  style: AppType.caption(),
                ),
              ),
            ],
            if (action != null) ...[
              const SizedBox(height: AppSpace.x4),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}
