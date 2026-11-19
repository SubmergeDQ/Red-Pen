import 'package:material_ui/material_ui.dart';

/// 红笔 · 审阅桌 — clean paper, ink, pine and vermilion.
///
/// Every colour, shadow and icon metric lives here so pages never hard-code
/// values. The four verdict colours keep their meaning: red blocks the
/// signature, amber costs money, slate needs facts, green is standard.
abstract final class R {
  // Paper and ink.
  static const desk = Color(0xFFF3F1EB);
  static const desk2 = Color(0xFFECE9E1);
  static const sheet = Color(0xFFFFFFFF);
  static const sheet2 = Color(0xFFF7F5F0);
  static const ink = Color(0xFF191C19);
  static const ink2 = Color(0xFF363C35);
  static const muted = Color(0xFF565C52);
  static const faint = Color(0xFF6E746A);
  static const prose = Color(0xFF2B3026);

  // Rules and borders.
  static const rule = Color(0xFFE3DFD5);
  static const rule2 = Color(0xFFEFECE5);
  static const ruleStrong = Color(0xFFCBC5B7);
  static const focusBorder = Color(0xFFA6A091);

  // Brand.
  static const pine = Color(0xFF123A2D);
  static const pine2 = Color(0xFF1B5140);
  static const pineSoft = Color(0xFFE3EDE7);
  static const cream = Color(0xFFF7F3E7);
  static const gold = Color(0xFFB08D57);

  // Verdicts.
  static const vermilion = Color(0xFFC0392B);
  static const vermilion2 = Color(0xFF9B2C20);
  static const vermilionSoft = Color(0xFFFBEAE6);
  static const amber = Color(0xFF9E6407);
  static const amberSoft = Color(0xFFFBF0D9);
  static const slate = Color(0xFF56676E);
  static const slateSoft = Color(0xFFE9EFF1);
  static const moss = Color(0xFF1B7845);
  static const mossSoft = Color(0xFFE2F0E7);

  // Soft borders and text inks for notices.
  static const vermilionBorder = Color(0xFFEFCFC7);
  static const vermilionInk = Color(0xFF7A261B);
  static const amberBorder = Color(0xFFEBD8AE);
  static const amberInk = Color(0xFF6B4708);
  static const mossBorder = Color(0xFFC6DCCE);
  static const mossInk = Color(0xFF1D4B32);
  static const pineBorder = Color(0xFFC9DCD1);
  static const pineInk = Color(0xFF1B4030);

  // Overlays.
  static const barrier = Color(0x66191C19);
  static const topBarEdge = Color(0x26101B16);
  static const focusRing = Color(0x1A1B5140);
  static const linkUnderline = Color(0x4D8FA89A);

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
    BoxShadow(color: Color(0x0F1A1F1C), offset: Offset(0, 1), blurRadius: 2),
    BoxShadow(color: Color(0x241A1F1C), offset: Offset(0, 14), blurRadius: 32, spreadRadius: -24),
  ];

  static const shadowFloat = [
    BoxShadow(color: Color(0x59101B16), offset: Offset(0, 22), blurRadius: 56, spreadRadius: -20),
  ];

  static const shadowButton = [
    BoxShadow(color: Color(0x14101B16), offset: Offset(0, 1), blurRadius: 2),
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
        selectionColor: Color(0x2BC0392B),
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
        thumbColor: WidgetStateProperty.all(const Color(0x667E857B)),
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

/// Icon metrics. Every icon in the app takes one of these sizes and is laid out
/// on the line box of the text it belongs to, so glyph differences never shift
/// the baseline.
abstract final class RI {
  /// Inline metadata next to 11–12px copy.
  static const double dense = 12;

  /// Default inline icon next to body copy.
  static const double inline = 14;

  /// Buttons, filters and compact controls.
  static const double control = 16;

  /// Leading icon of a list row or menu entry.
  static const double leading = 18;

  /// Empty state and hero marks.
  static const double display = 20;

  /// Gap between an icon and its label inside dense metadata lines.
  static const double gapDense = 6;

  /// Gap between an icon and its label in buttons and rows.
  static const double gap = 8;
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
