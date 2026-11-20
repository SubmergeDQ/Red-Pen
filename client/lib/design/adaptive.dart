import 'package:material_ui/material_ui.dart';

/// 响应式档位。页面按档位决定列数、页边距与操作承载方式，
/// 不直接散落宽度数字；新增折叠屏 / 平板 / 车机等场景时在这里补档位。
enum AppLayout { compact, medium, expanded }

abstract final class AppBreakpoints {
  static const medium = 760.0;
  static const expanded = 1000.0;
  static const wide = 1180.0;

  static AppLayout layoutOf(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    if (width >= expanded) return AppLayout.expanded;
    if (width >= medium) return AppLayout.medium;
    return AppLayout.compact;
  }

  static bool isExpanded(BuildContext context) =>
      MediaQuery.sizeOf(context).width >= expanded;

  /// 页面水平边距：手机 16、平板 24、桌面 32。
  static double pagePadding(AppLayout layout) => switch (layout) {
        AppLayout.compact => 16,
        AppLayout.medium => 24,
        AppLayout.expanded => 32,
      };

  /// 内容最大宽度：阅读与表单类页面用它控制行长。
  static const contentWidth = 1180.0;
  static const reportWidth = 1440.0;
}
