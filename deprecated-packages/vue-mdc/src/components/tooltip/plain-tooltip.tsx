/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { useReflectAttribute } from '@glare-labs/vue-reflect-attribute'
import { computed, defineComponent, onMounted, ref, type SlotsType } from 'vue'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import { Corner, useSurfacePosition, type ISurfacePositionControllerProperties } from '../../internals/controller/use-surface-position'
import { createAnimationSignal } from '../../internals/motion/animation'
import { isServer } from '../../utils'
import { animateClose, animateOpen } from './animation'
import { props, type TPlainTooltipSlots } from './plain-tooltip.definition'
import css from './styles/plain-tooltip.module.scss'
import { STooltipController, useTooltip, type ITooltipControllerHost } from './tooltip-controller'

export const PlainTooltip = defineComponent({
    name: `${componentNamePrefix}-plain-tooltip`,
    props: props,
    slots: {} as SlotsType<TPlainTooltipSlots>,
    emits: [],
    setup(props, { }) {
        const root = ref<ITooltipControllerHost | null>(null)
        const animationSignal = createAnimationSignal()

        /**
         * Computed
         */
        const visibility = computed({
            set: (value: boolean) => {
                if (_visibility.value === value) {
                    return
                }
                _visibility.value = value
                if (value) {
                } else {
                }
            },
            get: () => _visibility.value
        })
        const anchorElement = computed<HTMLElement | null>(() => {
            if (!root.value) {
                return null
            }
            const document = window.document
            if (!document) {
                return null
            }
            return document.querySelector(`#${_anchor.value}`)
        })
        const surfacePositionProps = computed<ISurfacePositionControllerProperties>(() => ({
            anchorCorner: Corner.EndStart,
            surfaceCorner: Corner.StartStart,
            anchorEl: anchorElement.value,
            surfaceEl: root.value,
            isOpen: visibility.value,
            positioning: 'document',
            xOffset: 0,
            yOffset: 0,
            disableBlockFlip: true,
            disableInlineFlip: true,
            onBeforeOpen: async () => setVisibilityAttribute(true),
            onOpen: showTooltip,
            onBeforeClose: hideTooltip,
            onClose: async () => setVisibilityAttribute(false),
        }))

        /**
         * Props
         */
        const _supportingText = ref(props.supportingText)
        const _position = ref(props.position)
        const _visibility = ref(props.visibility)
        const _disabled = ref(props.disabled)
        const _showDelay = ref(props.showDelay)
        const _hideDelay = ref(props.hideDelay)
        const _anchor = ref(props.anchor)
        const _disableElevation = ref(props.disableElevation)

        useReflectAttribute(root, {
            attributes: [
                { attribute: 'supporting-text', ref: _supportingText, reflect: true, type: 'string' },
                { attribute: 'position', ref: _position, reflect: true, type: 'string', },
                { attribute: 'visible', ref: _visibility, reflect: true, type: 'boolean', },
                { attribute: 'disabled', ref: _disabled, reflect: true, type: 'boolean', },
                { attribute: 'showDelay', ref: _showDelay, reflect: true, type: 'number', },
                { attribute: 'hideDelay', ref: _hideDelay, reflect: true, type: 'number', },
                { attribute: 'anchor', ref: _anchor, reflect: true, type: 'string', },
                { attribute: 'disable-elevation', ref: _disableElevation, reflect: true, type: 'boolean', },
            ],
            tick: 'before'
        })

        /**
         * Methods
         */
        const showTooltip = (delay?: number) => {
            if (!root.value || _disabled.value) {
                return
            }
            return animateOpen(root.value, animationSignal)
        }

        const hideTooltip = (delay?: number) => {
            if (!root.value) {
                return
            }
            return animateClose(root.value, animationSignal)
        }

        const setVisibilityAttribute = (visibility: boolean) => {
            if (visibility) {
                root.value?.setAttribute('visible', '')
            } else {
                root.value?.removeAttribute('visible')
            }
        }

        useTooltip(root, anchorElement, {
            disabled: _disabled,
            hideDelay: _hideDelay,
            position: _position,
            showDelay: _showDelay,
            touchGestures: ref('auto'),
            visibility: visibility
        })



        const { surfaceStyles } = useSurfacePosition(surfacePositionProps)

        onMounted(() => {
            if (isServer()) {
                return
            }
            if (!root.value) {
                return
            }

            root.value[STooltipController] = {
                open: showTooltip,
                close: hideTooltip,
                position: _position,
                visibility: visibility,
                touchGestures: ref('auto'),
            }
        })

        return () => {
            return (
                <span ref={root} class={css['plain-tooltip']} style={surfaceStyles.value}>
                    {_supportingText.value && <span class={css['supporting-text']}>{_supportingText.value}</span>}
                </span>
            )
        }
    },
    inheritAttrs: true,
})
