import 'package:material_ui/material_ui.dart';

import '../tokens.dart';
import 'brand_mark.dart';

/// 品牌标识：新应用图标 + 文字标。
class BrandLockup extends StatelessWidget {
  const BrandLockup({
    super.key,
    this.markSize = 30,
    this.showSubtitle = false,
    this.onDark = false,
  });

  final double markSize;
  final bool showSubtitle;
  final bool onDark;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        BrandMark(size: markSize),
        const SizedBox(width: AppSpace.x2 + 2),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '红笔',
              style: AppType.h3(
                color: onDark ? AppColors.onBrand : AppColors.ink,
              ).copyWith(letterSpacing: 1.2, fontWeight: FontWeight.w700),
            ),
            if (showSubtitle) ...[
              const SizedBox(height: 1),
              Text(
                '签约审阅台',
                style: AppType.caption(
                  color: onDark ? AppColors.onBrand.withValues(alpha: 0.65) : AppColors.inkTertiary,
                ).copyWith(letterSpacing: 1.4),
              ),
            ],
          ],
        ),
      ],
    );
  }
}
