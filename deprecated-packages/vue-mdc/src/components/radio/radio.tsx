/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { defineComponent, type SlotsType } from 'vue'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import { isServer } from '../../utils/is-server'
import { generateUuid } from '../../utils/uuid'
import { FocusRing } from '../focus-ring'
import { Ripple } from '../ripple/ripple'
import { props, type TRadioSlots } from './radio.definition'
import css from './styles/radio.module.scss'

export const Radio = defineComponent({
    name: `${componentNamePrefix}-radio`,
    props: props,
    slots: {} as SlotsType<TRadioSlots>,
    emits: [
        'update:modelValue',
        'change'
    ],
    setup(props) {

        // const _disabled = ref()
    },
    created() {
        if (this.modelValue === null) {
            this.checked = this.defaultChecked
            this.$emit('update:modelValue', this.defaultChecked)

        } else {
            this.checked = this.modelValue
        }
    },
    mounted() {
        if (isServer()) {
            return
        }
        (this.$el as Element).addEventListener('click', this.handleClick)

        const maskElement = (this.$el as Element).querySelector('&>svg>.mask')
        const needMaskElement = (this.$el as Element).querySelector('&>svg>.need-mask')
        if (this.maskId === null) {
            this.maskId = generateUuid()
        }
        maskElement?.setAttribute('id', this.maskId)
        needMaskElement?.setAttribute('mask', `url(#${this.maskId})`)

    },
    beforeUpdate() {
        if (this.modelValue !== null) {
            this.setChecked(this.modelValue)
        }
    },
    beforeUnmount() {
        (this.$el as Element).removeEventListener('click', this.handleClick)
    },
    data: () => ({
        checked: false,
        /**
         * Unique id for mask.
         */
        maskId: null as string | null
    }),
    methods: {
        getRootElement(): HTMLElement | null {
            return this.$el
        },
        getFocusRingElement(): HTMLElement | null {
            return (this.$el as HTMLElement).querySelector('[data-component="focus-ring"]')
        },
        getInputElement(): HTMLElement | null {
            return (this.$el as HTMLElement).querySelector(`input.${css.input}`)
        },
        setChecked(checked: boolean) {
            const changeEvent = new Event('change', { cancelable: true })
            this.$emit('change', changeEvent)
            const preventChange = !dispatchEvent(changeEvent)
            if (preventChange) {
                return
            }
            if (this.checked === checked) {
                return
            }
            this.checked = checked
            this.$emit('update:modelValue', checked)
        },
        handleClick() {
            if (this.disabled) {
                return
            }
            this.setChecked(!this.checked)
        },
    },

    render() {
        return (
            <div
                data-component="radio"
                role="radio"
                class={[css.radio, this.checked && css.checked, this.disabled && css.disabled]}
                tabindex={0}
            >
                <Ripple disabled={this.disabled}></Ripple>
                <FocusRing shapeInherit={false}></FocusRing>

                <svg
                    aria-hidden="true"
                    class={css.icon}
                    viewBox="0 0 20 20"
                >
                    <mask class="mask">
                        <rect
                            width="100%"
                            height="100%"
                            fill="white"
                        />
                        <circle
                            cx="10"
                            cy="10"
                            r="8"
                            fill="black"
                        />
                    </mask>
                    <circle
                        class={["need-mask", css.outer, css.circle]}
                        cx="10"
                        cy="10"
                        r="10"
                    />
                    <circle
                        class={[css.inner, css.circle]}
                        cx="10"
                        cy="10"
                        r="5"
                    />
                </svg>

                <span class={css['touch-target']}></span>
            </div>
        )
    },
})
