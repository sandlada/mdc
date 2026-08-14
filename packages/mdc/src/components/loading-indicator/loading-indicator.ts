/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * `mdc-loading-indicator` — the MD3 Expressive morphing-shape loading indicator.
 *
 * The indeterminate form morphs through the MD3E shape sequence
 * (SoftBurst → Cookie9Sided → Pentagon → Pill → Sunny → Cookie4Sided → Oval)
 * with a spring-driven morph between consecutive shapes, a short hold on each
 * shape, an extra 90° spin per completed morph, and a continuous global
 * rotation — mirroring the Jetpack Compose `LoadingIndicator` and the Android
 * Views `LoadingIndicatorDrawable` animation parameters. The determinate form
 * drives a circle → SoftBurst morph from `progress`.
 *
 * Geometry: every shape is a radial function sampled at uniform angles, so all
 * shapes share the same point count and morphing reduces to a per-point lerp.
 * The result is rendered as a single closed SVG path (a dense polyline reads
 * as a smooth curve at the 38px active size).
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../utils/aria/aria'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import {
    LOADING_INDICATOR_COMPLETE_EVENT,
    type ILoadingIndicator,
    type ILoadingIndicatorCompleteDetail,
    type LoadingIndicatorVariant,
} from './loading-indicator.interface'
import { LoadingIndicatorStyles } from './loading-indicator.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-loading-indicator': MDCLoadingIndicator
    }
}

// ── geometry: MD3E morphing shapes ───────────────────────────────────────────

const SAMPLE_COUNT = 72
const TWO_PI = Math.PI * 2

type Point = [number, number]
type Shape = Point[]

/** Spring driving the per-shape morph (values from the Android / Compose impl). */
const SPRING_STIFFNESS = 200
const SPRING_DAMPING_RATIO = 0.6
const SPRING_DAMPING = 2 * SPRING_DAMPING_RATIO * Math.sqrt(SPRING_STIFFNESS)
/** Hold time (s) between two consecutive morphs. */
const MORPH_INTERVAL_S = 0.65
/** Duration (s) of one full 360° rotation of the whole sequence. */
const GLOBAL_ROTATION_S = 4.666
/** Extra clockwise spin (°) contributed by each completed morph. */
const PER_MORPH_SPIN = 90

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/**
 * Sample a radius function at `SAMPLE_COUNT` uniform angles, then normalize so
 * every point sits inside (or on) the unit circle. Normalizing by the
 * circumradius — rather than the axis-aligned bounding box — keeps the shape
 * inside the viewBox under any rotation, which is exactly the "active size
 * fitted inside the container with rotation headroom" behavior of the spec.
 */
function sampleShape(radiusAt: (θ: number) => number): Shape {
    const points: Point[] = []
    let maxRadius = 0
    for (let i = 0; i < SAMPLE_COUNT; i++) {
        const θ = (i / SAMPLE_COUNT) * TWO_PI
        const r = radiusAt(θ)
        points.push([Math.cos(θ) * r, Math.sin(θ) * r])
        maxRadius = Math.max(maxRadius, r)
    }
    if (!maxRadius) return points
    return points.map(([x, y]) => [x / maxRadius, y / maxRadius])
}

/**
 * Radius of a regular n-gon whose vertices reach radius 1. `undulation` adds a
 * gentle scallop at each vertex to soften the "cookie" shapes.
 */
const polygonRadius = (n: number, undulation = 0) => (θ: number) => {
    const sector = ((θ % (TWO_PI / n)) + TWO_PI / n) % (TWO_PI / n)
    const base = Math.cos(Math.PI / n) / Math.cos(sector - Math.PI / n)
    return base * (1 + undulation * Math.cos(n * θ))
}

/** Radius of an ellipse with half-axes `rx` × `ry`. */
const ellipseRadius = (rx: number, ry: number) => (θ: number) =>
    (rx * ry) / Math.hypot(ry * Math.cos(θ), rx * Math.sin(θ))

/**
 * A horizontal capsule, described by its perimeter and re-sampled to uniform
 * angles so it can morph with the radial shapes.
 */
function capsuleShape(halfLength: number, capRadius: number): Shape {
    const perimeter: Point[] = []
    const steps = 16
    // Right cap (bottom → top on the +x side).
    for (let i = 0; i < steps; i++) {
        const a = -Math.PI / 2 + (i / steps) * Math.PI
        perimeter.push([halfLength + capRadius * Math.cos(a), capRadius * Math.sin(a)])
    }
    // Top edge (right → left).
    for (let i = 0; i < steps; i++) {
        perimeter.push([halfLength - (i / steps) * halfLength * 2, capRadius])
    }
    // Left cap (top → bottom on the −x side).
    for (let i = 0; i < steps; i++) {
        const a = Math.PI / 2 + (i / steps) * Math.PI
        perimeter.push([-halfLength + capRadius * Math.cos(a), capRadius * Math.sin(a)])
    }
    // Bottom edge (left → right).
    for (let i = 0; i < steps; i++) {
        perimeter.push([-halfLength + (i / steps) * halfLength * 2, -capRadius])
    }
    return radialize(perimeter)
}

/**
 * Convert a convex, origin-containing perimeter into a uniform-angle radius
 * sample: map each point to polar, sort by angle, then resample `r(θ)` at the
 * shared uniform angles via linear interpolation.
 */
function radialize(perimeter: Point[]): Shape {
    const radial = perimeter.map(([x, y]) => ({
        t: (Math.atan2(y, x) + TWO_PI) % TWO_PI,
        r: Math.hypot(x, y),
    })).sort((a, b) => a.t - b.t)
    const m = radial.length
    const radiusAt = (θ: number) => {
        if (θ <= radial[0].t) return radial[0].r
        if (θ >= radial[m - 1].t) return radial[m - 1].r
        let lo = 0
        let hi = m - 1
        while (hi - lo > 1) {
            const mid = (lo + hi) >> 1
            if (radial[mid].t <= θ) lo = mid
            else hi = mid
        }
        const a = radial[lo]
        const b = radial[hi]
        const span = b.t - a.t || 1
        return a.r + (b.r - a.r) * ((θ - a.t) / span)
    }
    return sampleShape(radiusAt)
}

/**
 * The MD3E indeterminate shape sequence, matching the Compose
 * `IndeterminateIndicatorPolygons`: SoftBurst, Cookie9Sided, Pentagon, Pill,
 * Sunny, Cookie4Sided, Oval.
 */
const INDETERMINATE_SHAPES: Shape[] = [
    sampleShape((θ) => 1 + 0.38 * Math.cos(4 * θ)),                            // SoftBurst
    sampleShape(polygonRadius(9, 0.08)),                                       // Cookie9Sided
    sampleShape(polygonRadius(5)),                                             // Pentagon
    capsuleShape(0.5, 0.5),                                                    // Pill
    sampleShape((θ) => 1 + 0.5 * Math.pow(Math.max(0, Math.cos(6 * θ)), 0.6)), // Sunny
    sampleShape(polygonRadius(4, 0.1)),                                        // Cookie4Sided
    sampleShape(ellipseRadius(1, 0.82)),                                       // Oval
]

/** The determinate sequence: a circle morphing into SoftBurst. */
const DETERMINATE_SHAPES: Shape[] = [
    sampleShape(() => 1),
    INDETERMINATE_SHAPES[0],
]

/** Linear interpolation between two same-count shapes. */
function morphShape(a: Shape, b: Shape, t: number): Shape {
    return a.map(([ax, ay], i) => [
        ax + (b[i][0] - ax) * t,
        ay + (b[i][1] - ay) * t,
    ])
}

/** Render a shape as a dense closed polyline (reads as a smooth curve). */
function shapeToPath(points: Shape): string {
    if (!points.length) return ''
    let d = `M ${points[0][0].toFixed(4)} ${points[0][1].toFixed(4)}`
    for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i][0].toFixed(4)} ${points[i][1].toFixed(4)}`
    }
    return `${d} Z`
}

// ── component ────────────────────────────────────────────────────────────────

/**
 * @element mdc-loading-indicator
 *
 * MD3 Expressive loading indicator. Runs the looping morph-shape sequence when
 * `indeterminate` is set, or tracks `progress` (0–1) as a determinate
 * circle → SoftBurst morph that rotates −180° across the full range.
 *
 * @version Material Design 3 - Expressive
 *
 * @link https://m3.material.io/components/loading-indicator/overview
 */
@customElement('mdc-loading-indicator')
export class MDCLoadingIndicator
    extends composeMixin(mixinDelegatesAria)(LitElement)
    implements ILoadingIndicator {

    static override styles = LoadingIndicatorStyles

    /** When set, loops the indeterminate morph instead of tracking `progress`. */
    @property({ type: Boolean, reflect: true })
    public indeterminate = false

    /** Determinate progress, `0`–`1` (mirrored by `aria-valuenow`). */
    @property({ type: Number })
    public progress = 0

    /**
     * MD3 color-role scheme: `'primary'` (default) | `'secondary'` |
     * `'tertiary'` | `'error'` | `'surface'`.
     */
    @property({ type: String, reflect: true })
    public variant: LoadingIndicatorVariant = 'primary'

    /** When set, draws the fully-rounded container behind the shape. */
    @property({ type: Boolean, reflect: true })
    public contained = false

    /** Animation-rate multiplier for the indeterminate form (default `1`). */
    @property({ type: Number, reflect: true })
    public speed = 1

    // Indeterminate animation state.
    private rafId: number | null = null
    private lastFrameTime = 0
    private morphIndex = 0
    private springPos = 0
    private springVel = 0
    private holdElapsed = 0
    private springRunning = false
    private rotationTarget = 0
    private globalRotation = 0
    private reducedMotion = false
    private reducedMotionQuery: MediaQueryList | null = null
    private completeFired = false

    public override connectedCallback(): void {
        super.connectedCallback()
        if (isServer) return
        const query = matchMedia('(prefers-reduced-motion: reduce)')
        this.reducedMotionQuery = query
        this.reducedMotion = query.matches
        query.addEventListener('change', this.handleReducedMotionChange)
        if (this.indeterminate) this.startAnimation()
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        if (isServer) return
        this.reducedMotionQuery?.removeEventListener('change', this.handleReducedMotionChange)
        this.reducedMotionQuery = null
        this.stopAnimation()
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        if (changedProperties.has('indeterminate')) {
            if (this.indeterminate) {
                // Completion is meaningless while the indicator loops.
                this.completeFired = true
                this.startAnimation()
            } else {
                this.stopAnimation()
                this.completeFired = false
            }
        }
        if (changedProperties.has('progress') && this.progress < 1) {
            this.completeFired = false
        }
        if (!this.indeterminate && !this.completeFired && this.progress >= 1) {
            this.completeFired = true
            this.dispatchEvent(new CustomEvent<ILoadingIndicatorCompleteDetail>(
                LOADING_INDICATOR_COMPLETE_EVENT,
                { detail: { value: 1 }, bubbles: true, composed: true },
            ))
        }
    }

    protected override render(): TemplateResult {
        const { ariaLabel } = this as AriaMixinStrict
        const render = this.computeRender()
        const classes = classMap({
            'container': true,
            'contained': this.contained,
            'indeterminate': this.indeterminate,
            // The color-role class drives the bg / fill via CSS (no inline
            // style): the variant class on the container re-keys the internal
            // color tokens that .background and .indicator path consume.
            [`variant-${this.variant}`]: true,
        })
        return html`
            <div
                class="${classes}"
                role="progressbar"
                aria-label="${ariaLabel || nothing}"
                aria-valuemin="0"
                aria-valuemax="1"
                aria-valuenow=${this.indeterminate ? nothing : this.progress}
            >
                <span class="background" aria-hidden="true"></span>
                <svg class="indicator" viewBox="-1.1 -1.1 2.2 2.2" aria-hidden="true">
                    <path d=${render.path} transform="rotate(${render.rotation.toFixed(2)})" />
                </svg>
            </div>
        `
    }

    // ── private ───────────────────────────────────────────────────────────────

    /** The path and rotation for the current frame or progress value. */
    private computeRender(): { path: string; rotation: number } {
        const shapes = this.indeterminate ? INDETERMINATE_SHAPES : DETERMINATE_SHAPES
        let index: number
        let t: number
        let rotation: number
        if (this.indeterminate) {
            index = this.morphIndex % shapes.length
            t = this.springPos
            // The per-morph 90° spin plus the accumulated target plus the
            // continuous global rotation (Compose: rotate(morphProgress * 90 +
            // morphRotationTargetAngle + globalRotation)).
            rotation = this.globalRotation + this.rotationTarget + t * PER_MORPH_SPIN
        } else {
            const raw = clamp(this.progress, 0, 1) * shapes.length
            index = Math.min(Math.floor(raw), shapes.length - 1)
            // The last shape holds steady for the remainder of the progress.
            t = index === shapes.length - 1 ? 0 : raw - index
            rotation = -clamp(this.progress, 0, 1) * 180
        }
        const next = shapes[(index + 1) % shapes.length]
        const path = shapeToPath(morphShape(shapes[index], next, clamp(t, 0, 1.1)))
        return { path, rotation }
    }

    private startAnimation(): void {
        if (this.rafId !== null) return
        if (this.reducedMotion) {
            // Reduced motion: hold a static frame instead of animating.
            this.requestUpdate()
            return
        }
        this.lastFrameTime = performance.now()
        this.rafId = requestAnimationFrame(this.frame)
    }

    private stopAnimation(): void {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId)
            this.rafId = null
        }
    }

    private readonly frame = (now: number) => {
        if (this.rafId === null) return
        const dt = Math.min((now - this.lastFrameTime) / 1000, 0.05)
        this.lastFrameTime = now
        this.stepIndeterminate(dt)
        this.requestUpdate()
        this.rafId = requestAnimationFrame(this.frame)
    }

    /**
     * Advance the indeterminate morph: spring the shape toward the next one,
     * hold on each shape, accumulate the per-morph spin and the continuous
     * global rotation.
     */
    private stepIndeterminate(dt: number): void {
        // The rate multiplier scales the whole animation timeline — morph
        // spring, hold, per-morph spin and global rotation — so speed=2 runs
        // twice as fast and 0 pauses the loop. Clamped to >= 0 so a negative
        // speed pauses instead of reversing (unstable) the spring.
        const t = Math.max(this.speed, 0) * dt
        if (this.springRunning) {
            const target = 1
            // Semi-implicit Euler integration of the underdamped spring
            // (damping ratio 0.6), giving the characteristic soft overshoot.
            const accel = -SPRING_STIFFNESS * (this.springPos - target) - SPRING_DAMPING * this.springVel
            this.springVel += accel * t
            this.springPos += this.springVel * t
            if (Math.abs(this.springPos - target) < 0.001 && Math.abs(this.springVel) < 0.001) {
                this.springPos = 1
                this.springVel = 0
                this.springRunning = false
                this.holdElapsed = 0
            }
        } else {
            this.holdElapsed += t
            if (this.holdElapsed >= MORPH_INTERVAL_S) {
                this.morphIndex = (this.morphIndex + 1) % INDETERMINATE_SHAPES.length
                this.springPos = 0
                this.springVel = 0
                this.springRunning = true
                this.rotationTarget = (this.rotationTarget + PER_MORPH_SPIN) % 360
            }
        }
        this.globalRotation = (this.globalRotation + (360 / GLOBAL_ROTATION_S) * t) % 360
    }

    private readonly handleReducedMotionChange = (event: MediaQueryListEvent) => {
        this.reducedMotion = event.matches
        if (this.reducedMotion) {
            this.stopAnimation()
            this.requestUpdate()
        } else if (this.indeterminate) {
            this.startAnimation()
        }
    }
}
