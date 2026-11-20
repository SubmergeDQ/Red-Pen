import 'dart:ffi';
import 'dart:io';

import 'package:flutter/services.dart';
import 'package:material_ui/material_ui.dart';
import 'package:url_launcher/url_launcher.dart';

import '../engine/engine.dart';
import '../services/ocr/ocr_service.dart';
import '../services/update_service.dart';
import '../state/update_controller.dart';
import '../theme.dart';
import '../ui/common.dart';

/// Desktop opens a modal; phones push a page they can go back from.
Future<void> showAboutPage(
  BuildContext context, {
  required UpdateController update,
  required OcrService ocr,
}) async {
  final size = MediaQuery.sizeOf(context);
  final desktop = size.width >= 900 &&
      (Platform.isWindows || Platform.isMacOS || Platform.isLinux);
  if (desktop) {
    await showDialog<void>(
      context: context,
      barrierColor: R.barrier,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        elevation: 0,
        insetPadding: const EdgeInsets.all(24),
        child: ConstrainedBox(
          constraints: BoxConstraints(
            maxWidth: 760,
            maxHeight: size.height * 0.88,
          ),
          child: _AboutPanel(update: update, ocr: ocr, onClose: () => Navigator.of(context).pop()),
        ),
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
      backgroundColor: R.desk,
      body: SafeArea(
        child: Column(
          children: [
            Container(
              height: 54,
              padding: const EdgeInsets.symmetric(horizontal: 8),
              decoration: const BoxDecoration(
                color: R.sheet,
                border: Border(bottom: BorderSide(color: R.rule)),
              ),
              child: Row(
                children: [
                  IconButton(
                    tooltip: '返回',
                    onPressed: () => Navigator.of(context).maybePop(),
                    icon: const Icon(Icons.arrow_back, size: RI.leading, color: R.ink2),
                  ),
                  const SizedBox(width: 4),
                  Text('关于红笔', style: R.serif(size: 16, weight: FontWeight.w600, height: 1.2)),
                ],
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(16, 18, 16, 28),
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
    return Container(
      decoration: BoxDecoration(
        color: R.sheet,
        borderRadius: BorderRadius.circular(10),
        boxShadow: R.shadowFloat,
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          Container(
            height: 54,
            padding: const EdgeInsets.only(left: 22, right: 8),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: R.rule)),
            ),
            child: Row(
              children: [
                Text('关于红笔', style: R.serif(size: 16, weight: FontWeight.w600, height: 1.2)),
                const Spacer(),
                IconButton(
                  tooltip: '关闭',
                  onPressed: onClose,
                  icon: const Icon(Icons.close, size: RI.leading, color: R.muted),
                ),
              ],
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(24, 20, 24, 24),
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
                const SealMark(size: 46),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('红笔', style: R.serif(size: 24, weight: FontWeight.w600, height: 1.2)),
                      const SizedBox(height: 3),
                      Text(
                        '签约前 5 分钟 · 学生与应届生的合同自查工具',
                        style: R.sans(size: 12, color: R.muted, height: 1.4),
                      ),
                    ],
                  ),
                ),
                _VersionChip(version: update.currentVersion, buildNumber: update.buildNumber),
              ],
            ),
            const SizedBox(height: 22),
            _Section(
              title: '更新',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        update.error != null
                            ? Icons.cloud_off_outlined
                            : update.hasUpdate
                                ? Icons.new_releases_outlined
                                : update.releases.isEmpty
                                    ? Icons.inventory_2_outlined
                                    : Icons.verified_outlined,
                        size: RI.leading,
                        color: update.error != null
                            ? R.vermilion
                            : update.hasUpdate
                                ? R.accent
                                : update.releases.isEmpty
                                    ? R.muted
                                    : R.moss,
                      ),
                      const SizedBox(width: RI.gap),
                      Expanded(
                        child: Text(
                          update.statusLabel,
                          style: R.sans(
                            size: 13,
                            weight: FontWeight.w500,
                            color: update.error != null ? R.vermilionInk : R.ink2,
                            height: 1.5,
                          ),
                        ),
                      ),
                      if (update.checkedAt != null)
                        Text(
                          '${_two(update.checkedAt!.hour)}:${_two(update.checkedAt!.minute)} 检查',
                          style: R.sans(size: 11, color: R.faint, height: 1.3),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      DeskButton(
                        label: update.loading ? '检查中…' : '检查更新',
                        icon: Icons.refresh,
                        kind: DeskButtonKind.outline,
                        height: 36,
                        compact: true,
                        onPressed: update.loading ? null : update.check,
                      ),
                      if (latest != null)
                        DeskButton(
                          label: '下载 ${latest.tag}',
                          icon: Icons.download_outlined,
                          kind: DeskButtonKind.primary,
                          height: 36,
                          compact: true,
                          onPressed: () => _open(
                            context,
                            latest.download?.url ?? latest.htmlUrl,
                          ),
                        ),
                      if (latest != null)
                        TextButton(
                          onPressed: () async {
                            await update.skipLatest();
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('已跳过 ${latest.tag}，有新版本时会再提醒。')),
                              );
                            }
                          },
                          child: Text(
                            '跳过此版本',
                            style: R.sans(size: 12, color: R.muted),
                          ),
                        ),
                    ],
                  ),
                  if (update.hasUpdate && latest != null) ...[
                    const SizedBox(height: 12),
                    _NotesBox(text: latest.notes, maxLines: 8),
                  ],
                  if (update.error != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      '更新检查只读取 GitHub 的版本信息，不影响合同核对。',
                      style: R.sans(size: 11, color: R.faint, height: 1.5),
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
                      style: R.sans(size: 12, color: R.muted, height: 1.5),
                    )
                  : Column(
                      children: [
                        for (final release in update.releases.take(8))
                          _ReleaseTile(release: release, current: update.currentVersion),
                      ],
                    ),
            ),
            _Section(
              title: '运行环境',
              child: _EnvironmentTable(update: update, ocr: ocr),
            ),
            _Section(
              title: '代码仓库',
              child: Row(
                children: [
                  const Icon(Icons.code, size: RI.control, color: R.muted),
                  const SizedBox(width: RI.gap),
                  Expanded(
                    child: SelectableText(
                      UpdateService.repoUrl,
                      maxLines: 1,
                      style: R.sans(size: 12, color: R.ink2, height: 1.4),
                    ),
                  ),
                  IconTextButton(
                    icon: Icons.copy_outlined,
                    label: '复制',
                    onTap: () async {
                      await Clipboard.setData(const ClipboardData(text: UpdateService.repoUrl));
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('仓库地址已复制。')),
                        );
                      }
                    },
                  ),
                  const SizedBox(width: 6),
                  IconTextButton(
                    icon: Icons.open_in_new,
                    label: '打开',
                    onTap: () => _open(context, UpdateService.repoUrl),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 6),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
              decoration: BoxDecoration(
                color: R.sheet2,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: R.rule),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '隐私',
                    style: R.sans(
                      size: 10.5,
                      weight: FontWeight.w600,
                      color: R.muted,
                      letterSpacing: 1.2,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '合同正文只在本机解析与核对，不上传、不留存。更新检查只向 GitHub 读取公开的版本信息，不发送任何合同内容。',
                    style: R.sans(size: 11.5, color: R.ink2, height: 1.6),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Text(
              '© 2026 Red Pen · 规则 ${ruleLibrary.length} 类 · 不构成法律意见',
              style: R.sans(size: 10.5, color: R.faint, height: 1.4),
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
      padding: const EdgeInsets.only(bottom: 22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: R.sans(
              size: 10.5,
              weight: FontWeight.w600,
              color: R.muted,
              letterSpacing: 1.6,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 8),
          Container(height: 1, color: R.rule),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

class _VersionChip extends StatelessWidget {
  const _VersionChip({required this.version, required this.buildNumber});

  final String version;
  final String buildNumber;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: R.brandSoft,
        borderRadius: BorderRadius.circular(5),
        border: Border.all(color: R.brandBorder),
      ),
      child: Text(
        buildNumber.isEmpty ? 'v$version' : 'v$version ($buildNumber)',
        style: R.sans(size: 11.5, weight: FontWeight.w600, color: R.brandInk, height: 1.3),
      ),
    );
  }
}

class _NotesBox extends StatelessWidget {
  const _NotesBox({required this.text, this.maxLines});

  final String text;
  final int? maxLines;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
      decoration: BoxDecoration(
        color: R.sheet2,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: R.rule),
      ),
      child: Text(
        _plainNotes(text),
        maxLines: maxLines,
        overflow: maxLines == null ? TextOverflow.clip : TextOverflow.ellipsis,
        style: R.sans(size: 12, color: R.ink2, height: 1.7),
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
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Container(
        decoration: BoxDecoration(
          color: R.sheet,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: R.rule),
        ),
        child: Column(
          children: [
            InkWell(
              borderRadius: BorderRadius.circular(6),
              onTap: () => setState(() => _open = !_open),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 10, 10, 10),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: isCurrent ? R.mossSoft : R.sheet2,
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: isCurrent ? R.mossBorder : R.rule),
                      ),
                      child: Text(
                        release.tag,
                        style: R.sans(
                          size: 10.5,
                          weight: FontWeight.w600,
                          color: isCurrent ? R.mossInk : R.ink2,
                          height: 1.3,
                        ),
                      ),
                    ),
                    const SizedBox(width: 9),
                    Expanded(
                      child: Text(
                        date == null
                            ? release.name
                            : '${date.year}-${_two(date.month)}-${_two(date.day)} · ${release.name}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: R.sans(size: 12, color: R.ink2, height: 1.4),
                      ),
                    ),
                    if (release.prerelease)
                      Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: Text('预览版', style: R.sans(size: 10, color: R.faint)),
                      ),
                    Icon(
                      _open ? Icons.expand_less : Icons.expand_more,
                      size: RI.control,
                      color: R.faint,
                    ),
                  ],
                ),
              ),
            ),
            AnimatedCrossFade(
              firstChild: const SizedBox(width: double.infinity),
              secondChild: Padding(
                padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
                child: _NotesBox(
                  text: release.notes.isEmpty ? '这一版没有附带更新说明。' : release.notes,
                ),
              ),
              crossFadeState: _open ? CrossFadeState.showSecond : CrossFadeState.showFirst,
              duration: const Duration(milliseconds: 160),
            ),
          ],
        ),
      ),
    );
  }
}

class _EnvironmentTable extends StatelessWidget {
  const _EnvironmentTable({required this.update, required this.ocr});

  final UpdateController update;
  final OcrService ocr;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final rows = <(String, String)>[
      ('应用版本', update.buildNumber.isEmpty ? update.currentVersion : '${update.currentVersion} (${update.buildNumber})'),
      ('运行平台', _platformLabel()),
      ('处理器架构', _abiLabel()),
      ('屏幕', '${size.width.round()} × ${size.height.round()} 逻辑像素'),
      ('像素密度', '${MediaQuery.devicePixelRatioOf(context).toStringAsFixed(2)}×'),
      ('界面语言', Platform.localeName.replaceAll('_', '-')),
      ('识别引擎', ocr.engineLabel),
      ('规则库', '${ruleLibrary.length} 类 · 本机运行'),
    ];
    return Column(
      children: [
        for (var i = 0; i < rows.length; i++)
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8),
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(color: i == rows.length - 1 ? Colors.transparent : R.rule2),
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 84,
                  child: Text(
                    rows[i].$1,
                    style: R.sans(size: 11.5, color: R.muted, height: 1.5),
                  ),
                ),
                Expanded(
                  child: Text(
                    rows[i].$2,
                    style: R.sans(size: 12, color: R.ink2, height: 1.5),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class IconTextButton extends StatelessWidget {
  const IconTextButton({super.key, required this.icon, required this.label, required this.onTap});

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(4),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
        child: IconLabel(
          icon: icon,
          label: label,
          iconSize: RI.dense,
          gap: RI.gapDense,
          color: R.brand,
          style: R.sans(size: 11.5, weight: FontWeight.w500, color: R.brand, height: 1.4),
        ),
      ),
    );
  }
}

Future<void> _open(BuildContext context, String url) async {
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

String _plainNotes(String raw) {
  final lines = raw
      .replaceAll('\r\n', '\n')
      .split('\n')
      .map((line) => line
          .replaceAll(RegExp(r'^#{1,6}\s*'), '')
          .replaceAll('**', '')
          .replaceAll('`', '')
          .trimRight())
      .toList();
  while (lines.isNotEmpty && lines.first.trim().isEmpty) {
    lines.removeAt(0);
  }
  while (lines.isNotEmpty && lines.last.trim().isEmpty) {
    lines.removeLast();
  }
  return lines.join('\n');
}

String _two(int value) => value.toString().padLeft(2, '0');

/// Startup update prompt: a dialog on desktop, a bottom sheet on phones.
///
/// The caller decides whether to prompt at all ([UpdateController.shouldPrompt])
/// so a skipped version or a second check in the same session stays silent.
Future<void> showUpdatePrompt(
  BuildContext context, {
  required UpdateController update,
  required ReleaseInfo release,
}) async {
  final size = MediaQuery.sizeOf(context);
  final desktop = size.width >= 900 &&
      (Platform.isWindows || Platform.isMacOS || Platform.isLinux);
  final card = _UpdatePrompt(
    update: update,
    release: release,
    roundedTop: !desktop,
    onClose: () => Navigator.of(context).maybePop(),
  );
  if (desktop) {
    await showDialog<void>(
      context: context,
      barrierColor: R.barrier,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        elevation: 0,
        insetPadding: const EdgeInsets.all(24),
        child: ConstrainedBox(
          constraints: BoxConstraints(maxWidth: 460, maxHeight: size.height * 0.8),
          child: card,
        ),
      ),
    );
    return;
  }
  await showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    barrierColor: R.barrier,
    builder: (context) => card,
  );
}

class _UpdatePrompt extends StatelessWidget {
  const _UpdatePrompt({
    required this.update,
    required this.release,
    required this.roundedTop,
    required this.onClose,
  });

  final UpdateController update;
  final ReleaseInfo release;
  final bool roundedTop;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    final asset = release.download;
    final size = asset?.sizeLabel ?? '';
    return Container(
      decoration: BoxDecoration(
        color: R.sheet,
        borderRadius: roundedTop
            ? const BorderRadius.vertical(top: Radius.circular(12))
            : BorderRadius.circular(10),
        border: Border.all(color: R.rule),
        boxShadow: R.shadowFloat,
      ),
      clipBehavior: Clip.antiAlias,
      child: SafeArea(
        top: false,
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(22, 20, 22, 18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const SealMark(size: 34),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '有新版可用',
                          style: R.serif(size: 19, weight: FontWeight.w600, height: 1.35),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          '当前 v${update.currentVersion} → 最新 ${release.tag}',
                          style: R.sans(size: 12, color: R.muted, height: 1.4),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    tooltip: '稍后再说',
                    onPressed: onClose,
                    icon: const Icon(Icons.close, size: RI.leading, color: R.muted),
                  ),
                ],
              ),
              if (release.notes.trim().isNotEmpty) ...[
                const SizedBox(height: 14),
                _NotesBox(text: release.notes, maxLines: 8),
              ],
              const SizedBox(height: 18),
              DeskButton(
                label: size.isEmpty ? '下载 ${release.tag}' : '下载 ${release.tag}（$size）',
                icon: Icons.download_outlined,
                kind: DeskButtonKind.primary,
                height: 44,
                expand: true,
                onPressed: () async {
                  await _open(context, asset?.url ?? release.htmlUrl);
                  onClose();
                },
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: DeskButton(
                      label: '稍后再说',
                      kind: DeskButtonKind.quiet,
                      height: 40,
                      compact: true,
                      expand: true,
                      onPressed: onClose,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: DeskButton(
                      label: '跳过此版本',
                      kind: DeskButtonKind.outline,
                      height: 40,
                      compact: true,
                      expand: true,
                      onPressed: () async {
                        await update.skipLatest();
                        onClose();
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                '更新检查只读取 GitHub 的公开版本信息，合同正文始终留在本机。下载完成后请自行安装。',
                style: R.sans(size: 11, color: R.faint, height: 1.6),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
