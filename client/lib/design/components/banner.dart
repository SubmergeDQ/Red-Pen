import 'package:material_ui/material_ui.dart';

import '../tokens.dart';
import '../icons.dart';
import 'button.dart';
import 'tag.dart';

/// 行内提示条。状态色只作辅色，说明文字保持正文对比度。
class AppBanner extends StatelessWidget {
  const AppBanner({
    super.key,
    required this.message,
    this.tone = AppTone.brand,
    this.icon,
    this.action,
    this.onClose,
  });

  final String message;
  final AppTone tone;
  final IconData? icon;
  final Widget? action;
  final VoidCallback? onClose;

  @override
  Widget build(BuildContext context) {
    final (bg, fg, border) = AppTag.colorsOf(tone);
    final resolvedIcon = icon ??
        switch (tone) {
          AppTone.red => AppIcons.error,
          AppTone.amber => AppIcons.warning,
          AppTone.green => AppIcons.checkCircle,
          _ => AppIcons.info,
        };
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(AppSpace.x3, AppSpace.x3, AppSpace.x2, AppSpace.x3),
      decoration: BoxDecoration(
        color: bg,
        border: Border.all(color: border),
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 1),
            child: Icon(resolvedIcon, size: 18, color: fg),
          ),
          const SizedBox(width: AppSpace.x2),
          Expanded(
            child: Text(
              message,
              style: AppType.bodySm(color: fg).copyWith(height: 1.6),
            ),
          ),
          if (action != null) ...[
            const SizedBox(width: AppSpace.x2),
            action!,
          ],
          if (onClose != null) ...[
            const SizedBox(width: AppSpace.x1),
            AppIconButton(
              icon: AppIcons.close,
              tooltip: '关闭',
              onPressed: onClose,
            ),
          ],
        ],
      ),
    );
  }
}
