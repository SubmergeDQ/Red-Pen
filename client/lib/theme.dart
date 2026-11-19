import 'package:material_ui/material_ui.dart';

/// 红笔 · 审阅桌 — warm paper, ink, pine and vermilion.
abstract final class R {
  static const desk = Color(0xFFF2EEE2);
  static const desk2 = Color(0xFFEBE5D4);
  static const sheet = Color(0xFFFEFCF5);
  static const sheet2 = Color(0xFFF9F5EA);
  static const ink = Color(0xFF1D201A);
  static const ink2 = Color(0xFF3B4137);
  static const muted = Color(0xFF63635A);
  static const faint = Color(0xFF85836F);
  static const rule = Color(0xFFDED6C1);
  static const rule2 = Color(0xFFEDE7D8);
  static const ruleStrong = Color(0xFFC6BCA3);
  static const pine = Color(0xFF17352B);
  static const pine2 = Color(0xFF214C3E);
  static const pineSoft = Color(0xFFE4EBE2);
  static const cream = Color(0xFFF4EFDF);
  static const vermilion = Color(0xFFAE3A2B);
  static const vermilion2 = Color(0xFF8E2B1E);
  static const vermilionSoft = Color(0xFFF3E0D8);
  static const amber = Color(0xFF87600F);
  static const amberSoft = Color(0xFFF2E6CC);
  static const slate = Color(0xFF4E5A61);
  static const slateSoft = Color(0xFFE8EAE3);
  static const moss = Color(0xFF3C6348);
  static const mossSoft = Color(0xFFE6EDE0);
  static const gold = Color(0xFFB5975B);

  static const serifFamily = 'RedPenSerifA';
  static const serifFallback = [
    'RedPenSerifB',
    'Noto Serif SC',
    'Source Han Serif SC',
    'Songti SC',
    'STSong',
    'SimSun',
    'serif',
  ];
  static const sansFamily = 'Noto Sans SC';
  static const sansFallback = [
    'Noto Sans CJK SC',
    'PingFang SC',
    'Microsoft YaHei',
    'Hiragino Sans GB',
    'Microsoft YaHei UI',
  ];

  static TextStyle serif({
    double size = 16,
    FontWeight weight = FontWeight.w600,
    Color color = ink,
    double height = 1.6,
    double letterSpacing = 0,
  }) =>
      TextStyle(
        fontFamily: serifFamily,
        fontFamilyFallback: serifFallback,
        fontSize: size,
        fontWeight: weight,
        color: color,
        height: height,
        letterSpacing: letterSpacing,
      );

  static TextStyle sans({
    double size = 14,
    FontWeight weight = FontWeight.w400,
    Color color = ink,
    double height = 1.65,
    double letterSpacing = 0,
  }) =>
      TextStyle(
        fontFamily: sansFamily,
        fontFamilyFallback: sansFallback,
        fontSize: size,
        fontWeight: weight,
        color: color,
        height: height,
        letterSpacing: letterSpacing,
      );

  static TextStyle num({
    double size = 22,
    FontWeight weight = FontWeight.w600,
    Color color = ink,
    double height = 1.2,
  }) =>
      serif(
        size: size,
        weight: weight,
        color: color,
        height: height,
      ).copyWith(fontFeatures: const [FontFeature.tabularFigures()]);

  static const shadowSheet = [
    BoxShadow(color: Color(0x0D1D201A), offset: Offset(0, 1), blurRadius: 0),
    BoxShadow(color: Color(0x361D201A), offset: Offset(0, 18), blurRadius: 40, spreadRadius: -30),
  ];

  static const shadowFloat = [
    BoxShadow(color: Color(0x6617352B), offset: Offset(0, 24), blurRadius: 60, spreadRadius: -22),
  ];

  static ThemeData theme() {
    final scheme = ColorScheme.fromSeed(
      seedColor: pine,
      brightness: Brightness.light,
    ).copyWith(
      primary: pine,
      onPrimary: cream,
      secondary: vermilion,
      onSecondary: Colors.white,
      surface: sheet,
      onSurface: ink,
      error: vermilion,
      onError: Colors.white,
      outline: ruleStrong,
      outlineVariant: rule,
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: desk,
      canvasColor: sheet,
      fontFamily: sansFamily,
      fontFamilyFallback: sansFallback,
      splashFactory: InkRipple.splashFactory,
      textSelectionTheme: const TextSelectionThemeData(
        cursorColor: vermilion,
        selectionColor: Color(0x33AE3A2B),
        selectionHandleColor: vermilion,
      ),
      tooltipTheme: TooltipThemeData(
        decoration: BoxDecoration(
          color: pine,
          borderRadius: BorderRadius.circular(4),
        ),
        textStyle: sans(size: 11.5, color: cream, height: 1.4),
        waitDuration: const Duration(milliseconds: 500),
      ),
      scrollbarTheme: ScrollbarThemeData(
        thickness: WidgetStateProperty.all(6),
        radius: const Radius.circular(3),
        thumbColor: WidgetStateProperty.all(const Color(0x66C6BCA3)),
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: pine,
        contentTextStyle: sans(size: 13, color: cream),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
        insetPadding: const EdgeInsets.all(20),
      ),
    );
  }
}

extension InkPalette on BuildContext {
  bool get isNarrow => MediaQuery.sizeOf(this).width < 760;
  bool get isWide => MediaQuery.sizeOf(this).width >= 1000;

  void showNotice(String message) {
    ScaffoldMessenger.of(this)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(message),
          width: isNarrow ? null : 420,
          duration: const Duration(seconds: 2),
        ),
      );
  }
}