import 'package:material_ui/material_ui.dart';

import '../engine/engine.dart';
import '../state/review_controller.dart';
import '../theme.dart';
import '../ui/common.dart';

class AnalyzingPage extends StatefulWidget {
  const AnalyzingPage({super.key, required this.controller});

  final ReviewController controller;

  @override
  State<AnalyzingPage> createState() => _AnalyzingPageState();
}

class _AnalyzingPageState extends State<AnalyzingPage> with SingleTickerProviderStateMixin {
  late final AnimationController _pulse = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1600),
  )..repeat();

  static const _stages = [
    ('拆解条款', '正在分段'),
    ('识别文件类型', '正在判断'),
    ('逐条核对规则', '正在扫描'),
    ('整理提问与改法', '正在生成'),
  ];

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.controller;
    final step = c.analyzingStep.clamp(0, 3);
    final done = c.analysis != null;

    return Container(
      color: R.desk,
      child: CustomScrollView(
        slivers: [
          SliverFillRemaining(
            hasScrollBody: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 520),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: [
                          SizedBox(
                            width: 50,
                            height: 50,
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                AnimatedBuilder(
                                  animation: _pulse,
                                  builder: (context, child) {
                                    final t = Curves.easeOut.transform(_pulse.value);
                                    return Container(
                                      width: 38 + 12 * t,
                                      height: 38 + 12 * t,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: R.brand.withValues(alpha: 0.22 * (1 - t)),
                                        ),
                                      ),
                                    );
                                  },
                                ),
                                Container(
                                  width: 38,
                                  height: 38,
                                  decoration: BoxDecoration(
                                    color: R.sheet,
                                    shape: BoxShape.circle,
                                    border: Border.all(color: R.ruleStrong),
                                  ),
                                  child: const Icon(Icons.description_outlined, size: 17, color: R.brand),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '正在核对这份协议',
                                  style: R.serif(size: 21, weight: FontWeight.w600, height: 1.4, letterSpacing: 0.2),
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  '规则在本机运行，不调用外部服务',
                                  style: R.sans(size: 12, color: R.muted, height: 1.5),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 28),
                      Container(
                        decoration: const BoxDecoration(
                          border: Border(top: BorderSide(color: R.ruleStrong)),
                        ),
                        child: Column(
                          children: [
                            for (var i = 0; i < _stages.length; i++)
                              _StageRow(
                                title: i == 2 ? '逐条核对 ${ruleLibrary.length} 类规则' : _stages[i].$1,
                                note: done
                                    ? '完成'
                                    : i < step
                                        ? '完成'
                                        : i == step
                                            ? _stages[i].$2
                                            : '等待',
                                state: done || i < step
                                    ? _StageState.done
                                    : i == step
                                        ? _StageState.active
                                        : _StageState.pending,
                              ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),
                      TweenAnimationBuilder<double>(
                        tween: Tween(begin: 0, end: done ? 1 : (step + 0.55) / 4),
                        duration: const Duration(milliseconds: 320),
                        curve: Curves.easeOut,
                        builder: (context, value, _) => ClipRRect(
                          borderRadius: BorderRadius.circular(2),
                          child: LinearProgressIndicator(
                            value: value,
                            minHeight: 3,
                            backgroundColor: R.rule,
                            color: R.accent,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          IconLabel(
                            icon: Icons.lock_outline,
                            label: '文本不会离开这台设备',
                            iconSize: RI.dense,
                            gap: RI.gapDense,
                            color: R.muted,
                            style: R.sans(size: 11.5, color: R.muted, height: 1.5),
                          ),
                        ],
                      ),
                    ],
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

enum _StageState { done, active, pending }

class _StageRow extends StatelessWidget {
  const _StageRow({required this.title, required this.note, required this.state});

  final String title;
  final String note;
  final _StageState state;

  @override
  Widget build(BuildContext context) {
    final active = state == _StageState.active;
    final done = state == _StageState.done;
    return AnimatedOpacity(
      duration: const Duration(milliseconds: 220),
      opacity: state == _StageState.pending ? 0.42 : 1,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 13, horizontal: 2),
        decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: R.rule)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 17,
              height: 17,
              margin: const EdgeInsets.only(top: 2),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: done
                    ? R.moss
                    : active
                        ? R.vermilion
                        : R.sheet,
                border: Border.all(
                  color: done
                      ? R.moss
                      : active
                          ? R.vermilion
                          : R.ruleStrong,
                ),
              ),
              child: done
                  ? const Icon(Icons.check, size: 11, color: R.cream)
                  : active
                      ? Container(
                          width: 5,
                          height: 5,
                          decoration: const BoxDecoration(color: R.cream, shape: BoxShape.circle),
                        )
                      : null,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: R.sans(
                      size: 13,
                      weight: active ? FontWeight.w600 : FontWeight.w500,
                      color: R.ink,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 1),
                  Text(
                    note,
                    style: R.sans(size: 11.5, color: R.muted, height: 1.5),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}