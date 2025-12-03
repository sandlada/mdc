/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { defineComponent, type PropType, type SlotsType } from 'vue'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import { isServer } from '../../utils'
import { DefaultThemes } from './default-theme-solutions'

export type TThemeProviderGenerateCallback = () => string

export interface IThemeProviderThemeChangeCustomEventDetail {
    styleText: string
}

class ThemeProviderComponent {
    private readonly name = `${componentNamePrefix}-provider`

    protected readonly props = {
        /**
         * Give a function, return a style string.
         */
        generateCallback: {
            default: null,
            type: Function as PropType<TThemeProviderGenerateCallback>,
            required: false,
        },

        theme: {
            default: null,
            type: String as PropType<string>,
            required: false,
        }
    }
    protected readonly slots = {} as SlotsType<{
        default: void
    }>
    protected readonly emits = [
        'theme-change'
    ]

    public component = defineComponent({
        name: this.name,
        props: this.props,
        slots: this.slots,
        emits: this.emits,
        data: (props) => ({
            _theme: props.theme,
            _generateCallback: props.generateCallback,
        }),
        mounted() {
            if (isServer()) {
                return
            }

            this.handleThemeChange()
        },
        beforeUpdate() {
            let changed = false

            if (this._generateCallback !== this.generateCallback) {
                this._generateCallback = this.generateCallback
                changed = true
            }
            if (this._theme !== this.theme) {
                this._theme = this.theme
                changed = true
            }

            if (changed) {
                this.handleThemeChange()
            }
        },
        updated() {

        },
        methods: {
            handleThemeChange() {
                const styleText = this._theme ?? this._generateCallback?.() ?? DefaultThemes.GreenLight

                const event = new CustomEvent<IThemeProviderThemeChangeCustomEventDetail>('theme-change', {
                    bubbles: true,
                    cancelable: false,
                    composed: true,
                    detail: {
                        styleText,
                    }
                })
                this.$emit('theme-change', event)
                document.dispatchEvent(event)
            }
        },
        render() {
            return this.$slots.default && this.$slots.default()
        }
    })
}

export const ThemeProvider = new ThemeProviderComponent().component
