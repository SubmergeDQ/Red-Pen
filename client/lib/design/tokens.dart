import 'package:material_ui/material_ui.dart';

/// 红笔 1.1 设计令牌。
///
/// 所有颜色、间距、圆角、阴影和时长都从这里派生，页面与组件不写裸值。
/// 语义色只按角色命名（表面 / 文字 / 边界 / 状态），不按页面命名。
abstract final class AppColors {
  // 画布与表面
  static const canvas = Color(0xFFF2F4F7);
  static const canvasDeep = Color(0xFFE9EDF2);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceMuted = Color(0xFFF7F9FB);
  static const surfaceSunken = Color(0xFFEDF1F5);

  // 文字
  static const ink = Color(0xFF101820);
  static const inkSecondary = Color(0xFF475666);
  static const inkTertiary = Color(0xFF6B7A88);
  static const inkDisabled = Color(0xFF9AA7B4);

  // 边界与焦点
  static const border = Color(0xFFE3E8EE);
  static const borderSoft = Color(0xFFEDF1F5);
  static const borderStrong = Color(0xFFCBD4DD);
  static const focusRing = Color(0x33C04434);

  // 品牌
  static const brand = Color(0xFF1F3243);
  static const brandHover = Color(0xFF2A4358);
  static const brandPressed = Color(0xFF172634);
  static const brandSoft = Color(0xFFE9EFF4);
  static const brandBorder = Color(0xFFC9D6E0);
  static const onBrand = Color(0xFFF7FAFC);

  // 强调（图标里的那一道红线）
  static const accent = Color(0xFFC04434);
  static const accentHover = Color(0xFFAA382A);
  static const accentPressed = Color(0xFF8F2E22);
  static const accentSoft = Color(0xFFFBECE9);
  static const accentBorder = Color(0xFFF0CFC9);

  // 四级判定
  static const red = Color(0xFFB23A2F);
  static const redInk = Color(0xFF6E2119);
  static const redSoft = Color(0xFFFBEBE8);
  static const redBorder = Color(0xFFF0CFC9);

  static const amber = Color(0xFF946200);
  static const amberInk = Color(0xFF5A3C00);
  static const amberSoft = Color(0xFFFFF5DC);
  static const amberBorder = Color(0xFFEFDFB7);

  static const slate = Color(0xFF51616F);
  static const slateInk = Color(0xFF33414D);
  static const slateSoft = Color(0xFFEFF3F6);
  static const slateBorder = Color(0xFFD8E1E8);

  static const green = Color(0xFF2F6B4F);
  static const greenInk = Color(0xFF1E4634);
  static const greenSoft = Color(0xFFE9F3ED);
  static const greenBorder = Color(0xFFCFE3D7);

  // 语义别名
  static const success = green;
  static const successSoft = greenSoft;
  static const danger = red;
  static const dangerSoft = redSoft;
  static const warning = amber;
  static const warningSoft = amberSoft;

  // 遮罩
  static const overlay = Color(0x66101820);
  static const overlaySoft = Color(0x33101820);
  static const hoverTint = Color(0x0A101820);
}

/// 4 的倍数间距，页面和组件统一引用。
abstract final class AppSpace {
  static const x1 = 4.0;
  static const x2 = 8.0;
  static const x3 = 12.0;
  static const x4 = 16.0;
  static const x5 = 20.0;
  static const x6 = 24.0;
  static const x8 = 32.0;
  static const x10 = 40.0;
  static const x14 = 56.0;
  static const x20 = 80.0;
}

abstract final class AppRadius {
  static const xs = 6.0;
  static const sm = 8.0;
  static const md = 10.0;
  static const lg = 14.0;
  static const xl = 20.0;
  static const pill = 999.0;
}

abstract final class AppDuration {
  static const fast = Duration(milliseconds: 120);
  static const base = Duration(milliseconds: 180);
  static const slow = Duration(milliseconds: 280);
  static const page = Duration(milliseconds: 320);
  static const curve = Curves.easeOutCubic;
}

abstract final class AppShadow {
  static const card = [
    BoxShadow(color: Color(0x0A101820), offset: Offset(0, 1), blurRadius: 2),
    BoxShadow(color: Color(0x0D101820), offset: Offset(0, 4), blurRadius: 12),
  ];

  static const raised = [
    BoxShadow(color: Color(0x1F101820), offset: Offset(0, 12), blurRadius: 32, spreadRadius: -12),
  ];

  static const overlay = [
    BoxShadow(color: Color(0x2E101820), offset: Offset(0, 24), blurRadius: 64, spreadRadius: -16),
  ];
}

/// 字体角色。界面只使用一套无衬线字族，靠字号与字重分层。
abstract final class AppType {
  static const family = 'Noto Sans SC';
  static const fallback = [
    'Noto Sans CJK SC',
    'PingFang SC',
    'Microsoft YaHei UI',
    'Microsoft YaHei',
    'Hiragino Sans GB',
  ];

  static TextStyle _base(
    double size,
    FontWeight weight,
    double height, {
    Color color = AppColors.ink,
    double letterSpacing = 0,
  }) =>
      TextStyle(
        fontFamily: family,
        fontFamilyFallback: fallback,
        fontSize: size,
        fontWeight: weight,
        color: color,
        height: height,
        letterSpacing: letterSpacing,
      );

  static TextStyle display({Color color = AppColors.ink}) =>
      _base(42, FontWeight.w700, 1.14, color: color, letterSpacing: -0.8);

  static TextStyle h1({Color color = AppColors.ink}) =>
      _base(30, FontWeight.w700, 1.24, color: color, letterSpacing: -0.4);

  static TextStyle h2({Color color = AppColors.ink}) =>
      _base(22, FontWeight.w600, 1.32, color: color, letterSpacing: -0.2);

  static TextStyle h3({Color color = AppColors.ink}) =>
      _base(17, FontWeight.w600, 1.4, color: color);

  static TextStyle body({Color color = AppColors.ink}) =>
      _base(14.5, FontWeight.w400, 1.68, color: color);

  static TextStyle bodySm({Color color = AppColors.inkSecondary}) =>
      _base(13, FontWeight.w400, 1.62, color: color);

  static TextStyle caption({Color color = AppColors.inkTertiary}) =>
      _base(12, FontWeight.w400, 1.52, color: color);

  static TextStyle label({Color color = AppColors.inkTertiary}) =>
      _base(11.5, FontWeight.w600, 1.3, color: color, letterSpacing: 0.6);

  static TextStyle strong({Color color = AppColors.ink, double size = 14.5}) =>
      _base(size, FontWeight.w600, 1.5, color: color);

  static TextStyle num({Color color = AppColors.ink, double size = 24}) => _base(
        size,
        FontWeight.w700,
        1.15,
        color: color,
        letterSpacing: -0.3,
      ).copyWith(fontFeatures: const [FontFeature.tabularFigures()]);
}
