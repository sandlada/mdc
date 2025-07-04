/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { useReflectAttribute } from '@glare-labs/vue-reflect-attribute'
import { computed, defineComponent, readonly, ref, type Ref } from 'vue'
import { redispatchEvent } from '../../internals'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import { generateUuid } from '../../utils'
import { FocusRing } from '../focus-ring'
import { props, type TSliderSlots } from './slider.definition'
import css from './styles/style.module.scss'
import { useAction } from './use-action'

export const Slider = defineComponent({
    name: `${componentNamePrefix}-slider`,
    props: props,
    slots: {} as TSliderSlots,
    emits: [],
    setup(props, { slots, emit }) {

        const root = ref<HTMLElement | null>(null)
        const inputStart = ref<HTMLInputElement | null>(null)
        const inputEnd = ref<HTMLInputElement | null>(null)
        const handleStart = ref<HTMLElement | null>(null)
        const handleEnd = ref<HTMLElement | null>(null)

        /**
         * State
         */
        const { action, finishAction, startAction, clampAction, flipAction, isActionFlipped, needsClamping } = useAction(inputStart, inputEnd)
        const renderValueStart: Ref<null | number> = ref(props.valueStart)
        const renderValueEnd: Ref<null | number> = ref(props.valueEnd)
        const startOnTop: Ref<boolean> = ref(false)
        const handleStartHover = ref<boolean>(false)
        const handleEndHover = ref<boolean>(false)
        const isRedispatchingEvent = ref<boolean>(false)
        const focusRingIdStart = readonly(ref(`focus-ring-start-${generateUuid()}`))
        const focusRingIdEnd = readonly(ref(`focus-ring-end-${generateUuid()}`))

        /**
         * Props
         */

        const _size = ref(props.size)
        const _disabled = ref(props.disabled)
        const _min = ref(props.min)
        const _max = ref(props.max)
        const _step = ref(props.step)
        const _ticks = ref(props.ticks)
        const _labeled = ref(props.labeled)
        const _range = ref(props.range)
        const _value = ref(props.value)
        const _valueStart = ref(props.valueStart)
        const _valueEnd = ref(props.valueEnd)
        const _valueLabel = ref(props.valueLabel)
        const _valueLabelStart = ref(props.valueLabelStart)
        const _valueLabelEnd = ref(props.valueLabelEnd)
        const _ariaLabelStart = ref(props.ariaLabelStart)
        const _ariaLabelEnd = ref(props.ariaLabelEnd)
        const _ariaValueStart = ref(props.ariaValueStart)
        const _ariaValueEnd = ref(props.ariaValueEnd)
        const _ariaValuetextStart = ref(props.ariaValuetextStart)
        const _ariaValuetextEnd = ref(props.ariaValuetextEnd)

        useReflectAttribute(root, {
            attributes: [
                { attribute: 'size', ref: _size, reflect: true, type: 'string', },
                { attribute: 'disabled', ref: _disabled, reflect: true, type: 'boolean', },
                { attribute: 'min', ref: _min, reflect: true, type: 'number', },
                { attribute: 'max', ref: _max, reflect: true, type: 'number', },
                { attribute: 'step', ref: _step, reflect: true, type: 'number', },
                { attribute: 'ticks', ref: _ticks, reflect: true, type: 'boolean', },
                { attribute: 'labeled', ref: _labeled, reflect: true, type: 'boolean', },
                { attribute: 'range', ref: _range, reflect: true, type: 'boolean', },
                { attribute: 'value', ref: _value, reflect: true, type: 'number', },
                { attribute: 'value-start', ref: _valueStart, reflect: true, type: 'number', },
                { attribute: 'value-end', ref: _valueEnd, reflect: true, type: 'number', },
                { attribute: 'value-label', ref: _valueLabel, reflect: true, type: 'string', },
                { attribute: 'value-label-start', ref: _valueLabelStart, reflect: true, type: 'string', },
                { attribute: 'value-label-end', ref: _valueLabelEnd, reflect: true, type: 'string', },
                { attribute: 'aria-label-start', ref: _ariaLabelStart, reflect: true, type: 'string', },
                { attribute: 'aria-label-end', ref: _ariaLabelEnd, reflect: true, type: 'string', },
                { attribute: 'aria-value-start', ref: _ariaValueStart, reflect: true, type: 'string', },
                { attribute: 'aria-value-end', ref: _ariaValueEnd, reflect: true, type: 'string', },
                { attribute: 'aria-valuetext-start', ref: _ariaValuetextStart, reflect: true, type: 'string', },
                { attribute: 'aria-valuetext-end', ref: _ariaValuetextEnd, reflect: true, type: 'string', },
            ]
        })

        const ariaLabelStart = computed(() => {
            if (!root.value) {
                return undefined
            }
            const { ariaLabel } = root.value
            return (
                _ariaLabelStart.value || (ariaLabel && `${ariaLabel} start`) || _valueLabelStart.value || String(_valueStart.value)
            )
        })
        const ariaValueTextStart = computed(() => _ariaValuetextStart.value || _valueLabelStart.value || String(_valueStart.value))
        // Note: end aria-* properties are applied for single and range sliders, which
        // is why it needs to handle `this.range` (while start aria-* properties do
        // not).
        const ariaLabelEnd = computed(() => {
            if (!root.value) {
                return undefined
            }
            // Needed for closure conformance
            const { ariaLabel } = root.value
            if (_range.value) {
                return (_ariaLabelEnd.value || (ariaLabel && `${ariaLabel} end`) || _valueLabelEnd.value || String(_valueEnd.value))
            }
            return ariaLabel || _valueLabel.value || String(_value.value)
        })
        const ariaValueTextEnd = computed(() => {
            if (_range.value) {
                return _ariaValuetextEnd.value || _valueLabelEnd.value || String(_valueEnd.value)
            }

            if (!root.value) {
                return undefined
            }

            // Needed for conformance
            const { ariaValueText } = root.value!
            return ariaValueText || _valueLabel.value || String(_value.value)
        })
        const step = computed(() => _step.value === 0 ? 1 : _step.value)
        const range = computed(() => Math.max(_max.value - _min.value, step.value))
        const startFraction = computed(() => _range.value ? ((renderValueStart.value ?? _min.value) - _min.value) / range.value : 0)
        const endFraction = computed(() => ((renderValueEnd.value ?? _min.value) - _min.value) / range.value)
        const labelStart = computed(() => _valueLabelStart.value || String(renderValueStart.value))
        const labelEnd = computed(() => (_range.value ? _valueLabelEnd.value : _valueLabel.value) || String(renderValueEnd.value))
        const valueStart = computed({
            get: () => _valueStart.value,
            set: (value: number) => {
                _valueStart.value = value
                renderValueStart.value = value
            }
        })
        const valueEnd = computed({
            get: () => _valueEnd.value,
            set: (value: number) => {
                _valueEnd.value = value
                renderValueEnd.value = value
            }
        })
        const value = computed({
            get: () => _value.value,
            set: (value: number) => {
                _value.value = value
                // _valueEnd.value = value
                renderValueEnd.value = _range.value ? valueEnd.value : value
            }
        })

        /**
         * Methods
         */
        const inBounds = ({ x, y }: PointerEvent, element?: HTMLElement | null) => {
            if (!element) {
                return false
            }
            const { top, left, bottom, right } = element.getBoundingClientRect()
            return x >= left && x <= right && y >= top && y <= bottom
        }
        const updateOnTop = (input: HTMLInputElement) => {
            startOnTop.value = input.classList.contains(css.start)
        }


        /**
         * Events
         */
        const handleFocus = (e: Event) => {
            updateOnTop(e.target as HTMLInputElement)
        }
        const handleKeydown = (e: KeyboardEvent) => {
            startAction(e)
        }
        const handleKeyup = () => {
            finishAction()
        }
        const handlePointerDown = (e: PointerEvent) => {
            startAction(e)
            // ripplePointerId = e.pointerId
            const isStart = (e.target as HTMLInputElement) === inputStart.value
            // Since handle moves to pointer on down and there may not be a move,
            // it needs to be considered hovered.
            handleStartHover.value = !_disabled.value && isStart && Boolean(handleStart.value)
            handleEndHover.value = !_disabled.value && !isStart && Boolean(handleEnd.value)
        }
        const handlePointerUp = async (e: PointerEvent) => {
            if (!action.value) {
                return
            }
            const { target, flipped, values } = action.value
            await new Promise(requestAnimationFrame)

            if (target !== undefined && target !== null) {
                target.focus()

                if (flipped && target.valueAsNumber !== values.get(target)!) {
                    target.dispatchEvent(new Event('change', { bubbles: true }))
                }
            }

            finishAction()
        }
        const handlePointerMove = (e: PointerEvent) => {
            handleStartHover.value = !_disabled.value && inBounds(e, handleStart.value)
            handleEndHover.value = !_disabled.value && inBounds(e, handleEnd.value)
        }
        const handlePointerEnter = (e: PointerEvent) => {
            handlePointerMove(e)
        }
        const handlePointerLeave = () => {
            handleStartHover.value = false
            handleEndHover.value = false
        }
        const handleInput = (event: Event) => {
            // avoid processing a re-dispatched event
            if (isRedispatchingEvent.value) {
                return
            }
            let stopPropagation = false
            let redispatch = false
            if (_range.value) {
                if (isActionFlipped()) {
                    stopPropagation = true
                    redispatch = flipAction()
                }
                if (clampAction()) {
                    stopPropagation = true
                    redispatch = false
                }
            }
            const target = event.target as HTMLInputElement
            updateOnTop(target)
            // update value only on interaction
            if (_range.value) {
                valueStart.value = inputStart.value!.valueAsNumber
                valueEnd.value = inputEnd.value!.valueAsNumber
            } else {
                value.value = inputEnd.value!.valueAsNumber
            }
            // control external visibility of input event
            if (stopPropagation) {
                event.stopPropagation()
            }
            // ensure event path is correct when flipped.
            if (redispatch) {
                isRedispatchingEvent.value = true
                redispatchEvent(target, event)
                isRedispatchingEvent.value = false
            }
        }

        const handleChange = (event: Event) => {
            // prevent keyboard triggered changes from dispatching for
            // clamped values; note, this only occurs for keyboard
            const changeTarget = event.target as HTMLInputElement
            const { target, values } = action.value ?? {}
            const squelch = target && target.valueAsNumber === values!.get(changeTarget)!
            if (!squelch) {
                redispatchEvent(root.value!, event)
            }
            // ensure keyboard triggered change clears action.
            finishAction()
        }


        const RenderLabel = (props: { label: Ref<string> }) => (
            <div class={css.label}>
                <span>{props.label.value}</span>
            </div>
        )

        const RenderTrack = () => (
            <div class={css.track}>
                <span class={css.icon}>
                    {slots.icon && slots.icon()}
                </span>

                <span class={css.active}></span>
                <span class={[css.inactive, css.left]}></span>
                <span class={[css.inactive, css.right]}></span>
            </div>
        )

        const RenderHandle = (props: { start: boolean, label: Ref<string>, hover: Ref<boolean> }) => (
            <div class={[css.handle, props.start && startOnTop.value && css['on-top'], props.start ? css.start : css.end, props.hover.value && css.hover]}>
                <FocusRing for={props.start ? focusRingIdStart.value : focusRingIdEnd.value}></FocusRing>

                <div class={css.handleNub} ></div>

                {
                    _labeled.value && <RenderLabel label={props.label} />
                }
            </div>
        )

        const RenderInput = ({
            start,
            value,
            ariaLabel,
            ariaValueText,
            ariaMin,
            ariaMax,
        }: {
            start: boolean
            value?: number
            ariaLabel?: string
            ariaValueText?: string
            ariaMin: number
            ariaMax: number
        }) => (
            <input
                type="range"
                class={[start ? css.start : css.end]}
                onFocus={handleFocus}
                onPointerdown={handlePointerDown}
                onPointerup={handlePointerUp}
                onPointerenter={handlePointerEnter}
                onPointermove={handlePointerMove}
                onPointerleave={handlePointerLeave}
                onKeydown={handleKeydown}
                onKeyup={handleKeyup}
                onInput={handleInput}
                onChange={handleChange}
                {...{
                    disabled: _disabled.value,
                }}
                step={step.value}
                min={_min.value}
                max={_max.value}
                id={start ? focusRingIdStart.value : focusRingIdEnd.value}
                value={value}
                tab-index={start ? 1 : 0}
                aria-valuemin={ariaMin}
                aria-valuemax={ariaMax}
                aria-label={ariaLabel}
                aria-valuetext={ariaValueText}
            />
        )

        return () => {


            return (
                <div
                    ref={root}
                    data-component="slider"
                    class={[css.slider, css.variable, css[_size.value], _range.value && css.ranged]}
                    style={`--_start-fraction: ${String(startFraction.value)}; --_end-fraction: ${String(endFraction.value)};`}
                >


                    {
                        _range.value && <RenderInput ref={inputStart} start={true} value={renderValueStart.value ?? 0} ariaLabel={ariaLabelStart.value} ariaValueText={ariaValueTextStart.value} ariaMin={_min.value} ariaMax={_max.value}></RenderInput>
                    }

                    <RenderInput ref={inputEnd} start={false} value={renderValueEnd.value ?? 0} ariaLabel={ariaLabelEnd.value} ariaValueText={ariaValueTextEnd.value} ariaMin={_min.value} ariaMax={_max.value}></RenderInput>

                    <RenderTrack></RenderTrack>

                    <div class={css.handleContainerPadded}>
                        <div class={css.handleContainerBlock}>
                            <div class={css.handleContainer}>
                                {
                                    _range.value && <RenderHandle start={true} hover={handleStartHover} label={labelStart}></RenderHandle>
                                }
                                <RenderHandle start={false} hover={handleEndHover} label={labelEnd}></RenderHandle>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    },
})
