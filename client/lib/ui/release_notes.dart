import 'package:flutter/services.dart';
import 'package:material_ui/material_ui.dart';
import 'package:url_launcher/url_launcher.dart';

import '../design/design.dart';
import '../services/update_service.dart';

/// 更新说明文本框：去掉 Markdown 记号后按正文展示。
class ReleaseNotesBox extends StatelessWidget {
  const ReleaseNotesBox({super.key, required this.notes, this.maxLines});

  final String notes;
  final int? maxLines;

  @override
  Widget build(BuildContext context) {
    final plain = plainReleaseNotes(notes);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(AppSpace.x3, AppSpace.x3, AppSpace.x3, AppSpace.x3),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Text(
        plain.isEmpty ? '这一版没有附带更新说明。' : plain,
        maxLines: maxLines,
        overflow: maxLines == null ? TextOverflow.clip : TextOverflow.ellipsis,
        style: AppType.bodySm(color: AppColors.inkSecondary),
      ),
    );
  }
}

/// 打开外部链接；失败时复制地址并提示，避免用户卡住。
Future<void> openExternal(BuildContext context, String url) async {
  final uri = Uri.tryParse(url);
  if (uri == null) return;
  var ok = false;
  try {
    ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
  } on Object {
    ok = false;
  }
  if (!ok && context.mounted) {
    await Clipboard.setData(ClipboardData(text: url));
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('没能打开浏览器，下载地址已复制。')),
      );
    }
  }
}
