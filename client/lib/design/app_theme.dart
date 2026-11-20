import 'package:material_ui/material_ui.dart';

import 'theme_config.dart';
import 'tokens.dart';

/// 应用主题。组件库之外的 Material 控件（输入框、菜单、弹窗、滚动条）
/// 也通过这里保持一致，页面不再各自覆写。
ThemeData buildAppTheme({AppThemeConfig config = const AppThemeConfig()}) {
  final scheme = ColorScheme.fromSeed(
    seedColor: config.brand,
    brightness: Brightness.light,
  ).copyWith(
    primary: config.brand,
    onPrimary: AppColors.onBrand,
    secondary: config.accent,
    onSecondary: Colors.white,
    surface: config.surface,
    onSurface: AppColors.ink,
    surfaceContainerHighest: AppColors.surfaceMuted,
    error: AppColors.danger,
    onError: Colors.white,
    outline: AppColors.borderStrong,
    outlineVariant: AppColors.border,
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: config.canvas,
    canvasColor: config.surface,
    fontFamily: AppType.family,
    fontFamilyFallback: AppType.fallback,
    splashFactory: InkRipple.splashFactory,
    visualDensity: config.visualDensity,
    extensions: [AppThemeTokens(config)],
    dividerTheme: const DividerThemeData(
      color: AppColors.border,
      thickness: 1,
      space: 1,
    ),
    textSelectionTheme: const TextSelectionThemeData(
      cursorColor: AppColors.accent,
      selectionColor: AppColors.accentSoft,
      selectionHandleColor: AppColors.accent,
    ),
    iconTheme: const IconThemeData(size: 20, color: AppColors.inkSecondary),
    tooltipTheme: TooltipThemeData(
      decoration: BoxDecoration(
        color: AppColors.ink,
        borderRadius: BorderRadius.circular(AppRadius.sm),
      ),
      textStyle: AppType.caption(color: Colors.white),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      waitDuration: const Duration(milliseconds: 450),
    ),
    scrollbarTheme: ScrollbarThemeData(
      thickness: WidgetStateProperty.all(8),
      radius: const Radius.circular(4),
      thumbColor: WidgetStateProperty.resolveWith(
        (states) => states.contains(WidgetState.hovered)
            ? const Color(0x809AA7B4)
            : const Color(0x4D9AA7B4),
      ),
    ),
    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      backgroundColor: AppColors.ink,
      contentTextStyle: AppType.bodySm(color: Colors.white),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
      insetPadding: const EdgeInsets.all(AppSpace.x5),
      elevation: 6,
    ),
    dialogTheme: DialogThemeData(
      backgroundColor: AppColors.surface,
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.xl)),
    ),
    bottomSheetTheme: const BottomSheetThemeData(
      backgroundColor: AppColors.surface,
      modalBackgroundColor: AppColors.surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
    ),
    popupMenuTheme: PopupMenuThemeData(
      color: AppColors.surface,
      elevation: 12,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        side: const BorderSide(color: AppColors.border),
      ),
      textStyle: AppType.bodySm(color: AppColors.ink),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.accent,
        textStyle: AppType.strong(color: AppColors.accent, size: 13.5),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.sm)),
      ),
    ),
    progressIndicatorTheme: const ProgressIndicatorThemeData(
      color: AppColors.accent,
      linearTrackColor: AppColors.surfaceSunken,
    ),
  );
}
