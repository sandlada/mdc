import { LitElement, type PropertyValues, css, html, nothing, unsafeCSS } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'

// 定义 CSS 自定义属性接口
const CSS_VARS = {
    TRACK_COLOR: 'var(--md-sys-color-surface-container-highest, #E1E3E1)',
    INDICATOR_COLOR: 'var(--md-sys-color-primary, #006C4C)',
    TRACK_HEIGHT: 'var(--md-linear-progress-track-height, 4px)',
    WAVE_AMPLITUDE: 'var(--md-linear-progress-wave-amplitude, 5px)',
    WAVE_LENGTH: 'var(--md-linear-progress-wave-length, 20px)',
    BORDER_RADIUS: 'var(--md-linear-progress-shape, 4px)', // 线性模式下的圆角
}

function generateSineWavePath(
    width: number,
    height: number,
    amplitude: number,
    wavelength: number
): string {
    // 为了让动画循环无缝衔接，我们需要多绘制一个波长
    const totalWidth = width + wavelength
    const midY = height / 2

    let d = `M 0 ${midY}`

    // 使用三次贝塞尔曲线 (Cubic Bezier) 拟合正弦波
    // 每个周期分两段曲线绘制：上波峰和下波谷
    for (let x = 0; x < totalWidth; x += wavelength) {
        const q = wavelength / 4 // 四分之一周期
        const h = wavelength / 2 // 半周期

        // 第一段：向上拱起 (控制点在上方)
        // CP1: (x + q, midY - amp), CP2: (x + 2q, midY - amp), End: (x + h, midY)
        // 注意：这里为了简化计算和提升性能，使用平滑的正弦近似控制点算法
        // 控制点 Y 轴偏移约等于振幅 * 1.33 可以很好地拟合圆形正弦
        const cY = amplitude * 1.35

        d += ` C ${x + q} ${midY - cY}, ${x + q} ${midY - cY}, ${x + h} ${midY}`

        // 第二段：向下凹陷 (控制点在下方)
        d += ` C ${x + h + q} ${midY + cY}, ${x + h + q} ${midY + cY}, ${x + wavelength} ${midY}`
    }

    return d
}

@customElement('mdc-linear-progress-t')
export class MdLinearProgress extends LitElement {
    static override styles = css`
    :host {
      display: block;
      position: relative;
      /* 默认尺寸，由外部决定宽度 */
      width: 100%;
      /* 高度需要容纳波浪的振幅，如果不为波浪则为轨道高度 */
      contain: content;
    }

    /* 内部容器 */
    .root {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
    }

    svg {
      width: 100%;
      /* 确保波浪溢出部分不可见 (但在做动画时需要计算好) */
      overflow: hidden;
      /* 让 SVG 撑满 host */
      height: 100%;
    }

    /* 轨道和指示器的通用样式 */
    .path {
      fill: none;
      stroke-linecap: round;
      transition: stroke 0.2s; /* 颜色过渡 */
    }

    .track {
      stroke: ${unsafeCSS(CSS_VARS.TRACK_COLOR)};
    }

    .indicator {
      stroke: ${unsafeCSS(CSS_VARS.INDICATOR_COLOR)};
    }

    /* 隐藏模式 */
    :host([hidden]) {
      display: none;
    }
  `;

    // --- Public Properties ---

    @property({ type: Number }) value = 0; // 0 to 1
    @property({ type: Number }) max = 1;
    @property({ type: Boolean, reflect: true }) indeterminate = false;
    @property({ type: Boolean, reflect: true }) wavy = false;
    @property({ type: Array }) stops: number[] = []; // e.g., [0.2, 0.5]
    @property({ type: Number }) buffer = 0; // 0 to 1

    // --- Internal State ---

    @state() private _width = 0;
    @state() private _height = 0;
    @state() private _pathD = '';

    // 用于计算波浪参数的数值（从 CSS 变量解析或默认）
    private _amplitude = 5;
    private _wavelength = 20;
    private _strokeWidth = 4;

    // --- DOM Elements ---

    @query('svg') private _svgEl!: SVGSVGElement
    @query('.indicator') private _indicatorEl!: SVGPathElement
    @query('.root') private _rootEl!: HTMLElement

    // --- Observers & Animations ---

    private _resizeObserver: ResizeObserver | null = null;
    private _waveAnimation: Animation | null = null;
    private _linearIndeterminateAnimation: Animation | null = null;

    // --- Lifecycle ---

    override connectedCallback() {
        super.connectedCallback()
        // 监听容器尺寸变化以重新绘制波浪
        this._resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const rect = entry.contentRect
                this._width = rect.width
                this._height = rect.height || (this.wavy ? 16 : 4) // 默认高度兜底
                this._updatePathGeometry()
            }
        })
        this._resizeObserver.observe(this)
    }

    override disconnectedCallback() {
        super.disconnectedCallback()
        this._resizeObserver?.disconnect()
        this._stopAnimations()
    }

    protected override updated(changedProperties: PropertyValues) {
        // 当影响几何形状的属性变化时，重新计算路径
        if (changedProperties.has('wavy') || changedProperties.has('_width')) {
            // 读取 CSS 变量中的配置 (在实际项目中可能需要 getComputedStyle)
            // 这里简化处理，若 wavy 开启，设置特定高度
            if (this.wavy) {
                this.style.height = `calc(${CSS_VARS.WAVE_AMPLITUDE} * 2 + ${CSS_VARS.TRACK_HEIGHT})`
                this._readCssVars()
            } else {
                this.style.height = CSS_VARS.TRACK_HEIGHT
                this._strokeWidth = 4 // Default
            }
            this._updatePathGeometry()
        }

        // 处理动画状态切换
        if (changedProperties.has('indeterminate') || changedProperties.has('wavy')) {
            this._manageAnimations()
        }
    }

    // --- Logic ---

    private _readCssVars() {
        // 在真实场景中，这里应该用 getComputedStyle(this) 获取 CSS 变量值并 parseFloat
        // 这里为了演示直接写死默认值逻辑，你可以在这里接入 CSS Token 解析逻辑
        this._amplitude = 5
        this._wavelength = 40
        this._strokeWidth = 4
    }

    private _updatePathGeometry() {
        if (this._width === 0) return

        if (this.wavy) {
            // 步骤 1: 生成波浪路径
            this._pathD = generateSineWavePath(
                this._width,
                this._height,
                this._amplitude,
                this._wavelength
            )
        } else {
            // 步骤 1 (线性): 生成直线路径
            const midY = this._height / 2
            this._pathD = `M 0 ${midY} L ${this._width} ${midY}`
        }
    }

    private _manageAnimations() {
        this._stopAnimations()

        if (!this.indeterminate) return

        if (this.wavy) {
            // Wavy Indeterminate: 波浪流动动画
            // 原理：将 path 向左平移一个波长的距离，然后循环
            if (this._indicatorEl) {
                this._waveAnimation = this._indicatorEl.animate(
                    [
                        { transform: 'translateX(0px)' },
                        { transform: `translateX(-${this._wavelength}px)` }
                    ],
                    {
                        duration: 600, // 流动速度
                        iterations: Infinity,
                        easing: 'linear' // 必须线性，否则循环处有顿挫
                    }
                )
            }
        } else {
            // Linear Indeterminate: 经典的 Material 两段式动画
            // 由于我们是用 SVG Path，不能像 div 那样简单 scale，最好用 stroke-dasharray 或者 translate
            // 这里简化使用 CSS class 或 WAAPI 做 translateX + scaleX 的模拟
            // 为了精确控制，推荐 CSS keyframes，或者复杂的 WAAPI
            // 这里展示 WAAPI 控制 SVG ClipPath 或者 Mask 的位移会更精确，但最简单的是利用 CSS
            // 略：为保持代码简洁，这里假设线性 Indeterminate 仅做简单的左右扫描
        }
    }

    private _stopAnimations() {
        this._waveAnimation?.cancel()
        this._linearIndeterminateAnimation?.cancel()
        this._waveAnimation = null
        this._linearIndeterminateAnimation = null
    }

    // --- Rendering ---

    // 渲染断点 Mask
    private _renderStopsMask() {
        if (this.stops.length === 0) return nothing

        const stopWidth = 4 // 断点间隙宽度 px

        return html`
      <mask id="stops-mask">
        <!-- 白色区域显示内容 -->
        <rect x="0" y="0" width="100%" height="100%" fill="white" />
        <!-- 黑色区域隐藏内容 (断点) -->
        ${this.stops.map(stopVal => {
            // stopVal 是 0-1 的比例
            const x = stopVal * this._width
            return html`<rect x="${x - stopWidth / 2}" y="0" width="${stopWidth}" height="100%" fill="black" />`
        })}
      </mask>
    `
    }

    // 渲染进度裁剪区域 (用于 Determinate 状态)
    private _renderProgressClip() {
        // 进度比例
        const progressRatio = Math.min(Math.max(this.value / this.max, 0), 1)
        const progressPercent = progressRatio * 100

        // 如果是 Indeterminate 且是波浪，我们显示全长波浪并让它动起来
        // 如果是 Indeterminate 且是线性，通常通过 CSS 动画控制，这里默认全宽
        const width = this.indeterminate ? '100%' : `${progressPercent}%`

        return html`
      <clipPath id="progress-clip">
        <rect x="0" y="0" width="${width}" height="100%" />
      </clipPath>
    `
    }

    override render() {
        // 动态内联样式：用于控制 SVG 描边宽度
        const strokeStyle = { strokeWidth: `${this._strokeWidth}px` }

        return html`
      <div class="root" role="progressbar"
           aria-valuemin="0"
           aria-valuemax="${this.max}"
           aria-valuenow="${this.indeterminate ? nothing : this.value}">

        <svg part="svg">
          <defs>
            ${this._renderStopsMask()}
            ${this._renderProgressClip()}
          </defs>

          <!-- 1. 轨道层 (Track) -->
          <!-- 应用 stops-mask，如果有断点，轨道也会被打断 -->
          <path
            class="path track"
            part="track"
            d="${this._pathD}"
            style=${this._styleMap(strokeStyle)}
            mask="url(#stops-mask)"
          ></path>

          <!-- 2. 指示器层 (Indicator) -->
          <!-- 应用 progress-clip (控制长度) 和 stops-mask (控制断点) -->
          <path
            class="path indicator"
            part="indicator"
            d="${this._pathD}"
            style=${this._styleMap(strokeStyle)}
            clip-path="url(#progress-clip)"
            mask="url(#stops-mask)"
          ></path>
        </svg>
      </div>
    `
    }

    // 简单的 styleMap 辅助函数 (如果未引入 lit/directives/style-map.js)
    private _styleMap(styles: Record<string, string>) {
        return Object.entries(styles).map(([k, v]) => `${k}:${v}`).join(';')
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'md-linear-progress': MdLinearProgress
    }
}
