# 红笔 Flutter 客户端 · UI 刷新与双端构建记录（2026-11-19）

本次改动集中在三件事：全局配色重调、图标对齐规范化、桌面与安卓双端可分发构建。
判定引擎与规则内容未改动，`flutter test` 69 项仍全部通过（引擎黄金用例 + 29 条规则用例 + PDF/解析用例）。

---

## 一、配色方案

所有颜色收敛到 `lib/theme.dart` 的 `R` 类，页面不再出现硬编码色值（仅剩 PDF 渲染底色与印鉴描边两处）。

### 1. 纸面与墨色

| Token | 旧值 | 新值 | 作用 |
|---|---|---|---|
| `desk` | `#F2EEE2` | `#F3F1EB` | 桌面底色，去掉偏黄绿的老纸感 |
| `desk2` | `#EBE5D4` | `#ECE9E1` | 结果页右栏底色 |
| `sheet` | `#FEFCF5` | `#FFFFFF` | 卡片 / 合同纸面 |
| `sheet2` | `#F9F5EA` | `#F7F5F0` | 次级填充、原文摘录底 |
| `ink` | `#1D201A` | `#191C19` | 主文字 |
| `ink2` | `#3B4137` | `#363C35` | 次级文字 |
| `muted` | `#63635A` | `#565C52` | 辅助文字（对白 6.89:1） |
| `faint` | `#85836F` | `#6E746A` | 三级文字 / 弱图标（对白 3.84 → 4.81:1） |
| `prose` | 页面内 `#2B3026` | `#2B3026` | 提到 token，便于统一调整 |
| `rule` | `#DED6C1` | `#E3DFD5` | 常规分隔线 |
| `rule2` | `#EDE7D8` | `#EFECE5` | 更浅的表格线 |
| `ruleStrong` | `#C6BCA3` | `#CBC5B7` | 强描边、悬停描边 |

### 2. 品牌与四色分级

| Token | 旧值 | 新值 | 对白对比度 |
|---|---|---|---|
| `pine` | `#17352B` | `#123A2D` | 顶栏底色，更深更干净 |
| `pine2` | `#214C3E` | `#1B5140` | 次级绿 |
| `pineSoft` | `#E4EBE2` | `#E3EDE7` | 绿色浅底 |
| `cream` | `#F4EFDF` | `#F7F3E7` | 顶栏文字 |
| `vermilion` | `#AE3A2B` | `#C0392B` | 红线（5.44:1） |
| `amber` | `#87600F` | `#9E6407` | 黄线（4.91:1，旧值偏褐） |
| `slate` | `#4E5A61` | `#56676E` | 灰线（5.90:1，转冷灰更现代） |
| `moss` | `#3C6348` | `#1B7845` | 绿线（5.50:1，更清晰） |
| `gold` | `#B5975B` | `#B08D57` | 装饰点 |

四色语义不变：红=签字前必须解决，黄=可能亏钱，灰=要问清楚，绿=本身就是标准条款。
柔和底色同步重算：`vermilionSoft #FBEAE6`、`amberSoft #FBF0D9`、`slateSoft #E9EFF1`、`mossSoft #E2F0E7`。

### 3. 阴影与遮罩

- 卡片阴影由棕色 `#1A1D1A` 系改为中性冷灰双层（`0x0F1A1F1C` + `0x241A1F1C`）。
- 顶栏原先投下一道朱红阴影 `0x8CAE3A2B`，视觉上像一条红边；改为中性深色 `0x26101B16`。
- 弹窗遮罩、聚焦描边、链接下划线颜色全部提为 token（`barrier` / `focusRing` / `focusBorder` / `linkUnderline`）。
- 提示条 `SnackBar` 主题改为松绿底 + 米白字，与顶栏一致。

---

## 二、图标对齐规范

### 1. 规范内容

写在 `lib/theme.dart` 的 `RI` 与 `lib/ui/common.dart` 的 `IconLabel`：

| 项 | 规则 |
|---|---|
| 尺寸档位 | `dense 12` / `inline 14` / `control 16` / `leading 18` / `display 20`，不再出现 13、15、17 这类散值 |
| 图标与文字间距 | 密集行 = `RI.gapDense 6`；按钮、列表行 = `RI.gap 8` |
| 垂直基准 | `IconLabel` 把图标放进一个「高度 = 文字行盒高度（fontSize × height）」的定宽盒子并居中，图标不再按自身字形高度对齐 |
| 多行文字 | 图标对齐首行：`iconTopOffset(style, size) = (行盒高 − 图标尺寸) / 2` |
| 触控热区 | 窄屏顶栏按钮高度与最小宽度均为 44 |

### 2. 逐项修复

| 位置 | 改动 |
|---|---|
| 顶栏图标按钮 | 图标 15 → 16；间距 7 → 8；高度 36 → 44（宽度 < 760 时最小宽度同为 44） |
| 主/次按钮 | 图标 15/16 混用 → 紧凑 14、常规 16；间距 7 → 8 |
| 顶部「仅本机处理」 | 13/5 → `RI.dense 12` / `RI.gapDense 6`，改用 `IconLabel` 行盒对齐 |
| 输入页隐私行 | 13/6 → `IconLabel`（12/6），多行时不再与文字顶部错位 |
| 结果页「在原文中定位」 | 13/4 → 12/6，图标与 11.5px 文字居中对齐 |
| 提示块 `InfoNote` | 图标原先顶对齐、比首行文字高约 2.4px；改为按首行行盒居中 |
| 进度页设备提示 | 13/6 → `IconLabel` 12/6 |
| 文档类型下拉 | `expand_more` 14，间距 3 → 4，使用尺寸 token |
| 样本列表 / 来源列表 | 18 → `RI.leading`；箭头 14 → `RI.inline` |
| 规则弹窗关闭 | 18 → `RI.leading` |
| 复制小按钮 | 图标 12 → `RI.dense` |

---

## 三、交互修复

- 浮动 `SnackBar` 会盖住输入页右下角的「开始核对」：载入样本后 2 秒内点不到主按钮。
  改为底部左侧、`IgnorePointer` 的轻提示（3 秒淡入淡出），不拦截任何点击，也不再遮挡主操作。
  相关：`lib/main.dart` 的 `HomeShell` 由 `StatelessWidget` 改为 `StatefulWidget`，新增 `_NoticeToast`。

---

## 四、构建修复（与 UI 无关，但为出包必需）

| 问题 | 处理 | 文件 |
|---|---|---|
| `printing` 插件源码含 UTF-8 字符，MSVC 按 GBK 读取触发 C4819，`/WX` 直接失败 | 全局加 `/utf-8` | `windows/CMakeLists.txt` |
| `pdfrx` 依赖 Windows 开发者模式创建 `.lib/latest` 符号链接，链接被重定向后找不到 `fpdfview.h` | 去掉符号链接，直接引用真实目录 | `third_party/pdfrx/windows/CMakeLists.txt` |
| pdfium 目录名含 `chromium%2F7202`，MSBuild 把 `%2F` 当转义斜杠，头文件路径失效 | 本地目录改名 `chromium-7202`，下载 URL 不变 | 同上 |
| 安卓中文 OCR 运行时会因缺少模型崩溃 | 增加 `com.google.mlkit:text-recognition-chinese:16.0.1` | `android/app/build.gradle.kts` |
| R8 因插件引用未打包的日/韩/梵文识别类而失败 | 增加 `-dontwarn` 规则 | `android/app/proguard-rules.pro` |
| 插件合并清单会带入 `INTERNET` 权限 | 用 `tools:node="remove"` 显式移除 | `android/app/src/main/AndroidManifest.xml` |
| Kotlin 增量缓存在本机反复无法关闭 | `kotlin.incremental=false` | `android/gradle.properties` |
| 发布签名 | 读取 `android/key.properties`（已 gitignore），alias `swfu` | `android/app/build.gradle.kts` |
| 窗口标题 `red_pen` | 改为「红笔 · 签约前 5 分钟」 | `windows/runner/main.cpp` |

---

## 五、验证记录

- `flutter analyze`：0 error / 0 warning。
- `flutter test`：69 项全部通过（含 27 条黄金用例、29 条规则用例、4 份样本的 PDF 生成）。
- Windows：`flutter build windows --release` 成功，产物 `build/windows/x64/runner/Release/red_pen.exe`（整目录 51MB）。
- 原生流程实跑：启动 → 载入样本 → 开始核对 → 报告页 → 展开卡片，进程无退出、无崩溃。
- 多尺寸截图：900×640、1200×800、1600×1000、2560×1400 物理像素（系统 125% 缩放），无图标错位、文字截断或重叠。
- Android：`flutter build apk --release` 成功，`apksigner` 校验签名为 `CN=SWFU Hub`，SHA-256 `638bf1b7…8505c5`；`minSdk 26`、`targetSdk 36`、应用名「红笔」、清单无 `INTERNET`。
- 未覆盖：安卓真机 / 模拟器安装运行（当前无连接设备），PDF 导出在 Android 端只验证到“生成成功”。

---

## 六、改动文件

```
client/lib/theme.dart            配色 token、阴影、图标尺寸与间距常量
client/lib/ui/common.dart        IconLabel、按钮/顶栏/提示块图标对齐、NoteTone 取色
client/lib/main.dart             提示条改造、页面外壳
client/lib/pages/intake_page.dart      输入页图标与配色
client/lib/pages/review_page.dart      结果页图标、正文色、下划线色
client/lib/pages/analyzing_page.dart   进度页图标对齐
client/lib/services/pdf_export.dart    移除多余 import
client/windows/CMakeLists.txt          /utf-8
client/windows/runner/main.cpp         窗口标题
client/third_party/pdfrx/windows/CMakeLists.txt  pdfium 路径处理
client/android/app/build.gradle.kts    中文 OCR 模型、签名配置
client/android/app/proguard-rules.pro  R8 规则（新增）
client/android/gradle.properties       Kotlin 增量编译关闭
client/android/app/src/main/AndroidManifest.xml  移除 INTERNET
client/.gitignore                      key.properties、插件本地构建目录
```

---

# 第二轮：OCR 稳定性、去红绿配色、桌面/移动双端分化（2026-11-20）

## 七、安卓图片识别修复

### 1. 现象

`Attempt to invoke virtual method 'java.lang.Class java.lang.Object.getClass()' on a null object reference`。

### 2. 定位

ML Kit 插件把图片交给原生层时，文件路径走 `File(path)` → `Uri.fromFile` 这条链，原生侧对路径/解码结果不做判空；只要路径或位图为空，就会在 Java 层抛这个空指针（`File(null)` 内部的 `getClass()`），并由 MethodChannel 以平台异常返回，界面上表现为「ML Kit 识别失败」。这条链本身在 Flutter 侧不可控。

### 3. 处理

`client/lib/services/ocr/ocr_android.dart` 重写为：

- **主路径改为像素直传**：在 worker isolate 解码 → 摆正 EXIF → 长边压到 1600 → 取 RGBA，用 `InputImage.fromBitmap` 交给 ML Kit。整条链路不经过文件路径，空指针这一类失败从根上消失。
- **文件路径降级为第二次尝试**：像素路径失败时，重新编码 PNG 写入临时目录，并校验文件存在且非空后才交给 ML Kit。
- **两次都失败**才报错，错误文案区分「识别模型没准备好」和「识别没完成」，并提示可改用「导入文件」；原生错误码与消息写入 `debugPrint`，便于用 logcat 定位。
- 空图片、尺寸异常、RGBA 长度不匹配都在进入 ML Kit 前拦掉；`recognizer.close()` 单独 try/catch，避免关闭失败覆盖真实错误。
- 识别图片上限从 2400 降到 1600 长边，单张过通道的数据从约 17MB 降到约 10MB，中端机更稳。

> 说明：本机没有安卓设备/模拟器，这一修复已通过静态审查与构建验证，仍需在真机上点一次「图片识别」确认。

## 八、配色：去掉红绿组合与深绿

- 界面主色由深松绿改为**墨蓝** `#1F3243`（侧栏、主按钮、顶栏），绿色从所有装饰性界面元素中移除。
- 唯一装饰强调色改为**琥珀** `#B07A3C`：标题下划线、进度条、光标、输入框焦点、眉标圆点。
- 红笔印章保留砖红 `#A8443A`（品牌语义，不再与绿色同时出现在界面上）。
- 四色分级降饱和，避免红绿对撞：砖红 `#A8443A`（5.91:1）、赭黄 `#9C6A14`（4.68:1）、石板灰 `#5B6B76`（5.51:1）、灰绿 `#5F7A63`（4.72:1），四者都达到正文级对比度；合同原文的高亮底色同步变浅。
- 纸面进一步中性化：`#F4F3EF` / `#EDEBE6` / 纯白卡片；三级文字 `#6E747B`（4.7:1）。
- 语义命名同步调整：`R.pine*` → `R.brand*`，新增 `R.accent / R.accentSoft`。

## 九、Windows 与移动端 UI 分化

Windows（以及 macOS/Linux）在宽度 ≥ 900 时进入 `DesktopShell`，移动端保留原顶栏结构：

| | Windows 桌面 | Android |
|---|---|---|
| 全局导航 | 左侧 252px 常驻侧栏：品牌、当前文档信息、文件/核对/带走三组命令 | 顶部通栏 + 底部操作 |
| 上下文 | 52px 上下文栏：当前阶段 + 文档摘要 + 换一份 | 顶部栏显示文档类型与待看数量 |
| 状态 | 26px 状态栏：引擎状态 + 快捷键提示 | 无 |
| 快捷键 | Ctrl+Enter 开始核对、Ctrl+O 导入、Ctrl+P 导出、Ctrl+Shift+C 复制、Esc 返回 | 无 |
| 结果页 | 侧栏 + 双栏（原文 / 报告）常驻 | 合同原文 / 核对报告 Tab 切换 |

侧栏的「核对结果」带待看数量徽标，报告生成后可直接从侧栏回到结果，不需要重新跑规则（`ReviewController.showReport()`）。桌面端不再渲染移动端的顶部栏，减少一套重复操作。

## 十、第二轮验证

- `flutter analyze`：无问题；`flutter test`：69 项全部通过。
- Windows：`flutter build windows --release` 成功，原生窗口启动正常，桌面侧栏/上下文栏/状态栏渲染正确。
- Android：`flutter build apk --release` 成功，签名仍为 `CN=SWFU Hub`。
- 桌面 1200×800 / 1440×900 与移动 390×844 截图核对：无溢出、错位、截断。
- 未覆盖：安卓真机运行；原生自动化点击会被前台其他窗口遮挡，桌面端流程改用同组件的预览截图核对。

## 十一、第二轮改动文件

```
client/lib/services/ocr/ocr_android.dart   像素直传 + 文件降级 + 双重试 + 错误分型
client/lib/theme.dart                      墨蓝/琥珀配色，四色降饱和，R.pine→R.brand
client/lib/ui/desktop_shell.dart           桌面侧栏、上下文栏、状态栏（新增）
client/lib/main.dart                       桌面/移动外壳分流、快捷键、导入调整
client/lib/state/review_controller.dart    showReport()：从侧栏回到已有结果
client/lib/pages/intake_page.dart          标题下划线/进度/光标改琥珀，桌面垂直留白收紧
client/lib/pages/review_page.dart          原文分隔线中性化
client/lib/pages/analyzing_page.dart       进度条改琥珀
client/lib/ui/common.dart                  眉标圆点改琥珀，印章色沿用砖红
```

---

# 第三轮：分架构 APK、Windows 安装程序、OCR 准确率（2026-11-20）

## 十二、OCR 准确率：23.00% → 2.56% 字符错误率

### 1. 原因

`test.png` 是 1057×4803 的整页扫描件。旧预处理按「长边 2400」缩放，长页被整体压到一半，正文汉字只剩约 7px 高——任何引擎在这种分辨率下都会大量认错。旧输出里 `劳动合同` 被读成 `劳动合間`、`甲方` 读成 `印方`，都是分辨率不足导致的。

### 2. 新流水线（`lib/services/ocr/ocr_image.dart`）

1. 摆正 EXIF，透明图先垫白底；
2. 亮度 2%–98% 分位拉伸，把灰底灰字拉成黑白（不改二值化，避免断笔）；
3. 按宽度归一到 1600px（小图最多放大 2.2×，大图缩小），不再按长边压；
4. 超高页面按宽高比 ≤ 1:2 纵向切块，块间留 8% 重叠；
5. 各块分别识别后，按尾部/首部重复行去重合并（`mergeOcrTiles`）。

Android 端把切块像素直接交给 ML Kit（`maxWidth 1800`、`maxPixels 600 万`），不再二次压缩；Windows 端同样的切块走系统 OCR。

### 3. 量化结果（同一引擎、同一张图、同一段真值）

| 指标 | 旧流水线 | 新流水线 |
|---|---|---|
| 对比字符数 | 313 | 313 |
| 编辑距离 | 72 | 8 |
| 字符错误率 CER | **23.00%** | **2.56%** |
| 字符准确率 | 77.00% | **97.44%** |
| 处理耗时（3 块） | — | 2.19 s（含 3 次引擎调用） |

复现命令：

```powershell
cd client
dart run tool/ocr_bench.dart "D:\Users\HUANG\Desktop\test.png" --old --ground-truth ..\.oil-ui\tools\gt.txt
dart run tool/ocr_bench.dart "D:\Users\HUANG\Desktop\test.png" --ground-truth ..\.oil-ui\tools\gt.txt
```

真值取图首 313 字（标题、甲乙方、第一至三条、五项义务），见 `.oil-ui/tools/gt.txt`。
以上数据来自 Windows 本机 OCR；Android 的 ML Kit 使用同一套预处理与切块逻辑，但未在真机上复测。

## 十三、分架构 APK

`flutter build apk --release --split-per-abi`，签名与通用包相同（`CN=SWFU Hub`）：

| 包 | 体积 | 内含 |
|---|---|---|
| `红笔-1.0.0-arm64-v8a.apk` | 46.0 MB | 仅 arm64-v8a 原生库 + 中文 OCR 模型 + PDF 字体 |
| `红笔-1.0.0-armeabi-v7a.apk` | 38.5 MB | 仅 armeabi-v7a |
| `红笔-1.0.0-x86_64.apk` | 48.0 MB | 仅 x86_64（模拟器 / Chromebook） |

逐包校验：每个包只含本架构 `lib/`，`assets/mlkit-google-ocr-models` 中文模型与 `NotoSansSC` 均存在，`apksigner` 验签通过。相比 110 MB 通用包，体积下降 56%–65%。
`x86_64` 是给模拟器用的，真机装 arm64（少数老机装 armeabi-v7a）。

## 十四、Windows 安装程序

用 Inno Setup 6.7.4 编译（`installer/redpen.iss`），产物 `dist/installer/红笔-1.0.0-windows-x64-setup.exe`，18.2 MB。

- 标准向导（简体中文 / 英文双语），可选安装目录，默认 `{autopf}\红笔`，**按用户安装、不弹 UAC**；
- 创建开始菜单项与桌面快捷方式（可在「附加任务」里取消桌面图标）；
- 写 `HKCU\Software\RedPen`（InstallPath / Version / Exe），标准「应用和功能」卸载条目由 Inno 自动维护；
- 关闭正在运行的实例（`CloseApplications`）、安装日志、卸载时删除安装目录与注册表键；
- 安装完成页提供「立即运行红笔」。

实测（静默安装到工作区目录）：安装 exit 0，31 个文件落地，注册表三项写入，启动后窗口标题为「红笔 · 签约前 5 分钟」；卸载 exit 0，安装目录、注册表键、卸载条目全部清除。
**未验证**：桌面与开始菜单快捷方式——当前执行环境的桌面目录拒绝写入（普通 `Set-Content` 同样被拒，非安装器问题），日志里对应两条错误 5 拒绝访问。在正常桌面会话双击安装即可创建。

## 十五、macOS

Flutter 的 macOS 目标只能在 macOS 上用 Xcode 构建，无法在 Windows 上交叉编译，因此本轮没有 macOS 产物。
已提供 `installer/package_macos.sh`：`flutter build macos --release` → 打包 `.app` → `hdiutil` 生成 dmg，并预留 codesign / notarytool 参数。该脚本未在 macOS 上执行验证。

## 十六、第三轮改动文件

```
client/lib/services/ocr/ocr_image.dart   对比度拉伸、等比缩放、纵向切块（新增）
client/lib/services/ocr/ocr.dart         逐块识别 + 重叠去重合并
client/lib/services/ocr/ocr_android.dart 切块后按宽度/像素上限解码，不再按长边压
client/test/ocr_image_test.dart          切块与合并的 5 条测试（新增）
client/tool/ocr_bench.dart               真值对比基准工具（新增）
installer/redpen.iss                     Windows 安装程序脚本（新增）
installer/package_macos.sh               macOS 打包脚本（新增，未验证）
```

---

# 第四轮：自动更新与「关于」页面（2026-11-20）

版本号正式定为 `1.0.0+1`，本轮新增启动更新检查与双端关于页；判定引擎、规则库与既有界面未改动。

## 十七、更新检测

### 1. 结构

| 文件 | 职责 |
|---|---|
| `client/lib/services/version.dart` | `SemVer` 解析与比较 |
| `client/lib/services/update_service.dart` | 读取 GitHub 发行版列表、按平台挑选资产 |
| `client/lib/services/update_store.dart` | 记住用户跳过的版本 |
| `client/lib/state/update_controller.dart` | 发行版列表、加载/错误状态、每会话只提示一次 |
| `client/lib/pages/about_page.dart` | 关于页 + 启动更新提示（桌面对话框 / 移动底部卡片） |

### 2. 版本比较规则

- 去掉 `v` 前缀、`+build` 元数据，兼容 `release-1.2.3` 这类前缀写法；
- 主、次、修订逐段按数值比较（`1.10.0` > `1.9.9`）；
- 正式版高于同号预发布版（`1.0.0` > `1.0.0-beta.2`），预发布段内数字按数值、字符串按字典序，数字低于字符串。

### 3. 提示逻辑

- 启动首帧后检查一次；`shouldPrompt()` 同时校验「有新版本」「本会话未提示过」「未被用户跳过」；
- 「跳过此版本」写入 `update_state.json`；只有出现更高版本才重新提示；
- 最新版本从非草稿、非预发布中取；桌面优先 `.exe` 安装程序，其次 `.zip`；Android 按 `arm64-v8a → armeabi-v7a → x86_64` 选择 APK；
- 网络失败、GitHub 403/429 限流均转为可读中文提示，不影响合同核对，也不会产生「有新版本」的误报。

### 4. 状态文件位置

默认写入 `getApplicationSupportDirectory()`（Windows 为 `%APPDATA%\cn.redpen\red_pen`）。当前执行环境拒绝创建该目录（`PathAccessException`，错误 5），因此增加了回退：创建失败时改用临时目录下的 `red_pen/update_state.json`。跳过标记丢失无副作用。

## 十八、关于页

### 1. 入口

- 桌面：左侧栏新增「应用 → 关于红笔」，位于「带走」分组之后，不需要滚动即可看到；
- 移动：顶栏最右侧新增信息图标，进入独立页面（带返回箭头），符合手机导航习惯；
- 桌面宽度 ≥ 900 时打开 760px 宽的模态弹窗，窄窗或手机平台进入整页。

### 2. 内容

- 品牌区：印章、名称、副标题、`v1.0.0 (1)` 版本徽标；
- 更新：状态图标与文案、最近检查时间、「检查更新」、发现新版本时的「下载」与「跳过此版本」、最新更新说明；
- 历史版本：最近 8 个发行版，逐条展开更新日志，标记「当前版本」「预览版」；
- 运行环境：应用版本、运行平台、处理器架构（`dart:ffi`）、屏幕逻辑尺寸、像素密度、界面语言、识别引擎、规则库规模；
- 代码仓库：`https://github.com/SubmergeDQ/Red-Pen`，支持复制与浏览器打开；
- 隐私与页脚：合同正文不上传、不留存；更新检查只读取公开版本信息。

## 十九、权限与文案修正

第一轮曾为「完全离线」移除 `INTERNET` 权限。本轮更新检查需要读取 GitHub，已恢复该权限，并同步修正容易误解的文案：

| 位置 | 旧 | 新 |
|---|---|---|
| Android 清单 | `tools:node="remove"` 移除 INTERNET | 显式声明 `INTERNET`，并补充 Android 11+ 打开浏览器的 `https` 可见性查询 |
| 桌面状态栏 | 本机规则 20 类 · 无网络请求 | 本机规则 20 类 · 合同不上传 |
| 桌面侧栏 | 只在本机核对，不上传、不留存 | 合同只在本机核对，不上传、不留存 |
| 移动顶栏 | 仅本机处理 | 合同仅本机处理 |
| 关于页 | — | 合同正文只在本机解析与核对；更新检查只向 GitHub 读取公开版本信息，不发送任何合同内容 |

## 二十、验证

- `flutter analyze`：0 error / 0 warning。
- `flutter test`：89 项全部通过，本轮新增 20 项：SemVer（前缀、位数、构建元数据、预发布）、发行版 JSON（草稿、字段、Windows 资产选择）、HTTP 状态映射、更新状态机（一次提示、跳过、跳过旧版后重新提示、网络错误）。
- Windows 实机（1600×900，125% 缩放）：
  - 临时发布 `v1.0.1` 后启动，自动弹出「有新版可用」，版本对比、说明、下载与跳过按钮齐全；
  - 点「跳过此版本」后状态文件写入 `{"ignoredVersion":"v1.0.1"}`，再次启动不再弹出；
  - 删除临时发行版后，关于页恢复为无更新状态；
  - 关于页弹窗与 800px 窄窗的移动版页面均正常，运行环境读取为 `Windows · 10.0 (Build 22621)` / `x64` / `1.25×` / `zh-CN`；
  - GitHub 未认证接口限流时显示「GitHub 暂时限制了请求频率」，无崩溃、无误报。
- Android：`flutter build apk --release --split-per-abi` 成功，三个包签名仍为 `CN=SWFU Hub`（SHA-256 `638bf1b7…8505c5`）；`aapt dump permissions` 确认包含 `INTERNET`；每个包只含本架构 `lib/`。
- 未覆盖：Android 真机 / 模拟器上的更新提示与关于页（本机无连接设备）；macOS 未构建。

## 二十一、第四轮改动文件

```
client/lib/services/version.dart              SemVer 解析与比较（新增）
client/lib/services/update_service.dart       GitHub 发行版读取与资产选择（新增）
client/lib/services/update_store.dart         跳过版本持久化（新增，含目录回退）
client/lib/state/update_controller.dart       更新状态机（新增）
client/lib/pages/about_page.dart              关于页与更新提示（新增）
client/lib/main.dart                          启动检查、关于入口、UpdateController 注入
client/lib/ui/desktop_shell.dart              侧栏「关于红笔」、状态栏与隐私文案
client/lib/ui/common.dart                     移动顶栏信息按钮、隐私文案
client/test/update_test.dart                  版本/解析/状态机 20 项测试（新增）
client/test/widget_test.dart                  注入离线更新服务
client/android/app/src/main/AndroidManifest.xml  恢复 INTERNET、补充 https 可见性
docs/版本更新说明-1.0.0.md                     发行版更新说明（新增）
```



