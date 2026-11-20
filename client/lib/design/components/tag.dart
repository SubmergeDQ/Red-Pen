import 'package:material_ui/material_ui.dart';

import '../tokens.dart';

enum AppTone { neutral, brand, accent, red, amber, slate, green }

/// 胶囊标签：状态、类型和计数都用同一种几何。
class AppTag extends StatelessWidget {
  const AppTag({
    super.key,
    required this.label,
    this.tone = AppTone.neutral,
    this.dot = false,
    this.compact = false,
  });

  final String label;
  final AppTone tone;
  final bool dot;
  final bool compact;

  static (Color, Color, Color) colorsOf(AppTone tone) => switch (tone) {
        AppTone.neutral => (AppColors.surfaceSunken, AppColors.inkSecondary, AppColors.border),
        AppTone.brand => (AppColors.brandSoft, AppColors.brand, AppColors.brandBorder),
        AppTone.accent => (AppColors.accentSoft, AppColors.accentPressed, AppColors.accentBorder),
        AppTone.red => (AppColors.redSoft, AppColors.redInk, AppColors.redBorder),
        AppTone.amber => (AppColors.amberSoft, AppColors.amberInk, AppColors.amberBorder),
        AppTone.slate => (AppColors.slateSoft, AppColors.slateInk, AppColors.slateBorder),
        AppTone.green => (AppColors.greenSoft, AppColors.greenInk, AppColors.greenBorder),
      };

  @override
  Widget build(BuildContext context) {
    final (bg, fg, border) = colorsOf(tone);
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 7 : 9,
        vertical: compact ? 2 : 3.5,
      ),
      decoration: BoxDecoration(
        color: bg,
        border: Border.all(color: border),
        borderRadius: BorderRadius.circular(AppRadius.pill),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (dot) ...[
            Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(color: fg, shape: BoxShape.circle),
            ),
            const SizedBox(width: 5),
          ],
          Text(
            label,
            style: AppType.label(color: fg).copyWith(
              fontSize: compact ? 10.5 : 11.5,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }
}

/// 品牌口号胶囊：「签约前」与「5 分钟」横向并排，双端共用。
///
/// 两段文字各自成块，避免在窄屏被拆成两行；「5 分钟」用强调色强调时间。
class SignBadge extends StatelessWidget {
  const SignBadge({super.key});

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: '签约前 5 分钟',
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
        decoration: BoxDecoration(
          color: AppColors.accentSoft,
          border: Border.all(color: AppColors.accentBorder),
          borderRadius: BorderRadius.circular(AppRadius.pill),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 6,
              height: 6,
              decoration: const BoxDecoration(
                color: AppColors.accent,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 6),
            Text(
              '签约前',
              maxLines: 1,
              softWrap: false,
              style: AppType.label(color: AppColors.inkSecondary).copyWith(letterSpacing: 0.2),
            ),
            const SizedBox(width: 5),
            Text(
              '5 分钟',
              maxLines: 1,
              softWrap: false,
              style: AppType.label(color: AppColors.accent).copyWith(
                fontSize: 12,
                letterSpacing: 0.2,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// 计数徽标，用于导航与筛选。
class CountBadge extends StatelessWidget {
  const CountBadge({super.key, required this.count, this.tone = AppTone.accent});

  final int count;
  final AppTone tone;

  @override
  Widget build(BuildContext context) {
    final (bg, fg, _) = AppTag.colorsOf(tone);
    return Container(
      constraints: const BoxConstraints(minWidth: 18),
      height: 18,
      padding: const EdgeInsets.symmetric(horizontal: 5),
      alignment: Alignment.center,
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(9)),
      child: Text(
        '$count',
        style: AppType.label(color: fg).copyWith(fontSize: 10.5, letterSpacing: 0),
      ),
    );
  }
}
