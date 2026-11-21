import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';

import 'package:red_pen/design/design.dart';
import 'package:red_pen/engine/engine.dart';
import 'package:red_pen/main.dart';
import 'package:red_pen/services/update_service.dart';
import 'package:red_pen/state/review_controller.dart';
import 'package:red_pen/state/update_controller.dart';

class _OfflineService extends UpdateService {
  @override
  Future<List<ReleaseInfo>> fetchReleases({int limit = 30}) async => const [];
}

UpdateController _offlineUpdate() => UpdateController(service: _OfflineService());

Future<void> _pumpApp(
  WidgetTester tester,
  ReviewController controller,
) async {
  await tester.pumpWidget(MaterialApp(
    theme: buildAppTheme(),
    home: HomeShell(controller: controller, update: _offlineUpdate()),
  ));
  await tester.pump();
}

void main() {
  testWidgets('mobile report can switch to the contract source after review',
      (WidgetTester tester) async {
    debugDefaultTargetPlatformOverride = TargetPlatform.android;
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1;
    addTearDown(() {
      tester.view.reset();
      debugDefaultTargetPlatformOverride = null;
    });

    final controller = ReviewController();
    addTearDown(controller.dispose);
    controller.editor.text = samples.first.text;
    controller.sourceName = '示例 · ${samples.first.name}';

    await _pumpApp(tester, controller);

    await tester.tap(find.text('开始核对'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 1600));
    await tester.pumpAndSettle();

    expect(find.text('核对报告 · 7'), findsOneWidget);
    expect(find.text('劳动合同书'), findsNothing);

    await tester.tap(find.text('合同原文'));
    await tester.pumpAndSettle();

    expect(find.text('劳动合同书'), findsOneWidget, reason: '点击合同原文后应展示合同正文');
    expect(find.text('第一条 合同期限'), findsWidgets);
  });

  testWidgets('desktop about dialog closes from close, escape and the barrier',
      (WidgetTester tester) async {
    debugDefaultTargetPlatformOverride = TargetPlatform.windows;
    tester.view.physicalSize = const Size(900, 640);
    tester.view.devicePixelRatio = 1;
    addTearDown(() {
      tester.view.reset();
      debugDefaultTargetPlatformOverride = null;
    });

    final controller = ReviewController();
    addTearDown(controller.dispose);
    await _pumpApp(tester, controller);

    const subtitle = '版本、运行环境与更新';

    await tester.tap(find.byTooltip('关于红笔'));
    await tester.pumpAndSettle();
    expect(find.text(subtitle), findsOneWidget);

    await tester.tap(find.byTooltip('关闭'));
    await tester.pumpAndSettle();
    expect(find.text(subtitle), findsNothing, reason: '关闭按钮应销毁关于弹窗');

    await tester.tap(find.byTooltip('关于红笔'));
    await tester.pumpAndSettle();
    expect(find.text(subtitle), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.escape);
    await tester.pumpAndSettle();
    expect(find.text(subtitle), findsNothing, reason: 'Esc 应销毁关于弹窗');

    await tester.tap(find.byTooltip('关于红笔'));
    await tester.pumpAndSettle();
    expect(find.text(subtitle), findsOneWidget);

    await tester.tapAt(const Offset(8, 8));
    await tester.pumpAndSettle();
    expect(find.text(subtitle), findsNothing, reason: '点击弹窗外区域应销毁关于弹窗');
  });
}
