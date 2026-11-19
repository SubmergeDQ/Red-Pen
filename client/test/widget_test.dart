import 'package:flutter_test/flutter_test.dart';

import 'package:red_pen/main.dart';

void main() {
  testWidgets('shows the intake desk', (WidgetTester tester) async {
    await tester.pumpWidget(const RedPenApp());

    expect(find.text('红笔'), findsOneWidget);
    expect(find.text('协议正文'), findsOneWidget);
    expect(find.text('开始核对'), findsOneWidget);
  });
}