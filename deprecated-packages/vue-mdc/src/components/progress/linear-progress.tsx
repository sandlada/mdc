/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { defineComponent, type SlotsType } from 'vue'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import { props, type TLinearProgressSlots } from './linear-progress.definition'
import css from './styles/progress.module.scss'

export const LinearProgress = defineComponent({
    name: `${componentNamePrefix}-linear-progress`,
    props: props,
    slots: {} as SlotsType<TLinearProgressSlots>,
    computed: {
        progressStyles() {
            return {
                transform: `scaleX(${(this.indeterminate ? 1 : this.value / this.max) * 100}%)`
            }
        },
        dotStyles() {
            return {
                transform: `scaleX(${(this.indeterminate ? 1 : this.buffer / this.max) * 100}%)`
            }
        },
        shouldHideDots() {
            return (this.indeterminate) || (this.buffer >= this.max) || (this.value >= this.max)
        },
    },
    render() {
        return (
            <div
                data-component="linear-progress"
                class={[css['linear-progress'], this.indeterminate && css.indeterminate]}
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax={this.max}
                aria-valuenow={this.indeterminate ? 0 : this.value}
            >
                <div
                    style={{ display: this.shouldHideDots ? 'block' : 'none' }}
                    class={css.dots}
                ></div>
                <div class={css['inactive-track']} style={this.dotStyles}></div>
                <div class={[css.bar, css['primary-bar']]} style={this.progressStyles}>
                    <div class={css['bar-inner']}></div>
                </div>
                <div class={[css.bar, css['secondary-bar']]}>
                    <div class={css['bar-inner']}></div>
                </div>
            </div>
        )
    },
    inheritAttrs: true,
})
