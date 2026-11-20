import 'package:flutter_test/flutter_test.dart';

import 'package:red_pen/main.dart';
import 'package:red_pen/services/update_service.dart';
import 'package:red_pen/state/update_controller.dart';

class _OfflineService extends UpdateService {
  @override
  Future<List<ReleaseInfo>> fetchReleases({int limit = 30}) async => const [];
}

void main() {
  testWidgets('shows the intake desk', (WidgetTester tester) async {
    final update = UpdateController(service: _OfflineService());
    await tester.pumpWidget(RedPenApp(update: update));
    await tester.pump();

    expect(find.text('红笔'), findsOneWidget);
    expect(find.text('协议正文'), findsOneWidget);
    expect(find.text('开始核对'), findsOneWidget);
  });
}