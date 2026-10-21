# TESTS.md — AI Agent 测试执行提示词

> 本文件是 AI 编码代理执行测试与验收的提示词。`AGENTS.md` 是架构与编码规范的唯一声明；本文件只约束测试策略、浏览器验证、失败排查与交付证据。两者冲突时以 `AGENTS.md` 为准；产品语义以各组件 `README.md` / `demo/` 为准。
>
> 你的目标不是“让测试变绿”，而是证明改动满足规格、没有回归，并留下可复核的证据。

---

## 1. 第一原则

1. **黑盒先行**：期望值必须从规格独立推导，禁止用实际输出回填断言。
2. **Red → Green → Refactor**：先写会失败的测试，再修源码，最后重构。
3. **测试行为，不测试实现**：断言对外可观察结果；不要为了覆盖率锁死私有方法或内部调用顺序。
4. **失败必须显性**：非法输入用 `throw new Error(...)`；测试要断言抛错，禁止静默 fallback、返回码、哨兵值。
5. **不得削弱断言**：测试失败时只修源码或规格；除非规格确实变更，禁止删断言、放宽匹配、改快照。
6. **Node 测逻辑，浏览器测 DOM**：仓库 vitest 是 `environment: 'node'`，没有 DOM。纯函数、token、resolver 用 Node；自定义元素、Shadow DOM、焦点、ARIA、媒体查询、动画、布局必须用真实浏览器验证。
7. **不引入 jsdom / happy-dom**：除非任务明确要求并获批准。不要为了“方便”把组件测试塞进 Node。
8. **每个改动都要有证据**：测试命令输出、tsc、build、静态 grep、浏览器场景、控制台状态；口头“应该可以”不算证据。
9. **只提交目标文件**：禁止 `git add -A` / `git add .`；提交前审核暂存区。
10. **主代理负责最终验收**：可以派 subagent 写测试、审计、提交，但必须复核其输出，不能把 subagent 的“已通过”直接当成证据。

---

## 2. 测试分层

| 层级 | 环境 | 适合验证 | 不适合验证 |
|---|---|---|---|
| 纯函数 / 算法 | vitest node | resolver、映射、token 展开、校验、排序、计算 | DOM、事件、焦点 |
| 样式生成 | vitest node | `CSSResult.cssText` 中的变量名、轴向、token 引用 | 实际布局、媒体查询 |
| 组件属性 / 构造 | vitest node | 默认值、property 映射、纯状态机 | `document.createElement`、渲染、ARIA 树 |
| 浏览器验证 | dev-app + Playwright / 真实 Chrome | 自定义元素升级、Shadow DOM、slots、焦点、键盘、ARIA、dialog、媒体查询、动画、视觉布局 | 大量数据算法 |
| 静态检查 | shell | 枚举残留、禁用 API、`tsc`、build | 运行时行为 |

**选择规则**：能在 Node 稳定验证的逻辑就写 Node spec；只要涉及 DOM/CSS/焦点/AT，就必须补浏览器验证，不能只用 mock 代替。

---

## 3. 必跑命令

在仓库根目录执行：

```bash
pnpm test
pnpm --filter @sandlada/mdc exec tsc --project tsconfig.json --noEmit --skipLibCheck
pnpm run build
```

定向运行单个 spec：

```bash
pnpm --filter @sandlada/mdc run test <spec-file-or-pattern>
```

浏览器验证：

```bash
pnpm --filter @sandlada/dev-app run dev -- --port 5199 --strictPort
```

- dev server 用后台方式启动；验证完成后按端口停止，不要让它常驻。
- 不要轮询后台输出；读一次就绪输出或等待完成通知。
- 每次浏览器验证使用**新导航**（可加 `?fresh=...` 缓存参数）；不要信任上一次页面残留的 HMR 状态。

---

## 4. Node 单测写法

### 4.1 文件位置与命名

- spec 放在被测源码同目录，命名 `*.spec.ts`。
- 纯函数测试放 `internal/*.spec.ts`；组件级测试放组件目录。
- 新文件使用 MIT 版权头（衍生 Google / Material Web 用 Apache-2.0）。

### 4.2 假对象要最小化

Base 容器/控制器测试常用结构化 fake，而不是完整 DOM：

```ts
const tab = {
    navigationScope: '',
    label: '',
    variant: 'bar-vertical',
    parentElement: { closest: () => container as unknown as Element },
}
```

原则：

- fake 只实现被测代码真正读取的字段/方法。
- 需要 `getAttribute` 时显式提供，不要偷偷依赖真实 DOM。
- 私有方法测试只在没有更好边界时使用；优先把逻辑抽成纯函数。
- 断言错误信息中的关键片段，不要只断言 `toThrow()`。

### 4.3 表驱动覆盖分支

映射、resolver、枚举转换用 `it.each` 覆盖全部合法组合和非法值：

```ts
const CASES = [
    ['collapsed', true, 'rail-vertical'],
    ['collapsed', false, 'rail-round'],
    ['xr', true, 'rail-xr-vertical'],
    ['xr', false, 'rail-xr-round'],
] as const
```

必须覆盖：

- 每个合法枚举；
- 有/无关键输入（如 label、icon、checked）；
- 空值、空白、重复值；
- 非法枚举 → `throw`；
- 原型链键（`constructor`、`toString`）→ 不得绕过校验（用 `Object.hasOwn` / `Map`）。

### 4.4 CSS 生成也要有回归测试

样式 token 变量写错，浏览器才会暴露。可用 `CSSResult.cssText` 在 Node 做静态回归：

```ts
const cssText = NavigationBarStyles.cssText
expect(cssText).toContain('padding-inline-start: var(--_horizontal-container-inline-leading-space)')
expect(cssText).not.toContain('shape-radius')
```

这类测试适合抓：padding 轴向互换、radius token 命名错误、变量前缀不一致、重复声明。

### 4.5 隔离全局状态

- 每个测试使用唯一 `navigation-scope`、唯一 `name`、唯一 ID。
- 模块级 `WeakMap`、全局 store、单例状态会在测试间残留；必要时在 `afterEach` 清理。
- 不要用 `global` / document 级共享 scope 的 fixture。
- 测试 DOM 浏览器 fixture 也要清理：`element.remove()`、关闭打开的 dialog、断开 observer。

### 4.6 Node 的边界

Node 不能证明：

- `document.createElement` 是否抛错（构造器规范）；
- 自定义元素是否真正升级；
- Shadow DOM 焦点/`delegatesFocus`；
- 原生 dialog 的 `showModal()` / `:modal` / top layer；
- `forced-colors` / `prefers-*` 媒体查询；
- 实际 padding/radius/布局；
- 动画与过渡。

这些必须进浏览器验证清单。

---

## 5. 浏览器验证清单

每次涉及组件/样式/交互的改动，至少检查相关项。

### 5.1 元素升级与生命周期

- `document.createElement('mdc-...')` 不抛 `NotSupportedError`。
- 解析器创建、`innerHTML`、`new Ctor()`、动态 append 四种路径都升级正常。
- 构造器内**不得**设置 attribute / children；初始 ARIA、tabindex 放到 `connectedCallback` / `firstUpdated`。
- 断开再重连：observer、transitionend、dialog top layer、焦点、滚动分割线恢复。
- 打开状态下断开重连：modal 仍为 modal；floating rail 仍打开；standard drawer 不被强制 modal。

### 5.2 焦点与键盘

- 从外部元素按 `Tab` 能进入当前 active tab。
- 同一 roving 组只有一个 Tab stop；再按 `Tab` 离开该组到下一个控件。
- `Shift+Tab` 反向；方向键在组内移动；`Space` / `Enter` 激活。
- 禁用项不可聚焦，且被 roving/方向键跳过。
- `document.activeElement` 是 host，`shadowRoot.activeElement` 是内层控件；不要混淆。
- `delegatesFocus` 的 host 若内层控件 `tabindex="-1"`，Chrome 会跳过 host；内层控件必须是真正的可聚焦目标。
- 不要用 synthetic `KeyboardEvent` 验证 Tab 顺序；用 Playwright 的 `page.keyboard.press`。
- 多步键盘/延时用 `browser_run_code_unsafe` + `page.waitForTimeout`；Code Mode 没有 `setTimeout`。

### 5.3 ARIA / 可访问名称

- 用可访问性快照/真实 DOM 检查内层 button/link 的名称。
- icon-only tab 必须有非空可访问名称（作者 `aria-label` 或可见 label）。
- 选中项用 `aria-current="page"`（导航目的地语义），不要给 button/link 加无效的 `aria-selected`。
- 不要给 tab role 加无效的 `aria-required`；form-associated `required` 走校验，不硬塞 ARIA。
- 宿主上的 `aria-*` 是否被 `mixinDelegatesAria` 移到 `data-*`；渲染点必须消费 `this.getAttribute('aria-label')`。
- 检查 AX 树是否出现无名 button、重复角色、缺少 tablist 上下文。
- 视觉状态不能只靠颜色：selected/disabled/focus 至少有一个非颜色线索。

### 5.4 Slots / 动态内容

- tab 放在 `mdc-navigation-rail-section` 内时，动态 append 仍获得 scope/variant。
- `slotchange` 不冒泡；section 内新增不会触发 rail 的默认 slotchange。用 `MutationObserver` 观察 subtree。
- 直接文本 label 变化（`textContent` 替换、文本节点 `data` 原位修改）要能更新 label。
- icon 内部文本不得被误当作 label。
- 作者显式 `label` 不能被自动文本观察覆盖。

### 5.5 Dialog / Modal

- floating rail / modal drawer 打开后 `dialog.matches(':modal') === true`。
- 背景元素不可聚焦（inert/top layer）。
- Tab/Shift+Tab 在 dialog 内首尾循环。
- 重要：rail/bar/drawer 的 tab 是 light DOM slotted 内容，原生 dialog 的 focus trap 不把它们算作 dialog 内部；需要自定义 Tab 循环守卫。
- `Escape`、scrim/backdrop 点击关闭；`returnValue` 不被 `"scrim"` / `"escape"` 污染；焦点恢复到触发元素。
- 关闭动画完整：先 `open=false` 等过渡，再 `dialog.close()`。
- `no-focus-trap` 必须真正降级为非模态，而不是只跳过首次 focus。
- 重连后 modal top layer 丢失时，用 `close()` + `showModal()` 恢复，不重复派发组件事件。

### 5.6 媒体查询与 a11y

用 Playwright `browser_emulate_media` 验证：

```ts
await browser_emulate_media({ forcedColors: 'active' })
await browser_emulate_media({ contrast: 'more' })
await browser_emulate_media({ reducedMotion: 'reduce' })
```

检查 `getComputedStyle`：

- forced-colors：选中 indicator = `Highlight`，文字/图标 = `CanvasText`/`HighlightText`，disabled = `GrayText`，边界可见。
- `prefers-contrast: more/less`：边界和文字对比符合预期。
- `prefers-reduced-motion`：`transition-duration` / `animation` 为 `0s` 或 `none`。
- `prefers-reduced-transparency`：scrim/半透明表面改为不透明；MCP 无该参数时用 CDP `Emulation.setEmulatedMedia`。
- 同时开启多个媒体特性时，确认 forced-colors 规则最终胜出。

**不要凭 `CSS.supports` 猜测**：移除 vendor prefix 前先验证目标 Chrome 是否支持标准属性。例如 `line-clamp` 在当前 Chrome 可能仍返回 `false`，此时保留 `-webkit-line-clamp` 是功能需要，不是旧设备托底。

### 5.7 布局与视觉

- 用 `getComputedStyle` 检查 padding 的 inline/block 轴向、border-radius、display/grid。
- 混合 `rail-vertical` / `rail-round` 时检查实际尺寸、标签可见性、图标居中。
- XR 胶囊圆角必须为 `Shape.Full`，不能 fallback 到 0。
- 用截图/AX snapshot 辅助，但不要只依赖截图判断可访问性。

### 5.8 事件与控制台

- 组件在 Shadow Root 内时，对外 `input` / `change` 必须 `composed: true` 才能穿透。
- 在 document/window 监听并断言 `detail`、`composed`、目标重定向。
- 新导航后注册 `error` 和 `unhandledrejection`，跑完场景再读取；不要读历史 HMR 错误。
- Lit 的 `willUpdate` 抛错可能以 unhandled rejection 出现，`window.addEventListener('error')` 不一定捕获；同时监听 `unhandledrejection` 或读取控制台。
- 任何 console error 都视为失败，即使测试命令通过。

---

## 6. 本次踩坑清单（回归重点）

| 症状 | 根因 | 正确做法 | 验证 |
|---|---|---|---|
| `document.createElement('mdc-...')` 抛 `NotSupportedError` | 构造器内 `setAttribute` / `tabIndex` | 初始 ARIA/tabindex 移到 `connectedCallback` / `firstUpdated` | 浏览器 createElement + parser + innerHTML |
| Tab 永远进不到 tab | 内层控件固定 `tabindex="-1"`，`delegatesFocus` host 被 Chrome 跳过 | 内层原生控件持有 roving tabindex；host 不做 Tab stop | 从外部 Tab、单组单停靠、Shift+Tab |
| 原生 dialog 的 Tab 会跑到 BODY | slotted light DOM 不在 dialog DOM containment 内 | 自定义 `trapTabKey`，按 rail 内可聚焦元素首尾循环 | 单 tab、多控件、Shift+Tab |
| 选中态屏幕阅读器读不到 | 给 button 写 `aria-selected`，role=tab 宿主无 tablist | 内层原生控件 + `aria-current="page"` | AX 快照 + `getAttribute('aria-current')` |
| icon-only tab 无名 | 名称只到宿主/data 属性，没到内层 button | `accessibleLabel` 镜像到 `<a>/<button>` | AX 快照显示名称 |
| label 被 icon 文本污染 | `textContent` 包含子元素文本 | 只读直接文本节点；`readDirectLabel` | icon-only 仍为 round |
| 动态文本不更新 label | 只在 connected 读一次 | `MutationObserver` 观察直接文本；显式 label 后停止 | `textContent` 与原位 `data` 修改 |
| section 内动态 tab 无 scope/variant | slotchange 不冒泡 | `MutationObserver` 观察 subtree | 动态 append 后检查 scope+variant |
| 演示页/测试互相污染选中态 | 所有 fixture 共用 `global` scope | 每个 fixture 唯一 `navigation-scope`，清理 DOM | 多 fixture 并行 |
| 同组重复 value 多选/闪烁 | store 按 `(scope,value)` 匹配 | 同容器同 name 的 value 必须唯一，fail-fast | 重复值抛错；跨容器重复仍允许 |
| `variant="constructor"` 绕过校验 | `in` 走原型链 | `Object.hasOwn` / `Map` | 非法原型键抛错 |
| 测试绿但控制台报错 | 只跑 vitest，没看浏览器 | 每次改 DOM/焦点/样式都做浏览器冒烟 | 新导航 + error/unhandledrejection |
| HMR 导致源码与页面不一致 | 旧模块缓存 | 重启 dev server / 新导航 / 缓存参数 | 同一场景重跑两次 |
| modal drawer 重连后不再 modal | 原生 dialog 脱离文档丢失 top layer | `close()` + `showModal()` 恢复 | remove + append 后 `:modal` |
| padding/radius 错 | CSS 变量轴向/命名错误 | 样式生成用 `.cssText` 回归 + 浏览器计算样式 | horizontal/vertical-xr |

---

## 7. 失败排查顺序

1. **确认失败是真实的**：用新页面/新进程复现；排除 HMR、旧 bundle、缓存。
2. **确认测试层级正确**：Node 测 DOM 行为本身就是错层；补浏览器验证。
3. **读完整错误**：堆栈、元素、属性、期望/实际；不要只看第一行。
4. **定位是源码还是规格**：规格变更才改断言；否则修源码。
5. **最小化复现**：删到最小 DOM/最小输入；用 fixture 而不是整页。
6. **修复根因**：不要加 `setTimeout`、不要吞异常、不要用 `try/catch` 掩盖。
7. **加回归测试**：能在 Node 加的加 Node；DOM/焦点/模态加浏览器 fixture 或记录手工验证步骤。
8. **重跑全部门禁**：test → tsc → build → 静态检查 → 浏览器。

---

## 8. 提交与交付证据

每完成一个修复批次：

1. 运行并记录：
   - `pnpm test`（文件数/用例数）
   - `tsc --noEmit`
   - `pnpm run build`
   - 相关静态 grep
   - 浏览器场景与控制台状态
2. 只暂存目标文件；`git diff --cached --name-status` 审核。
3. 提交信息使用仓库约定：`fix(scope): message` / `refactor(...)` / `test(...)`。
4. 不 push，除非用户明确要求。
5. 保留用户已有的未提交修改和未跟踪目录，不要 `git add -A`。
6. 报告：
   - 改了什么；
   - 测试/tsc/build 实际输出；
   - 浏览器验证了哪些场景；
   - 临时 dev server 是否已关闭；
   - 未解决的已知问题（如有）。

---

## 9. AI Agent 快速检查清单

- [ ] 期望值来自规格，不是实际输出
- [ ] 新行为有对应 spec；纯逻辑在 Node，DOM/焦点在浏览器
- [ ] 非法输入有 `throw` 断言
- [ ] 映射/枚举用表驱动覆盖全部组合
- [ ] CSS token/轴向有 `.cssText` 或计算样式回归
- [ ] 自定义元素构造器无 attribute/children
- [ ] Tab 能进入、单组单停靠、方向键/Space/Enter 正常
- [ ] icon-only 有可访问名称；选中态 `aria-current` 正确
- [ ] dialog modal/inert/焦点陷阱/关闭恢复正确
- [ ] 动态 slot/文本/属性变化有 observer 覆盖
- [ ] 媒体查询用 emulateMedia 验证
- [ ] 跨 shadow 事件 `composed`
- [ ] 控制台无 error/unhandledrejection
- [ ] `pnpm test`、tsc、build、静态检查全绿
- [ ] dev server 已关闭
- [ ] 只提交目标文件，未 push
