import 'package:material_ui/material_ui.dart';

import '../tokens.dart';
import '../icons.dart';

class AppSelectOption<T> {
  const AppSelectOption({required this.value, required this.label, this.icon});

  final T value;
  final String label;
  final IconData? icon;
}

/// 轻量下拉选择。外观与其他控件一致，菜单圆角、边界来自主题。
class AppSelect<T> extends StatelessWidget {
  const AppSelect({
    super.key,
    required this.value,
    required this.options,
    required this.onChanged,
    this.label,
    this.compact = false,
    this.icon,
  });

  final T value;
  final List<AppSelectOption<T>> options;
  final ValueChanged<T> onChanged;
  final String? label;
  final bool compact;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<T>(
      initialValue: value,
      tooltip: label ?? '选择',
      position: PopupMenuPosition.under,
      onSelected: onChanged,
      itemBuilder: (context) => [
        for (final option in options)
          PopupMenuItem<T>(
            value: option.value,
            height: 38,
            child: Row(
              children: [
                SizedBox(
                  width: 22,
                  child: option.value == value
                      ? const Icon(AppIcons.check, size: 16, color: AppColors.accent)
                      : option.icon != null
                          ? Icon(option.icon, size: 16, color: AppColors.inkTertiary)
                          : null,
                ),
                const SizedBox(width: 6),
                Text(
                  option.label,
                  style: AppType.bodySm(
                    color: option.value == value ? AppColors.ink : AppColors.inkSecondary,
                  ),
                ),
              ],
            ),
          ),
      ],
      child: Container(
        height: compact ? 30 : 36,
        padding: EdgeInsets.symmetric(horizontal: compact ? 9 : 12),
        decoration: BoxDecoration(
          color: AppColors.surface,
          border: Border.all(color: AppColors.border),
          borderRadius: BorderRadius.circular(AppRadius.sm),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon ?? AppIcons.article, size: 15, color: AppColors.inkTertiary),
            const SizedBox(width: 6),
            Text(
              label ?? options.firstWhere((o) => o.value == value).label,
              style: AppType.bodySm(color: AppColors.inkSecondary).copyWith(
                fontSize: compact ? 12 : 12.5,
              ),
            ),
            const SizedBox(width: 4),
            const Icon(AppIcons.chevronDown, size: 16, color: AppColors.inkTertiary),
          ],
        ),
      ),
    );
  }
}

/// 文本输入外壳：白底、圆角、聚焦时强调色描边。
class AppField extends StatelessWidget {
  const AppField({
    super.key,
    required this.child,
    this.focused = false,
    this.padding = const EdgeInsets.all(AppSpace.x3),
  });

  final Widget child;
  final bool focused;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: AppDuration.fast,
      padding: padding,
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border.all(
          color: focused ? AppColors.accent : AppColors.border,
        ),
        borderRadius: BorderRadius.circular(AppRadius.md),
        boxShadow: focused
            ? const [BoxShadow(color: AppColors.focusRing, blurRadius: 0, spreadRadius: 3)]
            : null,
      ),
      child: child,
    );
  }
}

/// 分段切换：报告 / 原文，或筛选项。
class AppSegmented<T> extends StatelessWidget {
  const AppSegmented({
    super.key,
    required this.options,
    required this.value,
    required this.onChanged,
    this.expand = true,
    this.compact = false,
  });

  final List<AppSelectOption<T>> options;
  final T value;
  final ValueChanged<T> onChanged;
  final bool expand;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: AppColors.surfaceSunken,
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Row(
        mainAxisSize: expand ? MainAxisSize.max : MainAxisSize.min,
        children: [
          for (final option in options)
            Expanded(
              flex: expand ? 1 : 0,
              child: _Segment(
                label: option.label,
                icon: option.icon,
                selected: option.value == value,
                compact: compact,
                onTap: () => onChanged(option.value),
              ),
            ),
        ],
      ),
    );
  }
}

class _Segment extends StatelessWidget {
  const _Segment({
    required this.label,
    required this.selected,
    required this.onTap,
    this.icon,
    this.compact = false,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;
  final IconData? icon;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      selected: selected,
      label: label,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppRadius.sm),
          child: AnimatedContainer(
            duration: AppDuration.fast,
            height: compact ? 30 : 34,
            padding: const EdgeInsets.symmetric(horizontal: 8),
            decoration: BoxDecoration(
              color: selected ? AppColors.surface : Colors.transparent,
              borderRadius: BorderRadius.circular(AppRadius.sm),
              boxShadow: selected
                  ? const [BoxShadow(color: Color(0x14101820), offset: Offset(0, 1), blurRadius: 3)]
                  : null,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (icon != null) ...[
                  Icon(
                    icon,
                    size: 15,
                    color: selected ? AppColors.ink : AppColors.inkTertiary,
                  ),
                  const SizedBox(width: 6),
                ],
                Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppType.strong(
                    color: selected ? AppColors.ink : AppColors.inkTertiary,
                    size: compact ? 12 : 12.5,
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
