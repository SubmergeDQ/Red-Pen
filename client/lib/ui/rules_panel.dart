import 'package:material_ui/material_ui.dart';

import '../design/design.dart';
import '../engine/engine.dart';

/// 核对依据面板：桌面居中弹窗，移动端底部面板。
Future<void> showRulesPanel(BuildContext context) {
  final size = MediaQuery.sizeOf(context);
  final narrow = size.width < 760;
  final content = _RulesContent(narrow: narrow);
  if (narrow) {
    return showAppSheet<void>(
      context: context,
      builder: (context) => SizedBox(
        height: size.height * 0.9,
        child: content,
      ),
    );
  }
  return showAppDialog<void>(
    context: context,
    maxWidth: 680,
    builder: (context) => content,
  );
}

class _RulesContent extends StatelessWidget {
  const _RulesContent({required this.narrow});

  final bool narrow;

  @override
  Widget build(BuildContext context) {
    return AppDialogSurface(
      onlyTop: narrow,
      child: Column(
        children: [
          if (narrow) const SheetHandle(),
          AppDialogHeader(
            title: '${ruleLibrary.length} 类核对依据',
            subtitle: '每条规则都标注了法律出处；条文序号无法确认时会写「需核对」。',
            onClose: () => Navigator.of(context).pop(),
          ),
          const Divider(),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(AppSpace.x5, AppSpace.x2, AppSpace.x5, AppSpace.x5),
              itemCount: ruleLibrary.length,
              separatorBuilder: (_, _) => const Divider(height: AppSpace.x5),
              itemBuilder: (context, index) {
                final rule = ruleLibrary[index];
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      width: 40,
                      child: AppTag(label: rule.id, tone: AppTone.brand, compact: true),
                    ),
                    const SizedBox(width: AppSpace.x3),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(rule.name, style: AppType.strong(size: 14)),
                          const SizedBox(height: 2),
                          Text(rule.cite, style: AppType.caption()),
                          const SizedBox(height: AppSpace.x1 + 2),
                          Text(rule.gist, style: AppType.bodySm(color: AppColors.inkSecondary)),
                        ],
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(AppSpace.x5, AppSpace.x3, AppSpace.x5, AppSpace.x4),
            decoration: const BoxDecoration(
              color: AppColors.surfaceMuted,
              border: Border(top: BorderSide(color: AppColors.border)),
            ),
            child: Text(
              '规则覆盖常见条款，不替代律师。界面与规则都在本机运行，合同正文不上传。',
              style: AppType.caption(),
            ),
          ),
        ],
      ),
    );
  }
}
