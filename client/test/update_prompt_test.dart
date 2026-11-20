import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';

import 'package:red_pen/design/design.dart';
import 'package:red_pen/services/update_service.dart';
import 'package:red_pen/services/update_store.dart';
import 'package:red_pen/state/update_controller.dart';
import 'package:red_pen/ui/update_prompt.dart';

class _FakeStore extends UpdateStore {
  String? value;

  @override
  Future<String?> ignoredVersion() async => value;

  @override
  Future<void> setIgnoredVersion(String? version) async {
    value = version;
  }
}

class _FakeService extends UpdateService {
  @override
  Future<List<ReleaseInfo>> fetchReleases({int limit = 30}) async => [
        ReleaseInfo(
          tag: 'v1.1.0',
          name: '红笔 1.1.0',
          notes: '## 界面\n- 全新设计系统\n- 新图标',
          htmlUrl: 'https://example.com/v1.1.0',
          publishedAt: DateTime(2026, 11, 20),
          prerelease: false,
          assets: const [],
        ),
      ];
}

Future<UpdateController> _controller(_FakeStore store) async {
  final controller = UpdateController(
    service: _FakeService(),
    store: store,
    currentVersion: '1.0.0',
    buildNumber: '1',
  );
  await controller.check();
  return controller;
}

void main() {
  testWidgets('shows the update prompt and closes on later', (WidgetTester tester) async {
    final update = await _controller(_FakeStore());
    await tester.pumpWidget(
      MaterialApp(
        theme: buildAppTheme(),
        home: Builder(
          builder: (context) => Scaffold(
            body: Center(
              child: TextButton(
                onPressed: () => showUpdatePrompt(
                  context,
                  update: update,
                  release: update.latestStable!,
                ),
                child: const Text('open'),
              ),
            ),
          ),
        ),
      ),
    );
    await tester.tap(find.text('open'));
    await tester.pumpAndSettle();

    expect(find.text('发现新版本'), findsOneWidget);
    expect(find.textContaining('最新 v1.1.0'), findsOneWidget);
    expect(find.text('稍后再说'), findsOneWidget);

    await tester.tap(find.text('稍后再说'));
    await tester.pumpAndSettle();
    expect(find.text('发现新版本'), findsNothing);
  });

  testWidgets('skip this version stores the tag', (WidgetTester tester) async {
    final store = _FakeStore();
    final update = await _controller(store);
    await tester.pumpWidget(
      MaterialApp(
        theme: buildAppTheme(),
        home: Builder(
          builder: (context) => Scaffold(
            body: Center(
              child: TextButton(
                onPressed: () => showUpdatePrompt(
                  context,
                  update: update,
                  release: update.latestStable!,
                ),
                child: const Text('open'),
              ),
            ),
          ),
        ),
      ),
    );
    await tester.tap(find.text('open'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('跳过此版本'));
    await tester.pumpAndSettle();

    expect(store.value, 'v1.1.0');
    expect(find.text('发现新版本'), findsNothing);
  });
}
