/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { useReflectAttribute } from '@glare-labs/vue-reflect-attribute'
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch, type ComponentPublicInstance, type SlotsType } from 'vue'
import { afterDispatch, dispatchActivationClick, isActivationClick, redispatchEvent, setupDispatchHooks } from '../../internals'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import { generateUuid } from '../../utils'
import { isServer } from '../../utils/is-server'
import { FocusRing } from '../focus-ring'
import { Ripple } from '../ripple/ripple'
import css from './styles/switch.module.scss'
import { props, type TSwitchSlots } from './switch.definition'

const SwitchOnIcon = () => (
    <div class={[css.icon, css['icon--on']]}>
        <svg viewBox="0 0 24 24">
            <path d="M9.55 18.2 3.65 12.3 5.275 10.675 9.55 14.95 18.725 5.775 20.35 7.4Z" />
        </svg>
    </div>
)

const SwitchOffIcon = () => (
    <div class={[css.icon, css['icon--off']]}>
        <svg viewBox="0 0 24 24">
            <path
                d="M6.4 19.2 4.8 17.6 10.4 12 4.8 6.4 6.4 4.8 12 10.4 17.6 4.8 19.2 6.4 13.6 12 19.2 17.6 17.6 19.2 12 13.6Z"
            />
        </svg>
    </div>
)

export const Switch = defineComponent({
    name: `${componentNamePrefix}-switch`,
    props: props,
    slots: {} as SlotsType<TSwitchSlots>,
    emits: [
        'update:modelValue',
        'change'
    ],
    setup(props, { emit, slots }) {
        const root = ref<HTMLElement | null>(null)
        const input = ref<HTMLInputElement | null>(null)
        const ripple = ref<ComponentPublicInstance | null>(null)
        const focusRing = ref<ComponentPublicInstance | null>(null)

        const _selected = ref(props.defaultSelected)
        const selected = computed({
            get: () => _selected.value,
            set: (value: boolean) => {
                _selected.value = value
                emit('update:modelValue', value)
            }
        })

        /**
         * Props
         */
        const _disabled = ref(props.disabled)
        const _withIcon = ref(props.withIcon)
        const _withIconSelectedOnly = ref(props.withIconSelectedOnly)

        /**
         * Form
         */
        const _value = computed(() => selected.value ? 'on' : 'off')

        useReflectAttribute(root, {
            attributes: [
                { attribute: 'disabled', ref: _disabled, reflect: true, type: 'boolean', },
                { attribute: 'selected', ref: _selected, reflect: true, type: 'boolean', },
                { attribute: 'with-icon', ref: _withIcon, reflect: true, type: 'boolean', },
                { attribute: 'with-icon-selected-only', ref: _withIconSelectedOnly, reflect: true, type: 'boolean', },
                { attribute: 'value', ref: _value, reflect: false, type: 'string', },
            ]
        })

        /**
         * Methods
         */
        const handleClick = (event: MouseEvent) => {
            if (!isActivationClick(event) || !input.value) {
                return
            }

            root.value?.focus()
            if (input.value) {
                dispatchActivationClick(input.value)
            }
        }
        const handleKeydown = (event: KeyboardEvent) => {
            afterDispatch(event, () => {
                const ignoreEvent = event.defaultPrevented || event.key !== 'Enter'
                if (ignoreEvent || _disabled.value || !input.value) {
                    return
                }

                input.value.click()
            })
        }
        const handleInput = (event: Event) => {
            const target = event.target as HTMLInputElement
            selected.value = target.checked
        }
        const handleChange = (event: Event) => {
            redispatchEvent(root.value!, event)
        }

        onMounted(() => {
            if (isServer() || !root.value) {
                return
            }

            const innerId = `switch-${generateUuid()}`
            input.value?.setAttribute('id', innerId)
            focusRing.value?.$el.setAttribute('for', innerId)
            ripple.value?.$el.setAttribute('for', innerId)

            setupDispatchHooks(root.value, 'keydown')
            root.value.addEventListener('click', handleClick)
            root.value.addEventListener('keydown', handleKeydown)
        })

        onBeforeUnmount(() => {
            root.value?.removeEventListener('click', handleClick)
            root.value?.removeEventListener('keydown', handleKeydown)
        })

        watch(() => props.modelValue, (newValue, oldValue) => {
            selected.value = newValue
        }, {
            immediate: false,
        })


        return () => {
            const renderIcon = (
                <span class={[css.handle, (_withIconSelectedOnly.value || _withIcon.value) && css['with-icon']]}>
                    {
                        (_withIconSelectedOnly.value || _withIcon.value) &&
                        <div class={css.icons}>
                            {
                                _selected.value && (slots['on-icon'] ? slots['on-icon']() : <SwitchOnIcon></SwitchOnIcon>)
                            }
                            {
                                !_withIconSelectedOnly.value && !_selected.value && (slots['off-icon'] ? slots['off-icon']() : <SwitchOffIcon></SwitchOffIcon>)
                            }
                        </div>
                    }
                </span>
            )

            return (
                <div
                    class={[css.switch, _disabled.value && css.disabled, _selected.value ? css.selected : css.unselected]}
                    role="switch"
                    aria-disabled={_disabled.value}
                    data-component="switch"
                    ref={root}
                >
                    <FocusRing ref={focusRing} shapeInherit={false}></FocusRing>

                    <input
                        type="checkbox"
                        role="switch"
                        checked={_selected.value}
                        disabled={_disabled.value}
                        aria-disabled={_disabled.value}
                        class={"need-inner-id"}
                        onInput={handleInput}
                        onChange={handleChange}
                        ref={input}
                    />

                    <span aria-hidden="true" class={css.background}></span >
                    <span aria-hidden="true" class={css.outline}></span >

                    <span class={css.track} aria-hidden="true">
                        <span class={css['handle-container']}>
                            <Ripple ref={ripple}></Ripple>
                            {renderIcon}
                        </span>
                    </span>
                </div>
            )
        }
    },
    inheritAttrs: true,
})
