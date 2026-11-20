# 红笔设计规范 · 1.1「墨线」

本文件是 1.1 起界面与组件的唯一设计依据。1.0 及之前的纸面／衬线／侧栏方案全部废弃，页面、组件和取值都以本文件与 `client/lib/design/` 为准。

- 设计方向：现代审阅工作台。冷白画布、纯白表面、墨蓝结构色、一道朱红强调色。
- 设计原则：内容优先；一个页面只保留一个主动作；用空间和字重分组，最后才用线；所有控件共用同一套几何和状态。
- 主视口：Windows 桌面（≥1000 逻辑像素）与 Android 手机（360–430 逻辑像素）。

---

## 1. 色彩系统

所有颜色定义在 `client/lib/design/tokens.dart` 的 `AppColors`，页面与组件不写裸色值。

### 1.1 表面与文字

| Token | 值 | 用途 |
|---|---|---|
| `canvas` | `#F2F4F7` | 应用画布 |
| `surface` | `#FFFFFF` | 卡片、顶栏、弹层 |
| `surfaceMuted` | `#F7F9FB` | 次级填充、说明块、输入底 |
| `surfaceSunken` | `#EDF1F5` | 分段控件轨道、进度槽 |
| `ink` | `#101820` | 主文字、数字 |
| `inkSecondary` | `#475666` | 正文、次要信息 |
| `inkTertiary` | `#6B7A88` | 辅助说明（白底对比度约 4.6:1） |
| `inkDisabled` | `#9AA7B4` | 禁用、占位、极弱信息 |

### 1.2 品牌与强调

| Token | 值 | 用途 |
|---|---|---|
| `brand` | `#1F3243` | 主按钮、品牌结构色（取自应用图标） |
| `brandHover` | `#2A4358` | 主按钮悬停 |
| `brandSoft` | `#E9EFF4` | 品牌浅底、标签 |
| `accent` | `#C04434` | 唯一强调色：主动作、选中、批注、风险红线 |
| `accentHover` | `#AA382A` | 强调色悬停 |
| `accentSoft` | `#FBECE9` | 强调浅底 |
| `border` / `borderStrong` | `#E3E8EE` / `#CBD4DD` | 默认边界 / 控件边界 |

规则：强调色只出现在「当前选中、主操作、风险标记」三类位置；普通卡片不加彩色边框、不加彩色阴影。

### 1.3 四级判定

| 等级 | 主色 | 浅底 | 说明 |
|---|---|---|---|
| 红线 | `#B23A2F` | `#FBEBE8` | 签字前必须解决 |
| 黄线 | `#946200` | `#FFF5DC` | 合法但明显不利 |
| 灰线 | `#51616F` | `#EFF3F6` | 需要补充信息 |
| 绿线 | `#2F6B4F` | `#E9F3ED` | 常规条款 |

状态不只靠颜色：标签文字、图标、位置同时表达等级。

---

## 2. 字体系统

只使用一套无衬线字族：Noto Sans SC（随包内嵌，OFL）。英文与数字回退到系统无衬线；比较型数字启用 `tabularFigures`。

| 角色 | 字号 / 字重 / 行高 | 使用位置 |
|---|---|---|
| Display | 42 / 700 / 1.14 | 交稿台主标题（桌面） |
| H1 | 30 / 700 / 1.24 | 交稿台主标题（手机） |
| H2 | 22 / 600 / 1.32 | 页面标题、报告结论 |
| H3 | 17 / 600 / 1.40 | 卡片标题、弹窗标题 |
| Body | 14.5 / 400 / 1.68 | 正文 |
| Body S | 13 / 400 / 1.62 | 卡片说明、列表副文 |
| Caption | 12 / 400 / 1.52 | 辅助信息、时间、来源 |
| Label | 11.5 / 600 / 1.30 + 0.6 字距 | 分区标签、状态标签 |
| Number | 24 / 700 / 1.15（等宽数字） | 统计数字 |

门槛：正文不小于 13px，辅助信息不小于 11px；中文标题行高不低于 1.2；窄屏禁止出现只剩 1–2 个字的孤行。

---

## 3. 间距、圆角、阴影、动效

- 间距：4 的倍数，档位 `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 56 / 80`。组内用 8–12，组间用 24–32。
- 圆角：`6`（小控件）/ `8`（标签、内嵌块）/ `10`（按钮、输入）/ `14`（卡片）/ `20`（弹窗、底部面板）/ 胶囊（标签、徽标）。
- 阴影：卡片只有一层极轻阴影；浮层（弹窗、底部面板）用 `AppShadow.overlay`；不使用彩色阴影。
- 动效：120ms（悬停、按压）、180ms（展开、分段切换）、280ms（页面内状态）、320ms（页面切换）。缓动统一 `easeOutCubic`。
- 边框：卡片 `1px border`；同一处分隔不叠线；卡片内不再套一圈描边盒。

---

## 4. 图标规范

- 应用图标：`assets/brand/app-icon.png`，与 Android adaptive icon、Windows `.ico`、Web favicon、manifest 图标同源；界面内品牌标识统一使用 `BrandMark`，不再手绘印章。
- 界面图标：统一使用 Material Rounded 一套；全部从 `AppIcons` 取，禁止直接写 `Icons.*` 或混用字符／Emoji。
- 尺寸档位：`16`（行内）、`18`（控件）、`22`（展示）、`28`（品牌/空状态）。图标尺寸约为相邻字号的 1.1–1.25 倍，并按行盒居中。
- 触控：手机端可点区域不小于 `44×44`；图标按钮选中态用浅强调底 + 强调色图标。
- 平台资产：Android 提供 legacy `ic_launcher(_round)`、adaptive foreground/background/monochrome；Windows 提供 16–256 多尺寸 ico；Web 提供 64 favicon 与 192/512 常规/可遮罩图标。

---

## 5. 组件库

目录：`client/lib/design/`

```
tokens.dart                 颜色、间距、圆角、阴影、时长、字体
app_theme.dart              Material 3 主题与组件默认皮肤
theme_config.dart           AppThemeConfig / AppThemeTokens（主题扩展位）
adaptive.dart               AppLayout compact / medium / expanded 与断点
commands.dart               AppCommand 扩展命令接口
icons.dart                  统一图标表与尺寸档位
foundation/                 BrandMark、BrandLockup、IconTile
components/
  button.dart               AppButton（5 种语义 × 3 种尺寸）、AppIconButton、AppLink、KeyHint
  tag.dart                  AppTag（7 种语义）、CountBadge
  card.dart                 AppCard、SectionHeader、StatTile、KeyValueRow、EmptyState
  banner.dart               AppBanner（行内提示）
  input.dart                AppSelect、AppField、AppSegmented
  dialog.dart               showAppDialog / showAppSheet、AppDialogSurface、AppDialogHeader、SheetHandle
  feedback.dart             AppToast、AppProgressBar、PulseDots
```

使用规则：

1. 页面不新增按钮、标签、卡片的一次性样式；缺能力时先扩展组件变体，并在至少两个位置成立。
2. 所有交互组件必须有默认、悬停、按下、聚焦、禁用、处理中状态；禁用态说明原因或保持可见但不可点。
3. 弹窗只用于阻断式决定；普通选择用底部面板或菜单；长内容用页面。
4. 页面里不再出现 `Border.all` 包裹的小卡片、渐变标题下划线、装饰性眉标线。

---

## 6. 布局与响应式

| 档位 | 宽度（逻辑像素） | 行为 |
|---|---|---|
| compact | < 760 | 单列；顶部 56 高品牌栏；底部固定操作栏；对话用底部面板 |
| medium | 760–999 | 单列；页面边距 24；可选择底部面板或弹窗 |
| expanded | ≥ 1000 | 桌面顶部导航（64 高）；交稿台两栏（≥1040）；报告双栏（报告 6 : 原文 5） |

- 页面边距：16 / 24 / 32；内容最大宽度 1180，报告最大 1440。
- 顶栏：左侧品牌与当前文档；中间三段导航；右侧本机状态、扩展命令、换一份、关于。
- 手机顶栏：品牌 + 风险徽标 + 关于 + 更多菜单；不放大标题、不叠加英文眉题。
- 主操作：桌面在固定底栏右侧（48 高），手机在底部安全区之上的固定栏（44+ 高）。
- 键盘：Ctrl+Enter 开始核对、Ctrl+O 导入、Ctrl+P 导出、Ctrl+Shift+C 复制报告、Esc 返回交稿台。

---

## 7. 扩展预留

1. **主题**：`AppThemeConfig` 集中控制品牌色、强调色、画布、表面与密度；`AppThemeTokens` 作为 `ThemeExtension` 挂在主题上。当前版本使用默认编译期配置，深色/换色只需新增配置并让自定义组件读取 `AppThemeTokens`，不需要改页面结构。
2. **命令插槽**：`AppCommand` + `AppShell(extraCommands: [...])` 可把新功能放进桌面顶栏或移动端更多菜单，外壳布局不变。
3. **响应式档位**：`AppBreakpoints` / `AppLayout` 预留 tablet、foldable、wide 场景；新页面按档位取值，不散落宽度判断。
4. **模块边界**：`design`（视觉与组件）→ `ui`（外壳与共享面板）→ `pages`（页面组合）→ `state`（业务状态）→ `services`（平台能力）。插件只依赖 `design` 与 `state` 的公开接口。
5. **扩展命令的稳定标识**：`AppCommand.id` 用于分发与埋点；新增页面级操作时优先使用命令插槽，不修改 `AppShell` 的布局代码。

---

## 8. 禁止事项

- 不使用衬线字体、米色纸面、深色侧栏、状态栏、装饰性分割线等 1.0 视觉特征。
- 不新增与 `AppColors` / `AppType` / `AppSpace` 平行的第二套取值。
- 不在卡片里重复描边、不在同一处分两次画线、不给普通卡片配彩色边框或彩色阴影。
- 不用 9–11px 的低对比文字承担关键信息；关键动作不使用纯图标而无无障碍名称。
- 不为一次性页面新建组件变体；先在现有组件上扩展语义。
