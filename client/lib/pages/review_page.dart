import 'package:material_ui/material_ui.dart';

import '../design/design.dart';
import '../engine/engine.dart';
import '../state/review_controller.dart';
import '../ui/rules_panel.dart';

Color verdictColor(Verdict v) => switch (v) {
  Verdict.red => AppColors.red,
  Verdict.yellow => AppColors.amber,
  Verdict.gray => AppColors.slate,
  Verdict.green => AppColors.green,
};

Color verdictSoft(Verdict v) => switch (v) {
  Verdict.red => AppColors.redSoft,
  Verdict.yellow => AppColors.amberSoft,
  Verdict.gray => AppColors.slateSoft,
  Verdict.green => AppColors.greenSoft,
};

AppTone verdictTone(Verdict v) => switch (v) {
  Verdict.red => AppTone.red,
  Verdict.yellow => AppTone.amber,
  Verdict.gray => AppTone.slate,
  Verdict.green => AppTone.green,
};

class ReviewPage extends StatefulWidget {
  const ReviewPage({super.key, required this.controller});

  final ReviewController controller;

  @override
  State<ReviewPage> createState() => _ReviewPageState();
}

class _ReviewPageState extends State<ReviewPage> {
  final ScrollController _contractScroll = ScrollController();
  final ScrollController _reportScroll = ScrollController();
  final Map<int, GlobalKey> _clauseKeys = {};
  final Map<String, GlobalKey> _findingKeys = {};

  ReviewController get c => widget.controller;
  Analysis? get a => c.analysis;

  @override
  void initState() {
    super.initState();
    final analysis = a;
    if (analysis != null) {
      for (final clause in analysis.clauses) {
        _clauseKeys[clause.index] = GlobalKey();
      }
      for (final finding in analysis.items) {
        _findingKeys[finding.id] = GlobalKey();
      }
    }
  }

  @override
  void dispose() {
    _contractScroll.dispose();
    _reportScroll.dispose();
    super.dispose();
  }

  void _revealClause(int? index) {
    if (index == null) return;
    setState(() {});
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final target = _clauseKeys[index]?.currentContext;
      if (target == null) return;
      Scrollable.ensureVisible(
        target,
        duration: const Duration(milliseconds: 420),
        curve: AppDuration.curve,
        alignment: 0.06,
      );
    });
  }

  void _revealFinding(String id) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final target = _findingKeys[id]?.currentContext;
      if (target == null) return;
      Scrollable.ensureVisible(
        target,
        duration: const Duration(milliseconds: 360),
        curve: AppDuration.curve,
        alignment: 0.2,
      );
    });
  }

  void _locate(Finding finding, {required bool wide}) {
    c.selectFinding(finding.id);
    if (!wide) c.setMobileTab(1);
    _revealClause(finding.clauseIndex);
  }

  void _tapClause(List<Finding> findings, {required bool wide}) {
    if (findings.isEmpty) return;
    final first = findings.first;
    c.selectFinding(first.id);
    if (!wide) {
      c.setMobileTab(0);
    }
    _revealFinding(first.id);
  }

  @override
  Widget build(BuildContext context) {
    final analysis = a;
    if (analysis == null) {
      return const Center(
        child: EmptyState(title: '还没有核对结果。', message: '回到交稿台粘贴合同，开始核对。'),
      );
    }
    final size = MediaQuery.sizeOf(context);
    final wide = size.width >= 1000;

    final report = _ReportPane(
      controller: c,
      scroll: _reportScroll,
      findingKeys: _findingKeys,
      onLocate: (finding) => _locate(finding, wide: wide),
      onCopy: (text, label) => c.copy(text, label),
      onRules: () => showRulesPanel(context),
    );
    final source = _SourcePane(
      controller: c,
      scroll: _contractScroll,
      clauseKeys: _clauseKeys,
      onClauseTap: (findings) => _tapClause(findings, wide: wide),
      wide: wide,
    );

    if (!wide) {
      return Column(
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(
              AppSpace.x4,
              AppSpace.x3,
              AppSpace.x4,
              AppSpace.x3,
            ),
            color: AppColors.canvas,
            child: AppSegmented<int>(
              value: c.mobileTab,
              options: [
                AppSelectOption(
                  value: 0,
                  label: '核对报告 · ${c.riskCount}',
                  icon: AppIcons.report,
                ),
                const AppSelectOption(
                  value: 1,
                  label: '合同原文',
                  icon: AppIcons.article,
                ),
              ],
              onChanged: c.setMobileTab,
            ),
          ),
          Expanded(
            child: c.mobileTab == 0
                ? KeyedSubtree(
                    key: const ValueKey('mobile-report'),
                    child: report,
                  )
                : KeyedSubtree(
                    key: const ValueKey('mobile-source'),
                    child: source,
                  ),
          ),
          if (c.mobileTab == 0) _MobileReportBar(controller: c),
        ],
      );
    }

    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpace.x8,
        AppSpace.x6,
        AppSpace.x8,
        0,
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1440),
          child: Column(
            children: [
              _ReviewHeader(
                controller: c,
                onRules: () => showRulesPanel(context),
              ),
              const SizedBox(height: AppSpace.x5),
              Expanded(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Expanded(flex: 6, child: report),
                    const SizedBox(width: AppSpace.x4),
                    Expanded(flex: 5, child: source),
                    const SizedBox(width: AppSpace.x2),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ReviewHeader extends StatelessWidget {
  const _ReviewHeader({required this.controller, required this.onRules});

  final ReviewController controller;
  final VoidCallback onRules;

  @override
  Widget build(BuildContext context) {
    final analysis = controller.analysis!;
    final narrow = MediaQuery.sizeOf(context).width < 1180;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      AppTag(
                        label: verdictLabel[analysis.topVerdict]!,
                        tone: verdictTone(analysis.topVerdict),
                        dot: true,
                      ),
                      const SizedBox(width: AppSpace.x2),
                      Text(analysis.docType, style: AppType.caption()),
                      if (analysis.packLabels.isNotEmpty) ...[
                        const SizedBox(width: AppSpace.x2),
                        Flexible(
                          child: Text(
                            analysis.packLabels.join(' / '),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppType.caption(
                              color: AppColors.inkDisabled,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: AppSpace.x2 + 2),
                  Text(analysis.oneLiner, style: AppType.h2()),
                ],
              ),
            ),
            if (!narrow) ...[
              const SizedBox(width: AppSpace.x5),
              AppButton(
                label: '导出 PDF',
                icon: AppIcons.pdf,
                tone: AppButtonTone.secondary,
                onPressed: controller.exporting ? null : controller.exportPdf,
                loading: controller.exporting,
              ),
              const SizedBox(width: AppSpace.x2),
              AppButton(
                label: '复制报告',
                icon: AppIcons.copy,
                onPressed: controller.copyReport,
              ),
            ],
          ],
        ),
        const SizedBox(height: AppSpace.x4),
        _CountStrip(controller: controller),
      ],
    );
  }
}

class _CountStrip extends StatelessWidget {
  const _CountStrip({required this.controller});

  final ReviewController controller;

  @override
  Widget build(BuildContext context) {
    final analysis = controller.analysis!;
    final entries = <(Verdict?, String, Color)>[
      (null, '全部', AppColors.ink),
      (Verdict.red, verdictLabel[Verdict.red]!, AppColors.red),
      (Verdict.yellow, verdictLabel[Verdict.yellow]!, AppColors.amber),
      (Verdict.gray, verdictLabel[Verdict.gray]!, AppColors.slate),
      (Verdict.green, verdictLabel[Verdict.green]!, AppColors.green),
    ];
    return LayoutBuilder(
      builder: (context, constraints) {
        final children = [
          for (final entry in entries)
            StatTile(
              label: entry.$2,
              value:
                  '${entry.$1 == null ? analysis.items.length : analysis.countOf(entry.$1!)}',
              tone: entry.$3,
              active: controller.filter == entry.$1,
              onTap: () => controller.setFilter(entry.$1),
            ),
        ];
        if (constraints.maxWidth < 520) {
          return SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                for (var i = 0; i < children.length; i++) ...[
                  if (i > 0) const SizedBox(width: AppSpace.x2),
                  SizedBox(width: 96, child: children[i]),
                ],
              ],
            ),
          );
        }
        return Row(
          children: [
            for (var i = 0; i < children.length; i++) ...[
              if (i > 0) const SizedBox(width: AppSpace.x2),
              Expanded(child: children[i]),
            ],
          ],
        );
      },
    );
  }
}

class _ReportPane extends StatelessWidget {
  const _ReportPane({
    required this.controller,
    required this.scroll,
    required this.findingKeys,
    required this.onLocate,
    required this.onCopy,
    required this.onRules,
  });

  final ReviewController controller;
  final ScrollController scroll;
  final Map<String, GlobalKey> findingKeys;
  final void Function(Finding finding) onLocate;
  final void Function(String text, String label) onCopy;
  final VoidCallback onRules;

  @override
  Widget build(BuildContext context) {
    final analysis = controller.analysis!;
    final items = controller.visibleFindings;
    final nonGreen = analysis.items
        .where((f) => f.verdict != Verdict.green)
        .length;

    final compact = MediaQuery.sizeOf(context).width < 1000;
    return Scrollbar(
      controller: scroll,
      child: SingleChildScrollView(
        controller: scroll,
        physics: const ClampingScrollPhysics(),
        padding: EdgeInsets.fromLTRB(
          compact ? AppSpace.x4 : 0,
          0,
          compact ? AppSpace.x4 : 0,
          compact ? AppSpace.x14 : AppSpace.x8,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (compact) ...[
              _MobileSummary(controller: controller),
              const SizedBox(height: AppSpace.x3),
            ],
            if (controller.ocrUsed) ...[
              const AppBanner(
                tone: AppTone.amber,
                message: '正文来自本机 OCR。请对照原件核对金额、日期和条款编号，再依据这份结果去谈。',
              ),
              const SizedBox(height: AppSpace.x3),
            ],
            if (analysis.insufficient) ...[
              AppBanner(
                tone: AppTone.amber,
                message:
                    '这份文本只拆出 ${analysis.clauseCount} 条实质条款，可能不是完整合同。请确认粘贴了全文，下面的结果仅供参考。',
              ),
              const SizedBox(height: AppSpace.x3),
            ],
            if (!analysis.insufficient && nonGreen == 0) ...[
              AppBanner(
                tone: AppTone.green,
                icon: AppIcons.checkCircle,
                message: '本次应用的规则没有扫到明显风险，但未覆盖的规则不等于无风险；金额、合同主体和附件仍要人工核对。',
              ),
              const SizedBox(height: AppSpace.x3),
            ],
            if (items.isEmpty)
              AppCard(
                child: EmptyState(
                  compact: true,
                  title: controller.filter == null
                      ? '没有可展开的条目。'
                      : '这个等级没有发现问题。',
                  message: controller.filter == null ? null : '切换到「全部」查看其他等级。',
                ),
              )
            else
              for (final finding in items)
                Padding(
                  key: findingKeys[finding.id],
                  padding: const EdgeInsets.only(bottom: AppSpace.x2),
                  child: _FindingCard(
                    finding: finding,
                    expanded: controller.expandedId == finding.id,
                    active: controller.activeFindingId == finding.id,
                    onToggle: () => controller.toggleExpanded(finding.id),
                    onLocate: () => onLocate(finding),
                    onCopy: onCopy,
                  ),
                ),
            if (analysis.pending.isNotEmpty) ...[
              const SizedBox(height: AppSpace.x3),
              _PendingCard(items: analysis.pending),
            ],
            const SizedBox(height: AppSpace.x5),
            Text(
              '以上为签约前风险提示，基于你提供的文本和通用规定，不构成法律意见。涉及金额较大或已产生争议，请拨打 12348 公共法律服务热线，或联系学校法律援助中心。',
              style: AppType.caption(),
            ),
            const SizedBox(height: AppSpace.x2),
            Text(
              '规则库 $ruleLibraryVersion 快照（${ruleLibrary.length} 类）；$ruleLibrarySnapshotNote',
              style: AppType.caption(),
            ),
            const SizedBox(height: AppSpace.x2),
            AppLink(
              label: '查看 ${ruleLibrary.length} 类核对依据与法律出处',
              icon: AppIcons.arrowOut,
              onPressed: onRules,
            ),
          ],
        ),
      ),
    );
  }
}

class _MobileSummary extends StatelessWidget {
  const _MobileSummary({required this.controller});

  final ReviewController controller;

  @override
  Widget build(BuildContext context) {
    final analysis = controller.analysis!;
    final entries = <(Verdict?, String, Color)>[
      (null, '全部', AppColors.ink),
      (Verdict.red, verdictLabel[Verdict.red]!, AppColors.red),
      (Verdict.yellow, verdictLabel[Verdict.yellow]!, AppColors.amber),
      (Verdict.gray, verdictLabel[Verdict.gray]!, AppColors.slate),
      (Verdict.green, verdictLabel[Verdict.green]!, AppColors.green),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            AppTag(
              label: verdictLabel[analysis.topVerdict]!,
              tone: verdictTone(analysis.topVerdict),
              dot: true,
              compact: true,
            ),
            const SizedBox(width: AppSpace.x2),
            Text(analysis.docType, style: AppType.caption()),
          ],
        ),
        const SizedBox(height: AppSpace.x2),
        Text(analysis.oneLiner, style: AppType.h3().copyWith(height: 1.5)),
        const SizedBox(height: AppSpace.x3),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              for (var i = 0; i < entries.length; i++) ...[
                if (i > 0) const SizedBox(width: AppSpace.x2),
                SizedBox(
                  width: 88,
                  child: StatTile(
                    label: entries[i].$2,
                    value:
                        '${entries[i].$1 == null ? analysis.items.length : analysis.countOf(entries[i].$1!)}',
                    tone: entries[i].$3,
                    active: controller.filter == entries[i].$1,
                    onTap: () => controller.setFilter(entries[i].$1),
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _FindingCard extends StatefulWidget {
  const _FindingCard({
    required this.finding,
    required this.expanded,
    required this.active,
    required this.onToggle,
    required this.onLocate,
    required this.onCopy,
  });

  final Finding finding;
  final bool expanded;
  final bool active;
  final VoidCallback onToggle;
  final VoidCallback onLocate;
  final void Function(String text, String label) onCopy;

  @override
  State<_FindingCard> createState() => _FindingCardState();
}

class _FindingCardState extends State<_FindingCard> {
  bool _hover = false;

  Finding get f => widget.finding;

  @override
  Widget build(BuildContext context) {
    final label = switch (f.verdict) {
      Verdict.red => '最坏会发生',
      Verdict.yellow => '可能吃亏',
      Verdict.gray => '需要确认',
      Verdict.green => '规则核对',
    };
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: AppCard(
        padding: EdgeInsets.zero,
        selected: widget.active,
        onTap: widget.onToggle,
        child: AnimatedContainer(
          duration: AppDuration.fast,
          decoration: BoxDecoration(
            color: _hover && !widget.active
                ? AppColors.surfaceMuted.withValues(alpha: 0.55)
                : null,
            borderRadius: BorderRadius.circular(AppRadius.lg),
          ),
          padding: const EdgeInsets.fromLTRB(
            AppSpace.x4,
            AppSpace.x3 + 2,
            AppSpace.x3,
            AppSpace.x3 + 2,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.only(top: 1),
                    child: AppTag(
                      label: verdictLabel[f.verdict]!,
                      tone: verdictTone(f.verdict),
                      compact: true,
                    ),
                  ),
                  const SizedBox(width: AppSpace.x2),
                  Expanded(
                    child: Text(
                      f.ruleName,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: AppType.strong(size: 14.5),
                    ),
                  ),
                  const SizedBox(width: AppSpace.x2),
                  Text(
                    f.location,
                    style: AppType.caption(color: AppColors.inkDisabled),
                  ),
                  const SizedBox(width: AppSpace.x1),
                  AnimatedRotation(
                    turns: widget.expanded ? 0.5 : 0,
                    duration: AppDuration.fast,
                    child: Icon(
                      AppIcons.expandMore,
                      size: 20,
                      color: _hover
                          ? AppColors.inkSecondary
                          : AppColors.inkDisabled,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpace.x2),
              Text(label, style: AppType.label(color: AppColors.inkTertiary)),
              const SizedBox(height: 1),
              Text(
                f.consequence,
                style: AppType.bodySm(color: AppColors.inkSecondary),
              ),
              AnimatedSize(
                duration: AppDuration.base,
                alignment: Alignment.topCenter,
                child: widget.expanded
                    ? _FindingDetail(
                        finding: f,
                        onLocate: widget.onLocate,
                        onCopy: widget.onCopy,
                      )
                    : const SizedBox(width: double.infinity),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FindingDetail extends StatelessWidget {
  const _FindingDetail({
    required this.finding,
    required this.onLocate,
    required this.onCopy,
  });

  final Finding finding;
  final VoidCallback onLocate;
  final void Function(String text, String label) onCopy;

  @override
  Widget build(BuildContext context) {
    final f = finding;
    final color = verdictColor(f.verdict);
    return Container(
      margin: const EdgeInsets.only(top: AppSpace.x3),
      padding: const EdgeInsets.all(AppSpace.x3),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (f.quote.isNotEmpty) ...[
            Text('原文', style: AppType.label()),
            const SizedBox(height: AppSpace.x1 + 2),
            Text(
              f.quote,
              style: AppType.bodySm(color: AppColors.inkSecondary)
                  .copyWith(height: 1.8),
            ),
            const SizedBox(height: AppSpace.x3),
          ],
          if (f.basis != null) ...[
            Text('法律依据', style: AppType.label()),
            const SizedBox(height: AppSpace.x1 + 2),
            Text(
              '${f.basis!.law} ${f.basis!.article == '需核对' ? '（条文序号需核对）' : f.basis!.article}',
              style: AppType.strong(size: 13),
            ),
            const SizedBox(height: 2),
            Text(
              f.basis!.text,
              style: AppType.caption(color: AppColors.inkSecondary)
                  .copyWith(height: 1.75),
            ),
            const SizedBox(height: AppSpace.x3),
          ],
          if (f.ask.isNotEmpty)
            _AdviceRow(
              label: '问谁 · 问什么',
              text: f.ask,
              onCopy: () => onCopy(f.ask, '这句话'),
            ),
          if (f.ask.isNotEmpty && f.counter.isNotEmpty)
            const SizedBox(height: AppSpace.x3),
          if (f.counter.isNotEmpty)
            _AdviceRow(
              label: '可以怎么改',
              text: f.counter,
              emphasis: true,
              onCopy: () => onCopy(f.counter, '这句话'),
            ),
          const SizedBox(height: AppSpace.x3),
          Row(
            children: [
              AppLink(
                label: '在原文中定位',
                icon: AppIcons.location,
                onPressed: onLocate,
                color: color,
              ),
              const Spacer(),
              Text(
                '把握：${f.confidence}',
                style: AppType.caption(color: AppColors.inkDisabled),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _AdviceRow extends StatelessWidget {
  const _AdviceRow({
    required this.label,
    required this.text,
    required this.onCopy,
    this.emphasis = false,
  });

  final String label;
  final String text;
  final VoidCallback onCopy;
  final bool emphasis;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: AppType.label()),
              const SizedBox(height: AppSpace.x1 + 2),
              Text(
                text,
                style: emphasis
                    ? AppType.strong(size: 13).copyWith(height: 1.7)
                    : AppType.bodySm(color: AppColors.inkSecondary)
                          .copyWith(height: 1.7),
              ),
            ],
          ),
        ),
        const SizedBox(width: AppSpace.x2),
        AppIconButton(icon: AppIcons.copy, tooltip: '复制这句话', onPressed: onCopy),
      ],
    );
  }
}

class _PendingCard extends StatelessWidget {
  const _PendingCard({required this.items});

  final List<String> items;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(AppIcons.flag, size: 18, color: AppColors.amber),
              const SizedBox(width: AppSpace.x2),
              Text('还要确认 ${items.length} 件事', style: AppType.h3()),
            ],
          ),
          const SizedBox(height: 2),
          Text('这些信息没有出现在你提供的文本里，不能替你判断。', style: AppType.caption()),
          const SizedBox(height: AppSpace.x3),
          for (var i = 0; i < items.length; i++)
            Padding(
              padding: EdgeInsets.only(
                bottom: i == items.length - 1 ? 0 : AppSpace.x2,
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 24,
                    child: Text(
                      '${i + 1}'.padLeft(2, '0'),
                      style: AppType.num(
                        color: AppColors.inkDisabled,
                        size: 12,
                      ).copyWith(fontWeight: FontWeight.w600),
                    ),
                  ),
                  const SizedBox(width: AppSpace.x2),
                  Expanded(
                    child: Text(
                      items[i],
                      style: AppType.bodySm(color: AppColors.inkSecondary),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _SourcePane extends StatelessWidget {
  const _SourcePane({
    required this.controller,
    required this.scroll,
    required this.clauseKeys,
    required this.onClauseTap,
    required this.wide,
  });

  final ReviewController controller;
  final ScrollController scroll;
  final Map<int, GlobalKey> clauseKeys;
  final void Function(List<Finding> findings) onClauseTap;
  final bool wide;

  @override
  Widget build(BuildContext context) {
    final analysis = controller.analysis!;
    final findingsByClause = <int, List<Finding>>{};
    for (final finding in analysis.items) {
      final index = finding.clauseIndex;
      if (index != null) (findingsByClause[index] ??= []).add(finding);
    }
    final activeClause = controller.activeFinding?.clauseIndex;

    return AppCard(
      padding: EdgeInsets.zero,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpace.x4,
              AppSpace.x3,
              AppSpace.x4,
              AppSpace.x3,
            ),
            child: Row(
              children: [
                const Icon(
                  AppIcons.article,
                  size: 18,
                  color: AppColors.inkTertiary,
                ),
                const SizedBox(width: AppSpace.x2),
                Text('合同原文', style: AppType.strong(size: 14)),
                const SizedBox(width: AppSpace.x2),
                AppTag(label: analysis.docType, compact: true),
                const Spacer(),
                Text(
                  '${analysis.numberedCount > 0 ? analysis.numberedCount : analysis.clauseCount} 条 · ${controller.charCount} 字',
                  style: AppType.caption(),
                ),
              ],
            ),
          ),
          const Divider(),
          Expanded(
            child: Scrollbar(
              controller: scroll,
              child: SingleChildScrollView(
                controller: scroll,
                physics: const ClampingScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(
                  AppSpace.x4,
                  AppSpace.x4,
                  AppSpace.x4,
                  AppSpace.x8,
                ),
                child: SelectionArea(
                  child: _ClauseList(
                    analysis: analysis,
                    findingsByClause: findingsByClause,
                    activeClause: activeClause,
                    clauseKeys: clauseKeys,
                    onClauseTap: onClauseTap,
                  ),
                ),
              ),
            ),
          ),
          if (wide)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpace.x4,
                vertical: AppSpace.x2 + 2,
              ),
              decoration: const BoxDecoration(
                color: AppColors.surfaceMuted,
                border: Border(top: BorderSide(color: AppColors.border)),
                borderRadius: BorderRadius.vertical(
                  bottom: Radius.circular(AppRadius.lg),
                ),
              ),
              child: Text(
                analysis.pending.isNotEmpty
                    ? '点击标红条款查看批注 · 另 ${analysis.pending.length} 条待确认'
                    : '点击标红条款查看批注',
                style: AppType.caption().copyWith(fontSize: 11.5),
              ),
            ),
        ],
      ),
    );
  }
}

class _ClauseList extends StatelessWidget {
  const _ClauseList({
    required this.analysis,
    required this.findingsByClause,
    required this.activeClause,
    required this.clauseKeys,
    required this.onClauseTap,
  });

  final Analysis analysis;
  final Map<int, List<Finding>> findingsByClause;
  final int? activeClause;
  final Map<int, GlobalKey> clauseKeys;
  final void Function(List<Finding> findings) onClauseTap;

  @override
  Widget build(BuildContext context) {
    final titleKey = analysis.title.replaceAll(RegExp(r'\s+'), '');
    final clauses = [
      if (analysis.clauses.isNotEmpty)
        _stripTitleLine(analysis.clauses.first, titleKey),
      ...analysis.clauses.skip(analysis.clauses.isEmpty ? 0 : 1),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(analysis.title, style: AppType.h3().copyWith(height: 1.5)),
        const SizedBox(height: 2),
        Text(
          '共 ${analysis.clauseCount} 条 · 规则在本机逐条核对',
          style: AppType.caption(),
        ),
        const SizedBox(height: AppSpace.x4),
        for (final clause in clauses)
          if (!(clause.kind == 'preamble' && clause.body.trim().isEmpty))
            Container(
              key: clauseKeys[clause.index],
              child: _ClauseBlock(
                clause: clause,
                findings: findingsByClause[clause.index] ?? const [],
                active: activeClause == clause.index,
                onTap: () =>
                    onClauseTap(findingsByClause[clause.index] ?? const []),
              ),
            ),
        if (clauses.isEmpty)
          const EmptyState(compact: true, title: '没有可显示的原文。'),
        if (clauses.isNotEmpty) ...[
          const SizedBox(height: AppSpace.x4),
          Center(
            child: Text(
              '正文完',
              style: AppType.caption(color: AppColors.inkDisabled),
            ),
          ),
        ],
      ],
    );
  }

  Clause _stripTitleLine(Clause clause, String titleKey) {
    final bodyLines = clause.body.split('\n');
    if (bodyLines.first.replaceAll(RegExp(r'\s+'), '') != titleKey) {
      return clause;
    }
    final textLines = clause.text.split('\n');
    return Clause(
      kind: clause.kind,
      heading: clause.heading,
      body: bodyLines.skip(1).join('\n').trimLeft(),
      text: textLines.first.replaceAll(RegExp(r'\s+'), '') == titleKey
          ? textLines.skip(1).join('\n').trimLeft()
          : clause.text,
      start: clause.start,
      end: clause.end,
      numbered: clause.numbered,
      index: clause.index,
    );
  }
}

class _ClauseBlock extends StatelessWidget {
  const _ClauseBlock({
    required this.clause,
    required this.findings,
    required this.active,
    required this.onTap,
  });

  final Clause clause;
  final List<Finding> findings;
  final bool active;
  final VoidCallback onTap;

  Finding? get worst {
    if (findings.isEmpty) return null;
    var result = findings.first;
    for (final finding in findings.skip(1)) {
      if (verdictOrder[finding.verdict]! < verdictOrder[result.verdict]!) {
        result = finding;
      }
    }
    return result;
  }

  @override
  Widget build(BuildContext context) {
    final top = worst;
    if (clause.kind == 'preamble') {
      return Container(
        margin: const EdgeInsets.only(bottom: AppSpace.x3),
        padding: const EdgeInsets.all(AppSpace.x3),
        decoration: BoxDecoration(
          color: AppColors.surfaceMuted,
          borderRadius: BorderRadius.circular(AppRadius.sm),
        ),
        child: Text(
          clause.body,
          style: AppType.bodySm(color: AppColors.inkSecondary)
              .copyWith(height: 1.85),
        ),
      );
    }

    final flagged = top != null;
    final color = flagged ? verdictColor(top.verdict) : AppColors.border;
    final block = AnimatedContainer(
      duration: AppDuration.base,
      margin: const EdgeInsets.only(bottom: AppSpace.x1 + 2),
      padding: const EdgeInsets.fromLTRB(
        AppSpace.x3,
        AppSpace.x3,
        AppSpace.x3,
        AppSpace.x3,
      ),
      decoration: BoxDecoration(
        color: active
            ? color.withValues(alpha: 0.08)
            : flagged
            ? color.withValues(alpha: 0.04)
            : Colors.transparent,
        borderRadius: BorderRadius.circular(AppRadius.sm),
        border: Border.all(
          color: active ? color.withValues(alpha: 0.5) : Colors.transparent,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 26,
            child: Padding(
              padding: const EdgeInsets.only(top: 3),
              child: clause.numbered
                  ? Text(
                      clause.index.toString().padLeft(2, '0'),
                      textAlign: TextAlign.right,
                      style: AppType.num(
                        color: flagged ? color : AppColors.inkDisabled,
                        size: 11,
                      ).copyWith(fontWeight: FontWeight.w600),
                    )
                  : null,
            ),
          ),
          const SizedBox(width: AppSpace.x2),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (clause.heading.isNotEmpty)
                  Text(
                    clause.heading,
                    style: AppType.strong(size: 14.5).copyWith(height: 1.6),
                  ),
                if (clause.body.isNotEmpty) ...[
                  if (clause.heading.isNotEmpty) const SizedBox(height: 4),
                  _HighlightedText(text: clause.body, findings: findings),
                ],
                if (clause.body.isEmpty && clause.heading.isEmpty)
                  Text(
                    clause.text,
                    style: AppType.bodySm(color: AppColors.inkSecondary)
                        .copyWith(height: 1.9),
                  ),
                if (flagged) ...[
                  const SizedBox(height: AppSpace.x1 + 2),
                  Row(
                    children: [
                      Icon(AppIcons.location, size: 12, color: color),
                      const SizedBox(width: 4),
                      Text(
                        '批注 ${findings.length}',
                        style: AppType.caption(color: color)
                            .copyWith(fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );

    if (!flagged) return block;
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppRadius.sm),
          child: block,
        ),
      ),
    );
  }
}

class _HighlightedText extends StatelessWidget {
  const _HighlightedText({required this.text, required this.findings});

  final String text;
  final List<Finding> findings;

  @override
  Widget build(BuildContext context) {
    final base = AppType.bodySm(color: AppColors.inkSecondary)
        .copyWith(height: 1.9);
    final ranges = <(int, int, Color)>[];
    for (final finding in findings) {
      final quote = finding.quote.trim();
      if (quote.isEmpty) continue;
      final index = text.indexOf(quote);
      if (index < 0) continue;
      ranges.add((index, index + quote.length, verdictColor(finding.verdict)));
    }
    ranges.sort((x, y) => x.$1.compareTo(y.$1));

    final spans = <TextSpan>[];
    var cursor = 0;
    for (final range in ranges) {
      if (range.$1 < cursor) continue;
      if (range.$1 > cursor) {
        spans.add(
          TextSpan(text: text.substring(cursor, range.$1), style: base),
        );
      }
      spans.add(
        TextSpan(
          text: text.substring(range.$1, range.$2),
          style: base.copyWith(
            color: AppColors.ink,
            backgroundColor: range.$3.withValues(alpha: 0.14),
          ),
        ),
      );
      cursor = range.$2;
    }
    if (cursor < text.length) {
      spans.add(TextSpan(text: text.substring(cursor), style: base));
    }

    return Text.rich(
      TextSpan(
        children: spans.isEmpty ? [TextSpan(text: text, style: base)] : spans,
      ),
      style: base,
    );
  }
}

class _MobileReportBar extends StatelessWidget {
  const _MobileReportBar({required this.controller});

  final ReviewController controller;

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.paddingOf(context).bottom;
    return Container(
      padding: EdgeInsets.fromLTRB(
        AppSpace.x4,
        AppSpace.x2 + 2,
        AppSpace.x4,
        AppSpace.x2 + 2 + bottom,
      ),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: Row(
        children: [
          Expanded(
            child: AppButton(
              label: '导出 PDF',
              icon: AppIcons.pdf,
              tone: AppButtonTone.secondary,
              onPressed: controller.exporting ? null : controller.exportPdf,
              loading: controller.exporting,
            ),
          ),
          const SizedBox(width: AppSpace.x2),
          Expanded(
            child: AppButton(
              label: '复制报告',
              icon: AppIcons.copy,
              onPressed: controller.copyReport,
            ),
          ),
        ],
      ),
    );
  }
}
