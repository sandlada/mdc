/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { useReflectAttribute } from '@glare-labs/vue-reflect-attribute'
import { defineComponent, ref, type SlotsType } from 'vue'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import { FocusRing } from '../focus-ring'
import { Ripple } from '../ripple/ripple'
import { props, type TIconButtonSlots } from './icon-button.definition'
import css from './styles/icon-button.module.scss'

export const IconButton = defineComponent({
    name: `${componentNamePrefix}-icon-button`,
    slots: {} as SlotsType<TIconButtonSlots>,
    props: props,
    setup(props, { slots }) {
        const root = ref<HTMLElement | null>(null)

        /**
         * Props
         */
        const _appearance = ref(props.appearance)
        const _size = ref(props.size)
        const _width = ref(props.width)
        const _shape = ref(props.shape)
        const _disabled = ref(props.disabled)
        const _type = ref(props.type)
        const _href = ref(props.href)
        const _target = ref(props.target)
        const _form = ref(props.form)
        const _name = ref(props.name)
        const _value = ref(props.value)

        useReflectAttribute(root, {
            attributes: [
                { attribute: 'appearance', ref: _appearance, reflect: true, type: 'string', },
                { attribute: 'size', ref: _size, reflect: true, type: 'string', },
                { attribute: 'width', ref: _width, reflect: true, type: 'string', },
                { attribute: 'shape', ref: _shape, reflect: true, type: 'string', },
                { attribute: 'disabled', ref: _disabled, reflect: true, type: 'boolean', },
                { attribute: 'type', ref: _type, reflect: true, type: 'string', },
                { attribute: 'href', ref: _href, reflect: true, type: 'string', },
                { attribute: 'target', ref: _target, reflect: true, type: 'string', },
                { attribute: 'form', ref: _form, reflect: true, type: 'string', },
                { attribute: 'name', ref: _name, reflect: true, type: 'string', },
                { attribute: 'value', ref: _value, reflect: true, type: 'string', },
            ]
        })

        return () => {
            const isLink = _href.value !== null

            const classes = [
                css[_appearance.value],
                _disabled.value && css.disabled,
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
