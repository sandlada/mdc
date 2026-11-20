/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * `mdc-wavy-progress-indicator` — Material Design 3 Expressive wavy progress
 * indicator, faithfully replicating Jetpack Compose's
 * `LinearWavyProgressIndicator` and `CircularWavyProgressIndicator`.
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../utils/aria/aria'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import {
    AmplitudeTransitionDurationMs,
    buildCircularWavyPath,
    buildLinearWavyPath,
    clamp01,
    computeCapProtrusion,
    computeCircularIndeterminateArc,
    computeCircularTrackGapAngle,
    computeLinearIndeterminateSegments,
    computeTargetAmplitude,
    stepAmplitudeTransition,
    stepSpring,
    wrapPositiveModulo,
    type AmplitudeTransition,
    type SpringState,
} from './internal/wavy-math'
import {
    type IMDCWavyProgressIndicator,
    type WavyAmplitudeProvider,
    type WavyProgressIndicatorCircularSizes,
    type WavyProgressIndicatorStrokeCaps,
    type WavyProgressIndicatorVariants,
} from './wavy-progress-indicator.interface'
import { WavyProgressIndicatorStyles } from './wavy-progress-indicator.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-wavy-progress-indicator': MDCWavyProgressIndicator
    }
}

interface ResolvedMetrics {
    width: number
    height: number
    strokeWidth: number
    trackStrokeWidth: number
    gap: number
    stopSize: number
    maxAmplitude: number
    wavelength: number
}

@customElement('mdc-wavy-progress-indicator')
export class MDCWavyProgressIndicator
    extends composeMixin(mixinDelegatesAria)(LitElement)
    implements IMDCWavyProgressIndicator {

    static override styles = WavyProgressIndicatorStyles
    static override shadowRootOptions: ShadowRootInit = { mode: 'open', delegatesFocus: false }

    // ── Public API ────────────────────────────────────────────────────────────

    @property({ type: String, reflect: true })
    public variant: WavyProgressIndicatorVariants = 'linear'

    @property({ type: Number })
    public value = 0

    @property({ type: Number })
    public max = 1

    @property({ type: Boolean, reflect: true })
    public indeterminate = false

    @property({ type: String, reflect: true, attribute: 'circular-size' })
    public circularSize: WavyProgressIndicatorCircularSizes = 'medium'

    @property({ type: Number })
    public wavelength: number | null = null

    @property({ type: Number, attribute: 'wave-speed' })
    public waveSpeed: number | null = null

    @property({ type: Number, attribute: 'wave-amplitude' })
    public waveAmplitude: number | null = null

    @property({ attribute: false })
    public amplitude: WavyAmplitudeProvider = null

    @property({ type: Number, attribute: 'stroke-width' })
    public strokeWidth: number | null = null

    @property({ type: Number, attribute: 'track-stroke-width' })
    public trackStrokeWidth: number | null = null

    @property({ type: String, attribute: 'stroke-cap' })
    public strokeCap: WavyProgressIndicatorStrokeCaps = 'round'

    @property({ type: String, attribute: 'track-stroke-cap' })
    public trackStrokeCap: WavyProgressIndicatorStrokeCaps = 'round'

    @property({ type: Number, attribute: 'gap-size' })
    public gapSize: number | null = null

    @property({ type: Number, attribute: 'stop-size' })
    public stopSize: number | null = null

    @property({ type: Boolean })
    public animated = true

    // ── DOM Queries ───────────────────────────────────────────────────────────

    @query('.progress')
    private progressEl?: HTMLElement

    @query('svg')
    private svgEl?: SVGSVGElement

    @query('.track-path')
    private trackPathEl?: SVGPathElement

    @query('.active-path')
    private activePathEl?: SVGPathElement

    @query('.secondary-active-path')
    private secondaryActivePathEl?: SVGPathElement

    @query('.stop-dot')
    private stopDotEl?: SVGCircleElement

    // ── Animation & Layout State ──────────────────────────────────────────────

    private springState: SpringState = { value: 0, velocity: 0 }
    private targetFraction = 0
    private ampTransition: AmplitudeTransition = { from: 0, target: 0, current: 0, elapsedMs: AmplitudeTransitionDurationMs }
    private phasePx = 0
    private phaseRad = 0
    private indeterminateTimeMs = 0

    private hasInitialized = false
    private rafId = 0
    private lastFrameTime = 0
    private layoutWidth = 0
    private layoutHeight = 0
    private resizeObserver?: ResizeObserver
    private reducedMotionQuery?: MediaQueryList
    private prefersReducedMotion = false

    private readonly handleReducedMotionChange = (e: MediaQueryListEvent): void => {
        this.prefersReducedMotion = e.matches
        this.syncAnimationLoop()
        this.drawFrame()
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    public override connectedCallback(): void {
        super.connectedCallback()
        if (!isServer && typeof window.matchMedia === 'function') {
            this.reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
            this.prefersReducedMotion = this.reducedMotionQuery.matches
            this.reducedMotionQuery.addEventListener('change', this.handleReducedMotionChange)
        }
        if (this.hasInitialized) {
            this.setupResizeObserver()
            this.syncAnimationLoop()
        }
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        this.stopAnimationLoop()
        this.resizeObserver?.disconnect()
        this.resizeObserver = undefined
        this.reducedMotionQuery?.removeEventListener('change', this.handleReducedMotionChange)
        this.reducedMotionQuery = undefined
    }

    protected override firstUpdated(changedProperties: PropertyValues<this>): void {
        super.firstUpdated(changedProperties)
        this.setupAria()

        const initialFraction = this.computeRawFraction()
        this.targetFraction = initialFraction
        this.springState = { value: initialFraction, velocity: 0 }

        const initialAmp = computeTargetAmplitude(initialFraction, this.indeterminate, this.amplitude)
        this.ampTransition = {
            from: initialAmp,
            target: initialAmp,
            current: initialAmp,
            elapsedMs: AmplitudeTransitionDurationMs,
        }

        this.hasInitialized = true
        this.setupResizeObserver()
        this.drawFrame()
        this.syncAnimationLoop()
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)

        if (changedProperties.has('value') || changedProperties.has('max')) {
            this.targetFraction = this.computeRawFraction()
            if (!this.animated) {
                this.springState = { value: this.targetFraction, velocity: 0 }
            }
        }

        if (
            changedProperties.has('value')
            || changedProperties.has('max')
            || changedProperties.has('indeterminate')
            || changedProperties.has('amplitude')
            || changedProperties.has('animated')
        ) {
            this.updateAmplitudeTarget()
        }

        if (
            changedProperties.has('variant')
            || changedProperties.has('circularSize')
            || changedProperties.has('indeterminate')
            || changedProperties.has('wavelength')
            || changedProperties.has('waveSpeed')
            || changedProperties.has('waveAmplitude')
            || changedProperties.has('amplitude')
            || changedProperties.has('strokeWidth')
            || changedProperties.has('trackStrokeWidth')
            || changedProperties.has('strokeCap')
            || changedProperties.has('trackStrokeCap')
            || changedProperties.has('gapSize')
            || changedProperties.has('stopSize')
            || changedProperties.has('animated')
            || changedProperties.has('value')
            || changedProperties.has('max')
        ) {
            this.drawFrame()
        }

        this.syncAnimationLoop()
    }

    // ── Render ────────────────────────────────────────────────────────────────

    protected override render(): TemplateResult {
        const { ariaLabel } = this as AriaMixinStrict
        return html`
            <div
                class="progress ${classMap(this.getRenderClasses())}"
                role="progressbar"
                aria-label="${ariaLabel || nothing}"
                aria-valuemin="0"
                aria-valuemax=${this.max}
                aria-valuenow=${this.indeterminate ? nothing : this.value}
            >
                <svg aria-hidden="true">
                    <path class="track-path" d=""></path>
                    <path class="active-path" d=""></path>
                    <path class="active-path secondary-active-path" d=""></path>
                    <circle class="stop-dot" cx="0" cy="0" r="0"></circle>
                </svg>
            </div>
        `
    }

    protected getRenderClasses() {
        return {
            'indeterminate': this.indeterminate,
            'linear': this.variant === 'linear',
            'circular': this.variant === 'circular',
        }
    }

    // ── Animation Loop ────────────────────────────────────────────────────────

    private computeRawFraction(): number {
        return this.max > 0 ? clamp01(this.value / this.max) : 0
    }

    private updateAmplitudeTarget(): void {
        const effectiveFraction = this.springState.value
        const nextTarget = computeTargetAmplitude(effectiveFraction, this.indeterminate, this.amplitude)
        if (!this.animated) {
            this.ampTransition = {
                from: nextTarget,
                target: nextTarget,
                current: nextTarget,
                elapsedMs: AmplitudeTransitionDurationMs,
            }
            return
        }
        if (nextTarget !== this.ampTransition.target) {
            this.ampTransition = {
                from: this.ampTransition.current,
                target: nextTarget,
                current: this.ampTransition.current,
                elapsedMs: 0,
            }
        }
    }

    private getEffectiveWaveSpeed(metrics: ResolvedMetrics): number {
        return this.waveSpeed !== null && Number.isFinite(this.waveSpeed)
            ? this.waveSpeed
            : metrics.wavelength
    }

    private needsAnimationFrame(metrics: ResolvedMetrics): boolean {
        if (isServer) return false

        const springActive =
            this.animated
            && !this.indeterminate
            && (Math.abs(this.springState.value - this.targetFraction) > 0.0005
                || Math.abs(this.springState.velocity) > 0.0005)

        const ampActive = this.animated && this.ampTransition.elapsedMs < AmplitudeTransitionDurationMs

        if (this.prefersReducedMotion) {
            return springActive || ampActive
        }

        const effectiveSpeed = this.getEffectiveWaveSpeed(metrics)
        const waveActive = this.ampTransition.current > 0.001 && effectiveSpeed !== 0 && metrics.wavelength > 0

        return springActive || ampActive || waveActive || this.indeterminate
    }

    private syncAnimationLoop(): void {
        if (!this.hasInitialized || isServer) return
        const metrics = this.resolveMetrics()
        if (this.needsAnimationFrame(metrics)) {
            if (!this.rafId) {
                this.lastFrameTime = performance.now()
                this.rafId = requestAnimationFrame(this.onFrame)
            }
        } else {
            this.stopAnimationLoop()
        }
    }

    private stopAnimationLoop(): void {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId)
            this.rafId = 0
        }
    }

    private readonly onFrame = (now: number): void => {
        this.rafId = 0
        const dtMs = Math.max(0, Math.min(100, now - this.lastFrameTime))
        this.lastFrameTime = now
        const dtSec = dtMs / 1000

        if (!this.indeterminate) {
            this.springState = this.animated
                ? stepSpring(this.springState, this.targetFraction, dtSec)
                : { value: this.targetFraction, velocity: 0 }
            this.updateAmplitudeTarget()
        }

        this.ampTransition = this.animated
            ? stepAmplitudeTransition(this.ampTransition, dtMs)
            : { ...this.ampTransition, current: this.ampTransition.target, elapsedMs: AmplitudeTransitionDurationMs }

        const metrics = this.resolveMetrics()
        if (!this.prefersReducedMotion) {
            const effectiveSpeed = this.getEffectiveWaveSpeed(metrics)
            if (effectiveSpeed !== 0 && metrics.wavelength > 0) {
                this.phasePx = wrapPositiveModulo(this.phasePx + effectiveSpeed * dtSec, metrics.wavelength)
                const angularSpeed = (effectiveSpeed / metrics.wavelength) * 2 * Math.PI
                this.phaseRad = wrapPositiveModulo(this.phaseRad + angularSpeed * dtSec, 2 * Math.PI)
            }

            if (this.indeterminate) {
                this.indeterminateTimeMs += dtMs
            }
        }

        this.drawFrame(metrics)

        if (this.needsAnimationFrame(metrics)) {
            this.rafId = requestAnimationFrame(this.onFrame)
        }
    }

    // ── SVG Drawing ───────────────────────────────────────────────────────────

    private drawFrame(precomputedMetrics?: ResolvedMetrics): void {
        const svg = this.svgEl
        const trackPath = this.trackPathEl
        const activePath = this.activePathEl
        const secondaryActivePath = this.secondaryActivePathEl
        const stopDot = this.stopDotEl

        if (!svg || !trackPath || !activePath || !secondaryActivePath || !stopDot) {
            return
        }

        const metrics = precomputedMetrics ?? this.resolveMetrics()
        const { width, height, strokeWidth, trackStrokeWidth } = metrics
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`)

        // Apply stroke overrides cleanly (when null, remove inline override so CSS tokens govern)
        if (this.strokeWidth !== null && Number.isFinite(this.strokeWidth) && this.strokeWidth > 0) {
            activePath.style.strokeWidth = `${strokeWidth}px`
            secondaryActivePath.style.strokeWidth = `${strokeWidth}px`
        } else {
            activePath.style.strokeWidth = ''
            secondaryActivePath.style.strokeWidth = ''
        }

        if (this.trackStrokeWidth !== null && Number.isFinite(this.trackStrokeWidth) && this.trackStrokeWidth > 0) {
            trackPath.style.strokeWidth = `${trackStrokeWidth}px`
        } else {
            trackPath.style.strokeWidth = ''
        }

        activePath.style.strokeLinecap = this.strokeCap
        secondaryActivePath.style.strokeLinecap = this.strokeCap
        trackPath.style.strokeLinecap = this.trackStrokeCap

        if (this.variant === 'linear') {
            this.drawLinear(metrics, trackPath, activePath, secondaryActivePath, stopDot)
        } else {
            this.drawCircular(metrics, trackPath, activePath, secondaryActivePath, stopDot)
        }
    }

    private drawLinear(
        metrics: ResolvedMetrics,
        trackPath: SVGPathElement,
        activePath: SVGPathElement,
        secondaryActivePath: SVGPathElement,
        stopDot: SVGCircleElement,
    ): void {
        const { width, height, strokeWidth, trackStrokeWidth, gap, stopSize, maxAmplitude, wavelength } = metrics
        const activeCap = computeCapProtrusion(strokeWidth, this.strokeCap)
        const trackCap = computeCapProtrusion(trackStrokeWidth, this.trackStrokeCap)
        const edgePad = Math.max(activeCap, trackCap)
        const startX = edgePad
        const endMaxX = Math.max(startX, width - edgePad)
        const usableWidth = endMaxX - startX
        const centerY = height / 2
        const currentAmp = maxAmplitude * this.ampTransition.current

        if (this.indeterminate) {
            trackPath.setAttribute('d', buildLinearWavyPath(startX, endMaxX, centerY, 0, wavelength, 0))
            stopDot.setAttribute('r', '0')

            if (this.prefersReducedMotion) {
                activePath.setAttribute(
                    'd',
                    buildLinearWavyPath(startX, startX + usableWidth * 0.4, centerY, currentAmp, wavelength, this.phasePx),
                )
                secondaryActivePath.setAttribute('d', '')
                return
            }

            const [seg1, seg2] = computeLinearIndeterminateSegments(this.indeterminateTimeMs)
            activePath.setAttribute(
                'd',
                seg1.head > seg1.tail
                    ? buildLinearWavyPath(
                        startX + seg1.tail * usableWidth,
                        startX + seg1.head * usableWidth,
                        centerY,
                        currentAmp,
                        wavelength,
                        this.phasePx,
                    )
                    : '',
            )
            secondaryActivePath.setAttribute(
                'd',
                seg2.head > seg2.tail
                    ? buildLinearWavyPath(
                        startX + seg2.tail * usableWidth,
                        startX + seg2.head * usableWidth,
                        centerY,
                        currentAmp,
                        wavelength,
                        this.phasePx,
                    )
                    : '',
            )
            return
        }

        secondaryActivePath.setAttribute('d', '')

        const fraction = clamp01(this.springState.value)
        const activeEndX = startX + fraction * usableWidth
        const hasActive = fraction > 0.0005

        activePath.setAttribute(
            'd',
            hasActive
                ? buildLinearWavyPath(startX, activeEndX, centerY, currentAmp, wavelength, this.phasePx)
                : '',
        )

        const centerlineGap = Math.min(activeEndX - startX, gap + activeCap + trackCap)
        const trackStartX = hasActive ? activeEndX + centerlineGap : startX
        trackPath.setAttribute(
            'd',
            trackStartX < endMaxX
                ? buildLinearWavyPath(trackStartX, endMaxX, centerY, 0, wavelength, 0)
                : '',
        )

        stopDot.setAttribute('cx', endMaxX.toFixed(2))
        stopDot.setAttribute('cy', centerY.toFixed(2))
        stopDot.setAttribute('r', (stopSize / 2).toFixed(2))
    }

    private drawCircular(
        metrics: ResolvedMetrics,
        trackPath: SVGPathElement,
        activePath: SVGPathElement,
        secondaryActivePath: SVGPathElement,
        stopDot: SVGCircleElement,
    ): void {
        const { width, height, strokeWidth, trackStrokeWidth, gap, maxAmplitude, wavelength } = metrics
        secondaryActivePath.setAttribute('d', '')
        stopDot.setAttribute('r', '0')

        const cx = width / 2
        const cy = height / 2
        const maxStroke = Math.max(strokeWidth, trackStrokeWidth)
        const baseRadius = Math.max(4, Math.min(width, height) / 2 - maxStroke / 2 - maxAmplitude)
        const circumference = 2 * Math.PI * baseRadius
        const waveCount = Math.max(4, Math.round(circumference / Math.max(8, wavelength)))
        const currentAmp = maxAmplitude * this.ampTransition.current

        if (this.indeterminate) {
            trackPath.setAttribute('d', '')
            if (this.prefersReducedMotion) {
                activePath.setAttribute(
                    'd',
                    buildCircularWavyPath(cx, cy, baseRadius, -Math.PI / 2, Math.PI * 0.5, currentAmp, waveCount, this.phaseRad),
                )
                return
            }
            const arc = computeCircularIndeterminateArc(this.indeterminateTimeMs)
            activePath.setAttribute(
                'd',
                buildCircularWavyPath(
                    cx,
                    cy,
                    baseRadius,
                    arc.startAngleRad,
                    arc.sweepAngleRad,
                    currentAmp,
                    waveCount,
                    this.phaseRad,
                ),
            )
            return
        }

        const fraction = clamp01(this.springState.value)
        const startAngle = -Math.PI / 2
        const sweep = fraction * 2 * Math.PI

        activePath.setAttribute(
            'd',
            sweep > 0.001
                ? buildCircularWavyPath(cx, cy, baseRadius, startAngle, sweep, currentAmp, waveCount, this.phaseRad)
                : '',
        )

        const capCompensation = computeCapProtrusion(strokeWidth, this.strokeCap) + computeCapProtrusion(trackStrokeWidth, this.trackStrokeCap)
        const gapAngle = computeCircularTrackGapAngle(baseRadius, capCompensation, gap)
        const g = Math.min(sweep, gapAngle)
        const trackSweep = 2 * Math.PI - sweep - 2 * g
        trackPath.setAttribute(
            'd',
            trackSweep > 0.001
                ? buildCircularWavyPath(cx, cy, baseRadius, startAngle + sweep + g, trackSweep, 0, waveCount, 0)
                : '',
        )
    }

    // ── Metrics & Setup ───────────────────────────────────────────────────────

    private resolveMetrics(): ResolvedMetrics {
        const overrideOpt = (val: number | null, fallback: number, allowZero = false): number => {
            if (val !== null && Number.isFinite(val)) {
                return allowZero ? Math.max(0, val) : (val > 0 ? val : fallback)
            }
            return fallback
        }

        if (isServer) {
            return this.variant === 'linear'
                ? {
                    width: 240,
                    height: 10,
                    strokeWidth: overrideOpt(this.strokeWidth, 4),
                    trackStrokeWidth: overrideOpt(this.trackStrokeWidth, 4),
                    gap: overrideOpt(this.gapSize, 4, true),
                    stopSize: overrideOpt(this.stopSize, 4, true),
                    maxAmplitude: overrideOpt(this.waveAmplitude, 3, true),
                    wavelength: overrideOpt(this.wavelength, this.indeterminate ? 20 : 40),
                }
                : {
                    width: 64,
                    height: 64,
                    strokeWidth: overrideOpt(this.strokeWidth, 4),
                    trackStrokeWidth: overrideOpt(this.trackStrokeWidth, 4),
                    gap: overrideOpt(this.gapSize, 4, true),
                    stopSize: 0,
                    maxAmplitude: overrideOpt(this.waveAmplitude, 2, true),
                    wavelength: overrideOpt(this.wavelength, this.indeterminate ? 20 : 28),
                }
        }

        const style = getComputedStyle(this)
        const readNum = (prop: string, fallback: number, allowZero = false): number => {
            const parsed = parseFloat(style.getPropertyValue(prop))
            if (!Number.isFinite(parsed)) return fallback
            return allowZero ? Math.max(0, parsed) : (parsed > 0 ? parsed : fallback)
        }

        if (this.variant === 'linear') {
            const height = this.layoutHeight > 0
                ? this.layoutHeight
                : readNum('--_linear-container-height', 10)
            const width = this.layoutWidth > 0 ? this.layoutWidth : 240
            const defaultWavelength = this.indeterminate
                ? readNum('--_linear-indeterminate-wavelength', 20)
                : readNum('--_linear-determinate-wavelength', 40)

            return {
                width,
                height,
                strokeWidth: overrideOpt(this.strokeWidth, readNum('--_linear-active-indicator-thickness', 4)),
                trackStrokeWidth: overrideOpt(this.trackStrokeWidth, readNum('--_linear-track-thickness', 4)),
                gap: overrideOpt(this.gapSize, readNum('--_linear-track-gap', 4, true), true),
                stopSize: overrideOpt(this.stopSize, readNum('--_linear-stop-indicator-size', 4, true), true),
                maxAmplitude: overrideOpt(this.waveAmplitude, readNum('--_linear-wave-amplitude', 3, true), true),
                wavelength: overrideOpt(this.wavelength, defaultWavelength),
            }
        }

        const sizeFallbackMap: Record<WavyProgressIndicatorCircularSizes, number> = {
            'extra-small': 32,
            'small': 48,
            'medium': 64,
            'large': 88,
        }
        const defaultSize = sizeFallbackMap[this.circularSize] ?? 64
        const defaultStroke = this.circularSize === 'large' ? 6 : 4
        const size = this.layoutWidth > 0
            ? this.layoutWidth
            : readNum(`--_circular-${this.circularSize}-size`, defaultSize)
        const defaultWavelength = this.indeterminate
            ? readNum('--_circular-indeterminate-wavelength', 20)
            : readNum('--_circular-determinate-wavelength', 28)

        return {
            width: size,
            height: size,
            strokeWidth: overrideOpt(this.strokeWidth, readNum(`--_circular-${this.circularSize}-stroke-width`, defaultStroke)),
            trackStrokeWidth: overrideOpt(this.trackStrokeWidth, readNum(`--_circular-${this.circularSize}-track-stroke-width`, defaultStroke)),
            gap: overrideOpt(this.gapSize, readNum('--_circular-track-gap', 4, true), true),
            stopSize: 0,
            maxAmplitude: overrideOpt(this.waveAmplitude, readNum('--_circular-wave-amplitude', 2, true), true),
            wavelength: overrideOpt(this.wavelength, defaultWavelength),
        }
    }

    private setupResizeObserver(): void {
        if (isServer || typeof ResizeObserver === 'undefined' || !this.progressEl) {
            return
        }
        this.resizeObserver?.disconnect()
        this.resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect
                if (width > 0 && height > 0) {
                    this.layoutWidth = width
                    this.layoutHeight = height
                    this.drawFrame()
                }
            }
        })
        this.resizeObserver.observe(this.progressEl)
    }

    private setupAria(): void {
        if (isServer) return
        if (!this.getAttribute('aria-label') && !this.getAttribute('aria-labelledby')) {
            this.setAttribute('aria-label', 'Progress')
        }
    }
}
