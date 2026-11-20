import 'package:material_ui/material_ui.dart';

import '../state/review_controller.dart';
import '../theme.dart';
import 'common.dart';

/// Windows / macOS / Linux shell.
///
/// Desktop gets a persistent side rail with document facts and commands, a
/// slim context bar and a status bar with shortcuts, instead of the phone's
/// bottom-heavy top bar. The phone shell keeps the top bar and tabs.
class DesktopShell extends StatelessWidget {
  const DesktopShell({
    super.key,
    required this.controller,
    required this.child,
    required this.onNewDocument,
    required this.onRules,
    required this.onAbout,
  });

  final ReviewController controller;
  final Widget child;
  final VoidCallback onNewDocument;
  final VoidCallback onRules;
  final VoidCallback onAbout;

  static bool supports(TargetPlatform platform) =>
      platform == TargetPlatform.windows ||
      platform == TargetPlatform.macOS ||
      platform == TargetPlatform.linux;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _SideRail(
          controller: controller,
          onRules: onRules,
          onAbout: onAbout,
        ),
        Expanded(
          child: Column(
            children: [
              _ContextBar(controller: controller, onNewDocument: onNewDocument),
              Expanded(child: child),
              _StatusBar(controller: controller),
            ],
          ),
        ),
      ],
    );
  }
}

class _SideRail extends StatelessWidget {
  const _SideRail({required this.controller, required this.onRules, required this.onAbout});

  final ReviewController controller;
  final VoidCallback onRules;
  final VoidCallback onAbout;

  @override
  Widget build(BuildContext context) {
    final a = controller.analysis;
    final hasText = controller.hasText;
    final report = controller.phase == Phase.report;
    final meta = hasText
        ? '${controller.charCount} 字'
            '${a == null ? '' : ' · ${a.clauseCount} 条'}'
            ' · ${controller.docTypeLabel}'
        : '还没有载入合同';

    return Container(
      width: 252,
      color: R.brand,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 22, 20, 16),
            child: Row(
              children: [
                const SealMark(size: 34),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '红笔',
                      style: R.serif(size: 19, weight: FontWeight.w600, color: R.cream, height: 1.2),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '签约前 5 分钟',
                      style: R.sans(size: 10.5, color: R.cream.withValues(alpha: 0.55), height: 1.2),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Container(height: 1, color: R.cream.withValues(alpha: 0.1)),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(12, 18, 12, 18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const _RailLabel('当前文档'),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
                    decoration: BoxDecoration(
                      color: R.cream.withValues(alpha: 0.06),
                      borderRadius: BorderRadius.circular(5),
                      border: Border.all(color: R.cream.withValues(alpha: 0.08)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          controller.sourceName.isEmpty ? '未命名合同' : controller.sourceName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: R.sans(
                            size: 12.5,
                            weight: FontWeight.w500,
                            color: R.cream.withValues(alpha: hasText ? 0.92 : 0.45),
                            height: 1.4,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          meta,
                          maxLines: 2,
                          style: R.sans(size: 11, color: R.cream.withValues(alpha: 0.5), height: 1.5),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  const _RailLabel('文件'),
                  const SizedBox(height: 6),
                  _RailItem(
                    icon: Icons.upload_file_outlined,
                    label: '导入文件',
                    hint: 'Ctrl+O',
                    onTap: controller.busy ? null : controller.importFile,
                  ),
                  _RailItem(
                    icon: Icons.content_paste_outlined,
                    label: '读取剪贴板',
                    onTap: controller.busy ? null : controller.readClipboard,
                  ),
                  _RailItem(
                    icon: Icons.image_outlined,
                    label: '识别图片',
                    onTap: controller.busy ? null : () => controller.importImage(camera: false),
                  ),
                  const SizedBox(height: 18),
                  const _RailLabel('核对'),
                  const SizedBox(height: 6),
                  _RailItem(
                    icon: Icons.menu_book_outlined,
                    label: '核对依据',
                    onTap: onRules,
                  ),
                  _RailItem(
                    icon: Icons.fact_check_outlined,
                    label: '核对结果',
                    active: report,
                    trailing: a == null || a.items.isEmpty ? null : '${controller.riskCount}',
                    onTap: a == null ? null : controller.showReport,
                  ),
                  const SizedBox(height: 18),
                  const _RailLabel('带走'),
                  const SizedBox(height: 6),
                  _RailItem(
                    icon: Icons.picture_as_pdf_outlined,
                    label: '导出 PDF',
                    hint: 'Ctrl+P',
                    onTap: a == null || controller.exporting ? null : controller.exportPdf,
                  ),
                  _RailItem(
                    icon: Icons.copy_outlined,
                    label: '复制核对报告',
                    hint: 'Ctrl+Shift+C',
                    onTap: a == null ? null : controller.copyReport,
                  ),
                  const SizedBox(height: 18),
                  const _RailLabel('应用'),
                  const SizedBox(height: 6),
                  _RailItem(
                    icon: Icons.info_outline,
                    label: '关于红笔',
                    onTap: onAbout,
                  ),
                ],
              ),
            ),
          ),
          Container(height: 1, color: R.cream.withValues(alpha: 0.1)),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 14, 20, 18),
            child: IconLabel(
              icon: Icons.lock_outline,
              label: '合同只在本机核对，不上传、不留存',
              iconSize: RI.dense,
              gap: RI.gapDense,
              maxLines: 2,
              color: R.cream.withValues(alpha: 0.5),
              style: R.sans(size: 10.5, color: R.cream.withValues(alpha: 0.5), height: 1.55),
            ),
          ),
        ],
      ),
    );
  }
}

class _RailLabel extends StatelessWidget {
  const _RailLabel(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10),
      child: Text(
        text,
        style: R.sans(
          size: 10,
          weight: FontWeight.w500,
          color: R.cream.withValues(alpha: 0.38),
          letterSpacing: 1.6,
          height: 1.3,
        ),
      ),
    );
  }
}

class _RailItem extends StatefulWidget {
  const _RailItem({
    required this.icon,
    required this.label,
    this.hint,
    this.trailing,
    this.active = false,
    this.onTap,
  });

  final IconData icon;
  final String label;
  final String? hint;
  final String? trailing;
  final bool active;
  final VoidCallback? onTap;

  @override
  State<_RailItem> createState() => _RailItemState();
}

class _RailItemState extends State<_RailItem> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final enabled = widget.onTap != null;
    final fg = R.cream.withValues(alpha: enabled ? (_hover || widget.active ? 0.96 : 0.78) : 0.3);
    return Padding(
      padding: const EdgeInsets.only(bottom: 2),
      child: MouseRegion(
        cursor: enabled ? SystemMouseCursors.click : SystemMouseCursors.basic,
        onEnter: (_) => setState(() => _hover = true),
        onExit: (_) => setState(() => _hover = false),
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: widget.onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 120),
            height: 34,
            padding: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              color: widget.active
                  ? R.cream.withValues(alpha: 0.1)
                  : _hover && enabled
                      ? R.cream.withValues(alpha: 0.06)
                      : Colors.transparent,
              borderRadius: BorderRadius.circular(5),
            ),
            child: Row(
              children: [
                Icon(widget.icon, size: RI.control, color: fg),
                const SizedBox(width: RI.gap),
                Expanded(
                  child: Text(
                    widget.label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: R.sans(size: 12.5, color: fg, height: 1.3),
                  ),
                ),
                if (widget.trailing != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                    decoration: BoxDecoration(
                      color: R.cream.withValues(alpha: 0.92),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      widget.trailing!,
                      style: R.sans(size: 10, weight: FontWeight.w600, color: R.brand, height: 1.3),
                    ),
                  )
                else if (widget.hint != null)
                  Text(
                    widget.hint!,
                    style: R.sans(size: 9.5, color: R.cream.withValues(alpha: 0.3), height: 1.3),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ContextBar extends StatelessWidget {
  const _ContextBar({required this.controller, required this.onNewDocument});

  final ReviewController controller;
  final VoidCallback onNewDocument;

  @override
  Widget build(BuildContext context) {
    final a = controller.analysis;
    final title = switch (controller.phase) {
      Phase.intake => '交稿台',
      Phase.analyzing => '正在核对',
      Phase.report => '核对结果',
    };
    final meta = switch (controller.phase) {
      Phase.intake => controller.hasText ? '${controller.charCount} 字 · ${controller.docTypeLabel}' : '粘贴或导入一份合同',
      Phase.analyzing => '规则在本机运行',
      Phase.report => a == null
          ? ''
          : '${a.docType} · ${controller.riskCount == 0 ? '未发现明显红线' : '${controller.riskCount} 处需看'}',
    };

    return Container(
      height: 52,
      padding: const EdgeInsets.symmetric(horizontal: 24),
      decoration: const BoxDecoration(
        color: R.sheet,
        border: Border(bottom: BorderSide(color: R.rule)),
      ),
      child: Row(
        children: [
          Text(title, style: R.serif(size: 15, weight: FontWeight.w600, height: 1.2)),
          const SizedBox(width: 12),
          Container(width: 1, height: 14, color: R.ruleStrong),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              meta,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: R.sans(size: 12, color: R.muted, height: 1.3),
            ),
          ),
          if (controller.phase != Phase.analyzing)
            DeskButton(
              label: '换一份',
              icon: Icons.refresh,
              kind: DeskButtonKind.quiet,
              height: 32,
              compact: true,
              onPressed: onNewDocument,
            ),
        ],
      ),
    );
  }
}

class _StatusBar extends StatelessWidget {
  const _StatusBar({required this.controller});

  final ReviewController controller;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 26,
      padding: const EdgeInsets.symmetric(horizontal: 24),
      decoration: const BoxDecoration(
        color: R.desk2,
        border: Border(top: BorderSide(color: R.rule)),
      ),
      child: Row(
        children: [
          Container(
            width: 5,
            height: 5,
            decoration: const BoxDecoration(color: R.moss, shape: BoxShape.circle),
          ),
          const SizedBox(width: 7),
          Text(
            controller.busy ? (controller.busyNote ?? '正在处理…') : '本机规则 20 类 · 合同不上传',
            style: R.sans(size: 10.5, color: R.muted, height: 1.2),
          ),
          const Spacer(),
          Text(
            controller.phase == Phase.intake
                ? 'Ctrl+Enter 开始核对 · Ctrl+O 导入'
                : 'Ctrl+P 导出 PDF · Ctrl+Shift+C 复制报告 · Esc 回到交稿台',
            style: R.sans(size: 10.5, color: R.faint, height: 1.2),
          ),
        ],
      ),
    );
  }
}
