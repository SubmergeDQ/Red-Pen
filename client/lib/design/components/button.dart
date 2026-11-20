import 'package:material_ui/material_ui.dart';

import '../tokens.dart';
import '../icons.dart';

enum AppButtonTone { primary, secondary, ghost, danger, onBrand }

enum AppButtonSize { sm, md, lg }

/// 统一按钮。高度、内边距、圆角、图标尺寸与状态都在这里定义。
class AppButton extends StatefulWidget {
  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.tone = AppButtonTone.primary,
    this.size = AppButtonSize.md,
    this.expand = false,
    this.loading = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final AppButtonTone tone;
  final AppButtonSize size;
  final bool expand;
  final bool loading;

  @override
  State<AppButton> createState() => _AppButtonState();
}

class _AppButtonState extends State<AppButton> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final enabled = widget.onPressed != null && !widget.loading;
    final (bg, fg, border) = switch (widget.tone) {
      AppButtonTone.primary => (
          _hover && enabled ? AppColors.brandHover : AppColors.brand,
          AppColors.onBrand,
          Colors.transparent,
        ),
      AppButtonTone.secondary => (
          _hover && enabled ? AppColors.surfaceMuted : AppColors.surface,
          enabled ? AppColors.ink : AppColors.inkDisabled,
          _hover && enabled ? AppColors.borderStrong : AppColors.border,
        ),
      AppButtonTone.ghost => (
          _hover && enabled ? AppColors.hoverTint : Colors.transparent,
          enabled ? AppColors.inkSecondary : AppColors.inkDisabled,
          Colors.transparent,
        ),
      AppButtonTone.danger => (
          _hover && enabled ? AppColors.accentHover : AppColors.accent,
          Colors.white,
          Colors.transparent,
        ),
      AppButtonTone.onBrand => (
          _hover && enabled ? Colors.white.withValues(alpha: 0.16) : Colors.white.withValues(alpha: 0.08),
          AppColors.onBrand,
          Colors.white.withValues(alpha: 0.16),
        ),
    };
    final height = switch (widget.size) {
      AppButtonSize.sm => 32.0,
      AppButtonSize.md => 40.0,
      AppButtonSize.lg => 48.0,
    };
    final padding = switch (widget.size) {
      AppButtonSize.sm => const EdgeInsets.symmetric(horizontal: 12),
      AppButtonSize.md => const EdgeInsets.symmetric(horizontal: 16),
      AppButtonSize.lg => const EdgeInsets.symmetric(horizontal: 20),
    };
    final fontSize = switch (widget.size) {
      AppButtonSize.sm => 12.5,
      AppButtonSize.md => 13.5,
      AppButtonSize.lg => 14.5,
    };
    final iconSize = switch (widget.size) {
      AppButtonSize.sm => 16.0,
      AppButtonSize.md => 18.0,
      AppButtonSize.lg => 20.0,
    };

    return MouseRegion(
      cursor: enabled ? SystemMouseCursors.click : SystemMouseCursors.basic,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: AnimatedContainer(
        duration: AppDuration.fast,
        height: height,
        width: widget.expand ? double.infinity : null,
        decoration: BoxDecoration(
          color: bg,
          border: Border.all(color: border),
          borderRadius: BorderRadius.circular(AppRadius.md),
          boxShadow: widget.tone == AppButtonTone.primary && enabled
              ? const [
                  BoxShadow(color: Color(0x1F1F3243), offset: Offset(0, 6), blurRadius: 16, spreadRadius: -8),
                ]
              : null,
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: enabled ? widget.onPressed : null,
            borderRadius: BorderRadius.circular(AppRadius.md),
            child: Padding(
              padding: padding,
              child: Row(
                mainAxisSize: widget.expand ? MainAxisSize.max : MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (widget.loading) ...[
                    SizedBox(
                      width: iconSize,
                      height: iconSize,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: fg.withValues(alpha: 0.9),
                      ),
                    ),
                    const SizedBox(width: AppSpace.x2),
                  ] else if (widget.icon != null) ...[
                    Icon(widget.icon, size: iconSize, color: fg),
                    const SizedBox(width: AppSpace.x2),
                  ],
                  Flexible(
                    child: Text(
                      widget.label,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppType.strong(color: fg, size: fontSize).copyWith(height: 1.2),
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

/// 纯图标按钮：桌面 36、触屏 44，选中态用浅品牌底。
class AppIconButton extends StatefulWidget {
  const AppIconButton({
    super.key,
    required this.icon,
    required this.onPressed,
    this.tooltip,
    this.selected = false,
    this.touch = false,
    this.onDark = false,
    this.badge,
  });

  final IconData icon;
  final VoidCallback? onPressed;
  final String? tooltip;
  final bool selected;
  final bool touch;
  final bool onDark;
  final Widget? badge;

  @override
  State<AppIconButton> createState() => _AppIconButtonState();
}

class _AppIconButtonState extends State<AppIconButton> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final enabled = widget.onPressed != null;
    final size = widget.touch ? 44.0 : 36.0;
    final fg = widget.onDark
        ? AppColors.onBrand.withValues(alpha: enabled ? 0.92 : 0.4)
        : widget.selected
            ? AppColors.accent
            : enabled
                ? AppColors.inkSecondary
                : AppColors.inkDisabled;
    final bg = widget.selected
        ? (widget.onDark ? Colors.white.withValues(alpha: 0.14) : AppColors.accentSoft)
        : _hover && enabled
            ? (widget.onDark ? Colors.white.withValues(alpha: 0.1) : AppColors.hoverTint)
            : Colors.transparent;

    final button = MouseRegion(
      cursor: enabled ? SystemMouseCursors.click : SystemMouseCursors.basic,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: AnimatedContainer(
        duration: AppDuration.fast,
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(AppRadius.sm),
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: widget.onPressed,
            borderRadius: BorderRadius.circular(AppRadius.sm),
            child: Stack(
              alignment: Alignment.center,
              children: [
                Icon(widget.icon, size: AppIconSize.control, color: fg),
                if (widget.badge != null)
                  Positioned(right: 7, top: 7, child: widget.badge!),
              ],
            ),
          ),
        ),
      ),
    );
    return widget.tooltip == null ? button : Tooltip(message: widget.tooltip!, child: button);
  }
}

/// 文字链接按钮，统一使用强调色与下划线。
class AppLink extends StatelessWidget {
  const AppLink({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.color = AppColors.accent,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final enabled = onPressed != null;
    return MouseRegion(
      cursor: enabled ? SystemMouseCursors.click : SystemMouseCursors.basic,
      child: GestureDetector(
        onTap: onPressed,
        behavior: HitTestBehavior.opaque,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                label,
                style: AppType.strong(
                  color: enabled ? color : AppColors.inkDisabled,
                  size: 13,
                ).copyWith(
                  decoration: TextDecoration.underline,
                  decorationColor: (enabled ? color : AppColors.inkDisabled).withValues(alpha: 0.4),
                  decorationThickness: 1,
                ),
              ),
              if (icon != null) ...[
                const SizedBox(width: 4),
                Icon(icon, size: 14, color: enabled ? color : AppColors.inkDisabled),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

/// 键盘快捷键提示，用中性小方块表达。
class KeyHint extends StatelessWidget {
  const KeyHint(this.keys, {super.key});

  final List<String> keys;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 4,
      children: [
        for (final key in keys)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
            decoration: BoxDecoration(
              color: AppColors.surface,
              border: Border.all(color: AppColors.border),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(key, style: AppType.caption(color: AppColors.inkTertiary).copyWith(fontSize: 10.5)),
          ),
      ],
    );
  }
}
