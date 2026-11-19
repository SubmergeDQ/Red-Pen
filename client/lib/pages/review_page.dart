import 'package:material_ui/material_ui.dart';

import '../engine/engine.dart';
import '../state/review_controller.dart';
import '../theme.dart';
import '../ui/common.dart';

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
      final context = _clauseKeys[index]?.currentContext;
      if (context == null) return;
      Scrollable.ensureVisible(
        context,
        duration: const Duration(milliseconds: 420),
        curve: Curves.easeOutCubic,
        alignment: 0.06,
      );
    });
  }

  void _revealFinding(String id) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final context = _findingKeys[id]?.currentContext;
      if (context == null) return;
      Scrollable.ensureVisible(
        context,
        duration: const Duration(milliseconds: 360),
        curve: Curves.easeOutCubic,
        alignment: 0.28,
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
      _revealFinding(first.id);
    } else {
      _revealFinding(first.id);
    }
  }

  @override
  Widget build(BuildContext context) {
    final analysis = a;
    if (analysis == null) {
      return const Center(child: Text('还没有审阅结果。'));
    }
    final size = MediaQuery.sizeOf(context);
    final wide = size.width >= 960;
    final reportWidth = (size.width * 0.43).clamp(420.0, 640.0);

    final reportPane = _ReportPane(
      controller: c,
      scroll: _reportScroll,
      findingKeys: _findingKeys,
      onLocate: (finding) => _locate(finding, wide: wide),
      onCopy: (text, label) => c.copy(text, label),
      onRules: () => showRulesPanel(context),
    );

    final contractPane = _ContractPane(
      controller: c,
      scroll: _contractScroll,
      clauseKeys: _clauseKeys,
      onClauseTap: (findings) => _tapClause(findings, wide: wide),
      showHint: wide,
    );

    if (!wide) {
      return Column(
        children: [
          _MobileTabs(controller: c),
          Expanded(
            child: IndexedStack(
              index: c.mobileTab,
              children: [reportPane, contractPane],
            ),
          ),
        ],
      );
    }
    return Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(child: contractPane),
        Container(width: 1, color: R.rule),
        SizedBox(width: reportWidth, child: reportPane),
      ],
    );
  }
}

class _MobileTabs extends StatelessWidget {
  const _MobileTabs({required this.controller});

  final ReviewController controller;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 47,
      decoration: const BoxDecoration(
        color: R.desk,
        border: Border(bottom: BorderSide(color: R.rule)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          _Tab(
            label: '合同原文',
            selected: controller.mobileTab == 1,
            onTap: () => controller.setMobileTab(1),
          ),
          _Tab(
            label: '审阅报告',
            count: controller.riskCount,
            selected: controller.mobileTab == 0,
            onTap: () => controller.setMobileTab(0),
          ),
        ],
      ),
    );
  }
}

class _Tab extends StatelessWidget {
  const _Tab({
    required this.label,
    required this.selected,
    required this.onTap,
    this.count,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;
  final int? count;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          height: 47,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(color: selected ? R.vermilion : Colors.transparent, width: 2),
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                label,
                style: R.serif(
                  size: 13.5,
                  weight: selected ? FontWeight.w600 : FontWeight.w500,
                  color: selected ? R.ink : R.muted,
                  height: 1.3,
                  letterSpacing: 0.2,
                ),
              ),
              if (count != null) ...[
                const SizedBox(width: 6),
                Text(
                  '($count)',
                  style: R.num(
                    size: 11,
                    weight: FontWeight.w600,
                    color: selected ? R.vermilion : R.faint,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _ContractPane extends StatelessWidget {
  const _ContractPane({
    required this.controller,
    required this.scroll,
    required this.clauseKeys,
    required this.onClauseTap,
    required this.showHint,
  });

  final ReviewController controller;
  final ScrollController scroll;
  final Map<int, GlobalKey> clauseKeys;
  final void Function(List<Finding> findings) onClauseTap;
  final bool showHint;

  @override
  Widget build(BuildContext context) {
    final analysis = controller.analysis!;
    final width = MediaQuery.sizeOf(context).width;
    final narrow = width < 600;
    final findingsByClause = <int, List<Finding>>{};
    for (final finding in analysis.items) {
      final index = finding.clauseIndex;
      if (index != null) (findingsByClause[index] ??= []).add(finding);
    }
    final activeClause = controller.activeFinding?.clauseIndex;

    return Container(
      color: R.desk,
      child: Column(
        children: [
          Container(
            height: narrow ? 48 : 54,
            padding: EdgeInsets.symmetric(horizontal: narrow ? 14 : 26),
            decoration: const BoxDecoration(
              color: R.desk,
              border: Border(bottom: BorderSide(color: R.rule)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  height: 24,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: R.sheet,
                    border: Border.all(color: R.ruleStrong),
                    borderRadius: BorderRadius.circular(3),
                  ),
                  child: Text(
                    analysis.docType,
                    style: R.serif(
                      size: 11.5,
                      weight: FontWeight.w600,
                      color: R.ink2,
                      letterSpacing: 0.5,
                      height: 1.2,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    '${analysis.numberedCount > 0 ? analysis.numberedCount : analysis.clauseCount} 条 · 约 ${controller.charCount} 字'
                    '${analysis.pending.isNotEmpty ? ' · 另 ${analysis.pending.length} 条待确认' : ''}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: R.sans(size: 11.5, color: R.muted, height: 1.4),
                  ),
                ),
                if (showHint)
                  Text(
                    '点击标红条款查看批注',
                    style: R.sans(size: 11.5, color: R.faint, height: 1.4),
                  ),
              ],
            ),
          ),
          Expanded(
            child: ScrollConfiguration(
              behavior: ScrollConfiguration.of(context).copyWith(scrollbars: false),
              child: Scrollbar(
                controller: scroll,
                child: SingleChildScrollView(
                  controller: scroll,
                  physics: const ClampingScrollPhysics(),
                  child: Center(
                    child: SelectionArea(
                      child: _Paper(
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
            ),
          ),
        ],
      ),
    );
  }
}

class _Paper extends StatelessWidget {
  const _Paper({
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
    final width = MediaQuery.sizeOf(context).width;
    final narrow = width < 600;
    final titleKey = analysis.title.replaceAll(RegExp(r'\s+'), '');
    final clauses = [
      if (analysis.clauses.isNotEmpty) _stripTitleLine(analysis.clauses.first, titleKey),
      ...analysis.clauses.skip(analysis.clauses.isEmpty ? 0 : 1),
    ];
    return Container(
      constraints: const BoxConstraints(maxWidth: 780),
      margin: EdgeInsets.fromLTRB(narrow ? 12 : 18, 18, narrow ? 12 : 18, 40),
      decoration: BoxDecoration(
        color: R.sheet,
        border: Border.all(color: R.rule),
        boxShadow: R.shadowSheet,
      ),
      child: Stack(
        children: [
          Positioned(
            left: narrow ? 20 : 44,
            top: 0,
            bottom: 0,
            child: Container(width: 1, color: R.vermilion.withValues(alpha: 0.13)),
          ),
          Padding(
            padding: EdgeInsets.fromLTRB(
              narrow ? 28 : 66,
              narrow ? 30 : 46,
              narrow ? 20 : 52,
              narrow ? 52 : 80,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  analysis.title,
                  textAlign: TextAlign.center,
                  style: R.serif(
                    size: narrow ? 21 : 26,
                    weight: FontWeight.w700,
                    letterSpacing: narrow ? 3 : 6,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  '共 ${analysis.clauseCount} 条 · 规则在本机逐条核对',
                  textAlign: TextAlign.center,
                  style: R.sans(size: 11, color: R.muted, letterSpacing: 0.6, height: 1.5),
                ),
                const SizedBox(height: 22),
                for (final clause in clauses)
                  if (!(clause.kind == 'preamble' && clause.body.trim().isEmpty))
                    Container(
                      key: clauseKeys[clause.index],
                      child: _ClauseBlock(
                        clause: clause,
                        findings: findingsByClause[clause.index] ?? const [],
                        active: activeClause == clause.index,
                        onTap: () => onClauseTap(findingsByClause[clause.index] ?? const []),
                      ),
                    ),
                if (clauses.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 40),
                    child: Text(
                      '没有可显示的原文。',
                      textAlign: TextAlign.center,
                      style: R.sans(size: 13, color: R.muted),
                    ),
                  ),
                if (clauses.isNotEmpty) ...[
                  const SizedBox(height: 26),
                  Center(
                    child: Text(
                      '— 正文完 —',
                      style: R.sans(size: 10.5, color: R.faint, letterSpacing: 2, height: 1.4),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Clause _stripTitleLine(Clause clause, String titleKey) {
    final bodyLines = clause.body.split('\n');
    if (bodyLines.first.replaceAll(RegExp(r'\s+'), '') != titleKey) return clause;
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
      if (verdictOrder[finding.verdict]! < verdictOrder[result.verdict]!) result = finding;
    }
    return result;
  }

  @override
  Widget build(BuildContext context) {
    final top = worst;
    if (clause.kind == 'preamble') {
      return Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 2),
        decoration: const BoxDecoration(
          border: Border(
            top: BorderSide(color: R.rule),
            bottom: BorderSide(color: R.rule),
          ),
        ),
        child: Text(
          clause.body,
          style: R.serif(size: 14.5, weight: FontWeight.w400, color: R.ink2, height: 1.95),
        ),
      );
    }

    final flagged = top != null;
    final color = flagged ? verdictColor(top.verdict) : R.rule;
    final content = Stack(
      children: [
        Padding(
          padding: EdgeInsets.only(right: flagged ? 2 : 0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (clause.numbered)
                SizedBox(
                  width: 38,
                  child: Padding(
                    padding: const EdgeInsets.only(top: 4, right: 12),
                    child: Text(
                      clause.index.toString().padLeft(2, '0'),
                      textAlign: TextAlign.right,
                      style: R.num(
                        size: 11,
                        weight: FontWeight.w600,
                        color: flagged ? color : R.faint,
                      ),
                    ),
                  ),
                )
              else
                const SizedBox(width: 2),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (clause.heading.isNotEmpty)
                      Padding(
                        padding: EdgeInsets.only(right: flagged ? 64 : 0),
                        child: Text(
                          clause.heading,
                          style: R.serif(
                            size: 16,
                            weight: FontWeight.w700,
                            height: 1.6,
                            letterSpacing: 0.2,
                          ),
                        ),
                      ),
                    if (clause.body.isNotEmpty) ...[
                      if (clause.heading.isNotEmpty) const SizedBox(height: 6),
                      _HighlightedText(
                        text: clause.body,
                        findings: findings,
                      ),
                    ],
                    if (clause.body.isEmpty && clause.heading.isEmpty)
                      Text(
                        clause.text,
                        style: R.serif(size: 15, weight: FontWeight.w400, color: R.ink2, height: 2),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
        if (flagged)
          Positioned(
            right: 0,
            top: 0,
            child: TagPill(
              label: '批注 ${findings.length}',
              color: color,
              background: color.withValues(alpha: 0.09).blend(R.sheet),
              border: color.withValues(alpha: 0.26),
            ),
          ),
      ],
    );

    final block = AnimatedContainer(
      duration: const Duration(milliseconds: 220),
      margin: const EdgeInsets.only(bottom: 2),
      padding: flagged
          ? const EdgeInsets.fromLTRB(12, 14, 14, 14)
          : const EdgeInsets.symmetric(vertical: 18),
      decoration: BoxDecoration(
        color: active
            ? color.withValues(alpha: 0.09)
            : flagged
                ? color.withValues(alpha: 0.055)
                : Colors.transparent,
        border: flagged
            ? Border(
                left: BorderSide(color: color, width: active ? 3 : 2),
              )
            : null,
        boxShadow: active
            ? [
                BoxShadow(
                  color: color.withValues(alpha: 0.16),
                  blurRadius: 0,
                  spreadRadius: 2,
                ),
              ]
            : null,
      ),
      child: content,
    );

    if (!flagged) return block;
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(2),
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
    final base = R.serif(size: 15, weight: FontWeight.w400, color: const Color(0xFF2B3026), height: 2);
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
        spans.add(TextSpan(text: text.substring(cursor, range.$1), style: base));
      }
      spans.add(
        TextSpan(
          text: text.substring(range.$1, range.$2),
          style: base.copyWith(
            color: R.ink,
            backgroundColor: range.$3.withValues(alpha: 0.13),
          ),
        ),
      );
      cursor = range.$2;
    }
    if (cursor < text.length) {
      spans.add(TextSpan(text: text.substring(cursor), style: base));
    }

    return Text.rich(
      TextSpan(children: spans.isEmpty ? [TextSpan(text: text, style: base)] : spans),
      style: base,
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
    final width = MediaQuery.sizeOf(context).width;
    final narrow = width < 600;
    final items = controller.visibleFindings;
    final nonGreen = analysis.items.where((f) => f.verdict != Verdict.green).length;
    final anyActionable = nonGreen > 0;

    return Container(
      color: R.desk2,
      child: ScrollConfiguration(
        behavior: ScrollConfiguration.of(context).copyWith(scrollbars: false),
        child: Scrollbar(
          controller: scroll,
          child: SingleChildScrollView(
            controller: scroll,
            physics: const ClampingScrollPhysics(),
            padding: EdgeInsets.fromLTRB(narrow ? 16 : 30, narrow ? 22 : 28, narrow ? 16 : 30, 44),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 640),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Eyebrow('审阅结果'),
                    const SizedBox(height: 13),
                    Container(
                      padding: const EdgeInsets.only(left: 16),
                      decoration: BoxDecoration(
                        border: Border(
                          left: BorderSide(color: verdictColor(analysis.topVerdict), width: 3),
                        ),
                      ),
                      child: Text(
                        analysis.oneLiner,
                        style: R.serif(
                          size: narrow ? 19 : 20,
                          weight: FontWeight.w600,
                          color: R.ink,
                          height: 1.55,
                          letterSpacing: 0.2,
                        ),
                      ),
                    ),
                    if (analysis.packLabels.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: R.sheet,
                          border: Border.all(color: R.rule),
                          borderRadius: BorderRadius.circular(3),
                        ),
                        child: Text(
                          '应用规则：${analysis.packLabels.join(' / ')}',
                          style: R.sans(size: 11, color: R.muted, height: 1.5),
                        ),
                      ),
                    ],
                    if (controller.ocrUsed) ...[
                      const SizedBox(height: 14),
                      const InfoNote(
                        tone: NoteTone.warning,
                        icon: Icons.image_outlined,
                        message: '正文来自本机 OCR。请对照原件核对金额、日期和条款编号，再依据这份结果去谈。',
                      ),
                    ],
                    const SizedBox(height: 18),
                    _FilterChips(controller: controller),
                    if (analysis.insufficient) ...[
                      const SizedBox(height: 14),
                      InfoNote(
                        tone: NoteTone.warning,
                        message: '这份文本只拆出 ${analysis.clauseCount} 条实质条款，可能不是完整合同。请确认粘贴了全文，下面的结果仅供参考。',
                      ),
                    ],
                    if (!analysis.insufficient && !anyActionable) ...[
                      const SizedBox(height: 14),
                      InfoNote(
                        tone: NoteTone.success,
                        icon: Icons.check_circle_outline,
                        message: '这 ${ruleLibrary.length} 类规则没有扫到明显风险。金额、合同主体和附件仍要人工核对。',
                      ),
                    ],
                    const SizedBox(height: 6),
                    if (items.isEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 22),
                        child: Text(
                          controller.filter == null ? '没有可展开的条目。' : '这个等级没有发现问题。',
                          style: R.sans(size: 12.5, color: R.muted, height: 1.7),
                        ),
                      )
                    else
                      Container(
                        decoration: const BoxDecoration(
                          border: Border(top: BorderSide(color: R.rule)),
                        ),
                        child: Column(
                          children: [
                            for (final finding in items)
                              KeyedSubtree(
                                key: findingKeys[finding.id],
                                child: _FindingCard(
                                  finding: finding,
                                  expanded: controller.expandedId == finding.id,
                                  active: controller.activeFindingId == finding.id,
                                  onToggle: () => controller.toggleExpanded(finding.id),
                                  onLocate: () => onLocate(finding),
                                  onCopy: onCopy,
                                ),
                              ),
                          ],
                        ),
                      ),
                    if (analysis.pending.isNotEmpty)
                      _PendingBlock(items: analysis.pending),
                    const SizedBox(height: 26),
                    const Divider(height: 1, color: R.rule),
                    const SizedBox(height: 13),
                    Text(
                      '以上为签约前风险提示，基于你提供的文本和通用规定，不构成法律意见。涉及金额较大或已产生争议，请拨打 12348 公共法律服务热线，或联系学校法律援助中心。',
                      style: R.sans(size: 11, color: R.muted, height: 1.75),
                    ),
                    const SizedBox(height: 8),
                    InkWell(
                      onTap: onRules,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 3),
                        child: Text(
                          '查看 ${ruleLibrary.length} 类核对依据与法律出处',
                          style: R.sans(
                            size: 12,
                            color: R.pine,
                            height: 1.5,
                          ).copyWith(decoration: TextDecoration.underline, decorationColor: const Color(0x4DA9B8A5)),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        DeskButton(
                          label: '回到交稿台',
                          icon: Icons.arrow_back,
                          kind: DeskButtonKind.outline,
                          height: 40,
                          compact: true,
                          onPressed: controller.editText,
                        ),
                        DeskButton(
                          label: '复制审阅报告',
                          icon: Icons.copy,
                          kind: DeskButtonKind.primary,
                          height: 40,
                          compact: true,
                          onPressed: controller.copyReport,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _FilterChips extends StatelessWidget {
  const _FilterChips({required this.controller});

  final ReviewController controller;

  @override
  Widget build(BuildContext context) {
    final analysis = controller.analysis!;
    final entries = <(Verdict?, String, int)>[
      (null, '全部', analysis.items.length),
      (Verdict.red, verdictLabel[Verdict.red]!, analysis.countOf(Verdict.red)),
      (Verdict.yellow, verdictLabel[Verdict.yellow]!, analysis.countOf(Verdict.yellow)),
      (Verdict.gray, verdictLabel[Verdict.gray]!, analysis.countOf(Verdict.gray)),
      (Verdict.green, verdictLabel[Verdict.green]!, analysis.countOf(Verdict.green)),
    ];
    return Container(
      decoration: const BoxDecoration(
        border: Border(
          top: BorderSide(color: R.ruleStrong),
          bottom: BorderSide(color: R.ruleStrong),
        ),
      ),
      child: Row(
        children: [
          for (var i = 0; i < entries.length; i++)
            Expanded(
              child: _FilterChip(
                value: entries[i].$1,
                label: entries[i].$2,
                count: entries[i].$3,
                selected: controller.filter == entries[i].$1,
                last: i == entries.length - 1,
                onTap: entries[i].$1 != null && entries[i].$3 == 0
                    ? null
                    : () => controller.setFilter(entries[i].$1),
              ),
            ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatefulWidget {
  const _FilterChip({
    required this.value,
    required this.label,
    required this.count,
    required this.selected,
    required this.last,
    required this.onTap,
  });

  final Verdict? value;
  final String label;
  final int count;
  final bool selected;
  final bool last;
  final VoidCallback? onTap;

  @override
  State<_FilterChip> createState() => _FilterChipState();
}

class _FilterChipState extends State<_FilterChip> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final enabled = widget.onTap != null;
    final color = widget.value == null ? R.vermilion : verdictColor(widget.value!);
    return MouseRegion(
      cursor: enabled ? SystemMouseCursors.click : SystemMouseCursors.basic,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        onTap: enabled ? widget.onTap : null,
        behavior: HitTestBehavior.opaque,
        child: AnimatedOpacity(
          duration: const Duration(milliseconds: 150),
          opacity: enabled ? 1 : 0.38,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            height: 60,
            padding: const EdgeInsets.fromLTRB(8, 8, 8, 7),
            decoration: BoxDecoration(
              color: widget.selected
                  ? R.sheet
                  : _hover && enabled
                      ? R.sheet.withValues(alpha: 0.6)
                      : Colors.transparent,
              border: Border(
                right: widget.last ? BorderSide.none : const BorderSide(color: R.rule),
                bottom: BorderSide(
                  color: widget.selected ? R.vermilion : Colors.transparent,
                  width: 2,
                ),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text(
                  '${widget.count}',
                  style: R.num(
                    size: 22,
                    weight: FontWeight.w600,
                    color: widget.selected ? R.vermilion : R.ink,
                  ),
                ),
                const SizedBox(height: 1),
                Row(
                  children: [
                    Container(
                      width: 12,
                      height: 2,
                      margin: const EdgeInsets.only(right: 4, bottom: 1),
                      color: color.withValues(alpha: 0.6),
                    ),
                    Flexible(
                      child: Text(
                        widget.label,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: R.sans(
                          size: 10.5,
                          weight: FontWeight.w500,
                          color: widget.selected ? R.ink : R.muted,
                          letterSpacing: 0.7,
                          height: 1.3,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
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
    final color = verdictColor(f.verdict);
    final soft = verdictSoft(f.verdict);
    final label = switch (f.verdict) {
      Verdict.red => '最坏会发生',
      Verdict.yellow => '可能吃亏',
      Verdict.gray => '需要确认',
      Verdict.green => '规则核对',
    };

    return LayoutBuilder(
      builder: (context, constraints) {
        final narrow = constraints.maxWidth < 430;
        final header = Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.only(top: 1),
              child: TagPill(label: verdictLabel[f.verdict]!, color: color, background: soft),
            ),
            const SizedBox(width: 9),
            Expanded(
              child: Text(
                f.ruleName,
                maxLines: narrow ? 2 : 1,
                overflow: TextOverflow.ellipsis,
                style: R.serif(size: 15.5, weight: FontWeight.w600, color: R.ink, height: 1.5),
              ),
            ),
            if (!narrow) ...[
              const SizedBox(width: 8),
              Padding(
                padding: const EdgeInsets.only(top: 2),
                child: Text(
                  f.location,
                  style: R.sans(size: 11, color: R.faint, height: 1.4),
                ),
              ),
            ],
            const SizedBox(width: 6),
            AnimatedRotation(
              turns: widget.expanded ? 0.5 : 0,
              duration: const Duration(milliseconds: 180),
              child: Icon(Icons.expand_more, size: 16, color: _hover ? R.ink2 : R.faint),
            ),
          ],
        );

        return MouseRegion(
          cursor: SystemMouseCursors.click,
          onEnter: (_) => setState(() => _hover = true),
          onExit: (_) => setState(() => _hover = false),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: widget.onToggle,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 160),
                padding: const EdgeInsets.fromLTRB(15, 16, 12, 14),
                decoration: BoxDecoration(
                  color: widget.active
                      ? R.sheet
                      : _hover
                          ? R.sheet.withValues(alpha: 0.55)
                          : Colors.transparent,
                  border: Border(
                    left: BorderSide(color: color, width: 2),
                    bottom: const BorderSide(color: R.rule),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    header,
                    if (narrow) ...[
                      const SizedBox(height: 4),
                      Padding(
                        padding: const EdgeInsets.only(left: 1),
                        child: Text(
                          f.location,
                          style: R.sans(size: 11, color: R.faint, height: 1.4),
                        ),
                      ),
                    ],
                    const SizedBox(height: 8),
                    Text(
                      label,
                      style: R.sans(
                        size: 10.5,
                        weight: FontWeight.w500,
                        color: R.faint,
                        letterSpacing: 1.4,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      f.consequence,
                      style: R.sans(size: 13.5, color: R.ink2, height: 1.75),
                    ),
                    AnimatedSize(
                      duration: const Duration(milliseconds: 180),
                      alignment: Alignment.topCenter,
                      child: widget.expanded
                          ? _FindingDetail(finding: f, onLocate: widget.onLocate, onCopy: widget.onCopy)
                          : const SizedBox(width: double.infinity),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
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
      margin: const EdgeInsets.only(top: 12),
      padding: const EdgeInsets.only(top: 12),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(color: color.withValues(alpha: 0.28)),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (f.quote.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.only(left: 11),
              margin: const EdgeInsets.only(bottom: 13),
              decoration: BoxDecoration(
                border: Border(left: BorderSide(color: color.withValues(alpha: 0.45), width: 2)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '原文',
                    style: R.sans(size: 10.5, color: R.faint, letterSpacing: 1.4, height: 1.4),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    f.quote,
                    style: R.serif(size: 13, weight: FontWeight.w400, color: R.ink2, height: 1.85),
                  ),
                ],
              ),
            ),
          ],
          if (f.basis != null) ...[
            Text(
              '法律依据',
              style: R.sans(size: 10.5, color: R.faint, letterSpacing: 1.4, height: 1.4),
            ),
            const SizedBox(height: 3),
            Text(
              '${f.basis!.law} ${f.basis!.article == '需核对' ? '（条文序号需核对）' : f.basis!.article}',
              style: R.sans(size: 12.5, weight: FontWeight.w600, color: R.ink, height: 1.55),
            ),
            const SizedBox(height: 3),
            Text(
              f.basis!.text,
              style: R.sans(size: 11.5, color: R.muted, height: 1.75),
            ),
            const SizedBox(height: 12),
          ],
          if (f.ask.isNotEmpty)
            _AdviceRow(
              label: '问谁 · 问什么',
              text: f.ask,
              onCopy: () => onCopy(f.ask, '这句话'),
            ),
          if (f.counter.isNotEmpty) ...[
            const SizedBox(height: 10),
            _AdviceRow(
              label: '可以怎么改',
              text: f.counter,
              onCopy: () => onCopy(f.counter, '这句话'),
            ),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              InkWell(
                onTap: onLocate,
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 3),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.location_on_outlined, size: 13, color: R.pine),
                      const SizedBox(width: 4),
                      Text(
                        '在原文中定位',
                        style: R.sans(size: 11.5, weight: FontWeight.w500, color: R.pine, height: 1.4),
                      ),
                    ],
                  ),
                ),
              ),
              const Spacer(),
              Text(
                '把握：${f.confidence}',
                style: R.sans(size: 11, color: R.faint, height: 1.4),
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
  });

  final String label;
  final String text;
  final VoidCallback onCopy;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: R.sans(size: 10.5, color: R.faint, letterSpacing: 1.4, height: 1.4),
              ),
              const SizedBox(height: 3),
              Text(
                text,
                style: R.sans(size: 12.5, color: R.ink2, height: 1.7),
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        Tooltip(
          message: '复制这句话',
          child: InkWell(
            onTap: onCopy,
            borderRadius: BorderRadius.circular(3),
            child: Container(
              margin: const EdgeInsets.only(top: 12),
              width: 26,
              height: 26,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: R.sheet2,
                border: Border.all(color: R.rule),
                borderRadius: BorderRadius.circular(3),
              ),
              child: const Icon(Icons.copy_outlined, size: 12, color: R.muted),
            ),
          ),
        ),
      ],
    );
  }
}

class _PendingBlock extends StatelessWidget {
  const _PendingBlock({required this.items});

  final List<String> items;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 24),
      padding: const EdgeInsets.fromLTRB(16, 16, 18, 16),
      decoration: BoxDecoration(
        color: R.sheet,
        border: Border(
          top: const BorderSide(color: R.rule),
          right: const BorderSide(color: R.rule),
          bottom: const BorderSide(color: R.rule),
          left: BorderSide(color: R.gold, width: 3),
        ),
        boxShadow: R.shadowSheet,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                '还要确认 ${items.length} 件事',
                style: R.serif(size: 15.5, weight: FontWeight.w600, letterSpacing: 0.2, height: 1.5),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            '这些信息没有出现在你提供的文本里，不能替你判断。',
            style: R.sans(size: 11.5, color: R.muted, height: 1.7),
          ),
          const SizedBox(height: 12),
          for (var i = 0; i < items.length; i++)
            Padding(
              padding: EdgeInsets.only(bottom: i == items.length - 1 ? 0 : 9),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 22,
                    child: Text(
                      '${i + 1}'.padLeft(2, '0'),
                      style: R.num(size: 11, weight: FontWeight.w500, color: R.faint, height: 1.5),
                    ),
                  ),
                  Expanded(
                    child: Text(
                      items[i],
                      style: R.sans(size: 12.5, color: R.ink2, height: 1.65),
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

extension on Color {
  Color blend(Color background) => Color.alphaBlend(this, background);
}