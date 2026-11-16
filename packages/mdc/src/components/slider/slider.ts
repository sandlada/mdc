/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * `mdc-slider` — Material Design 3 Expressive slider.
 *
 * Designed strictly from Figma MD3 Expressive prototype and Android Jetpack
 * Compose `Slider` / `RangeSlider` / `SliderDefaults` specifications:
 * - Five sizes: `extra-small` (default), `small`, `medium`, `large`, `extra-large`
 * - Three types: `standard`, `centered`, `range`
 * - Two orientations: `horizontal` (default), `vertical`
 * - Resting 4px handle morphing to 2px when pressed/dragged
 * - 6px thumb-to-track gap, 2px inner track corners, size-locked outer corners
 * - Accurate discrete ticks, stop indicators, optional inset icon (M/L/XL),
 *   and 48px touch/hover targets with animated value indicator pills
 *
 * @link https://m3.material.io/components/sliders/specs
 */

import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { styleMap } from 'lit/directives/style-map.js'
import { when } from 'lit/directives/when.js'
import type { AriaMixinStrict } from '../../utils/aria/aria'
import { CreateValidator, GetValidityAnchor, mixinConstraintValidation } from '../../utils/behaviors/constraint-validation'
import { mixinElementInternals } from '../../utils/behaviors/element-internals'
import { SliderValidator } from '../../utils/behaviors/validators/slider-validator'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { isActivationClick } from '../../utils/event/form-label-activation'
import { GetFormState, GetFormValue, mixinFormAssociated } from '../../utils/form/form-associated'
import { mixinFocusRingOptions } from '../focus-ring/focus-ring-options.mixin'
import '../focus-ring/focus-ring'
import '../icon/icon'
import {
    type IMDCSlider,
    SliderDirection,
    SliderSize,
    SliderType,
} from './slider.interface'
import { SliderStyles } from './slider.style'
import {
    clamp,
    computeStepDelta,
    computeTicks,
    fractionToValue,
    snapValue,
    toVisualFraction,
    valueToFraction,
} from './internal/slider-math'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-slider': MDCSlider
    }
}

type ThumbId = 'start' | 'end'

interface ISizeMetrics {
    stopInset  : number
    iconSize   : number
    iconLeading: number
}

const SizeMetricsTable: Record<SliderSize, ISizeMetrics> = {
    'extra-small': { stopInset: 8, iconSize: 0, iconLeading: 0 },
    'small'      : { stopInset: 10, iconSize: 0, iconLeading: 0 },
    'medium'     : { stopInset: 12, iconSize: 24, iconLeading: 12 },
    'large'      : { stopInset: 16, iconSize: 24, iconLeading: 16 },
    'extra-large': { stopInset: 20, iconSize: 32, iconLeading: 24 },
}

const RestHandleWidth = 4
const PressedHandleWidth = 2
const EdgeInset = RestHandleWidth / 2
const ThumbTrackGap = 6
const StopRadius = 2
const TickRadius = 2
const TouchTargetRadius = 24
const DefaultNominalLength = 260
const CoincidentUnlockPx = 2

const formatPos = (vf: number): string =>
    `calc(var(--_edge-inset) + ${vf} * var(--_travel))`

const formatGapStart = (vf: number, handleWidthVar: string): string =>
    `calc(var(--_edge-inset) + ${vf} * var(--_travel) - ${handleWidthVar} / 2 - var(--_thumb-track-gap))`

const formatGapEnd = (vf: number, handleWidthVar: string): string =>
    `calc(var(--_edge-inset) + ${vf} * var(--_travel) + ${handleWidthVar} / 2 + var(--_thumb-track-gap))`

/**
 * @element mdc-slider
 *
 * @slot icon - Optional inset icon for `medium`, `large`, and `extra-large` standard sliders.
 *
 * @fires input - Fired continuously as the slider value changes during interaction.
 * @fires change - Fired when an interaction completes and the value has changed.
 *
 * @csspart container - Root interactive slider container.
 * @csspart track - Track segment element.
 * @csspart handle - Visual handle nub element.
 * @csspart label - Value indicator text element.
 * @csspart focus-ring - Focus ring element attached to each thumb.
 *
 * @version
 * Material Design 3 Expressive
 */
@customElement('mdc-slider')
export class MDCSlider extends composeMixin(
    mixinElementInternals,
    mixinFormAssociated,
    mixinConstraintValidation,
    mixinFocusRingOptions,
)(LitElement) implements IMDCSlider {

    static override styles = SliderStyles

    static override shadowRootOptions: ShadowRootInit = {
        ...LitElement.shadowRootOptions,
        delegatesFocus: true,
    }

    declare disabled: boolean
    declare name: string

    private _value = 0
    private _valueStart = 0
    private _valueEnd = 100
    private _hasExplicitValue = false
    private _hasExplicitValueStart = false
    private _hasExplicitValueEnd = false
    private _initialized = false

    @property({ type: Number })
    public min = 0

    @property({ type: Number })
    public max = 100

    @property({ type: Number })
    public step = 1

    @property({ type: Number })
    public get value(): number {
        return this._value
    }
    public set value(next: number) {
        const prev = this._value
        this._hasExplicitValue = true
        this._value = next
        this.requestUpdate('value', prev)
    }

    @property({ type: Number, attribute: 'value-start' })
    public get valueStart(): number {
        return this._valueStart
    }
    public set valueStart(next: number) {
        const prev = this._valueStart
        this._hasExplicitValueStart = true
        this._valueStart = next
        this.requestUpdate('valueStart', prev)
    }

    @property({ type: Number, attribute: 'value-end' })
    public get valueEnd(): number {
        return this._valueEnd
    }
    public set valueEnd(next: number) {
        const prev = this._valueEnd
        this._hasExplicitValueEnd = true
        this._valueEnd = next
        this.requestUpdate('valueEnd', prev)
    }

    @property({ type: String, reflect: true })
    public type: SliderType = SliderType.Standard

    @property({ type: String, reflect: true })
    public size: SliderSize = SliderSize.ExtraSmall

    @property({ type: String, reflect: true })
    public direction: SliderDirection = SliderDirection.Horizontal

    @property({ type: Boolean, reflect: true })
    public reversed = false

    @property({ type: Boolean, reflect: true })
    public ticks = false

    @property({ type: Boolean, reflect: true })
    public labeled = false

    @property({ type: String })
    public icon = ''

    @property({ type: String, attribute: 'value-label' })
    public valueLabel = ''

    @property({ type: String, attribute: 'value-label-start' })
    public valueLabelStart = ''

    @property({ type: String, attribute: 'value-label-end' })
    public valueLabelEnd = ''

    @property({ attribute: false })
    public valueFormatter?: (value: number) => string

    @property({ type: String, attribute: 'aria-label-start' })
    public ariaLabelStart = ''

    @property({ type: String, attribute: 'aria-label-end' })
    public ariaLabelEnd = ''

    @property({ type: String, attribute: 'aria-valuetext-start' })
    public ariaValueTextStart = ''

    @property({ type: String, attribute: 'aria-valuetext-end' })
    public ariaValueTextEnd = ''

    public get nameStart(): string {
        return this.getAttribute('name-start') ?? this.name
    }
    public set nameStart(value: string) {
        this.setAttribute('name-start', value)
    }

    public get nameEnd(): string {
        return this.getAttribute('name-end') ?? this.nameStart
    }
    public set nameEnd(value: string) {
        this.setAttribute('name-end', value)
    }

    @query('.container')
    private readonly containerElement!: HTMLDivElement | null

    @query('.thumb[data-thumb="start"]')
    private readonly thumbStartElement!: HTMLDivElement | null

    @query('.thumb[data-thumb="end"]')
    private readonly thumbEndElement!: HTMLDivElement | null

    @state() private hoveredThumb: ThumbId | null = null
    @state() private pressedThumb: ThumbId | null = null
    @state() private focusedThumb: ThumbId | null = null
    @state() private trackLength = 0
    @state() private hasSlottedIcon = false

    private resizeObserver?: ResizeObserver
    private activePointerId: number | null = null
    private dragStartSnapshot: { value: number; valueStart: number; valueEnd: number } | null = null
    private pendingCoincidentDrag: { anchorClientPos: number } | null = null

    constructor() {
        super()
        if (!isServer) {
            this.addEventListener('click', (event: MouseEvent) => {
                if (!isActivationClick(event)) return
                this.focus()
            })
        }
    }

    public override connectedCallback() {
        super.connectedCallback()
        if (!isServer && typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const rect = entry.contentRect
                    const length = this.direction === SliderDirection.Vertical ? rect.height : rect.width
                    if (Math.abs(length - this.trackLength) > 0.5) {
                        this.trackLength = length
                    }
                }
            })
            if (this.containerElement) {
                this.resizeObserver.observe(this.containerElement)
            }
        }
    }

    public override disconnectedCallback() {
        super.disconnectedCallback()
        this.resizeObserver?.disconnect()
        this.resizeObserver = undefined
        this.pressedThumb = null
        this.hoveredThumb = null
        this.focusedThumb = null
        this.activePointerId = null
        this.pendingCoincidentDrag = null
        this.dragStartSnapshot = null
    }

    protected override firstUpdated(_changed: PropertyValues) {
        if (this.containerElement && this.resizeObserver) {
            this.resizeObserver.observe(this.containerElement)
        }
    }

    public override focus(options?: FocusOptions) {
        const target = this.thumbEndElement ?? this.thumbStartElement
        target?.focus(options)
    }

    protected override willUpdate(changed: PropertyValues) {
        const safeMin = Number.isFinite(this.min) ? this.min : 0
        const safeMax = Number.isFinite(this.max) ? Math.max(safeMin, this.max) : safeMin
        const snap = snapValue(safeMin, safeMax, this.step)

        if (!this._initialized) {
            this._initialized = true
            if (!this._hasExplicitValue && !this.hasAttribute('value')) {
                this._value = this.type === SliderType.Centered
                    ? snap((safeMin + safeMax) / 2)
                    : snap(safeMin)
            }
            if (!this._hasExplicitValueStart && !this.hasAttribute('value-start')) {
                this._valueStart = snap(safeMin + (safeMax - safeMin) / 3)
            }
            if (!this._hasExplicitValueEnd && !this.hasAttribute('value-end')) {
                this._valueEnd = snap(safeMin + (2 * (safeMax - safeMin)) / 3)
            }
        } else if (changed.has('type') && this.type === SliderType.Centered && !this._hasExplicitValue) {
            this._value = snap((safeMin + safeMax) / 2)
        }

        if (changed.has('disabled') && this.disabled) {
            this.hoveredThumb = null
            this.pressedThumb = null
            this.focusedThumb = null
            this.activePointerId = null
            this.pendingCoincidentDrag = null
            this.dragStartSnapshot = null
        }

        this._value = snap(this._value)
        this._valueStart = snap(this._valueStart)
        this._valueEnd = snap(this._valueEnd)
        if (this._valueStart > this._valueEnd) {
            this._valueStart = this._valueEnd
        }

        if (changed.has('direction') && this.containerElement) {
            const rect = this.containerElement.getBoundingClientRect()
            const length = this.direction === SliderDirection.Vertical ? rect.height : rect.width
            if (length > 0) {
                this.trackLength = length
            }
        }
    }

    private isRtlHorizontal(): boolean {
        if (this.direction === SliderDirection.Vertical || isServer) return false
        return getComputedStyle(this).direction === 'rtl'
    }

    private getEffectiveTrackLength(): number {
        return this.trackLength > 0 ? this.trackLength : DefaultNominalLength
    }

    private getSizeMetrics(): ISizeMetrics {
        return SizeMetricsTable[this.size] ?? SizeMetricsTable[SliderSize.ExtraSmall]
    }

    private formatThumbLabel(val: number, explicitLabel: string): string {
        if (explicitLabel) return explicitLabel
        if (this.valueFormatter) return this.valueFormatter(val)
        return String(val)
    }

    private getAriaLabelFor(thumb: ThumbId): string {
        const { ariaLabel } = this as AriaMixinStrict
        if (this.type === SliderType.Range) {
            if (thumb === 'start') {
                return this.ariaLabelStart || (ariaLabel ? `${ariaLabel} start` : 'Range start')
            }
            return this.ariaLabelEnd || (ariaLabel ? `${ariaLabel} end` : 'Range end')
        }
        return ariaLabel || 'Slider'
    }

    private getAriaValueTextFor(thumb: ThumbId): string {
        if (this.type === SliderType.Range) {
            return thumb === 'start'
                ? this.ariaValueTextStart || this.formatThumbLabel(this._valueStart, this.valueLabelStart)
                : this.ariaValueTextEnd || this.formatThumbLabel(this._valueEnd, this.valueLabelEnd)
        }
        const { ariaValueText } = this as AriaMixinStrict
        return ariaValueText || this.formatThumbLabel(this._value, this.valueLabel)
    }

    private thumbCenterPx(vf: number, length: number): number {
        const travel = Math.max(0, length - 2 * EdgeInset)
        return EdgeInset + vf * travel
    }

    private pointerClientCoord(event: PointerEvent): number {
        return this.direction === SliderDirection.Vertical ? event.clientY : event.clientX
    }

    private clientEventToValue(event: PointerEvent): number {
        const container = this.containerElement
        if (!container) return this._value

        const rect = container.getBoundingClientRect()
        const isVertical = this.direction === SliderDirection.Vertical
        const length = isVertical ? rect.height : rect.width
        if (length <= 0) return this._value

        const travel = Math.max(1, length - 2 * EdgeInset)
        let visualOffset: number
        if (isVertical) {
            visualOffset = rect.bottom - event.clientY - EdgeInset
        } else if (this.isRtlHorizontal()) {
            visualOffset = rect.right - event.clientX - EdgeInset
        } else {
            visualOffset = event.clientX - rect.left - EdgeInset
        }

        const vf = clamp(0, 1)(visualOffset / travel)
        const logicalFraction = this.reversed ? 1 - vf : vf
        return fractionToValue(this.min, this.max, this.step)(logicalFraction)
    }

    private clientEventToVisualPx(event: PointerEvent): number {
        const container = this.containerElement
        if (!container) return 0
        const rect = container.getBoundingClientRect()
        if (this.direction === SliderDirection.Vertical) {
            return rect.bottom - event.clientY
        }
        return this.isRtlHorizontal() ? rect.right - event.clientX : event.clientX - rect.left
    }

    private applyThumbValue(thumb: ThumbId, rawValue: number): boolean {
        const safeMin = Math.min(this.min, this.max)
        const safeMax = Math.max(this.min, this.max)
        const snapped = snapValue(safeMin, safeMax, this.step)(rawValue)

        if (this.type === SliderType.Range) {
            if (thumb === 'start') {
                const nextStart = Math.min(snapped, this._valueEnd)
                if (nextStart === this._valueStart) return false
                this.valueStart = nextStart
                return true
            }
            const nextEnd = Math.max(snapped, this._valueStart)
            if (nextEnd === this._valueEnd) return false
            this.valueEnd = nextEnd
            return true
        }

        if (snapped === this._value) return false
        this.value = snapped
        return true
    }

    private emitInteractionEvent(name: 'input' | 'change') {
        this.dispatchEvent(new Event(name, { bubbles: true, composed: true }))
    }

    private handlePointerDown = (event: PointerEvent) => {
        if (this.disabled || event.button !== 0) return
        const container = this.containerElement
        if (!container) return

        event.preventDefault()
        this.activePointerId = event.pointerId
        container.setPointerCapture(event.pointerId)

        this.dragStartSnapshot = {
            value: this._value,
            valueStart: this._valueStart,
            valueEnd: this._valueEnd,
        }
        this.pendingCoincidentDrag = null

        const length = this.direction === SliderDirection.Vertical
            ? container.getBoundingClientRect().height
            : container.getBoundingClientRect().width
        if (length > 0) {
            this.trackLength = length
        }

        const effectiveLength = this.getEffectiveTrackLength()
        const pointerPx = this.clientEventToVisualPx(event)
        const clickedValue = this.clientEventToValue(event)

        if (this.type === SliderType.Range) {
            const startVf = toVisualFraction(this.reversed)(valueToFraction(this.min, this.max)(this._valueStart))
            const endVf = toVisualFraction(this.reversed)(valueToFraction(this.min, this.max)(this._valueEnd))
            const startCenter = this.thumbCenterPx(startVf, effectiveLength)
            const endCenter = this.thumbCenterPx(endVf, effectiveLength)

            if (this._valueStart === this._valueEnd && Math.abs(pointerPx - startCenter) <= 12) {
                this.pendingCoincidentDrag = { anchorClientPos: this.pointerClientCoord(event) }
                const fallbackThumb: ThumbId = this._valueEnd >= this.max ? 'start' : 'end'
                this.pressedThumb = fallbackThumb
                this.hoveredThumb = fallbackThumb
                return
            }

            const targetThumb: ThumbId =
                Math.abs(pointerPx - startCenter) <= Math.abs(pointerPx - endCenter) ? 'start' : 'end'
            this.pressedThumb = targetThumb
            this.hoveredThumb = targetThumb
            const thumbEl = targetThumb === 'start' ? this.thumbStartElement : this.thumbEndElement
            thumbEl?.focus({ preventScroll: true })
            if (this.applyThumbValue(targetThumb, clickedValue)) {
                this.emitInteractionEvent('input')
            }
            return
        }

        this.pressedThumb = 'end'
        this.hoveredThumb = 'end'
        this.thumbEndElement?.focus({ preventScroll: true })
        if (this.applyThumbValue('end', clickedValue)) {
            this.emitInteractionEvent('input')
        }
    }

    private handlePointerMove = (event: PointerEvent) => {
        if (this.disabled) {
            this.hoveredThumb = null
            return
        }

        const container = this.containerElement
        if (!container) return

        if (this.activePointerId === event.pointerId && this.pressedThumb) {
            if (this.pendingCoincidentDrag) {
                const delta = this.pointerClientCoord(event) - this.pendingCoincidentDrag.anchorClientPos
                if (Math.abs(delta) < CoincidentUnlockPx) return

                const isVertical = this.direction === SliderDirection.Vertical
                const isRtl = this.isRtlHorizontal()
                let towardVisualEnd = isVertical ? delta < 0 : (isRtl ? delta < 0 : delta > 0)
                if (this.reversed) {
                    towardVisualEnd = !towardVisualEnd
                }

                const resolvedThumb: ThumbId = towardVisualEnd ? 'end' : 'start'
                this.pendingCoincidentDrag = null
                this.pressedThumb = resolvedThumb
                this.hoveredThumb = resolvedThumb
                const thumbEl = resolvedThumb === 'start' ? this.thumbStartElement : this.thumbEndElement
                thumbEl?.focus({ preventScroll: true })
            }

            const nextValue = this.clientEventToValue(event)
            if (this.applyThumbValue(this.pressedThumb, nextValue)) {
                this.emitInteractionEvent('input')
            }
            return
        }

        // Hover tracking across 48px touch target around each thumb
        const rect = container.getBoundingClientRect()
        const length = this.direction === SliderDirection.Vertical ? rect.height : rect.width
        if (length <= 0) return

        const pointerPx = this.clientEventToVisualPx(event)
        const endVf = toVisualFraction(this.reversed)(
            valueToFraction(this.min, this.max)(this.type === SliderType.Range ? this._valueEnd : this._value),
        )
        const endCenter = this.thumbCenterPx(endVf, length)
        const distEnd = Math.abs(pointerPx - endCenter)

        if (this.type === SliderType.Range) {
            const startVf = toVisualFraction(this.reversed)(valueToFraction(this.min, this.max)(this._valueStart))
            const startCenter = this.thumbCenterPx(startVf, length)
            const distStart = Math.abs(pointerPx - startCenter)
            if (distStart <= TouchTargetRadius && distStart <= distEnd) {
                this.hoveredThumb = 'start'
            } else if (distEnd <= TouchTargetRadius) {
                this.hoveredThumb = 'end'
            } else {
                this.hoveredThumb = null
            }
            return
        }

        this.hoveredThumb = distEnd <= TouchTargetRadius ? 'end' : null
    }

    private handlePointerUp = (event: PointerEvent) => {
        if (this.activePointerId !== event.pointerId) return
        const container = this.containerElement
        if (container && container.hasPointerCapture(event.pointerId)) {
            container.releasePointerCapture(event.pointerId)
        }

        const snapshot = this.dragStartSnapshot
        this.activePointerId = null
        this.pressedThumb = null
        this.pendingCoincidentDrag = null
        this.dragStartSnapshot = null

        if (snapshot) {
            const changed =
                snapshot.value !== this._value ||
                snapshot.valueStart !== this._valueStart ||
                snapshot.valueEnd !== this._valueEnd
            if (changed) {
                this.emitInteractionEvent('change')
            }
        }
    }

    private handlePointerLeave = () => {
        if (this.activePointerId === null) {
            this.hoveredThumb = null
        }
    }

    private handleThumbFocusIn = (thumb: ThumbId) => (event: FocusEvent) => {
        if (this.disabled) return
        const target = event.currentTarget as HTMLElement
        if (target.matches(':focus-visible')) {
            this.focusedThumb = thumb
        }
    }

    private handleThumbFocusOut = (thumb: ThumbId) => () => {
        if (this.focusedThumb === thumb) {
            this.focusedThumb = null
        }
    }

    private handleThumbKeyDown = (thumb: ThumbId) => (event: KeyboardEvent) => {
        if (this.disabled) return

        const delta = computeStepDelta(this.min, this.max, this.step)
        const bigDelta = Math.max(delta, (this.max - this.min) / 10)
        const isVertical = this.direction === SliderDirection.Vertical
        const isRtl = this.isRtlHorizontal()
        const hDir = (isRtl ? -1 : 1) * (this.reversed ? -1 : 1)
        const vDir = this.reversed ? -1 : 1

        const currentVal = this.type === SliderType.Range
            ? (thumb === 'start' ? this._valueStart : this._valueEnd)
            : this._value

        let nextVal: number | null = null
        switch (event.key) {
            case 'ArrowRight':
                nextVal = currentVal + (isVertical ? 1 : hDir) * delta
                break
            case 'ArrowLeft':
                nextVal = currentVal - (isVertical ? 1 : hDir) * delta
                break
            case 'ArrowUp':
                nextVal = currentVal + vDir * delta
                break
            case 'ArrowDown':
                nextVal = currentVal - vDir * delta
                break
            case 'PageUp':
                nextVal = currentVal + (isVertical ? vDir : hDir) * bigDelta
                break
            case 'PageDown':
                nextVal = currentVal - (isVertical ? vDir : hDir) * bigDelta
                break
            case 'Home':
                nextVal = this.type === SliderType.Range && thumb === 'end' ? this._valueStart : this.min
                break
            case 'End':
                nextVal = this.type === SliderType.Range && thumb === 'start' ? this._valueEnd : this.max
                break
            default:
                return
        }

        event.preventDefault()
        this.focusedThumb = thumb
        if (this.applyThumbValue(thumb, nextVal)) {
            this.emitInteractionEvent('input')
            this.emitInteractionEvent('change')
        }
    }

    private handleIconSlotChange = (event: Event) => {
        const slot = event.target as HTMLSlotElement
        this.hasSlottedIcon = slot.assignedNodes({ flatten: true }).length > 0
    }

    private isStandardIconSupported(): boolean {
        return (
            this.type === SliderType.Standard &&
            (this.size === SliderSize.Medium ||
                this.size === SliderSize.Large ||
                this.size === SliderSize.ExtraLarge)
        )
    }

    protected override render() {
        const length = this.getEffectiveTrackLength()
        const metrics = this.getSizeMetrics()
        const isCentered = this.type === SliderType.Centered
        const isRange = this.type === SliderType.Range

        const startFraction = isRange ? valueToFraction(this.min, this.max)(this._valueStart) : 0
        const endFraction = valueToFraction(this.min, this.max)(isRange ? this._valueEnd : this._value)

        const startVf = toVisualFraction(this.reversed)(startFraction)
        const endVf = toVisualFraction(this.reversed)(endFraction)

        const minVf = Math.min(startVf, endVf)
        const maxVf = Math.max(startVf, endVf)

        const containerAttrs = {
            'data-pressed-thumb': this.pressedThumb ?? '',
        }

        const startHandleHalf = (this.pressedThumb === 'start' ? PressedHandleWidth : RestHandleWidth) / 2
        const endHandleHalf = (this.pressedThumb === 'end' ? PressedHandleWidth : RestHandleWidth) / 2

        const stopThreshold = metrics.stopInset + StopRadius + 2
        const endHandleCenterPx = this.thumbCenterPx(endVf, length)
        const startHandleCenterPx = this.thumbCenterPx(startVf, length)

        let segments: TemplateResult[] = []
        let activeStartVf = 0
        let activeEndVf = 0
        let showStartStop = false
        let showEndStop = false
        let showCenterDot = false

        if (isRange) {
            const minHandleVar = startVf <= endVf ? 'var(--_start-handle-width)' : 'var(--_end-handle-width)'
            const maxHandleVar = startVf <= endVf ? 'var(--_end-handle-width)' : 'var(--_start-handle-width)'
            const minCenterPx = Math.min(startHandleCenterPx, endHandleCenterPx)
            const maxCenterPx = Math.max(startHandleCenterPx, endHandleCenterPx)
            const minHalf = startVf <= endVf ? startHandleHalf : endHandleHalf
            const maxHalf = startVf <= endVf ? endHandleHalf : startHandleHalf

            segments = [
                this.renderSegment('inactive', 'outer', 'inner', '0px', formatGapStart(minVf, minHandleVar)),
                this.renderSegment('active', 'inner', 'inner', formatGapEnd(minVf, minHandleVar), formatGapStart(maxVf, maxHandleVar)),
                this.renderSegment('inactive', 'inner', 'outer', formatGapEnd(maxVf, maxHandleVar), '100%'),
            ]
            activeStartVf = minVf
            activeEndVf = maxVf
            showStartStop = minCenterPx - minHalf - ThumbTrackGap >= stopThreshold
            showEndStop = length - (maxCenterPx + maxHalf + ThumbTrackGap) >= stopThreshold
        } else if (isCentered) {
            const handleVar = 'var(--_end-handle-width)'
            if (endVf >= 0.5) {
                segments = [
                    this.renderSegment('inactive', 'outer', 'inner', '0px', formatGapStart(endVf, handleVar)),
                    this.renderSegment('active', 'inner', 'inner', '50%', formatGapStart(endVf, handleVar)),
                    this.renderSegment('inactive', 'inner', 'outer', formatGapEnd(endVf, handleVar), '100%'),
                ]
                activeStartVf = 0.5
                activeEndVf = endVf
            } else {
                segments = [
                    this.renderSegment('inactive', 'outer', 'inner', '0px', formatGapStart(endVf, handleVar)),
                    this.renderSegment('inactive', 'inner', 'outer', formatGapEnd(endVf, handleVar), '100%'),
                    this.renderSegment('active', 'inner', 'inner', formatGapEnd(endVf, handleVar), '50%'),
                ]
                activeStartVf = endVf
                activeEndVf = 0.5
            }
            showStartStop = endHandleCenterPx - endHandleHalf - ThumbTrackGap >= stopThreshold
            showEndStop = length - (endHandleCenterPx + endHandleHalf + ThumbTrackGap) >= stopThreshold
            showCenterDot = Math.abs(endHandleCenterPx - length / 2) > endHandleHalf + ThumbTrackGap + StopRadius
        } else {
            const handleVar = 'var(--_end-handle-width)'
            if (this.reversed) {
                segments = [
                    this.renderSegment('inactive', 'outer', 'inner', '0px', formatGapStart(endVf, handleVar)),
                    this.renderSegment('active', 'inner', 'outer', formatGapEnd(endVf, handleVar), '100%'),
                ]
                activeStartVf = endVf
                activeEndVf = 1
                showStartStop = endHandleCenterPx - endHandleHalf - ThumbTrackGap >= stopThreshold
            } else {
                segments = [
                    this.renderSegment('active', 'outer', 'inner', '0px', formatGapStart(endVf, handleVar)),
                    this.renderSegment('inactive', 'inner', 'outer', formatGapEnd(endVf, handleVar), '100%'),
                ]
                activeStartVf = 0
                activeEndVf = endVf
                showEndStop = length - (endHandleCenterPx + endHandleHalf + ThumbTrackGap) >= stopThreshold
            }
        }

        const handleCenters = isRange ? [startHandleCenterPx, endHandleCenterPx] : [endHandleCenterPx]
        const tickMarks = this.ticks
            ? computeTicks({
                  min: this.min,
                  max: this.max,
                  step: this.step,
                  reversed: this.reversed,
                  activeStartVf,
                  activeEndVf,
                  handleCenters,
                  trackLength: length,
                  edgeInset: EdgeInset,
                  handleHalf: endHandleHalf,
                  gap: ThumbTrackGap,
                  tickRadius: TickRadius,
                  hideStartEdge: showStartStop,
                  hideEndEdge: showEndStop,
              })
            : []

        return html`
            <div
                class="container"
                part="container"
                data-pressed-thumb=${containerAttrs['data-pressed-thumb'] || nothing}
                @pointerdown=${this.handlePointerDown}
                @pointermove=${this.handlePointerMove}
                @pointerup=${this.handlePointerUp}
                @pointercancel=${this.handlePointerUp}
                @pointerleave=${this.handlePointerLeave}
            >
                ${segments}
                ${showStartStop ? html`<div class="stop-indicator" data-edge="start" aria-hidden="true"></div>` : nothing}
                ${showEndStop ? html`<div class="stop-indicator" data-edge="end" aria-hidden="true"></div>` : nothing}
                ${showCenterDot ? html`<div class="stop-indicator" data-edge="center" aria-hidden="true"></div>` : nothing}
                ${tickMarks.map(
                    (tick) => html`
                        <div
                            class="tick"
                            data-active=${String(tick.active)}
                            style=${styleMap({ '--_tick-vf': String(tick.visualFraction) })}
                            aria-hidden="true"
                        ></div>
                    `,
                )}
                ${this.renderInsetIcon(length, endHandleCenterPx, endHandleHalf, metrics)}
                ${when(isRange, () =>
                    this.renderThumb({
                        thumb: 'start',
                        vf: startVf,
                        value: this._valueStart,
                        ariaMin: this.min,
                        ariaMax: this._valueEnd,
                        label: this.formatThumbLabel(this._valueStart, this.valueLabelStart),
                    }),
                )}
                ${this.renderThumb({
                    thumb: 'end',
                    vf: endVf,
                    value: isRange ? this._valueEnd : this._value,
                    ariaMin: isRange ? this._valueStart : this.min,
                    ariaMax: this.max,
                    label: this.formatThumbLabel(
                        isRange ? this._valueEnd : this._value,
                        isRange ? this.valueLabelEnd : this.valueLabel,
                    ),
                })}
            </div>
        `
    }

    private renderSegment(
        role: 'active' | 'inactive',
        capStart: 'outer' | 'inner' | 'flat',
        capEnd: 'outer' | 'inner' | 'flat',
        segStart: string,
        segEnd: string,
    ): TemplateResult {
        return html`
            <div
                class="track-segment"
                part="track"
                data-role=${role}
                data-cap-start=${capStart}
                data-cap-end=${capEnd}
                style=${styleMap({
                    '--_seg-start': segStart,
                    '--_seg-end': segEnd,
                })}
                aria-hidden="true"
            ></div>
        `
    }

    private renderInsetIcon(
        length: number,
        handleCenterPx: number,
        handleHalf: number,
        metrics: ISizeMetrics,
    ): TemplateResult | typeof nothing {
        if (!this.isStandardIconSupported()) {
            return nothing
        }
        const hasIcon = Boolean(this.icon) || this.hasSlottedIcon
        const iconCenterFromEdge = metrics.iconLeading + metrics.iconSize / 2
        const iconCenterPx = this.reversed ? length - iconCenterFromEdge : iconCenterFromEdge
        const activeTrackLen = this.reversed
            ? Math.max(0, length - (handleCenterPx + handleHalf + ThumbTrackGap))
            : Math.max(0, handleCenterPx - handleHalf - ThumbTrackGap)
        const onInactiveSurface = activeTrackLen < metrics.iconLeading + metrics.iconSize * 0.5
        const occluded = Math.abs(handleCenterPx - iconCenterPx) < metrics.iconSize / 2 + handleHalf + ThumbTrackGap

        return html`
            <div
                class="inset-icon"
                ?hidden=${!hasIcon}
                data-reversed=${String(this.reversed)}
                data-inactive-surface=${String(onInactiveSurface)}
                data-occluded=${String(occluded)}
                aria-hidden="true"
            >
                <slot name="icon" @slotchange=${this.handleIconSlotChange}>
                    ${this.icon ? html`<mdc-icon name=${this.icon}></mdc-icon>` : nothing}
                </slot>
            </div>
        `
    }

    private renderThumb({
        thumb,
        vf,
        value,
        ariaMin,
        ariaMax,
        label,
    }: {
        thumb: ThumbId
        vf: number
        value: number
        ariaMin: number
        ariaMax: number
        label: string
    }): TemplateResult {
        const thumbId = `thumb-${thumb}`
        const classes = {
            thumb: true,
            hovered: !this.disabled && this.hoveredThumb === thumb,
            pressed: !this.disabled && this.pressedThumb === thumb,
            focused: !this.disabled && this.focusedThumb === thumb,
        }

        return html`
            <div
                id=${thumbId}
                class=${classMap(classes)}
                data-thumb=${thumb}
                style=${styleMap({ '--_vf': String(vf) })}
                role="slider"
                tabindex=${this.disabled ? -1 : 0}
                aria-label=${this.getAriaLabelFor(thumb)}
                aria-valuemin=${ariaMin}
                aria-valuemax=${ariaMax}
                aria-valuenow=${value}
                aria-valuetext=${this.getAriaValueTextFor(thumb)}
                aria-orientation=${this.direction}
                aria-disabled=${this.disabled ? 'true' : 'false'}
                @keydown=${this.handleThumbKeyDown(thumb)}
                @focusin=${this.handleThumbFocusIn(thumb)}
                @focusout=${this.handleThumbFocusOut(thumb)}
            >
                <div class="state-layer" aria-hidden="true"></div>
                <div class="handle-ring-anchor">
                    <mdc-focus-ring
                        part="focus-ring"
                        for=${thumbId}
                        ?inward=${this.focusRingInward}
                        .shapeInherit=${this.focusRingShapeInherit}
                        .animationDisabled=${this.focusRingAnimationDisabled}
                        .persistent=${this.focusRingPersistent}
                        ?disabled=${this.disabled || this.focusRingDisabled}
                    ></mdc-focus-ring>
                    <div class="handle" part="handle"></div>
                </div>
                ${when(
                    this.labeled,
                    () => html`
                        <div class="label" aria-hidden="true">
                            <span class="label-content" part="label">${label}</span>
                        </div>
                    `,
                )}
            </div>
        `
    }

    public override [GetFormValue]() {
        if (this.type === SliderType.Range) {
            const data = new FormData()
            data.append(this.nameStart, String(this._valueStart))
            data.append(this.nameEnd, String(this._valueEnd))
            return data
        }
        return String(this._value)
    }

    public override [GetFormState]() {
        return this[GetFormValue]()
    }

    public override formResetCallback() {
        const safeMin = Math.min(this.min, this.max)
        const safeMax = Math.max(this.min, this.max)
        const snap = snapValue(safeMin, safeMax, this.step)

        if (this.type === SliderType.Range) {
            const attrStart = this.getAttribute('default-value-start') ?? this.getAttribute('value-start')
            const attrEnd = this.getAttribute('default-value-end') ?? this.getAttribute('value-end')
            this._valueStart = attrStart !== null ? snap(Number(attrStart)) : snap(safeMin + (safeMax - safeMin) / 3)
            this._valueEnd = attrEnd !== null ? snap(Number(attrEnd)) : snap(safeMin + (2 * (safeMax - safeMin)) / 3)
            this.requestUpdate()
            return
        }

        const attrVal = this.getAttribute('default-value') ?? this.getAttribute('value')
        this._value = attrVal !== null
            ? snap(Number(attrVal))
            : (this.type === SliderType.Centered ? snap((safeMin + safeMax) / 2) : snap(safeMin))
        this.requestUpdate()
    }

    public override formStateRestoreCallback(state: string | Array<[string, string]> | null) {
        if (Array.isArray(state)) {
            const [[, valueStart], [, valueEnd]] = state
            this.type = SliderType.Range
            this.valueStart = Number(valueStart)
            this.valueEnd = Number(valueEnd)
            return
        }
        if (state !== null) {
            this.value = Number(state)
        }
    }

    public override [CreateValidator]() {
        return new SliderValidator(() => ({
            min: this.min,
            max: this.max,
            step: this.step,
            range: this.type === SliderType.Range,
            value: this._value,
            valueStart: this._valueStart,
            valueEnd: this._valueEnd,
        }))
    }

    public override [GetValidityAnchor]() {
        return this
    }
}
