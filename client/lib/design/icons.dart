import 'package:material_ui/material_ui.dart';

/// 统一的界面图标表。
///
/// 1.1 起所有界面图标都从这里取，统一使用 Material Rounded 画法；
/// 激活态才用实心变体，避免同一页面混用不同线宽和端点。
abstract final class AppIcons {
  static const upload = Icons.upload_file_rounded;
  static const paste = Icons.content_paste_rounded;
  static const image = Icons.image_rounded;
  static const camera = Icons.photo_camera_rounded;
  static const rules = Icons.menu_book_rounded;
  static const rulesActive = Icons.menu_book;
  static const report = Icons.fact_check_rounded;
  static const reportActive = Icons.fact_check;
  static const pdf = Icons.picture_as_pdf_rounded;
  static const copy = Icons.copy_rounded;
  static const check = Icons.check_rounded;
  static const checkCircle = Icons.check_circle_rounded;
  static const close = Icons.close_rounded;
  static const back = Icons.arrow_back_rounded;
  static const forward = Icons.arrow_forward_rounded;
  static const chevronDown = Icons.keyboard_arrow_down_rounded;
  static const chevronRight = Icons.chevron_right_rounded;
  static const expandMore = Icons.expand_more_rounded;
  static const refresh = Icons.refresh_rounded;
  static const info = Icons.info_rounded;
  static const shield = Icons.shield_rounded;
  static const lock = Icons.lock_rounded;
  static const location = Icons.my_location_rounded;
  static const download = Icons.download_rounded;
  static const external = Icons.open_in_new_rounded;
  static const edit = Icons.edit_rounded;
  static const cloudOff = Icons.cloud_off_rounded;
  static const release = Icons.new_releases_rounded;
  static const repo = Icons.code_rounded;
  static const devices = Icons.devices_rounded;
  static const language = Icons.translate_rounded;
  static const ruleCount = Icons.rule_rounded;
  static const warning = Icons.warning_amber_rounded;
  static const error = Icons.error_rounded;
  static const spinner = Icons.autorenew_rounded;
  static const more = Icons.more_horiz_rounded;
  static const menu = Icons.menu_rounded;
  static const search = Icons.search_rounded;
  static const filter = Icons.filter_list_rounded;
  static const article = Icons.article_rounded;
  static const arrowOut = Icons.arrow_outward_rounded;
  static const timer = Icons.schedule_rounded;
  static const flag = Icons.flag_rounded;
  static const add = Icons.add_rounded;
}

/// 图标尺寸档位：与相邻文字的行盒绑定，避免不同字形导致基线漂移。
abstract final class AppIconSize {
  static const inline = 16.0;
  static const control = 18.0;
  static const display = 22.0;
  static const hero = 28.0;
}
