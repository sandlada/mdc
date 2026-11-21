/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { styleMap } from 'lit/directives/style-map.js'
import type { AriaMixinStrict } from '../../../utils/aria/aria'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { mixinElementInternals } from '../../../utils/behaviors/element-internals'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import '../../ripple/ripple'
import { mixinRippleOptions } from '../../ripple/ripple-options.mixin'
import { mixinFocusRingOptions } from '../../focus-ring/focus-ring-options.mixin'
import { ShapeSizePixels } from '../shape.definition'
import {
    MaterialShape,
    ShapeChangeEvent,
    ShapeMorphEndEvent,
    ShapeMorphStartEvent,
    type IMDCShape,
    type IMDCShapeChangeDetail,
    type IMDCShapeMorphEndDetail,
    type IMDCShapeMorphStartDetail,
    type ShapeColor,
    type ShapeFit,
    type ShapeKind,
    type ShapeMotionScheme,
    type ShapeMotionSpeed,
    type ShapeSize,
    type ShapeVariant,
} from '../shape.interface'
import { ShapeStyles } from '../shape.style'
import type { Cubic } from './cubic'
import { Morph, cubicsToPathData } from './morph'
import { RoundedPolygon } from './rounded-polygon'
import { computeShapeTargetKey, parseShapeSequence, resolveShapePolygon } from './shape-resolver'
import { resolveMotionSpring, springMotionAt, type SpringParameters } from './spring'

const DefaultAutoplaySequence: readonly ShapeKind[] = [
    MaterialShape.Circle,
    MaterialShape.SoftBurst,
    MaterialShape.Cookie9Sided,
    MaterialShape.Pentagon,
    MaterialShape.Pill,
    MaterialShape.Sunny,
    MaterialShape.Cookie4Sided,
    MaterialShape.Heart,
]

const MorphSettlePosThreshold = 0.0008
const MorphSettleVelThreshold = 0.008
const RotationSettlePosThreshold = 0.05
const RotationSettleVelThreshold = 0.5

const isClientEnvironment = (): boolean =>
    typeof window !== 'undefined' && typeof document !== 'undefined'

export abstract class BaseShape extends composeMixin(
    mixinDelegatesAria,
    mixinElementInternals,
    mixinRippleOptions,
    mixinFocusRingOptions,
)(LitElement) implements IMDCShape {

    public static override styles = ShapeStyles

    @property({ type: String, reflect: true })
    public shape: ShapeKind = 'circle'

    @property({ type: String, attribute: 'hover-shape', reflect: true })
    public hoverShape: ShapeKind | '' = ''

    @property({ type: String, attribute: 'focus-shape', reflect: true })
    public focusShape: ShapeKind | '' = ''

    @property({ type: String, attribute: 'pressed-shape', reflect: true })
    public pressedShape: ShapeKind | '' = ''

    @property({ type: String, attribute: 'selected-shape', reflect: true })
    public selectedShape: ShapeKind | '' = ''

    @property({ type: String, attribute: 'disabled-shape', reflect: true })
    public disabledShape: ShapeKind | '' = ''

    @property({ type: String, attribute: 'morph-to', reflect: true })
    public morphTo: ShapeKind | '' = ''

    @property({ type: Number })
    public progress: number = 0

    @property({ type: String, reflect: true })
    public variant: ShapeVariant = 'tonal'

    @property({ type: String, reflect: true })
    public color: ShapeColor = 'primary'

    @property({ type: String, reflect: true })
    public size: ShapeSize = 'medium'

    @property({ type: String, reflect: true })
    public fit: ShapeFit = 'contain'

    @property({ type: Number, reflect: true })
    public rotation: number = 0

    @property({ type: Number, attribute: 'start-angle', reflect: true })
    public startAngle: number = 0

    @property({ type: Boolean, attribute: 'disable-clip', reflect: true })
    public disableClip: boolean = false

    @property({ type: Boolean, reflect: true })
    public interactive: boolean = false

    @property({ type: Boolean, reflect: true })
    public toggle: boolean = false

    @property({ type: Boolean, reflect: true })
    public selected: boolean = false

    @property({ type: Boolean, reflect: true })
    public disabled: boolean = false

    @property({ type: String, attribute: 'motion-scheme', reflect: true })
    public motionScheme: ShapeMotionScheme = 'expressive'

    @property({ type: String, attribute: 'motion-speed', reflect: true })
    public motionSpeed: ShapeMotionSpeed = 'default'

    @property({ type: Number })
    public stiffness: number | null = null

    @property({ type: Number, attribute: 'damping-ratio' })
    public dampingRatio: number | null = null

    @property({ type: Boolean, attribute: 'disable-animation', reflect: true })
    public disableAnimation: boolean = false

    @property({ type: Number })
    public sides: number = 5

    @property({ type: Number, attribute: 'inner-radius' })
    public innerRadius: number = 0.5

    @property({ type: Number, attribute: 'corner-radius' })
    public cornerRadius: number = 0.15

    @property({ type: Number, attribute: 'inner-corner-radius' })
    public innerCornerRadius: number | null = null

    @property({ type: Number })
    public smoothing: number = 0

    @property({ type: Number, attribute: 'aspect-ratio' })
    public aspectRatio: number = 1

    @property({ type: Number, attribute: 'vertex-spacing' })
    public vertexSpacing: number = 0.5

    @property({ attribute: false })
    public polygon: RoundedPolygon | null = null

    @property({ attribute: false })
    public vertices: number[] | null = null

    @property({ type: String })
    public sequence: string = ''

    @property({ type: Boolean, reflect: true })
    public autoplay: boolean = false

    @property({ type: Number })
    public interval: number = 1000

    @property({ type: Number, attribute: 'spin-per-step' })
    public spinPerStep: number = 0

    @state()
    private isHovered: boolean = false

    @state()
    private isFocused: boolean = false

    @state()
    private isFocusVisible: boolean = false

    @state()
    private isPressed: boolean = false

    @state()
    private sequenceIndex: number = 0

    @state()
    private measuredWidth: number = 0

    @state()
    private measuredHeight: number = 0

    @query('#container')
    protected readonly containerElement!: HTMLElement | null

    private hasInitialized = false
    private reducedMotion = false
    private reducedMotionQuery: MediaQueryList | null = null
    private resizeObserver: ResizeObserver | null = null
    private rafId: number | null = null
    private autoplayTimerId: number | null = null
    private imperativeSpringOverride: SpringParameters | null = null

    // Settled and in-flight morph state
    private settledPolygon: RoundedPolygon | null = null
    private settledKey: string = ''
    private morphStartPolygon: RoundedPolygon | null = null
    private morphEndPolygon: RoundedPolygon | null = null
    private morphStartKey: string = ''
    private morphEndKey: string = ''
    private activeMorph: Morph | null = null
    private morphSpringStartVal = 0
    private morphSpringStartVel = 0
    private morphSpringTarget = 1
    private morphStartTime = 0
    private morphValue = 1
    private morphVelocity = 0
    private activeSpringParams: SpringParameters | null = null

    // Rotation spring state
    private currentRotation = 0
    private rotVelocity = 0
    private rotStartVal = 0
    private rotStartVel = 0
    private rotTarget = 0
    private rotStartTime = 0
    private isRotationAnimating = false

    // Cached scrub morph for morphTo + progress
    private scrubKey = ''
    private scrubMorph: Morph | null = null

    public override get rippleControl(): HTMLElement | null {
        return this.isInteractive && !this.disabled ? this.containerElement : null
    }

    public override get focusRingControl(): HTMLElement | null {
        return null
    }

    protected get isInteractive(): boolean {
        return this.interactive || this.toggle
    }

    private get activeStateOverride(): ShapeKind | null {
        if (this.disabled && this.disabledShape) return this.disabledShape
        if (this.isPressed && !this.disabled && this.pressedShape) return this.pressedShape
        if (this.selected && this.selectedShape) return this.selectedShape
        if (this.isFocused && !this.disabled && this.focusShape) return this.focusShape
        if (this.isHovered && !this.disabled && this.hoverShape) return this.hoverShape
        return null
    }

    /** Active shape name accounting for interactive states and sequence index. */
    public get activeShape(): string {
        return this.activeStateOverride ?? this.getSequenceShape() ?? this.shape
    }

    /** Resolved target `RoundedPolygon` in normalized `[0, 1]^2` coordinates. */
    public get resolvedPolygon(): RoundedPolygon {
        const useCustom = this.activeStateOverride === null && this.getSequenceShape() === null
        return this.resolvePolygonForKind(this.activeShape as ShapeKind, useCustom)
    }

    /** Whether a spring morph or rotation transition is currently running. */
    public get isMorphing(): boolean {
        return this.activeMorph !== null || this.isRotationAnimating
    }

    /** Current rendered SVG path data in pixel coordinates. */
    public get pathData(): string {
        const cubics = this.getCurrentCubics()
        return this.buildPixelPathData(cubics)
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        if (!isClientEnvironment()) return

        if (typeof window.matchMedia === 'function') {
            const query = window.matchMedia('(prefers-reduced-motion: reduce)')
            this.reducedMotionQuery = query
            this.reducedMotion = query.matches
            query.addEventListener('change', this.handleReducedMotionChange)
        }

        if (typeof ResizeObserver === 'function') {
            this.resizeObserver = new ResizeObserver((entries) => {
                const entry = entries[0]
                if (!entry) return
                const { width, height } = entry.contentRect
                if (width !== this.measuredWidth || height !== this.measuredHeight) {
                    this.measuredWidth = width
                    this.measuredHeight = height
                }
            })
            this.resizeObserver.observe(this)
        }

        if (this.autoplay) {
            this.startAutoplay()
        }
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        if (!isClientEnvironment()) return
        this.reducedMotionQuery?.removeEventListener('change', this.handleReducedMotionChange)
        this.reducedMotionQuery = null
        this.resizeObserver?.disconnect()
        this.resizeObserver = null
        this.stopAnimationLoop()
        this.stopAutoplay()
        this.isHovered = false
        this.isPressed = false
        this.isFocused = false
        this.isFocusVisible = false
    }

    /**
     * Imperatively morphs from the current live shape to a named `ShapeKind` or
     * custom `RoundedPolygon`.
     */
    public morphToShape(
        target: ShapeKind | RoundedPolygon,
        options?: { stiffness?: number; dampingRatio?: number },
    ): void {
        this.imperativeSpringOverride =
            options?.stiffness !== undefined || options?.dampingRatio !== undefined
                ? {
                      stiffness: options.stiffness ?? this.getEffectiveSpring().stiffness,
                      dampingRatio: options.dampingRatio ?? this.getEffectiveSpring().dampingRatio,
                  }
                : null

        if (target instanceof RoundedPolygon) {
            this.polygon = target.normalized()
        } else {
            this.polygon = null
            this.vertices = null
            this.shape = target
        }
        this.requestUpdate()
    }

    /**
     * Advances one step in `sequence` (or the default expressive shape sequence).
     */
    public next(): void {
        const list = this.getEffectiveSequence()
        if (list.length === 0) return
        this.sequenceIndex = (this.sequenceIndex + 1) % list.length
        if (this.spinPerStep !== 0) {
            this.rotation = this.rotation + this.spinPerStep
        }
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)

        if (changedProperties.has('disabled') && this.disabled) {
            this.isHovered = false
            this.isPressed = false
            this.isFocused = false
            this.isFocusVisible = false
        }

        if (changedProperties.has('sequence')) {
            this.sequenceIndex = 0
        }

        if (this.morphTo) {
            // Scrub mode: stop active spring morph and prepare cached scrub Morph.
            this.activeMorph = null
            this.settledPolygon = this.resolvedPolygon
            this.settledKey = this.getActiveTargetKey()
            this.updateScrubMorph()
            if (!this.hasInitialized) {
                this.currentRotation = this.rotation
                this.rotTarget = this.rotation
                this.hasInitialized = true
            } else if (changedProperties.has('rotation')) {
                this.handleRotationTargetChange()
            }
            return
        }

        const targetKey = this.getActiveTargetKey()
        const targetPolygon = this.resolvedPolygon

        if (!this.hasInitialized) {
            this.settledPolygon = targetPolygon
            this.settledKey = targetKey
            this.currentRotation = this.rotation
            this.rotTarget = this.rotation
            this.hasInitialized = true
            return
        }

        if (targetKey !== this.getCurrentGoalKey()) {
            this.startOrRetargetMorph(targetKey, targetPolygon)
        }

        if (changedProperties.has('rotation') && this.rotation !== this.rotTarget) {
            this.handleRotationTargetChange()
        }
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (changedProperties.has('autoplay') || changedProperties.has('interval') || changedProperties.has('disableAnimation')) {
            if (this.autoplay && !this.shouldSkipAnimation()) {
                this.startAutoplay()
            } else {
                this.stopAutoplay()
            }
        }
    }

    protected getRenderClasses(): Record<string, boolean> {
        return {
            container: true,
            interactive: this.isInteractive,
            toggle: this.toggle,
            selected: this.selected,
            disabled: this.disabled,
            hovered: this.isHovered,
            focused: this.isFocused,
            'focused-visible': this.isFocusVisible,
            pressed: this.isPressed,
            morphing: this.isMorphing,
            [`variant-${this.variant}`]: true,
            [`color-${this.color}`]: true,
            [`size-${this.size}`]: true,
        }
    }

    protected override render(): TemplateResult {
        const { ariaLabel } = this as AriaMixinStrict
        const [boxWidth, boxHeight] = this.getBoxDimensions()
        const pathData = this.buildPixelPathData(this.getCurrentCubics(), boxWidth, boxHeight)
        const clipStyles = this.disableClip ? {} : { 'clip-path': `path('${pathData}')` }
        const classes = classMap(this.getRenderClasses())

        const inner = html`
            <svg
                class="shape-svg"
                part="svg"
                viewBox="0 0 ${boxWidth} ${boxHeight}"
                aria-hidden="true"
            >
                <path class="shape-fill" part="fill" d=${pathData} />
            </svg>
            <div class="clip-layer" part="clip" style=${styleMap(clipStyles)}>
                ${this.isInteractive && !this.disabled ? html`<mdc-ripple></mdc-ripple>` : nothing}
                <div class="content" part="content">
                    <slot></slot>
                </div>
            </div>
            <svg
                class="stroke-svg"
                part="stroke-svg"
                viewBox="0 0 ${boxWidth} ${boxHeight}"
                aria-hidden="true"
            >
                <path class="shape-stroke" part="stroke" d=${pathData} />
                ${this.isInteractive
                    ? html`<path class="shape-focus-stroke" part="focus-stroke" d=${pathData} />`
                    : nothing}
            </svg>
        `

        if (this.isInteractive) {
            return html`
                <button
                    id="container"
                    part="container"
                    type="button"
                    class=${classes}
                    ?disabled=${this.disabled}
                    aria-label=${ariaLabel || nothing}
                    aria-pressed=${this.toggle ? String(this.selected) : nothing}
                    @pointerenter=${this.handlePointerEnter}
                    @pointerleave=${this.handlePointerLeave}
                    @pointerdown=${this.handlePointerDown}
                    @pointerup=${this.handlePointerUp}
                    @pointercancel=${this.handlePointerCancel}
                    @focus=${this.handleFocus}
                    @blur=${this.handleBlur}
                    @click=${this.handleClick}
                >${inner}</button>
            `
        }

        return html`
            <div
                id="container"
                part="container"
                class=${classes}
                role=${ariaLabel ? 'img' : nothing}
                aria-label=${ariaLabel || nothing}
                @pointerenter=${this.handlePointerEnter}
                @pointerleave=${this.handlePointerLeave}
                @pointerdown=${this.handlePointerDown}
                @pointerup=${this.handlePointerUp}
                @pointercancel=${this.handlePointerCancel}
            >${inner}</div>
        `
    }

    public override focus(options?: FocusOptions): void {
        if (isClientEnvironment() && this.isInteractive && !this.disabled) {
            this.containerElement?.focus(options)
            return
        }
        super.focus(options)
    }

    // ── private ───────────────────────────────────────────────────────────────

    private getSequenceShape(): ShapeKind | null {
        const parsed = parseShapeSequence(this.sequence)
        if (parsed.length > 0) {
            return parsed[this.sequenceIndex % parsed.length]
        }
        if (this.autoplay) {
            return DefaultAutoplaySequence[this.sequenceIndex % DefaultAutoplaySequence.length]
        }
        return null
    }

    private getEffectiveSequence(): readonly ShapeKind[] {
        const parsed = parseShapeSequence(this.sequence)
        return parsed.length > 0 ? parsed : DefaultAutoplaySequence
    }

    private resolvePolygonForKind(kind: ShapeKind, allowCustom = false): RoundedPolygon {
        return resolveShapePolygon({
            shape: kind,
            polygon: allowCustom ? this.polygon : null,
            vertices: allowCustom ? this.vertices : null,
            sides: this.sides,
            innerRadius: this.innerRadius,
            cornerRadius: this.cornerRadius,
            innerCornerRadius: this.innerCornerRadius,
            smoothing: this.smoothing,
            aspectRatio: this.aspectRatio,
            vertexSpacing: this.vertexSpacing,
        })
    }

    private getActiveTargetKey(): string {
        const allowCustom = this.activeStateOverride === null && this.getSequenceShape() === null
        return computeShapeTargetKey(this.activeShape as ShapeKind, {
            polygon: allowCustom ? this.polygon : null,
            vertices: allowCustom ? this.vertices : null,
            sides: this.sides,
            innerRadius: this.innerRadius,
            cornerRadius: this.cornerRadius,
            innerCornerRadius: this.innerCornerRadius,
            smoothing: this.smoothing,
            aspectRatio: this.aspectRatio,
            vertexSpacing: this.vertexSpacing,
        })
    }

    private getCurrentGoalKey(): string {
        if (this.activeMorph !== null) {
            return this.morphSpringTarget === 1 ? this.morphEndKey : this.morphStartKey
        }
        return this.settledKey
    }

    private shouldSkipAnimation(): boolean {
        return this.disableAnimation || this.reducedMotion
    }

    private getEffectiveSpring(): SpringParameters {
        if (this.imperativeSpringOverride !== null) {
            return this.imperativeSpringOverride
        }
        const preset = resolveMotionSpring(this.motionScheme, this.motionSpeed)
        return {
            stiffness:
                this.stiffness !== null && Number.isFinite(this.stiffness) && this.stiffness > 0
                    ? this.stiffness
                    : preset.stiffness,
            dampingRatio:
                this.dampingRatio !== null && Number.isFinite(this.dampingRatio) && this.dampingRatio >= 0
                    ? this.dampingRatio
                    : preset.dampingRatio,
        }
    }

    private startOrRetargetMorph(targetKey: string, targetPolygon: RoundedPolygon): void {
        if (this.shouldSkipAnimation() || !isClientEnvironment()) {
            this.activeMorph = null
            this.settledPolygon = targetPolygon
            this.settledKey = targetKey
            this.morphValue = 1
            this.morphVelocity = 0
            this.imperativeSpringOverride = null
            return
        }

        const fromLabel = this.getCurrentGoalKey()
        this.activeSpringParams = this.getEffectiveSpring()
        this.imperativeSpringOverride = null

        if (this.activeMorph !== null) {
            // Reversing back to the start of the active morph preserves C1 continuity.
            if (targetKey === this.morphStartKey && this.morphSpringTarget !== 0) {
                this.morphSpringStartVal = this.morphValue
                this.morphSpringStartVel = this.morphVelocity
                this.morphSpringTarget = 0
                this.morphStartTime = performance.now()
                this.dispatchMorphStart(fromLabel, targetKey)
                this.ensureAnimationLoop()
                return
            }
            if (targetKey === this.morphEndKey && this.morphSpringTarget !== 1) {
                this.morphSpringStartVal = this.morphValue
                this.morphSpringStartVel = this.morphVelocity
                this.morphSpringTarget = 1
                this.morphStartTime = performance.now()
                this.dispatchMorphStart(fromLabel, targetKey)
                this.ensureAnimationLoop()
                return
            }

            // Switching to a third shape mid-flight: snapshot exact intermediate polygon.
            const snapshot = this.activeMorph.toPolygon(this.morphValue)
            this.morphStartPolygon = snapshot
            this.morphStartKey = '__snapshot__'
            this.morphEndPolygon = targetPolygon
            this.morphEndKey = targetKey
            this.activeMorph = new Morph(snapshot, targetPolygon)
            this.morphSpringStartVal = 0
            this.morphSpringStartVel = 0
            this.morphSpringTarget = 1
            this.morphValue = 0
            this.morphVelocity = 0
            this.morphStartTime = performance.now()
            this.dispatchMorphStart(fromLabel, targetKey)
            this.ensureAnimationLoop()
            return
        }

        const startPolygon = this.settledPolygon ?? targetPolygon
        this.morphStartPolygon = startPolygon
        this.morphStartKey = this.settledKey
        this.morphEndPolygon = targetPolygon
        this.morphEndKey = targetKey
        this.activeMorph = new Morph(startPolygon, targetPolygon)
        this.morphSpringStartVal = 0
        this.morphSpringStartVel = 0
        this.morphSpringTarget = 1
        this.morphValue = 0
        this.morphVelocity = 0
        this.morphStartTime = performance.now()
        this.dispatchMorphStart(fromLabel, targetKey)
        this.ensureAnimationLoop()
    }

    private handleRotationTargetChange(): void {
        if (this.shouldSkipAnimation() || !isClientEnvironment()) {
            this.currentRotation = this.rotation
            this.rotTarget = this.rotation
            this.rotVelocity = 0
            this.isRotationAnimating = false
            return
        }
        this.rotStartVal = this.currentRotation
        this.rotStartVel = this.rotVelocity
        this.rotTarget = this.rotation
        this.rotStartTime = performance.now()
        this.isRotationAnimating = true
        this.ensureAnimationLoop()
    }

    private updateScrubMorph(): void {
        if (!this.morphTo) {
            this.scrubMorph = null
            this.scrubKey = ''
            return
        }
        const startKey = this.getActiveTargetKey()
        const endKey = `material:${this.morphTo}`
        const combinedKey = `${startKey}->${endKey}`
        if (combinedKey !== this.scrubKey || this.scrubMorph === null) {
            const startPoly = this.resolvedPolygon
            const endPoly = this.resolvePolygonForKind(this.morphTo)
            this.scrubMorph = new Morph(startPoly, endPoly)
            this.scrubKey = combinedKey
        }
    }

    private getCurrentCubics(): readonly Cubic[] {
        if (this.morphTo && this.scrubMorph !== null) {
            return this.scrubMorph.asCubics(this.progress)
        }
        if (this.activeMorph !== null) {
            return this.activeMorph.asCubics(this.morphValue)
        }
        return (this.settledPolygon ?? this.resolvedPolygon).cubics
    }

    private getBoxDimensions(): [number, number] {
        const defaultSize = ShapeSizePixels[this.size] ?? ShapeSizePixels.medium
        const width = this.measuredWidth > 0 ? this.measuredWidth : defaultSize
        const height = this.measuredHeight > 0 ? this.measuredHeight : defaultSize
        return [width, height]
    }

    private buildPixelPathData(
        cubics: readonly Cubic[],
        widthOverride?: number,
        heightOverride?: number,
    ): string {
        const [boxWidth, boxHeight] =
            widthOverride !== undefined && heightOverride !== undefined
                ? [widthOverride, heightOverride]
                : this.getBoxDimensions()

        const scaleX = this.fit === 'fill' ? boxWidth : Math.min(boxWidth, boxHeight)
        const scaleY = this.fit === 'fill' ? boxHeight : Math.min(boxWidth, boxHeight)

        return cubicsToPathData(cubics, {
            rotation: this.currentRotation,
            startAngle: this.startAngle,
            rotationPivotX: 0.5,
            rotationPivotY: 0.5,
            sourceCenterX: 0.5,
            sourceCenterY: 0.5,
            scaleX,
            scaleY,
            centerX: boxWidth / 2,
            centerY: boxHeight / 2,
            precision: 3,
        })
    }

    private ensureAnimationLoop(): void {
        if (this.rafId !== null || !isClientEnvironment()) return
        this.rafId = requestAnimationFrame(this.stepAnimation)
    }

    private stopAnimationLoop(): void {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId)
            this.rafId = null
        }
    }

    private readonly stepAnimation = (now: number): void => {
        this.rafId = null
        let needsNextFrame = false

        if (this.activeMorph !== null) {
            const spring = this.activeSpringParams ?? this.getEffectiveSpring()
            const elapsedMs = Math.max(0, now - this.morphStartTime)
            const { value, velocity } = springMotionAt(spring)(
                this.morphSpringStartVal,
                this.morphSpringStartVel,
                elapsedMs,
                this.morphSpringTarget,
            )
            this.morphValue = value
            this.morphVelocity = velocity

            if (
                Math.abs(value - this.morphSpringTarget) < MorphSettlePosThreshold &&
                Math.abs(velocity) < MorphSettleVelThreshold
            ) {
                this.settledPolygon =
                    this.morphSpringTarget === 1 ? this.morphEndPolygon : this.morphStartPolygon
                this.settledKey =
                    this.morphSpringTarget === 1 ? this.morphEndKey : this.morphStartKey
                this.activeMorph = null
                this.morphValue = 1
                this.morphVelocity = 0
                this.dispatchMorphEnd(this.activeShape)
            } else {
                needsNextFrame = true
            }
        }

        if (this.isRotationAnimating) {
            const spring = this.getEffectiveSpring()
            const elapsedMs = Math.max(0, now - this.rotStartTime)
            const { value, velocity } = springMotionAt(spring)(
                this.rotStartVal,
                this.rotStartVel,
                elapsedMs,
                this.rotTarget,
            )
            this.currentRotation = value
            this.rotVelocity = velocity

            if (
                Math.abs(value - this.rotTarget) < RotationSettlePosThreshold &&
                Math.abs(velocity) < RotationSettleVelThreshold
            ) {
                this.currentRotation = this.rotTarget
                this.rotVelocity = 0
                this.isRotationAnimating = false
            } else {
                needsNextFrame = true
            }
        }

        this.requestUpdate()

        if (needsNextFrame) {
            this.rafId = requestAnimationFrame(this.stepAnimation)
        }
    }

    private startAutoplay(): void {
        this.stopAutoplay()
        if (!isClientEnvironment() || this.shouldSkipAnimation()) return
        const delay = Number.isFinite(this.interval) && this.interval >= 100 ? this.interval : 1000
        this.autoplayTimerId = window.setInterval(() => {
            this.next()
        }, delay)
    }

    private stopAutoplay(): void {
        if (this.autoplayTimerId !== null) {
            window.clearInterval(this.autoplayTimerId)
            this.autoplayTimerId = null
        }
    }

    private dispatchMorphStart(from: string, to: string): void {
        this.dispatchEvent(
            new CustomEvent<IMDCShapeMorphStartDetail>(ShapeMorphStartEvent, {
                detail: { from, to },
                bubbles: true,
                composed: true,
            }),
        )
    }

    private dispatchMorphEnd(shape: string): void {
        this.dispatchEvent(
            new CustomEvent<IMDCShapeMorphEndDetail>(ShapeMorphEndEvent, {
                detail: { shape },
                bubbles: true,
                composed: true,
            }),
        )
    }

    private readonly handlePointerEnter = (): void => {
        if (this.disabled) return
        this.isHovered = true
    }

    private readonly handlePointerLeave = (): void => {
        this.isHovered = false
        this.isPressed = false
    }

    private readonly handlePointerDown = (event: PointerEvent): void => {
        if (this.disabled || event.button !== 0) return
        this.isPressed = true
    }

    private readonly handlePointerUp = (): void => {
        this.isPressed = false
    }

    private readonly handlePointerCancel = (): void => {
        this.isPressed = false
    }

    private readonly handleFocus = (): void => {
        if (this.disabled) return
        this.isFocused = true
        this.isFocusVisible = this.containerElement?.matches(':focus-visible') ?? true
    }

    private readonly handleBlur = (): void => {
        this.isFocused = false
        this.isFocusVisible = false
        this.isPressed = false
    }

    private readonly handleClick = (event: MouseEvent): void => {
        if (this.disabled) {
            event.preventDefault()
            event.stopPropagation()
            return
        }
        if (this.toggle) {
            this.selected = !this.selected
            this.dispatchEvent(
                new CustomEvent<IMDCShapeChangeDetail>(ShapeChangeEvent, {
                    detail: {
                        selected: this.selected,
                        activeShape: this.activeShape,
                    },
                    bubbles: true,
                    composed: true,
                }),
            )
        }
    }

    private readonly handleReducedMotionChange = (event: MediaQueryListEvent): void => {
        this.reducedMotion = event.matches
        if (this.reducedMotion) {
            this.stopAnimationLoop()
            this.stopAutoplay()
            this.activeMorph = null
            this.isRotationAnimating = false
            this.settledPolygon = this.resolvedPolygon
            this.settledKey = this.getActiveTargetKey()
            this.currentRotation = this.rotation
            this.rotTarget = this.rotation
            this.requestUpdate()
        } else if (this.autoplay) {
            this.startAutoplay()
        }
    }
}
