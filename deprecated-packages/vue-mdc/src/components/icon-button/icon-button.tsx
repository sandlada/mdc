/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { useReflectAttribute } from '@glare-labs/vue-reflect-attribute'
import { defineComponent, onBeforeUnmount, onMounted, ref, toRef, type SlotsType } from 'vue'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import { isServer } from '../../utils'
import { useObserveProps } from '../../utils/observe-props'
import { FocusRing } from '../focus-ring'
import { Ripple } from '../ripple/ripple'
import { props, type TIconButtonSlots } from './icon-button.definition'
import css from './styles/icon-button.module.scss'

export const IconButton = defineComponent({
    name: `${componentNamePrefix}-icon-button`,
    slots: {} as SlotsType<TIconButtonSlots>,
    props: props,
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
        const _togglable = ref(props.togglable)
        const _disabled = ref(props.disabled)
        const _type = ref(props.type)
        const _href = ref(props.href)
        const _target = ref(props.target)
        const _form = ref(props.form)
        const _name = ref(props.name)
        const _value = ref(props.value)

        useReflectAttribute(root, {
            attributes: [
                { attribute: 'selected', ref: _selected, reflect: true, type: 'boolean', },
                { attribute: 'appearance', ref: _appearance, reflect: true, type: 'string', },
                { attribute: 'size', ref: _size, reflect: true, type: 'string', },
                { attribute: 'width', ref: _width, reflect: true, type: 'string', },
                { attribute: 'shape', ref: _shape, reflect: true, type: 'string', },
                { attribute: 'togglable', ref: _togglable, reflect: true, type: 'boolean', },
                { attribute: 'disabled', ref: _disabled, reflect: true, type: 'boolean', },
                { attribute: 'type', ref: _type, reflect: true, type: 'string', },
                { attribute: 'href', ref: _href, reflect: true, type: 'string', },
                { attribute: 'target', ref: _target, reflect: true, type: 'string', },
                { attribute: 'form', ref: _form, reflect: true, type: 'string', },
                { attribute: 'name', ref: _name, reflect: true, type: 'string', },
                { attribute: 'value', ref: _value, reflect: true, type: 'string', },
            ]
        })

        useObserveProps([
            { id: 'appearance', property: toRef(props.appearance), callback: (value) => _appearance.value = value },
            { id: 'size', property: toRef(props.size), callback: (value) => _size.value = value },
            { id: 'width', property: toRef(props.width), callback: (value) => _width.value = value },
            { id: 'shape', property: toRef(props.shape), callback: (value) => _shape.value = value },
            { id: 'togglable', property: toRef(props.togglable), callback: (value) => _togglable.value = value },
            { id: 'disabled', property: toRef(props.disabled), callback: (value) => _disabled.value = value },
            { id: 'type', property: toRef(props.type), callback: (value) => _type.value = value },
            { id: 'href', property: toRef(props.href), callback: (value) => _href.value = value },
            { id: 'target', property: toRef(props.target), callback: (value) => _target.value = value },
            { id: 'form', property: toRef(props.form), callback: (value) => _form.value = value },
            { id: 'name', property: toRef(props.name), callback: (value) => _name.value = value },
            { id: 'value', property: toRef(props.value), callback: (value) => _value.value = value },
            { id: 'moodelValue', property: () => props.modelValue, callback: (value) => _selected.value = value },
        ])

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

        return () => {
            const isLink = _href.value !== null

            const classes = [
                css[_appearance.value],
                _disabled.value && css.disabled,
                _togglable.value && css.togglable,
                _selected.value ? css.selected : css.unselected,
                css[_size.value],
                css[_width.value],
                css[_shape.value],
            ]

            const renderIcon = (
                <span class={css.icon}>
                    {slots.default && slots.default()}
                </span>
            )
            const renderContent = (
                <>
                    <Ripple></Ripple>
                    <FocusRing shapeInherit={false}></FocusRing>
                    <div aria-hidden="true" class={css.touch}></div>
                    <div aria-hidden="true" class={css.background}></div>
                    <div aria-hidden="true" class={css.outline}></div>
                    {renderIcon}
                </>
            )
            const renderLink = (
                <a
                    class={classes}
                    data-component="icon-button"
                    href={_href.value}
                    ref={root}
                >
                    {renderContent}
                </a>
            )
            const renderButton = (
                <button
                    class={classes}
                    data-component="icon-button"
                    ref={root}
                >
                    {renderContent}
                </button>
            )


            return isLink ? renderLink : renderButton
        }
    },
    inheritAttrs: true,
})
