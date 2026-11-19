import 'package:material_ui/material_ui.dart';

import 'pages/analyzing_page.dart';
import 'pages/intake_page.dart';
import 'pages/review_page.dart';
import 'state/review_controller.dart';
import 'theme.dart';
import 'ui/common.dart';

void main() {
  runApp(const RedPenApp());
}

class RedPenApp extends StatefulWidget {
  const RedPenApp({super.key});

  @override
  State<RedPenApp> createState() => _RedPenAppState();
}

class _RedPenAppState extends State<RedPenApp> {
  final GlobalKey<ScaffoldMessengerState> _messenger = GlobalKey<ScaffoldMessengerState>();
  late final ReviewController _controller;

  @override
  void initState() {
    super.initState();
    _controller = ReviewController()
      ..onNotice = (message) {
        final state = _messenger.currentState;
        if (state == null) return;
        final context = state.context;
        final wide = MediaQuery.sizeOf(context).width >= 760;
        state
          ..hideCurrentSnackBar()
          ..showSnackBar(
            SnackBar(
              content: Text(message),
              width: wide ? 420 : null,
              duration: const Duration(seconds: 2),
            ),
          );
      };
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '红笔 · 签约前 5 分钟',
      debugShowCheckedModeBanner: false,
      scaffoldMessengerKey: _messenger,
      theme: R.theme(),
      home: HomeShell(controller: _controller),
    );
  }
}

class HomeShell extends StatelessWidget {
  const HomeShell({super.key, required this.controller});

  final ReviewController controller;

  Future<void> _requestNewDocument(BuildContext context) async {
    if (controller.phase == Phase.analyzing) {
      controller.editText();
      return;
    }
    if (controller.phase != Phase.report) {
      controller.resetAll();
      return;
    }
    final replace = await showDialog<bool>(
      context: context,
      barrierColor: const Color(0x661D201A),
      builder: (context) => const _NewDocumentDialog(),
    );
    if (replace == true) controller.resetAll();
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: controller,
      builder: (context, _) {
        return PopScope(
          canPop: controller.phase == Phase.intake,
          onPopInvokedWithResult: (didPop, result) {
            if (!didPop) controller.editText();
          },
          child: Scaffold(
            backgroundColor: R.desk,
            body: Column(
              children: [
                DeskTopBar(
                  controller: controller,
                  onHome: () => _requestNewDocument(context),
                  onRules: () => showRulesPanel(context),
                  onCopyReport: controller.copyReport,
                  onNewDocument: () => _requestNewDocument(context),
                ),
                Expanded(
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    switchInCurve: Curves.easeOutCubic,
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
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.all(24),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 400),
        child: Container(
          padding: const EdgeInsets.fromLTRB(22, 22, 22, 18),
          decoration: BoxDecoration(
            color: R.sheet,
            border: Border.all(color: R.rule),
            borderRadius: BorderRadius.circular(8),
            boxShadow: R.shadowFloat,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '换一份合同？',
                style: R.serif(size: 20, weight: FontWeight.w600, height: 1.5),
              ),
              const SizedBox(height: 8),
              Text(
                '当前正文和审阅结果会从内存里清掉。红笔不保存合同，清掉之后无法找回。',
                style: R.sans(size: 13, color: R.muted, height: 1.75),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  DeskButton(
                    label: '继续看',
                    kind: DeskButtonKind.quiet,
                    height: 42,
                    onPressed: () => Navigator.of(context).pop(false),
                  ),
                  const SizedBox(width: 8),
                  DeskButton(
                    label: '换一份',
                    kind: DeskButtonKind.primary,
                    height: 42,
                    onPressed: () => Navigator.of(context).pop(true),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}