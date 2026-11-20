import 'dart:async';

import 'package:flutter/foundation.dart' show defaultTargetPlatform;
import 'package:flutter/services.dart';
import 'package:material_ui/material_ui.dart';
import 'package:package_info_plus/package_info_plus.dart';

import 'design/design.dart';
import 'pages/about_page.dart';
import 'pages/analyzing_page.dart';
import 'pages/intake_page.dart';
import 'pages/review_page.dart';
import 'state/review_controller.dart';
import 'state/update_controller.dart';
import 'ui/app_shell.dart';
import 'ui/rules_panel.dart';
import 'ui/update_prompt.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final update = UpdateController();
  try {
    final info = await PackageInfo.fromPlatform();
    update.currentVersion = info.version;
    update.buildNumber = info.buildNumber;
  } on Object {
    // 读不到包信息时保留 pubspec 默认值，更新检查依然可用。
  }
  runApp(RedPenApp(update: update));
}

class RedPenApp extends StatefulWidget {
  const RedPenApp({super.key, required this.update});

  final UpdateController update;

  @override
  State<RedPenApp> createState() => _RedPenAppState();
}

class _RedPenAppState extends State<RedPenApp> {
  late final ReviewController _controller;

  @override
  void initState() {
    super.initState();
    _controller = ReviewController();
  }

  @override
  void dispose() {
    _controller.dispose();
    widget.update.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '红笔 · 签约前 5 分钟',
      debugShowCheckedModeBanner: false,
      theme: buildAppTheme(),
      home: HomeShell(controller: _controller, update: widget.update),
    );
  }
}

class HomeShell extends StatefulWidget {
  const HomeShell({super.key, required this.controller, required this.update});

  final ReviewController controller;
  final UpdateController update;

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  ReviewController get controller => widget.controller;

  String? _notice;
  Timer? _noticeTimer;

  @override
  void initState() {
    super.initState();
    controller.onNotice = _showNotice;
    WidgetsBinding.instance.addPostFrameCallback((_) => _checkForUpdates());
  }

  /// 每次启动检查一次；跳过的版本或同一会话内不会再次提示。
  Future<void> _checkForUpdates() async {
    final update = widget.update;
    if (update.loading || update.releases.isNotEmpty) return;
    await update.check();
    if (!mounted) return;
    if (!await update.shouldPrompt()) return;
    if (!mounted) return;
    final latest = update.latestStable;
    if (latest == null) return;
    await showUpdatePrompt(context, update: update, release: latest);
  }

  void _showAbout() {
    showAboutPage(context, update: widget.update, ocr: controller.ocr);
  }

  @override
  void dispose() {
    _noticeTimer?.cancel();
    controller.onNotice = null;
    super.dispose();
  }

  void _showNotice(String message) {
    _noticeTimer?.cancel();
    if (!mounted) return;
    setState(() => _notice = message);
    _noticeTimer = Timer(const Duration(seconds: 3), () {
      if (mounted) setState(() => _notice = null);
    });
  }

  Future<void> _requestNewDocument(BuildContext context) async {
    if (controller.phase == Phase.analyzing) {
      controller.editText();
      return;
    }
    if (controller.phase != Phase.report) {
      controller.resetAll();
      return;
    }
    final replace = await showAppDialog<bool>(
      context: context,
      maxWidth: 420,
      builder: (context) => const _NewDocumentDialog(),
    );
    if (replace == true) controller.resetAll();
  }

  Widget _withShortcuts(Widget child) {
    return CallbackShortcuts(
      bindings: {
        const SingleActivator(LogicalKeyboardKey.enter, control: true): () {
          if (controller.canReview) controller.startReview();
        },
        const SingleActivator(LogicalKeyboardKey.keyO, control: true): () {
          if (!controller.busy) controller.importFile();
        },
        const SingleActivator(LogicalKeyboardKey.keyP, control: true): () {
          if (controller.analysis != null && !controller.exporting) controller.exportPdf();
        },
        const SingleActivator(LogicalKeyboardKey.keyC, control: true, shift: true): () {
          if (controller.analysis != null) controller.copyReport();
        },
        const SingleActivator(LogicalKeyboardKey.escape): () {
          if (controller.phase != Phase.intake) controller.editText();
        },
      },
      child: Focus(autofocus: true, child: child),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: controller,
      builder: (context, _) {
        final page = AnimatedSwitcher(
          duration: AppDuration.page,
          switchInCurve: AppDuration.curve,
          switchOutCurve: Curves.easeInCubic,
          layoutBuilder: (current, previous) => Stack(
            alignment: Alignment.topCenter,
            children: [...previous, ?current],
          ),
          transitionBuilder: (child, animation) {
            final slide = Tween<Offset>(
              begin: const Offset(0, 0.012),
              end: Offset.zero,
            ).animate(animation);
            return FadeTransition(
              opacity: animation,
              child: SlideTransition(position: slide, child: child),
            );
          },
          child: switch (controller.phase) {
            Phase.intake => IntakePage(
                key: const ValueKey('intake'),
                controller: controller,
              ),
            Phase.analyzing => AnalyzingPage(
                key: const ValueKey('analyzing'),
                controller: controller,
              ),
            Phase.report => ReviewPage(
                key: const ValueKey('report'),
                controller: controller,
              ),
          },
        );

        final desktop = MediaQuery.sizeOf(context).width >= 900 &&
            (defaultTargetPlatform == TargetPlatform.windows ||
                defaultTargetPlatform == TargetPlatform.macOS ||
                defaultTargetPlatform == TargetPlatform.linux);

        final shell = AppShell(
          controller: controller,
          update: widget.update,
          onRules: () => showRulesPanel(context),
          onAbout: _showAbout,
          onNewDocument: () => _requestNewDocument(context),
          child: page,
        );

        return PopScope(
          canPop: controller.phase == Phase.intake,
          onPopInvokedWithResult: (didPop, result) {
            if (!didPop) controller.editText();
          },
          child: Scaffold(
            backgroundColor: AppColors.canvas,
            body: Stack(
              children: [
                desktop ? _withShortcuts(shell) : shell,
                Positioned(
                  left: AppSpace.x5,
                  right: AppSpace.x5,
                  bottom: AppSpace.x20,
                  child: IgnorePointer(
                    child: Align(
                      alignment: Alignment.bottomLeft,
                      child: AnimatedSwitcher(
                        duration: AppDuration.base,
                        switchInCurve: Curves.easeOut,
                        switchOutCurve: Curves.easeIn,
                        transitionBuilder: (child, animation) => FadeTransition(
                          opacity: animation,
                          child: SlideTransition(
                            position: Tween<Offset>(
                              begin: const Offset(0, 0.15),
                              end: Offset.zero,
                            ).animate(animation),
                            child: child,
                          ),
                        ),
                        child: _notice == null
                            ? const SizedBox.shrink()
                            : AppToast(key: ValueKey(_notice), message: _notice!),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _NewDocumentDialog extends StatelessWidget {
  const _NewDocumentDialog();

  @override
  Widget build(BuildContext context) {
    return AppDialogSurface(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppDialogHeader(
            title: '换一份合同？',
            subtitle: '当前正文和核对结果会从内存里清掉。',
            onClose: () => Navigator.of(context).pop(false),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpace.x5, 0, AppSpace.x5, 0),
            child: Text(
              '红笔不保存合同，清掉之后无法找回。',
              style: AppType.bodySm(color: AppColors.inkSecondary),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpace.x5, AppSpace.x5, AppSpace.x5, AppSpace.x5),
            child: Row(
              children: [
                Expanded(
                  child: AppButton(
                    label: '继续看',
                    tone: AppButtonTone.secondary,
                    onPressed: () => Navigator.of(context).pop(false),
                  ),
                ),
                const SizedBox(width: AppSpace.x2),
                Expanded(
                  child: AppButton(
                    label: '换一份',
                    tone: AppButtonTone.danger,
                    onPressed: () => Navigator.of(context).pop(true),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
