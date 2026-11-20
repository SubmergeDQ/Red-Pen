import 'package:material_ui/material_ui.dart';

import '../tokens.dart';
import '../icons.dart';

/// 轻提示：不拦截点击，用于“已复制”“已跳过”这类短反馈。
class AppToast extends StatelessWidget {
  const AppToast({super.key, required this.message, this.icon = AppIcons.checkCircle});

  final String message;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      liveRegion: true,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 380),
        padding: const EdgeInsets.fromLTRB(AppSpace.x3, AppSpace.x2 + 2, AppSpace.x4, AppSpace.x2 + 2),
        decoration: BoxDecoration(
          color: AppColors.ink,
          borderRadius: BorderRadius.circular(AppRadius.md),
          boxShadow: AppShadow.raised,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 17, color: AppColors.onBrand),
            const SizedBox(width: AppSpace.x2),
            Flexible(
              child: Text(
                message,
                style: AppType.bodySm(color: AppColors.onBrand).copyWith(fontSize: 12.5),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// 细进度条，统一高度与圆角。
class AppProgressBar extends StatelessWidget {
  const AppProgressBar({super.key, this.value, this.height = 4});

  final double? value;
  final double height;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(height / 2),
      child: LinearProgressIndicator(
        value: value,
        minHeight: height,
        backgroundColor: AppColors.surfaceSunken,
        color: AppColors.accent,
      ),
    );
  }
}

/// 加载点：三个呼吸圆点，替代转圈，降低视觉噪音。
class PulseDots extends StatefulWidget {
  const PulseDots({super.key, this.color = AppColors.accent, this.size = 5});

  final Color color;
  final double size;

  @override
  State<PulseDots> createState() => _PulseDotsState();
}

class _PulseDotsState extends State<PulseDots> with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1100),
  )..repeat();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (var i = 0; i < 3; i++) ...[
              if (i > 0) SizedBox(width: widget.size * 1.2),
              Opacity(
                opacity: 0.25 + 0.75 * _level(i),
                child: Container(
                  width: widget.size,
                  height: widget.size,
                  decoration: BoxDecoration(color: widget.color, shape: BoxShape.circle),
                ),
              ),
            ],
          ],
        );
      },
    );
  }

  double _level(int index) {
    final t = (_controller.value + index * 0.18) % 1.0;
    return t < 0.5 ? t * 2 : (1 - t) * 2;
  }
}
