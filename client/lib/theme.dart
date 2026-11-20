import 'package:material_ui/material_ui.dart';

/// 红笔 · 审阅桌 — warm paper, ink and a deep ink-blue chrome.
///
/// The palette deliberately avoids a red/green pairing: the chrome is ink blue,
/// the only decorative accent is amber, and the four verdict colours are muted
/// so they read as ink annotations instead of traffic lights.
abstract final class R {
  // Paper and ink.
  static const desk = Color(0xFFF4F3EF);
  static const desk2 = Color(0xFFEDEBE6);
  static const sheet = Color(0xFFFFFFFF);
  static const sheet2 = Color(0xFFF7F6F2);
  static const ink = Color(0xFF1A1D22);
  static const ink2 = Color(0xFF3A3F47);
  static const muted = Color(0xFF5C6268);
  static const faint = Color(0xFF6E747B);
  static const prose = Color(0xFF2A2E34);

  // Rules and borders.
  static const rule = Color(0xFFE2E0DA);
  static const rule2 = Color(0xFFEFEDE8);
  static const ruleStrong = Color(0xFFC9C6BE);
  static const focusBorder = Color(0xFFA9A59B);

  // Brand chrome: ink blue.
  static const brand = Color(0xFF1F3243);
  static const brand2 = Color(0xFF2B4459);
  static const brandSoft = Color(0xFFE8EDF1);
  static const cream = Color(0xFFF5F2EA);
  static const accent = Color(0xFFB07A3C);
  static const accentSoft = Color(0xFFF6EDDF);
  static const gold = Color(0xFFB08D57);

  // Verdicts: brick, ochre, slate, sage. No pure red/green pair.
  static const vermilion = Color(0xFFA8443A);
  static const vermilion2 = Color(0xFF8C372E);
  static const vermilionSoft = Color(0xFFF8E8E4);
  static const amber = Color(0xFF9C6A14);
  static const amberSoft = Color(0xFFFAF0DA);
  static const slate = Color(0xFF5B6B76);
  static const slateSoft = Color(0xFFE9EEF1);
  static const moss = Color(0xFF5F7A63);
  static const mossSoft = Color(0xFFECF1EC);

  // Soft borders and text inks for notices.
  static const vermilionBorder = Color(0xFFEBCFC9);
  static const vermilionInk = Color(0xFF6F2A22);
  static const amberBorder = Color(0xFFE8D8B4);
  static const amberInk = Color(0xFF5E410C);
  static const mossBorder = Color(0xFFCBD9CD);
  static const mossInk = Color(0xFF33452F);
  static const brandBorder = Color(0xFFC8D3DB);
  static const brandInk = Color(0xFF1E3345);

  // Overlays.
  static const barrier = Color(0x66181B20);
  static const topBarEdge = Color(0x26131A21);
  static const focusRing = Color(0x1A1F3243);
  static const linkUnderline = Color(0x4D8FA0AE);

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
    BoxShadow(color: Color(0x0F1A1D22), offset: Offset(0, 1), blurRadius: 2),
    BoxShadow(color: Color(0x241A1D22), offset: Offset(0, 14), blurRadius: 32, spreadRadius: -24),
  ];

  static const shadowFloat = [
    BoxShadow(color: Color(0x59131A21), offset: Offset(0, 22), blurRadius: 56, spreadRadius: -20),
  ];

  static const shadowButton = [
    BoxShadow(color: Color(0x14131A21), offset: Offset(0, 1), blurRadius: 2),
  ];

  static ThemeData theme() {
    final scheme = ColorScheme.fromSeed(
      seedColor: brand,
      brightness: Brightness.light,
    ).copyWith(
      primary: brand,
      onPrimary: cream,
      secondary: accent,
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
        cursorColor: accent,
        selectionColor: Color(0x2BB07A3C),
        selectionHandleColor: accent,
      ),
      tooltipTheme: TooltipThemeData(
        decoration: BoxDecoration(
          color: brand,
          borderRadius: BorderRadius.circular(4),
        ),
        textStyle: sans(size: 11.5, color: cream, height: 1.4),
        waitDuration: const Duration(milliseconds: 500),
      ),
      scrollbarTheme: ScrollbarThemeData(
        thickness: WidgetStateProperty.all(6),
        radius: const Radius.circular(3),
        thumbColor: WidgetStateProperty.all(const Color(0x667A8088)),
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: brand,
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
}
