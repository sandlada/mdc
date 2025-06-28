/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { useReflectAttribute } from '@glare-labs/vue-reflect-attribute'
import { defineComponent, onBeforeUnmount, onBeforeUpdate, onMounted, ref, type SlotsType } from 'vue'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import { isServer } from '../../utils/is-server'
import { FocusRing } from '../focus-ring'
import { Ripple } from '../ripple/ripple'
import css from './styles/icon-button.module.scss'
import { props, type TToggleIconButtonSlots } from './toggle-icon-button.definition'

export const ToggleIconButton = defineComponent({
    name: `${componentNamePrefix}-toggle-icon-button`,
    props: props,
    slots: {} as SlotsType<TToggleIconButtonSlots>,
    emits: [
        'update:modelValue',
        'change'
    ],
    setup(props, { slots, emit }) {
        const root = ref<HTMLElement | null>(null)

        /**
         * States
         */
        const _selected = ref(props.defaultSelected)

        /**
         * Props
         */
        const _appearance = ref(props.appearance)
        const _size = ref(props.size)
        const _width = ref(props.width)
        const _shape = ref(props.shape)
        const _disabled = ref(props.disabled)
        const _name = ref(props.name)
        const _value = ref(props.value)

        useReflectAttribute(root, {
            attributes: [
                { attribute: 'appearance', ref: _appearance, reflect: true, type: 'string', },
                { attribute: 'size', ref: _size, reflect: true, type: 'string', },
                { attribute: 'width', ref: _width, reflect: true, type: 'string', },
                { attribute: 'shape', ref: _shape, reflect: true, type: 'string', },
                { attribute: 'disabled', ref: _disabled, reflect: true, type: 'boolean', },
                { attribute: 'name', ref: _name, reflect: true, type: 'string', },
                { attribute: 'value', ref: _value, reflect: true, type: 'string', },
                { attribute: 'selected', ref: _selected, reflect: true, type: 'boolean', },
            ],
        })

        /**
         * Methods
         */
        const setSelected = (value: boolean) => {
            const changeEvent = new Event('change', { bubbles: true, cancelable: true, })
            emit('change', changeEvent)
            const preventChange = !dispatchEvent(changeEvent)
            if (preventChange) {
                return
            }
            console.log('u')

            _selected.value = value
            emit('update:modelValue', value)
        }
        const handleIconButtonClick = (e: Event) => {
            e.stopImmediatePropagation()
            e.preventDefault()
            if (_disabled.value) {
                return
            }
            setSelected(!_selected.value)
        }

        onMounted(() => {
            if (isServer()) {
                return
            }

            root.value?.addEventListener('click', handleIconButtonClick)
        })

        onBeforeUnmount(() => {
            root.value?.removeEventListener('click', handleIconButtonClick)
        })

        onBeforeUpdate(() => {
            if (props.modelValue !== null) {
                _selected.value = props.modelValue
            }
        })

        return () => {

            const renderIcon = (
                <span class={css.icon}>
                    {slots.default && slots.default()}
                </span>
            )

            return (
                <button
                    class={[
                        css[_appearance.value],
                        css['togglable'],
                        _selected.value ? css.selected : css.unselected,
                        _disabled.value && css.disabled,
                        css[_size.value],
                        css[_width.value],
                        css[_shape.value],
                    ]}
                    data-component="togglable-icon-button"
                    role='checkbox'
                    ref={root}
                >
                    <Ripple></Ripple>
                    <FocusRing shapeInherit={false}></FocusRing>

                    <div aria-hidden="true" class={css.touch}></div>
                    <div aria-hidden="true" class={css.background}></div>
                    <div aria-hidden="true" class={css.outline}></div>

                    {renderIcon}
                </button>
            )
        }
    },
    inheritAttrs: true,
})
