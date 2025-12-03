/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { defineComponent, type SlotsType } from 'vue'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import { props, type TCircularProgressSlots } from './circular-progress.definition'
import css from './styles/progress.module.scss'

export const CircularProgress = defineComponent({
    name: `${componentNamePrefix}-circular-progress`,
    props: props,
    slots: {} as SlotsType<TCircularProgressSlots>,
    render() {
        return (
            <div
                data-component="circular-progress"
                class={[css['circular-progress'], this.indeterminate && css.indeterminate]}
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax={this.max}
                aria-valuenow={this.indeterminate ? 0 : this.value}
            >

                {
                    this.indeterminate ?
                        <div class={css.spinner}>
                            <div class={css.left}>
                                <div class={css.circle}></div>
                            </div>
                            <div class={css.right}>
                                <div class={css.circle}></div>
                            </div>
                        </div> :

                        <svg viewBox="0 0 4800 4800">
                            <circle
                                class={css.track}
                                pathLength="100"
                            ></circle>
                            <circle
                                class={css['active-track']}
                                pathLength="100"
                                stroke-dashoffset={(1 - this.value / this.max) * 100}
                            ></circle >
                        </svg >
                }

            </div >
        )
    },
    inheritAttrs: true,
})
