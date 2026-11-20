import 'package:material_ui/material_ui.dart';

/// 标准化的扩展命令接口。
///
/// 后续插件、实验功能或企业定制只需要提供一组 [AppCommand]，由 `AppShell`
/// 统一放进桌面顶栏或移动端更多菜单，不需要改动外壳布局。
@immutable
class AppCommand {
  const AppCommand({
    required this.id,
    required this.label,
    required this.icon,
    required this.onSelected,
    this.enabled = true,
    this.showInOverflow = true,
  });

  /// 稳定标识，用于命令分发与埋点。
  final String id;

  /// 面向用户的动作名称，写清楚会发生什么。
  final String label;

  final IconData icon;
  final VoidCallback onSelected;
  final bool enabled;

  /// 是否允许在移动端更多菜单中出现。
  final bool showInOverflow;
}
