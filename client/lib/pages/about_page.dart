import 'dart:ffi';
import 'dart:io';

import 'package:flutter/services.dart';
import 'package:material_ui/material_ui.dart';

import '../design/design.dart';
import '../engine/engine.dart';
import '../services/ocr/ocr_service.dart';
import '../services/update_service.dart';
import '../state/update_controller.dart';
import '../ui/release_notes.dart';

/// 桌面从顶部栏打开弹窗，手机进入独立页面。
Future<void> showAboutPage(
  BuildContext context, {
  required UpdateController update,
  required OcrService ocr,
}) async {
  final size = MediaQuery.sizeOf(context);
  final desktop = size.width >= 900 &&
      (Platform.isWindows || Platform.isMacOS || Platform.isLinux);
  if (desktop) {
    await showAppDialog<void>(
      context: context,
      maxWidth: 820,
      builder: (context) => _AboutPanel(
        update: update,
        ocr: ocr,
        onClose: () => Navigator.of(context).pop(),
      ),
    );
    return;
  }
  await Navigator.of(context).push(
    MaterialPageRoute<void>(
      builder: (context) => _AboutScreen(update: update, ocr: ocr),
    ),
  );
}

class _AboutScreen extends StatelessWidget {
  const _AboutScreen({required this.update, required this.ocr});

  final UpdateController update;
  final OcrService ocr;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: Column(
          children: [
            Container(
              height: 56,
              padding: const EdgeInsets.symmetric(horizontal: AppSpace.x2),
              decoration: const BoxDecoration(
                color: AppColors.surface,
                border: Border(bottom: BorderSide(color: AppColors.border)),
              ),
              child: Row(
                children: [
                  AppIconButton(
                    icon: AppIcons.back,
                    tooltip: '返回',
                    touch: true,
                    onPressed: () => Navigator.of(context).maybePop(),
                  ),
                  const SizedBox(width: AppSpace.x1),
                  Text('关于红笔', style: AppType.h3()),
                ],
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(AppSpace.x4, AppSpace.x4, AppSpace.x4, AppSpace.x8),
                child: _AboutContent(update: update, ocr: ocr),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AboutPanel extends StatelessWidget {
  const _AboutPanel({required this.update, required this.ocr, required this.onClose});

  final UpdateController update;
  final OcrService ocr;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    return AppDialogSurface(
      child: Column(
        children: [
          AppDialogHeader(
            title: '关于红笔',
            subtitle: '版本、运行环境与更新',
            onClose: onClose,
          ),
          const Divider(),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(AppSpace.x5, AppSpace.x4, AppSpace.x5, AppSpace.x8),
              child: _AboutContent(update: update, ocr: ocr),
            ),
          ),
        ],
      ),
    );
  }
}

class _AboutContent extends StatelessWidget {
  const _AboutContent({required this.update, required this.ocr});

  final UpdateController update;
  final OcrService ocr;

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: update,
      builder: (context, _) {
        final latest = update.hasUpdate ? update.latestStable : null;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const BrandMark(size: 52),
                const SizedBox(width: AppSpace.x4),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '红笔',
                        style: AppType.h2().copyWith(letterSpacing: 1.2),
                      ),
                      const SizedBox(height: 2),
                      Text('签约前 5 分钟 · 学生与应届生的合同自查工具', style: AppType.caption()),
                    ],
                  ),
                ),
                AppTag(
                  label: update.buildNumber.isEmpty
                      ? 'v${update.currentVersion}'
                      : 'v${update.currentVersion} (${update.buildNumber})',
                  tone: AppTone.brand,
                ),
              ],
            ),
            const SizedBox(height: AppSpace.x5),
            _Section(
              title: '更新',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        update.error != null
                            ? AppIcons.cloudOff
                            : update.hasUpdate
                                ? AppIcons.release
                                : update.releases.isEmpty
                                    ? AppIcons.info
                                    : AppIcons.checkCircle,
                        size: 19,
                        color: update.error != null
                            ? AppColors.red
                            : update.hasUpdate
                                ? AppColors.accent
                                : update.releases.isEmpty
                                    ? AppColors.inkTertiary
                                    : AppColors.green,
                      ),
                      const SizedBox(width: AppSpace.x2),
                      Expanded(
                        child: Text(
                          update.statusLabel,
                          style: AppType.strong(
                            color: update.error != null ? AppColors.redInk : AppColors.inkSecondary,
                            size: 13.5,
                          ),
                        ),
                      ),
                      if (update.checkedAt != null)
                        Text(
                          '${_two(update.checkedAt!.hour)}:${_two(update.checkedAt!.minute)} 检查',
                          style: AppType.caption(color: AppColors.inkDisabled),
                        ),
                    ],
                  ),
                  const SizedBox(height: AppSpace.x3),
                  Wrap(
                    spacing: AppSpace.x2,
                    runSpacing: AppSpace.x2,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      AppButton(
                        label: update.loading ? '检查中…' : '检查更新',
                        icon: AppIcons.refresh,
                        tone: AppButtonTone.secondary,
                        size: AppButtonSize.sm,
                        loading: update.loading,
                        onPressed: update.loading ? null : update.check,
                      ),
                      if (latest != null) ...[
                        AppButton(
                          label: '下载 ${latest.tag}',
                          icon: AppIcons.download,
                          size: AppButtonSize.sm,
                          onPressed: () => openExternal(
                            context,
                            latest.download?.url ?? latest.htmlUrl,
                          ),
                        ),
                        AppLink(
                          label: '跳过此版本',
                          onPressed: () async {
                            await update.skipLatest();
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('已跳过 ${latest.tag}，有新版本时会再提醒。')),
                              );
                            }
                          },
                        ),
                      ],
                    ],
                  ),
                  if (latest != null) ...[
                    const SizedBox(height: AppSpace.x3),
                    ReleaseNotesBox(notes: latest.notes, maxLines: 7),
                  ],
                  if (update.error != null) ...[
                    const SizedBox(height: AppSpace.x2),
                    Text(
                      '更新检查只读取 GitHub 的公开版本信息，不影响合同核对。',
                      style: AppType.caption(color: AppColors.inkDisabled),
                    ),
                  ],
                ],
              ),
            ),
            _Section(
              title: '历史版本',
              child: update.releases.isEmpty
                  ? Text(
                      update.loading ? '正在读取版本列表…' : '还没有读取到发行版信息。',
                      style: AppType.caption(),
                    )
                  : AppCard(
                      padding: EdgeInsets.zero,
                      flat: true,
                      child: Column(
                        children: [
                          for (var i = 0; i < update.releases.take(8).length; i++) ...[
                            if (i > 0) const Divider(height: 1),
                            _ReleaseTile(
                              release: update.releases[i],
                              current: update.currentVersion,
                            ),
                          ],
                        ],
                      ),
                    ),
            ),
            _Section(
              title: '运行环境',
              child: AppCard(
                padding: const EdgeInsets.symmetric(horizontal: AppSpace.x4, vertical: AppSpace.x1),
                flat: true,
                child: Column(
                  children: [
                    KeyValueRow(
                      label: '应用版本',
                      value: update.buildNumber.isEmpty
                          ? update.currentVersion
                          : '${update.currentVersion} (${update.buildNumber})',
                    ),
                    const Divider(height: 1),
                    KeyValueRow(label: '运行平台', value: _platformLabel()),
                    const Divider(height: 1),
                    KeyValueRow(label: '处理器架构', value: _abiLabel()),
                    const Divider(height: 1),
                    KeyValueRow(
                      label: '屏幕',
                      value:
                          '${MediaQuery.sizeOf(context).width.round()} × ${MediaQuery.sizeOf(context).height.round()} 逻辑像素 · ${MediaQuery.devicePixelRatioOf(context).toStringAsFixed(2)}×',
                    ),
                    const Divider(height: 1),
                    KeyValueRow(label: '界面语言', value: Platform.localeName.replaceAll('_', '-')),
                    const Divider(height: 1),
                    KeyValueRow(label: '识别引擎', value: ocr.engineLabel),
                    const Divider(height: 1),
                    KeyValueRow(label: '规则库', value: '${ruleLibrary.length} 类 · 本机运行'),
                  ],
                ),
              ),
            ),
            _Section(
              title: '代码仓库',
              child: AppCard(
                padding: const EdgeInsets.symmetric(horizontal: AppSpace.x4, vertical: AppSpace.x3),
                flat: true,
                child: Row(
                  children: [
                    const Icon(AppIcons.repo, size: 18, color: AppColors.inkTertiary),
                    const SizedBox(width: AppSpace.x2),
                    Expanded(
                      child: SelectableText(
                        UpdateService.repoUrl,
                        maxLines: 1,
                        style: AppType.bodySm(color: AppColors.inkSecondary),
                      ),
                    ),
                    AppIconButton(
                      icon: AppIcons.copy,
                      tooltip: '复制地址',
                      onPressed: () async {
                        await Clipboard.setData(const ClipboardData(text: UpdateService.repoUrl));
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('仓库地址已复制。')),
                          );
                        }
                      },
                    ),
                    AppIconButton(
                      icon: AppIcons.external,
                      tooltip: '在浏览器中打开',
                      onPressed: () => openExternal(context, UpdateService.repoUrl),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppSpace.x5),
            AppBanner(
              tone: AppTone.brand,
              icon: AppIcons.shield,
              message: '合同正文只在本机解析与核对，不上传、不留存。更新检查只向 GitHub 读取公开的版本信息，不发送任何合同内容。',
            ),
            const SizedBox(height: AppSpace.x3),
            Text(
              '© 2026 Red Pen · ${ruleLibrary.length} 类规则 · 不构成法律意见',
              style: AppType.caption(color: AppColors.inkDisabled),
            ),
          ],
        );
      },
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpace.x5),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: AppType.label(color: AppColors.inkTertiary)),
          const SizedBox(height: AppSpace.x2),
          child,
        ],
      ),
    );
  }
}

class _ReleaseTile extends StatefulWidget {
  const _ReleaseTile({required this.release, required this.current});

  final ReleaseInfo release;
  final String current;

  @override
  State<_ReleaseTile> createState() => _ReleaseTileState();
}

class _ReleaseTileState extends State<_ReleaseTile> {
  bool _open = false;

  @override
  Widget build(BuildContext context) {
    final release = widget.release;
    final isCurrent = release.version == widget.current;
    final date = release.publishedAt;
    return Column(
      children: [
        Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () => setState(() => _open = !_open),
            child: Padding(
              padding: const EdgeInsets.fromLTRB(AppSpace.x3, AppSpace.x2 + 2, AppSpace.x2, AppSpace.x2 + 2),
              child: Row(
                children: [
                  AppTag(
                    label: release.tag,
                    tone: isCurrent ? AppTone.green : AppTone.neutral,
                    compact: true,
                  ),
                  const SizedBox(width: AppSpace.x2),
                  Expanded(
                    child: Text(
                      date == null
                          ? release.name
                          : '${date.year}-${_two(date.month)}-${_two(date.day)} · ${release.name}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppType.bodySm(color: AppColors.inkSecondary),
                    ),
                  ),
                  if (isCurrent) ...[
                    Text('当前', style: AppType.label(color: AppColors.greenInk)),
                    const SizedBox(width: AppSpace.x2),
                  ],
                  if (release.prerelease)
                    Text('预览版', style: AppType.caption(color: AppColors.inkDisabled)),
                  const SizedBox(width: AppSpace.x1),
                  AnimatedRotation(
                    turns: _open ? 0.5 : 0,
                    duration: AppDuration.fast,
                    child: const Icon(AppIcons.expandMore, size: 18, color: AppColors.inkDisabled),
                  ),
                ],
              ),
            ),
          ),
        ),
        AnimatedCrossFade(
          firstChild: const SizedBox(width: double.infinity),
          secondChild: Padding(
            padding: const EdgeInsets.fromLTRB(AppSpace.x3, 0, AppSpace.x3, AppSpace.x3),
            child: ReleaseNotesBox(notes: release.notes),
          ),
          crossFadeState: _open ? CrossFadeState.showSecond : CrossFadeState.showFirst,
          duration: AppDuration.base,
        ),
      ],
    );
  }
}

String _platformLabel() {
  final version = Platform.operatingSystemVersion;
  if (Platform.isAndroid) {
    final sdk = RegExp(r'SDK\s*(\d+)').firstMatch(version)?.group(0);
    final release = RegExp(r'android\s+([0-9.]+)', caseSensitive: false)
        .firstMatch(version)
        ?.group(1);
    final parts = [
      'Android',
      if (release != null && release.isNotEmpty) release,
      ?sdk,
    ];
    return parts.join(' · ');
  }
  if (Platform.isWindows) {
    return version.startsWith('Windows') ? version : 'Windows · $version';
  }
  if (Platform.isMacOS) return 'macOS · $version';
  if (Platform.isLinux) return 'Linux · $version';
  return Platform.operatingSystem;
}

String _abiLabel() {
  try {
    final abi = Abi.current();
    return switch (abi) {
      Abi.androidArm => 'armeabi-v7a',
      Abi.androidArm64 => 'arm64-v8a',
      Abi.androidX64 => 'x86_64',
      Abi.androidIA32 => 'x86',
      Abi.windowsX64 => 'x64',
      Abi.windowsArm64 => 'arm64',
      Abi.macosArm64 => 'arm64',
      Abi.macosX64 => 'x64',
      Abi.linuxX64 => 'x64',
      Abi.linuxArm64 => 'arm64',
      _ => abi.toString().split('.').last,
    };
  } on Object {
    return '未知';
  }
}

String _two(int value) => value.toString().padLeft(2, '0');
