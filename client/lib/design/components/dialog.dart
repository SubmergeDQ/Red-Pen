import 'package:material_ui/material_ui.dart';

import '../tokens.dart';
import '../icons.dart';
import 'button.dart';

/// 统一的模态外框：桌面居中、移动端底部面板。
Future<T?> showAppDialog<T>({
  required BuildContext context,
  required WidgetBuilder builder,
  double maxWidth = 560,
  bool barrierDismissible = true,
}) {
  final size = MediaQuery.sizeOf(context);
  return showDialog<T>(
    context: context,
    barrierColor: AppColors.overlay,
    barrierDismissible: barrierDismissible,
    builder: (context) => Dialog(
      backgroundColor: Colors.transparent,
      elevation: 0,
      insetPadding: const EdgeInsets.all(AppSpace.x5),
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: maxWidth,
          maxHeight: size.height * 0.88,
        ),
        child: builder(context),
      ),
    ),
  );
}

Future<T?> showAppSheet<T>({
  required BuildContext context,
  required WidgetBuilder builder,
  Color barrierColor = AppColors.overlay,
}) {
  return showModalBottomSheet<T>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    barrierColor: barrierColor,
    builder: (context) => SafeArea(
      top: false,
      child: Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
        child: builder(context),
      ),
    ),
  );
}

/// 弹窗外壳：白底、20 圆角，内容自己决定滚动区域。
class AppDialogSurface extends StatelessWidget {
  const AppDialogSurface({
    super.key,
    required this.child,
    this.radius = AppRadius.xl,
    this.onlyTop = false,
  });

  final Widget child;
  final double radius;
  final bool onlyTop;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: onlyTop
            ? BorderRadius.vertical(top: Radius.circular(radius))
            : BorderRadius.circular(radius),
        boxShadow: AppShadow.overlay,
      ),
      clipBehavior: Clip.antiAlias,
      child: child,
    );
  }
}

class AppDialogHeader extends StatelessWidget {
  const AppDialogHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.onClose,
    this.leading,
    this.trailing,
  });

  final String title;
  final String? subtitle;
  final VoidCallback? onClose;
  final Widget? leading;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSpace.x5, AppSpace.x5, AppSpace.x3, AppSpace.x3),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (leading != null) ...[
            leading!,
            const SizedBox(width: AppSpace.x3),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppType.h3()),
                if (subtitle != null) ...[
                  const SizedBox(height: 3),
                  Text(subtitle!, style: AppType.caption()),
                ],
              ],
            ),
          ),
          ?trailing,
          if (onClose != null)
            AppIconButton(icon: AppIcons.close, tooltip: '关闭', onPressed: onClose),
        ],
      ),
    );
  }
}

/// 移动端底部面板的抓手。
class SheetHandle extends StatelessWidget {
  const SheetHandle({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 36,
      height: 4,
      margin: const EdgeInsets.only(top: AppSpace.x2, bottom: AppSpace.x1),
      decoration: BoxDecoration(
        color: AppColors.borderStrong,
        borderRadius: BorderRadius.circular(2),
      ),
    );
  }
}
