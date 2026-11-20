import 'package:material_ui/material_ui.dart';

import '../design/design.dart';
import '../state/review_controller.dart';
import '../state/update_controller.dart';

/// 1.1 应用外壳：桌面顶部导航 + 全宽画布，移动端紧凑顶栏。
///
/// 旧版的侧栏、上下文栏和状态栏全部移除；导航只保留三个目的地：
/// 交稿台、核对结果、核对依据。
class AppShell extends StatelessWidget {
  const AppShell({
    super.key,
    required this.controller,
    required this.update,
    required this.child,
    required this.onRules,
    required this.onAbout,
    required this.onNewDocument,
    this.extraCommands = const [],
  });

  final ReviewController controller;
  final UpdateController update;
  final Widget child;
  final VoidCallback onRules;
  final VoidCallback onAbout;
  final VoidCallback onNewDocument;
  final List<AppCommand> extraCommands;

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final desktop = width >= 900 &&
        (Theme.of(context).platform == TargetPlatform.windows ||
            Theme.of(context).platform == TargetPlatform.macOS ||
            Theme.of(context).platform == TargetPlatform.linux);
    return Column(
      children: [
        desktop
            ? _DesktopHeader(
                controller: controller,
                update: update,
                onRules: onRules,
                onAbout: onAbout,
                onNewDocument: onNewDocument,
                extraCommands: extraCommands,
              )
            : _MobileHeader(
                controller: controller,
                update: update,
                onRules: onRules,
                onAbout: onAbout,
                onNewDocument: onNewDocument,
                extraCommands: extraCommands,
              ),
        Expanded(child: child),
      ],
    );
  }
}

class _DesktopHeader extends StatelessWidget {
  const _DesktopHeader({
    required this.controller,
    required this.update,
    required this.onRules,
    required this.onAbout,
    required this.onNewDocument,
    required this.extraCommands,
  });

  final ReviewController controller;
  final UpdateController update;
  final VoidCallback onRules;
  final VoidCallback onAbout;
  final VoidCallback onNewDocument;
  final List<AppCommand> extraCommands;

  @override
  Widget build(BuildContext context) {
    final hasReport = controller.analysis != null;
    return Container(
      height: 64,
      padding: const EdgeInsets.symmetric(horizontal: AppSpace.x6),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: Row(
        children: [
          const BrandLockup(markSize: 30, showSubtitle: true),
          const SizedBox(width: AppSpace.x6),
          Container(width: 1, height: 24, color: AppColors.border),
          const SizedBox(width: AppSpace.x4),
          Flexible(
            child: Row(
              children: [
                Icon(AppIcons.article, size: 16, color: AppColors.inkTertiary),
                const SizedBox(width: 6),
                Flexible(
                  child: Text(
                    controller.sourceName.isEmpty ? '未载入合同' : controller.sourceName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppType.caption(color: AppColors.inkSecondary),
                  ),
                ),
              ],
            ),
          ),
          const Spacer(),
          _HeaderNav(
            items: [
              _NavSpec(
                icon: AppIcons.edit,
                label: '交稿台',
                selected: controller.phase == Phase.intake,
                onTap: controller.editText,
              ),
              _NavSpec(
                icon: AppIcons.report,
                label: '核对结果',
                selected: controller.phase == Phase.report,
                onTap: hasReport ? controller.showReport : null,
              ),
              _NavSpec(
                icon: AppIcons.rules,
                label: '核对依据',
                selected: false,
                onTap: onRules,
              ),
            ],
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.surfaceMuted,
              borderRadius: BorderRadius.circular(AppRadius.pill),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(AppIcons.lock, size: 13, color: AppColors.inkTertiary),
                const SizedBox(width: 5),
                Text('合同仅本机', style: AppType.caption(color: AppColors.inkTertiary).copyWith(fontSize: 11)),
              ],
            ),
          ),
          const SizedBox(width: AppSpace.x2),
          for (final command in extraCommands)
            AppIconButton(
              icon: command.icon,
              tooltip: command.label,
              onPressed: command.enabled ? command.onSelected : null,
            ),
          AppIconButton(
            icon: AppIcons.refresh,
            tooltip: '换一份合同',
            onPressed: controller.hasText || controller.phase != Phase.intake ? onNewDocument : null,
          ),
          AppIconButton(
            icon: AppIcons.info,
            tooltip: '关于红笔',
            onPressed: onAbout,
            badge: update.hasUpdate ? const _UpdateDot() : null,
          ),
        ],
      ),
    );
  }
}

class _NavSpec {
  const _NavSpec({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback? onTap;
}

class _HeaderNav extends StatelessWidget {
  const _HeaderNav({required this.items});

  final List<_NavSpec> items;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (final item in items) _NavButton(spec: item),
        ],
      ),
    );
  }
}

class _NavButton extends StatefulWidget {
  const _NavButton({required this.spec});

  final _NavSpec spec;

  @override
  State<_NavButton> createState() => _NavButtonState();
}

class _NavButtonState extends State<_NavButton> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final enabled = widget.spec.onTap != null;
    final selected = widget.spec.selected;
    final fg = selected
        ? AppColors.ink
        : enabled
            ? AppColors.inkTertiary
            : AppColors.inkDisabled;
    return MouseRegion(
      cursor: enabled ? SystemMouseCursors.click : SystemMouseCursors.basic,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        onTap: widget.spec.onTap,
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: AppDuration.fast,
          height: 34,
          padding: const EdgeInsets.symmetric(horizontal: 13),
          decoration: BoxDecoration(
            color: selected
                ? AppColors.surface
                : _hover && enabled
                    ? AppColors.surface.withValues(alpha: 0.6)
                    : Colors.transparent,
            borderRadius: BorderRadius.circular(AppRadius.sm),
            boxShadow: selected
                ? const [BoxShadow(color: Color(0x12101820), offset: Offset(0, 1), blurRadius: 3)]
                : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                selected ? _filled(widget.spec.icon) : widget.spec.icon,
                size: 16,
                color: selected ? AppColors.accent : fg,
              ),
              const SizedBox(width: 6),
              Text(
                widget.spec.label,
                style: AppType.strong(color: fg, size: 12.5),
              ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _filled(IconData icon) {
    if (icon == AppIcons.report) return AppIcons.reportActive;
    if (icon == AppIcons.rules) return AppIcons.rulesActive;
    return icon;
  }
}

class _MobileHeader extends StatelessWidget {
  const _MobileHeader({
    required this.controller,
    required this.update,
    required this.onRules,
    required this.onAbout,
    required this.onNewDocument,
    required this.extraCommands,
  });

  final ReviewController controller;
  final UpdateController update;
  final VoidCallback onRules;
  final VoidCallback onAbout;
  final VoidCallback onNewDocument;
  final List<AppCommand> extraCommands;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: SafeArea(
        bottom: false,
        child: SizedBox(
          height: 56,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpace.x3),
            child: Row(
              children: [
                const BrandLockup(markSize: 28),
                const Spacer(),
                if (controller.analysis != null)
                  Padding(
                    padding: const EdgeInsets.only(right: AppSpace.x1),
                    child: AppTag(
                      label: controller.riskCount == 0 ? '无明显红线' : '${controller.riskCount} 处需看',
                      tone: controller.riskCount == 0 ? AppTone.green : AppTone.accent,
                      compact: true,
                    ),
                  ),
                AppIconButton(
                  icon: AppIcons.info,
                  tooltip: '关于红笔',
                  touch: true,
                  onPressed: onAbout,
                  badge: update.hasUpdate ? const _UpdateDot() : null,
                ),
                PopupMenuButton<String>(
                  tooltip: '更多',
                  position: PopupMenuPosition.under,
                  onSelected: (value) {
                    switch (value) {
                      case 'rules':
                        onRules();
                      case 'new':
                        onNewDocument();
                      default:
                        for (final command in extraCommands) {
                          if (command.id == value && command.enabled) command.onSelected();
                        }
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'rules',
                      height: 42,
                      child: Row(
                        children: [
                          Icon(AppIcons.rules, size: 17, color: AppColors.inkSecondary),
                          SizedBox(width: 10),
                          Text('核对依据'),
                        ],
                      ),
                    ),
                    const PopupMenuItem(
                      value: 'new',
                      height: 42,
                      child: Row(
                        children: [
                          Icon(AppIcons.refresh, size: 17, color: AppColors.inkSecondary),
                          SizedBox(width: 10),
                          Text('换一份合同'),
                        ],
                      ),
                    ),
                    for (final command in extraCommands)
                      if (command.showInOverflow)
                        PopupMenuItem(
                          value: command.id,
                          height: 42,
                          enabled: command.enabled,
                          child: Row(
                            children: [
                              Icon(command.icon, size: 17, color: AppColors.inkSecondary),
                              const SizedBox(width: 10),
                              Text(command.label),
                            ],
                          ),
                        ),
                  ],
                  child: const SizedBox(
                    width: 44,
                    height: 44,
                    child: Icon(Icons.more_horiz_rounded, color: AppColors.inkSecondary),
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

class _UpdateDot extends StatelessWidget {
  const _UpdateDot();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 7,
      height: 7,
      decoration: BoxDecoration(
        color: AppColors.accent,
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.surface, width: 1.5),
      ),
    );
  }
}
