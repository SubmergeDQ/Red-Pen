import 'package:material_ui/material_ui.dart';

import '../design/design.dart';
import '../engine/engine.dart';
import '../state/review_controller.dart';

class AnalyzingPage extends StatefulWidget {
  const AnalyzingPage({super.key, required this.controller});

  final ReviewController controller;

  @override
  State<AnalyzingPage> createState() => _AnalyzingPageState();
}

class _AnalyzingPageState extends State<AnalyzingPage> with SingleTickerProviderStateMixin {
  late final AnimationController _pulse = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1500),
  )..repeat(reverse: true);

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
    final progress = done ? 1.0 : (step + 0.55) / 4;

    return Container(
      color: AppColors.canvas,
      child: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: AppSpace.x5, vertical: AppSpace.x10),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 560),
            child: AppCard(
              padding: const EdgeInsets.fromLTRB(AppSpace.x8, AppSpace.x8, AppSpace.x8, AppSpace.x6),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      _ProgressRing(progress: progress, pulse: _pulse),
                      const SizedBox(width: AppSpace.x5),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('正在核对这份协议', style: AppType.h2()),
                            const SizedBox(height: 3),
                            Text('规则在本机运行，不调用外部服务', style: AppType.caption()),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpace.x6),
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
                      last: i == _stages.length - 1,
                    ),
                  const SizedBox(height: AppSpace.x5),
                  AppBanner(
                    tone: AppTone.brand,
                    icon: AppIcons.lock,
                    message: '文本不会离开这台设备；核对结束后也不保存。',
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ProgressRing extends StatelessWidget {
  const _ProgressRing({required this.progress, required this.pulse});

  final double progress;
  final Animation<double> pulse;

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: progress),
      duration: AppDuration.slow,
      curve: AppDuration.curve,
      builder: (context, value, _) {
        return AnimatedBuilder(
          animation: pulse,
          builder: (context, _) => SizedBox(
            width: 84,
            height: 84,
            child: Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(
                  width: 84,
                  height: 84,
                  child: CircularProgressIndicator(
                    value: value,
                    strokeWidth: 6,
                    strokeCap: StrokeCap.round,
                    backgroundColor: AppColors.surfaceSunken,
                    color: AppColors.accent,
                  ),
                ),
                Container(
                  width: 58,
                  height: 58,
                  decoration: BoxDecoration(
                    color: AppColors.surfaceMuted,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppColors.accent.withValues(alpha: 0.18 + 0.12 * pulse.value),
                    ),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    '${(value * 100).round()}%',
                    style: AppType.num(size: 17),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

enum _StageState { done, active, pending }

class _StageRow extends StatelessWidget {
  const _StageRow({
    required this.title,
    required this.note,
    required this.state,
    required this.last,
  });

  final String title;
  final String note;
  final _StageState state;
  final bool last;

  @override
  Widget build(BuildContext context) {
    final active = state == _StageState.active;
    final done = state == _StageState.done;
    return AnimatedOpacity(
      duration: AppDuration.base,
      opacity: state == _StageState.pending ? 0.45 : 1,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: AppSpace.x2 + 2),
        decoration: BoxDecoration(
          border: last ? null : const Border(bottom: BorderSide(color: AppColors.borderSoft)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 20,
              height: 20,
              margin: const EdgeInsets.only(top: 1),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: done
                    ? AppColors.green
                    : active
                        ? AppColors.accent
                        : AppColors.surface,
                border: Border.all(
                  color: done
                      ? AppColors.green
                      : active
                          ? AppColors.accent
                          : AppColors.borderStrong,
                ),
              ),
              child: done
                  ? const Icon(AppIcons.check, size: 12, color: Colors.white)
                  : active
                      ? const PulseDots(color: Colors.white, size: 3)
                      : null,
            ),
            const SizedBox(width: AppSpace.x3),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppType.strong(
                      color: state == _StageState.pending ? AppColors.inkTertiary : AppColors.ink,
                      size: 13.5,
                    ),
                  ),
                  const SizedBox(height: 1),
                  Text(
                    note,
                    style: AppType.caption(
                      color: active ? AppColors.accent : AppColors.inkTertiary,
                    ),
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
