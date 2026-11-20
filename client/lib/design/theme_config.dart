import 'package:material_ui/material_ui.dart';

import 'tokens.dart';

/// 主题的全局配置。
///
/// 当前版本使用默认的编译期配置；后续切肤（深色、品牌换色、紧凑密度）只需
/// 传入新的 [AppThemeConfig]，Material 控件、滚动条、进度条与提示会一起跟随。
/// 自定义原子组件读取 [AppColors] 的默认值，迁移到 [AppThemeTokens] 是 1.2 的
/// 主题扩展位，接口已经预留。
@immutable
class AppThemeConfig {
  const AppThemeConfig({
    this.brand = AppColors.brand,
    this.accent = AppColors.accent,
    this.canvas = AppColors.canvas,
    this.surface = AppColors.surface,
    this.visualDensity = VisualDensity.standard,
  });

  final Color brand;
  final Color accent;
  final Color canvas;
  final Color surface;
  final VisualDensity visualDensity;

  AppThemeConfig copyWith({
    Color? brand,
    Color? accent,
    Color? canvas,
    Color? surface,
    VisualDensity? visualDensity,
  }) {
    return AppThemeConfig(
      brand: brand ?? this.brand,
      accent: accent ?? this.accent,
      canvas: canvas ?? this.canvas,
      surface: surface ?? this.surface,
      visualDensity: visualDensity ?? this.visualDensity,
    );
  }
}

/// 主题令牌扩展，供后续页面和插件读取当前主题配置。
class AppThemeTokens extends ThemeExtension<AppThemeTokens> {
  const AppThemeTokens(this.config);

  final AppThemeConfig config;

  @override
  AppThemeTokens copyWith({AppThemeConfig? config}) =>
      AppThemeTokens(config ?? this.config);

  @override
  AppThemeTokens lerp(ThemeExtension<AppThemeTokens>? other, double t) {
    if (other is! AppThemeTokens) return this;
    return AppThemeTokens(
      AppThemeConfig(
        brand: Color.lerp(config.brand, other.config.brand, t)!,
        accent: Color.lerp(config.accent, other.config.accent, t)!,
        canvas: Color.lerp(config.canvas, other.config.canvas, t)!,
        surface: Color.lerp(config.surface, other.config.surface, t)!,
        visualDensity: t < 0.5 ? config.visualDensity : other.config.visualDensity,
      ),
    );
  }
}
