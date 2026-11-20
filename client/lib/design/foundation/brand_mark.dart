import 'package:material_ui/material_ui.dart';

import '../tokens.dart';

/// 新应用图标。资源由 `assets/brand/app-icon.png` 提供，
/// 与各平台启动图标同源，界面内不再手绘印章。
class BrandMark extends StatelessWidget {
  const BrandMark({super.key, this.size = 32});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: '红笔',
      image: true,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(size * 0.23),
        child: Image.asset(
          'assets/brand/app-icon.png',
          width: size,
          height: size,
          filterQuality: FilterQuality.high,
          gaplessPlayback: true,
        ),
      ),
    );
  }
}

/// 图标占位块：统一底色、圆角与对齐，用于空状态和设置项。
class IconTile extends StatelessWidget {
  const IconTile({
    super.key,
    required this.icon,
    this.size = 40,
    this.tone = IconTileTone.brand,
  });

  final IconData icon;
  final double size;
  final IconTileTone tone;

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = switch (tone) {
      IconTileTone.brand => (AppColors.brandSoft, AppColors.brand),
      IconTileTone.accent => (AppColors.accentSoft, AppColors.accent),
      IconTileTone.neutral => (AppColors.surfaceMuted, AppColors.inkSecondary),
    };
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(size * 0.28),
      ),
      alignment: Alignment.center,
      child: Icon(icon, size: size * 0.45, color: fg),
    );
  }
}

enum IconTileTone { brand, accent, neutral }
