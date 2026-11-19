# 红笔 · Flutter 客户端

学生签约前的中文合同核对工具，Windows 与 Android 原生客户端。判定逻辑与 Web 版同源：`engine.js` 的 20 条规则逐函数移植到 Dart，并与 Web 版做逐字节比对。

## 构建与运行

```powershell
flutter pub get

# Windows（需要 Visual Studio「使用 C++ 的桌面开发」工作负载）
flutter build windows
# 产物：build\windows\x64\runner\Release\red_pen.exe

# Android（minSdk 26）
flutter build apk --release
# 产物：build\app\outputs\flutter-apk\app-release.apk
```

## 测试

```powershell
flutter test
```

- `test/engine_parity_test.dart`：读取 `test/golden/golden.json`，逐字段比对 Dart 引擎与 `engine.js` 的输出。
- `test/engine_rules_test.dart`：从 `tests/engine.test.js` 逐条翻译的 29 个回归用例。
- `test/pdf_export_test.dart`：生成四个样本的 PDF 报告，检查文件结构与体积。
- `test/document_parser_test.dart`、`test/ocr_postprocess_test.dart`：文件解析与 OCR 文本整理。

黄金文件由仓库根目录生成：

```powershell
node tools/gen_golden.js
```

## 结构

```
lib/
  engine/engine.dart        判定引擎：20 条规则、多规则包调度、法条库、样本
  pages/                    交稿台（输入）、核对进度、核对结果双栏
  state/review_controller.dart  阶段、导入、OCR、导出、筛选状态
  services/                 PDF/Word/TXT 解析、本机 OCR、PDF 报告导出
  ui/common.dart            顶栏、按钮、标签、依据面板等共享组件
  theme.dart                纸张/松绿/朱红配色与字体
  assets/fonts/             PDF 内嵌用的 Noto Sans SC（OFL）与界面衬线字体
```

## 隐私

无后端、无登录、无网络请求，Android manifest 未声明 `INTERNET` 权限。合同正文只在本进程内存里，导入的扫描件走本机 OCR（Windows 用系统 OCR 接口，Android 用 ML Kit 离线模型），导出的 PDF 写入用户选择的目录。
