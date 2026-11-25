# 红笔 · Flutter 客户端

学生签约前的中文合同核对工具，Windows 与 Android 原生客户端。判定逻辑与 Web 版同源：`engine.js` 的规则逐函数移植到 Dart，并与 Web 版做逐字段比对。客户端已对齐到 1.1 规则库（36 类，R1–R36），包含培训贷成本明示与预付课程退款等 R31–R36 规则；App 关于页、报告脚注与 PDF 页脚会显示当前规则版本。

## 构建与运行

```powershell
flutter pub get

# Windows（需要 Visual Studio「使用 C++ 的桌面开发」工作负载）
flutter build windows
# 产物：build\windows\x64\runner\Release\red_pen.exe

# Android（minSdk 26）
flutter build apk --release --split-per-abi
# 产物：build\app\outputs\flutter-apk\app-{arm64-v8a,armeabi-v7a,x86_64}-release.apk
```

Windows 安装程序（Inno Setup 6）：

```powershell
iscc installer\redpen.iss
# 产物：dist\installer\红笔-1.1.0-windows-x64-setup.exe
```

macOS 需在 macOS 上执行 `installer/package_macos.sh`（Windows 无法交叉编译）。

## 测试

```powershell
flutter test
```

- `test/engine_parity_test.dart`：读取 `test/golden/golden.json`，逐字段比对 Dart 引擎与 `engine.js` 的输出。
- `test/engine_rules_test.dart`：从 `tests/engine.test.js` 逐条翻译的回归用例。
- `test/engine_consumer_test.dart`：R31–R36 消费规则回归：持牌贷款披露、表外收费、预付课程退款、跨条优先关系、免责与个人信息。
- `test/pdf_export_test.dart`：生成四个样本的 PDF 报告，检查文件结构与体积。
- `test/document_parser_test.dart`、`test/ocr_postprocess_test.dart`：文件解析与 OCR 文本整理。
- `test/update_test.dart`、`test/update_prompt_test.dart`：版本比较、发行版解析与更新提示交互。
- `test/widget_test.dart`：移动端与桌面端外壳的冒烟测试。

黄金文件由仓库根目录生成：

```powershell
node tools/gen_golden.js
```

## 结构

```
lib/
  engine/engine.dart        判定引擎：36 条规则（1.1 快照）、多规则包调度、法条库、样本
  design/                   1.1 设计系统：tokens、主题、图标表、原子组件
  pages/                    交稿台、核对进度、核对结果、关于
  state/review_controller.dart  阶段、导入、OCR、导出、筛选状态
  services/                 PDF/Word/TXT 解析、本机 OCR、PDF 报告导出、更新检查
  ui/app_shell.dart         响应式外壳：桌面顶部导航 / 移动顶栏
  ui/rules_panel.dart       核对依据面板
  ui/update_prompt.dart     启动更新提示
  assets/brand/             应用图标（与各平台启动图标同源）
  assets/fonts/             PDF 内嵌与界面使用的 Noto Sans SC（OFL）
```

## 隐私

无后端、无登录。合同正文只在本进程内存里，导入的扫描件走本机 OCR（Windows 用系统 OCR 接口，Android 用 ML Kit 离线模型），导出的 PDF 写入用户选择的目录。

Android manifest 声明 `INTERNET` 权限，唯一用途是启动时读取 GitHub 的公开发行版信息并在「关于」页展示更新；请求不携带合同内容、设备标识或使用数据。网络不可用时只影响更新提示，不影响核对。

Android 的 OCR 默认把图片解码成 RGBA 像素直接交给 ML Kit，文件路径只作为第二次尝试，避免插件在空路径上抛原生空指针。
