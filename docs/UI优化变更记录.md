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
