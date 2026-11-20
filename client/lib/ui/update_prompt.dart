import 'package:material_ui/material_ui.dart';

import '../design/design.dart';
import '../services/update_service.dart';
import '../state/update_controller.dart';
import 'release_notes.dart';

/// 启动更新提示。桌面居中弹窗，移动端底部面板；
/// 是否弹出由调用方的 `shouldPrompt()` 决定。
Future<void> showUpdatePrompt(
  BuildContext context, {
  required UpdateController update,
  required ReleaseInfo release,
}) async {
  final size = MediaQuery.sizeOf(context);
  final desktop = size.width >= 900 &&
      (Theme.of(context).platform == TargetPlatform.windows ||
          Theme.of(context).platform == TargetPlatform.macOS ||
          Theme.of(context).platform == TargetPlatform.linux);
  final card = _UpdatePrompt(
    update: update,
    release: release,
    onlyTop: !desktop,
    onClose: () => Navigator.of(context).maybePop(),
  );
  if (desktop) {
    await showAppDialog<void>(
      context: context,
      maxWidth: 480,
      builder: (context) => card,
    );
    return;
  }
  await showAppSheet<void>(context: context, builder: (context) => card);
}

class _UpdatePrompt extends StatelessWidget {
  const _UpdatePrompt({
    required this.update,
    required this.release,
    required this.onlyTop,
    required this.onClose,
  });

  final UpdateController update;
  final ReleaseInfo release;
  final bool onlyTop;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    final asset = release.download;
    final sizeLabel = asset?.sizeLabel ?? '';
    return AppDialogSurface(
      onlyTop: onlyTop,
      child: SafeArea(
        top: false,
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(AppSpace.x5, AppSpace.x5, AppSpace.x5, AppSpace.x5),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (onlyTop) const SheetHandle(),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const BrandMark(size: 40),
                  const SizedBox(width: AppSpace.x3),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('发现新版本', style: AppType.h3()),
                        const SizedBox(height: 3),
                        Text(
                          '当前 v${update.currentVersion}，最新 ${release.tag}',
                          style: AppType.caption(),
                        ),
                      ],
                    ),
                  ),
                  AppIconButton(
                    icon: AppIcons.close,
                    tooltip: '稍后再说',
                    onPressed: onClose,
                  ),
                ],
              ),
              const SizedBox(height: AppSpace.x4),
              ReleaseNotesBox(notes: release.notes, maxLines: 9),
              const SizedBox(height: AppSpace.x5),
              AppButton(
                label: sizeLabel.isEmpty ? '下载 ${release.tag}' : '下载 ${release.tag} · $sizeLabel',
                icon: AppIcons.download,
                size: AppButtonSize.lg,
                expand: true,
                onPressed: () async {
                  await openExternal(context, asset?.url ?? release.htmlUrl);
                  onClose();
                },
              ),
              const SizedBox(height: AppSpace.x2),
              Row(
                children: [
                  Expanded(
                    child: AppButton(
                      label: '稍后再说',
                      tone: AppButtonTone.ghost,
                      onPressed: onClose,
                    ),
                  ),
                  const SizedBox(width: AppSpace.x2),
                  Expanded(
                    child: AppButton(
                      label: '跳过此版本',
                      tone: AppButtonTone.secondary,
                      onPressed: () async {
                        await update.skipLatest();
                        onClose();
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpace.x3),
              Text(
                '更新检查只读取 GitHub 的公开版本信息，合同正文始终留在本机。下载完成后请自行安装。',
                style: AppType.caption(color: AppColors.inkTertiary).copyWith(fontSize: 11.5),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
