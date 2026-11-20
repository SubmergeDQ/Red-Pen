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

---

# 第五轮：1.1.0 全量 UI 重构与新图标（2026-11-20）

本轮不是在前一版上改样式，而是换掉整套视觉语言：纸面、衬线、侧栏、上下文栏、状态栏与琥珀装饰线全部退役，新的「墨线」设计系统覆盖桌面与移动端。判定引擎、规则库和业务流程未改动。

## 二十二、设计方向与范围

| 范围 | 决定 |
|---|---|
| 品牌 | 采用用户提供的新应用图标；品牌色取自图标的墨蓝与朱红 |
| 视觉语言 | 冷白画布、纯白表面、单一无衬线字族、一个强调色、8pt 间距体系 |
| 页面结构 | 授权重排：桌面顶部导航 + 固定底栏；移动顶栏 + 分段切换 + 底部操作栏 |
| 业务流程 | 锁定：交稿台 → 核对中 → 核对报告；导入、OCR、导出、复制、更新检查不变 |
| 旧资产 | 删除 `theme.dart`、`ui/common.dart`、`ui/desktop_shell.dart` 与衬线字体，不保留双套实现 |

## 二十三、设计系统

新增 `client/lib/design/`：

- `tokens.dart`：表面/文字/边界/品牌/强调/四级判定色、4 倍数间距、圆角档位、阴影、时长与字体角色。
- `app_theme.dart`：Material 3 主题，统一 Tooltip、SnackBar、弹窗、底部面板、菜单、滚动条、进度条。
- `theme_config.dart`：`AppThemeConfig` 与 `AppThemeTokens`，全局主题配置与运行时扩展位。
- `adaptive.dart`：`AppLayout` compact / medium / expanded 与统一断点、页边距。
- `commands.dart`：`AppCommand`，桌面顶栏与移动更多菜单共用的命令插槽。
- `icons.dart`：统一 Material Rounded 图标表与 16/18/22/28 尺寸档位。
- `components/`：按钮、图标按钮、链接、标签、计数徽标、卡片、区块标题、指标块、键值行、空状态、提示条、下拉、输入外壳、分段控件、弹窗/底部面板、Toast、进度条、呼吸点。

关键取值：画布 `#F2F4F7`、表面白、墨 `#101820`、品牌 `#1F3243`、强调 `#C04434`；间距 4–80；圆角 6/8/10/14/20；动效 120/180/280/320ms。完整规范见 `docs/DESIGN.md`。

## 二十四、布局与页面

### 1. 外壳

- 桌面：64px 顶栏（品牌、当前文档、交稿台/核对结果/核对依据、本机状态、扩展命令、换一份、关于），页面底部固定操作栏。
- 移动：56px 顶栏（品牌、风险徽标、关于、更多），不放大标题、不再用深色通栏。
- 旧侧栏、上下文栏、26px 状态栏全部删除。

### 2. 交稿台

- 大标题改为两行无衬线排印，强调词用朱红；标签改为胶囊。
- 桌面两栏：左编辑器卡片、右试用文本卡片；编辑器工具条、字数、清空与隐私提示重排。
- 手机单列，底部固定「开始核对」栏；试用文本改为卡片列表，不再使用带圆圈箭头的长列表。

### 3. 核对中

- 单卡片居中：84px 进度环、百分比、四阶段列表、隐私提示；阶段完成用勾选圆点。

### 4. 核对报告

- 桌面：顶部一句结论 + 5 个可点统计块 + 操作按钮；下方报告（6）与原文（5）双栏。
- 移动：分段切换「核对报告 / 合同原文」，摘要与统计条进入报告滚动区，底部固定导出/复制。
- 卡片：白底 14 圆角，等级标签 + 标题 + 位置 + 结论；展开后在浅灰内嵌块里展示原文、法律依据、问法、改法与定位。原文面板按条款着色，批注数与定位保留。

### 5. 关于与弹层

- 关于页重写为品牌区、更新、历史版本、运行环境、代码仓库、隐私六段；版本徽标、检查更新、下载/跳过、发行版展开都使用新组件。
- 核对依据、换一份、图片源、更新提示全部改为统一弹窗/底部面板。

## 二十五、全平台图标

- 从 `red-pen-app-icon.zip` 的 SVG 生成全部位图：Android legacy 48–192、adaptive 108–432（foreground/background/monochrome）、Windows 16–256 `.ico`、Web 64 favicon 与 192/512 常规/可遮罩、应用内 128/512 品牌图。
- Android 新增 `mipmap-anydpi-v26/ic_launcher(_round).xml` 与清单 `roundIcon`；启动背景改为品牌墨蓝 + 居中图标。
- Web manifest 改为中文名称、品牌色与真实描述。
- 应用内 `SealMark` 删除，统一使用 `BrandMark` 读取同一图标。

## 二十六、架构扩展

- 组件按 foundation / components / ui / pages / state / services 分层，页面不再自建按钮和卡片样式。
- 全局主题：`buildAppTheme(config)`；`AppThemeTokens` 挂在 `ThemeExtension` 上，为深色与换色预留。
- 插件命令：`AppCommand` + `AppShell.extraCommands`，桌面顶栏与移动更多菜单自动分发。
- 多场景：`AppLayout` 三档与统一断点，为平板、折叠屏、超宽屏预留。

## 二十七、验证

- `flutter analyze`：0 问题；`flutter test`：92 项全部通过（新增更新提示交互 2 项、桌面外壳 1 项）。
- Windows Release 构建、安装、启动、卸载全部通过；安装 29 个文件，版本 `1.1.0+2`（第六轮升到 `+3`）。
- Android 三 ABI 构建通过，签名仍为 `CN=SWFU Hub`；清单含 `INTERNET`；adaptive icon 含 monochrome。
- 启动性能（Profile）：首帧 84.95 ms，光栅化 559.51 ms；报告页内存约 133 MB Working Set。
- 截图覆盖 1440×800、1266×682、706×762、480×720 逻辑视口，无溢出、截断或孤字。
- 未覆盖：Android 真机、连续帧率、Web 应用构建、macOS。

## 二十八、第五轮改动文件

```
client/lib/design/                     设计令牌、主题、扩展位、图标表与原子组件（新增）
client/lib/ui/app_shell.dart           响应式外壳（新增，替代 desktop_shell）
client/lib/ui/rules_panel.dart         核对依据面板（新增）
client/lib/ui/update_prompt.dart       更新提示（新增）
client/lib/ui/release_notes.dart       更新说明与外部链接（新增）
client/lib/pages/intake_page.dart      交稿台重写
client/lib/pages/analyzing_page.dart   核对中重写
client/lib/pages/review_page.dart      报告页重写
client/lib/pages/about_page.dart       关于页重写
client/lib/main.dart                   新主题、外壳、提示与弹窗
client/lib/theme.dart                  删除
client/lib/ui/common.dart              删除
client/lib/ui/desktop_shell.dart       删除
client/assets/brand/                   新应用图标（新增）
client/assets/fonts/                   移除四个衬线字体
client/android/app/src/main/res/       legacy/adaptive/monochrome 图标、启动背景、颜色
client/web/                            favicon、图标、manifest 与页面元信息
client/windows/runner/resources/app_icon.ico  多尺寸新图标
client/test/update_prompt_test.dart    更新提示测试（新增）
docs/DESIGN.md                         设计规范（新增）
docs/1.1.0-测试报告.md                 测试报告（新增）
docs/1.1.0-发布验收.md                 发布验收（新增）
docs/版本更新说明-1.1.0.md             发行版说明（新增）
docs/assets/1.1.0/                     UI 截图证据（新增）
```

---

# 第六轮：1.1.0 桌面窗口、图标与窄屏排版的修正（2026-11-20）

本轮针对实测反馈做四组修正，版本构建号升到 `1.1.0+3`，设计语言与业务流程不变。

## 二十九、Windows 窗口位置记忆

- 新增 `windows/runner/window_state.h/.cpp`：用 `GetWindowPlacement` 取还原后的矩形，写入 `HKCU\Software\RedPen\Window`（X / Y / Width / Height / Maximized）；关闭、系统会话结束时保存。
- 启动顺序：`Create` 后先恢复上次矩形；若不存在或已不在任何显示器工作区，则按默认 `1280×840` 逻辑像素创建，居中并夹到当前工作区。
- `Win32Window` 增加初始显示命令，保存时若为最大化，启动仍以最大化显示，不会被首帧的 `SW_SHOWNORMAL` 覆盖。
- 实测：默认窗口 1600×1050 物理（125%），移到 `220,80 / 1400×930` 关闭后重启，坐标与尺寸完全一致；删除注册表键后回到居中默认。

## 三十、默认展示完整交稿台

- 默认窗口从 1280×720 提高到 1280×840 逻辑像素。
- 交稿台按可用高度进入紧凑排版（`< 780`）：标题切到 H1、间距与卡片内边距收紧、编辑器 7 行、双栏阈值从 1040 降到 1000。
- 首次进入用 `jumpTo(0)` 固定滚动位置，避免窗口 DPI/尺寸变化后继承偏移、把「签约前 5 分钟」徽标裁掉。
- 实测：默认窗口下标题、编辑器、试用文本、免责声明与底部操作栏全部可见，无需滚动。

## 三十一、Windows 图标链路

- exe 与窗口类图标继续使用 `windows/runner/resources/app_icon.ico`（16–256 多尺寸）。
- 安装程序新增 `SetupIconFile`，安装包本身显示新图标；开始菜单、桌面快捷方式显式 `IconFilename` 指向 exe。
- 抽取 exe 与安装程序图标核对，均为纸面 + 红圈的新图标。

## 三十二、Android 启动图标留白

- 以 1024 画布重新合成：主体缩至 76%，居中添加透明留白；adaptive foreground / monochrome 同步缩放。
- legacy 图标用背景 + 缩小后的前景重新合成，圆角与圆形版本分别应用遮罩，不再直接复用整块 SVG。
- 从最终 APK 抽出 192px legacy 与圆形图标核对，留白与主体比例一致。

## 三十三、窄屏编辑器头部

- `_EditorHeader` 按宽度切换：`< 520` 时拆成两行。
  - 第一行：图标 + 「合同正文」/副标题（单行省略）+ 清空按钮。
  - 第二行：合同类型下拉 + 字数。
- 标题与副标题加 `maxLines: 1`，彻底避免「合同正文」折成「合同正 / 文」、类型与字数互相挤压。
- 实测 480 逻辑宽度载入 447 字合同：标题单行、`自动识别类型` 与 `447 字` 分列第二行两端，无重叠。

## 三十四、「签约前 5 分钟」横向双段

- 新增 `SignBadge`：胶囊内「签约前」在左、「5 分钟」以强调色紧随其右，两段各自 `softWrap: false`，任何宽度都不换行。
- 交稿台桌面/移动共用同一组件；关于页、窗口标题保持原有横向文案。

## 三十五、第六轮验证

- `flutter analyze`：0 问题；`flutter test`：92 项全部通过。
- Windows：默认窗口完整可见；位置记忆保存/恢复通过；安装、启动、卸载通过（29 文件、`1.1.0+3`）；exe 与安装程序图标核对一致。
- Android：三 ABI 构建通过，versionCode 2003 / 1003 / 4003，签名不变；APK 内图标为缩小留白版本。
- 未覆盖：Android 真机、连续帧率、Web 应用构建、macOS。

## 三十六、第六轮改动文件

```
client/windows/runner/main.cpp            默认窗口、居中夹取、恢复上次位置
client/windows/runner/window_state.h/.cpp 窗口位置读写与可见性校验（新增）
client/windows/runner/win32_window.*      初始显示命令（最大化）
client/windows/runner/flutter_window.cpp  WM_CLOSE / WM_ENDSESSION 保存位置
client/windows/runner/CMakeLists.txt      加入 window_state.cpp
client/lib/pages/intake_page.dart         紧凑排版、顶部滚动归零、两行编辑器头部
client/lib/design/components/tag.dart     SignBadge 横向双段徽标
client/android/app/src/main/res/          Android 图标缩小留白（各密度与 adaptive）
installer/redpen.iss                      安装程序图标与快捷方式图标
docs/版本更新说明-1.1.0.md                 补充 +3 修订与校验和
docs/1.1.0-测试报告.md                     补充窗口记忆、窄屏头部与图标验证
docs/1.1.0-发布验收.md                     补充修订项验收
docs/assets/1.1.0/                        更新默认窗口、关于页与窄屏头部截图
```

---

# 第七轮：1.1.0 的 OCR、排版与 Windows 窗口修正（2026-11-20）

本轮修四组问题，版本构建号升到 `1.1.0+4`；设计语言、业务流程和 1.1.0 发布范围不变。

## 三十七、Android ML Kit OCR 在 release 包中的初始化失败

### 1. 现象

- Debug 包一切正常；Release 包中「图片识别」与扫描版 PDF 导入都在识别器初始化阶段失败。
- 屏幕文案为「本机识别没有完成」，异常原文：

```
Attempt to read from field 'xn1.a' on a null object reference
in method 'cw com.google.mlkit.vision.text.TextRecognition.getClient(
com.google.mlkit.vision.text.TextRecognizerOptionsInterface)'
```

### 2. 定位

- 用临时入口 `lib/ocr_smoke.dart` 打包 release，把异常栈直接渲染到屏幕上，确认失败点在 `TextRecognition.getClient`，与图片预处理、切块、文件读取无关。
- 说明问题来自 R8：`proguard-android-optimize.txt` 裁剪/优化了 ML Kit 通过反射建立的识别器注册表，`getClient` 读到的注册项为 null。
- 原先的 keep 规则只保留了中文识别器与少量接口，不足以覆盖内部实现包。

### 3. 修复

`client/android/app/proguard-rules.pro` 改为整体保留：

```
-keep class com.google.mlkit.** { *; }
-keep class com.google.android.gms.internal.mlkit_** { *; }
```

- 第一条覆盖 `TextRecognition`、`TextRecognizer`、中文选项类与 `common` / `vision-common` 注册器。
- 第二条覆盖 `com.google.android.gms.internal.mlkit_vision_text_chinese`、`mlkit_vision_text_common`、`mlkit_common` 等内部实现。
- 仍保留其它 ML Kit 文字的 `-dontwarn`，应用只打包中文模型。

### 4. 真机验证

| 场景 | 结果 |
|---|---|
| 独立图片 | release 包，相册选择 `test.png` → 1584 字，正文自动填入，提示「识别文字已填入正文」 |
| PDF 内嵌图片 | release 包，导入无文本层扫描 PDF（1057×4803 单页）→ 页面渲染后走同一 OCR 服务，1584 字，提示「扫描页已在本机用 ML Kit 中文离线模型识别」 |

验证用的临时入口、测试图片与 integration_test 文件在验证后删除，`pubspec.yaml` 同步移除 `assets/test/` 与 `integration_test`。

## 三十八、首页「签约前 5 分钟」右移与右栏自适应

- `_Hero` 改为标题行内布局：左 `Expanded` 标题，右 `SignBadge`（`crossAxisAlignment.start` + 顶部 2px 微调），原独立一行删除，纵向省出一行。
- 移动端 480 逻辑宽度下标题两行不被压缩，徽标与首行顶对齐；桌面端徽标位于内容区右上，与标题首行同高。截图 `android-intake.png`、`desktop-intake-1320x900.png`。
- 实测桌面「试用文本」卡片在 900 高度下底部被裁掉一行：`_SamplePanel` 改为 `LayoutBuilder` 自适应，可用高度 `< 520` 时切换紧凑模式——行内边距 12→8、图标 34→30、卡片内边距 20→12，并收起「覆盖范围」说明。
- 紧凑模式在默认 `1320×900` 与最小 `1080×700` 下均能完整显示四份试用文本，无截断。

## 三十九、Windows 图标链路（任务栏）

- `FlutterWindow::OnCreate` 用 `LoadImage(IDI_APP_ICON, SM_CXICON/SM_CXSMICON, LR_SHARED)` 取大小两档，再 `WM_SETICON` 显式设置 `ICON_BIG` / `ICON_SMALL`，避免任务栏与 Alt+Tab 使用缓存或默认图标。
- `main.cpp` 调用 `SetCurrentProcessExplicitAppUserModelID(L"RedPen.Desktop.1")`；安装程序的桌面与开始菜单快捷方式使用同一 `AppUserModelID`，保证任务栏按钮与快捷方式归为同一应用。
- 快捷方式 `IconFilename` 继续指向 `{app}\red_pen.exe`，exe 内嵌 `app_icon.ico`（16/24/32/48/64/128/256 七档）。
- 验证：`WM_GETICON` 读回大/小图标句柄非空，抽取图像为纸面 + 红圈新图标；安装后的 exe 图标与品牌源文件一致；快捷方式 `IconLocation = D:\红笔\red_pen.exe,0`。

### 补充：覆盖安装后的图标缓存

- 现象：exe、安装包图标都已正确，但桌面快捷方式与任务栏仍显示旧的 Flutter 默认图标。
- 排查：`ExtractIconEx` 确认 exe 只有一个图标组且为新图标；`ico` 的 16–256 七档全部为新图；`SHGetFileInfo` 与 `SHGetImageList(SHIL_JUMBO)` 解析快捷方式均返回新图标——说明文件与系统解析都正确，是资源管理器内存/图标缓存未刷新。
- 修复：安装程序增加 `ChangesAssociations=yes`，覆盖安装结束时广播 `SHCNE_ASSOCCHANGED`，强制资源管理器重建图标；本机再清理 `iconcache_*.db` 并重启资源管理器后，桌面与任务栏均显示新图标。
- 任务栏复验：从安装目录启动并最小化，任务栏按钮图标为纸面 + 红圈（运行态下划线可见）。

## 四十、Windows 首页不滚动与窗口尺寸

- 桌面交稿台改为固定高度布局：`Column(_Hero, Expanded(双栏), 免责声明)` + 固定底栏；页面本身不再使用 `SingleChildScrollView`，长文本由编辑器内部滚动。
- 最小窗口 `WM_GETMINMAXINFO` 由固定 `1200×800` 改为按 DPI 换算的 `1080×700`，兼容 1366×768 笔记本；更窄时页面自动退回可滚动的单栏布局。
- 默认窗口从 `1280×840` 提高到 `1320×900` 逻辑像素，首次启动居中并夹到工作区。
- 实测：
  - 默认 `1320×900`：标题、编辑器、试用文本、免责声明、底栏全部可见，无滚动条。
  - 最小 `1080×700`：无溢出、无截断、无重叠，试用文本完整。
  - 位置记忆：移到 `300,120 / 1600×1000` 关闭后重启，`GetWindowRect` 与注册表保存值完全一致。

## 四十一、第七轮验证

- `flutter analyze`：0 问题；`flutter test`：92 项全部通过。
- Windows：Release 构建、静默安装（33 文件、`1.1.0+4`）、覆盖安装图标刷新、启动、图标、窗口恢复全部通过。
- Android：三 ABI 构建通过，versionCode `2004 / 1004 / 4004`，签名不变；真机 release 包完成首页、独立图片识别、扫描 PDF 识别。
- 未覆盖：连续帧率采样、Web 应用构建、macOS。

## 四十二、第七轮改动文件

```
client/android/app/proguard-rules.pro       ML Kit 全量 keep 规则
client/lib/pages/intake_page.dart           徽标并入标题行、右栏自适应（紧凑模式）
client/windows/runner/flutter_window.cpp    WM_SETICON 设置窗口大小图标
client/windows/runner/main.cpp              AppUserModelID、默认窗口 1320×900
client/windows/runner/win32_window.cpp      最小窗口按 DPI 换算为 1080×700
client/pubspec.yaml                         版本 1.1.0+4，移除测试资源与 integration_test
installer/redpen.iss                        VersionInfoVersion 1.1.0.4、ChangesAssociations 图标刷新
docs/版本更新说明-1.1.0.md                   +4 修订、体积、versionCode 与校验和
docs/1.1.0-测试报告.md                       第七轮补充验证（OCR、排版、图标、窗口）
docs/1.1.0-发布验收.md                       修订项验收与发布条件闭环
docs/assets/1.1.0/                          新增首页、最小窗口、真机 OCR 截图
```





