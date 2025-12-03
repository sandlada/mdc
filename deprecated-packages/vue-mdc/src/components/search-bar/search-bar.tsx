/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { useReflectAttribute } from '@glare-labs/vue-reflect-attribute'
import { defineComponent, ref, type PropType, type SlotsType } from 'vue'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'

export const SearchBar = defineComponent({
    name: `${componentNamePrefix}-search-bar`,
    emits: [],
    slots: {} as SlotsType<{
        ['leading-icon']?: void
        ['trailing-icon']?: void
    }>,
    props: {
        ['supporting-text']: {
            type: String as PropType<string>,
            default: 'Search'
        },

    },
    setup(props, { }) {
        const root = ref<HTMLElement | null>(null)
        const input = ref<HTMLInputElement | null>(null)

        /**
         * Props
         */
        const _supportingText = ref(props['supporting-text'])

        useReflectAttribute(root, {
            attributes: [
                { attribute: 'supporting-text', ref: _supportingText, reflect: true, type: 'string' },
            ],
        })
        useReflectAttribute(input, {
            attributes: [
                { attribute: 'placeholder', ref: _supportingText, reflect: false, type: 'string' },
            ],
        })

        const handleClick = () => {

        }
        const handleInput = () => {

        }

        return () => {
            return (
                <span ref={root}>

                    <input ref={input} onInput={handleInput} type='text' inputmode='search'></input>
                </span>
            )
        }
    },
})
