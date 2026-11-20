import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';

import 'package:red_pen/main.dart';
import 'package:red_pen/services/update_service.dart';
import 'package:red_pen/state/update_controller.dart';

class _OfflineService extends UpdateService {
  @override
  Future<List<ReleaseInfo>> fetchReleases({int limit = 30}) async => const [];
}

UpdateController _offlineUpdate() => UpdateController(service: _OfflineService());

void main() {
  testWidgets('shows the mobile intake desk', (WidgetTester tester) async {
    final update = _offlineUpdate();
    await tester.pumpWidget(RedPenApp(update: update));
    await tester.pump();

    expect(find.text('红笔'), findsOneWidget);
    expect(find.text('合同正文'), findsOneWidget);
    expect(find.text('开始核对'), findsOneWidget);
  });

  testWidgets('shows the desktop shell and navigation', (WidgetTester tester) async {
    debugDefaultTargetPlatformOverride = TargetPlatform.windows;
    tester.view.physicalSize = const Size(1440, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(() {
      tester.view.reset();
      debugDefaultTargetPlatformOverride = null;
    });

    final update = _offlineUpdate();
    await tester.pumpWidget(RedPenApp(update: update));
    await tester.pump();

    expect(find.text('交稿台'), findsOneWidget);
    expect(find.text('核对结果'), findsOneWidget);
    expect(find.text('核对依据'), findsOneWidget);
    expect(find.text('合同正文'), findsOneWidget);
  });
}
