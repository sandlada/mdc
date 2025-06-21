/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { useReflectAttribute } from '@glare-labs/vue-reflect-attribute'
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, type SlotsType } from 'vue'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import { isServer } from '../../utils/is-server'
import { Elevation } from '../elevation/elevation'
import { FocusRing } from '../focus-ring'
import { Ripple } from '../ripple/ripple'
import { ButtonAppearance, props, type TButtonAppearance, type TButtonSlots } from './button.definition'
import css from './styles/button.module.scss'

export const Button = defineComponent({
    name: `${componentNamePrefix}-button`,
    slots: {} as SlotsType<TButtonSlots>,
    props,
    setup(props, { slots }) {
        const root = ref<HTMLElement | null>(null)

        const _selected = ref(props.defaultSelected)
        const selected = computed({
            get: () => _selected.value,
            set: (value: boolean) => {
                _selected.value = value
            }
        })

        /**
         * Props
         */
        const _appearance = ref(props.appearance)
        const _size = ref(props.size)
        const _shape = ref(props.shape)
        const _togglable = ref(props.togglable)
        const _defaultSelected = ref(props.defaultSelected)
        const _disabled = ref(props.disabled)
        const _type = ref(props.type)
        const _href = ref(props.href)
        const _target = ref(props.target)
        const _form = ref(props.form)
        const _name = ref(props.name)
        const _value = ref(props.value)

        useReflectAttribute(root, {
            attributes: [
                { attribute: 'appearance', ref: _appearance, reflect: true, type: 'string' },
                { attribute: 'size', ref: _size, reflect: true, type: 'string' },
                { attribute: 'shape', ref: _shape, reflect: true, type: 'string' },
                { attribute: 'togglable', ref: _togglable, reflect: true, type: 'boolean' },
                { attribute: 'defaultSelected', ref: _defaultSelected, reflect: true, type: 'boolean' },
                { attribute: 'disabled', ref: _disabled, reflect: true, type: 'boolean' },
                { attribute: 'type', ref: _type, reflect: true, type: 'string' },
                { attribute: 'href', ref: _href, reflect: true, type: 'string' },
                { attribute: 'target', ref: _target, reflect: true, type: 'string' },
                { attribute: 'form', ref: _form, reflect: true, type: 'string' },
                { attribute: 'name', ref: _name, reflect: true, type: 'string' },
                { attribute: 'value', ref: _value, reflect: true, type: 'string' },
            ]
        })


        const handleClick = async (e: MouseEvent) => {
            if (_href.value && _disabled.value) {
                e.stopImmediatePropagation()
                e.preventDefault()
                return
            }

            selected.value = !selected.value
        }

        onMounted(() => {
            if (isServer()) {
                return
            }
            root.value?.addEventListener('click', handleClick)
        })

        onBeforeUnmount(() => {
            root.value?.removeEventListener('click', handleClick)
        })

        return () => {
            const elevationButtonArray: Array<TButtonAppearance> = [ButtonAppearance.Elevated, ButtonAppearance.Filled, ButtonAppearance.FilledTonal]

            const needElevation = elevationButtonArray.includes(_appearance.value)
            const needOutline = _appearance.value === ButtonAppearance.Outlined

            const iconState = slots['leading-icon'] ? css.left : slots['trailing-icon'] ? css.right : null
            const isLink = _href.value !== null

            const renderContent = (
                <span class={css.button}>
                    <span class={css.touch}></span>
                    {slots['leading-icon'] && slots['leading-icon']()}
                    <span class={[css.label]}>
                        {slots.default && slots.default()}
                    </span>
                    {slots['trailing-icon'] && slots['trailing-icon']()}
                </span>
            )

            const renderButtonWrapper = (
                <button
                    data-component="button"
                    class={[css[_appearance.value], iconState, _disabled.value && css.disabled, css[_size.value], css[_shape.value], _togglable.value && css.togglable, _togglable.value && (selected.value ? css.selected : css.unselected)]}
                    role='button'
                    ref={root}
                    tabindex={_disabled.value ? -1 : 0}
                >
                    <Ripple></Ripple>
                    <FocusRing shapeInherit={false}></FocusRing>

                    {needElevation && <Elevation></Elevation>}
                    {needOutline && <div aria-hidden="true" class={[css.outline]}></div>}

                    <div aria-hidden="true" class={[css.background]}></div>

                    {renderContent}
                </button>
            )
            const renderLinkWrapper = (
                <a
                    data-component="button"
                    class={[css[_appearance.value], iconState, _disabled.value && css.disabled, css[_size.value], css[_shape.value], _togglable.value && css.togglable, _togglable.value && (selected.value ? css.selected : css.unselected)]}
                    role='button'
                    ref={root}
                    tabindex={_disabled.value ? -1 : 0}
                >
                    <Ripple></Ripple>
                    <FocusRing shapeInherit={false}></FocusRing>

                    {needElevation && <Elevation></Elevation>}
                    {needOutline && <div aria-hidden="true" class={[css.outline]}></div>}

                    <div aria-hidden="true" class={[css.background]}></div>

                    {renderContent}
                </a>
            )

            return isLink ? renderLinkWrapper : renderButtonWrapper
        }
    },
    inheritAttrs: true,
})
