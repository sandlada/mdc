import { type SlotsType, defineComponent } from 'vue'
import { type ISlotsShared, propsShared } from './base'
import cssBase from './base.module.css'

/**
 * Responsive TopAppbar
 * 
 * @summary Responsive TopAppbar ???
 * 
 * enabled:
 * ```
 * **************  -- AREA A
 * * X          *
 * **************  -- AREA B
 * *            *
 * * Title is a *
 * * title      *
 * *            *
 * **************
 * ```
 * 
 * on-scroll:
 * ```
 * ***********************  -- AREA A
 * * X Title is a title  *
 * ***********************
 * ```
 */


const props = {
    ...propsShared
}
const slots = {} as SlotsType<
    ISlotsShared & {
        trailingIcons?: void
    }
>


export const ResponsiveTopAppbar = defineComponent({
    props,
    slots,
    render() {
        const renderLeadingIcon = (
            <span>{this.$slots.leadingIcon && this.$slots.leadingIcon()}</span>
        )
        const renderTrailingIcon = (
            <span>{this.$slots.trailingIcon && this.$slots.trailingIcon()}</span>
        )
        const renderTrailingIcons = (
            <span>{this.$slots.trailingIcons && this.$slots.trailingIcons()}</span>
        )
        const renderHeadlineSmall = (
            <span>{this.headline}</span>
        )
        const renderHeadlineMedium = (
            <span>{this.headline}</span>
        )
        return (
            <div
                data-is-top-app-bar="true"
                class={[]}
            >

                <div class={[]}>
                    {renderLeadingIcon}
                    {renderHeadlineSmall}

                    {renderTrailingIcon}
                    {renderTrailingIcons}
                    {renderHeadlineMedium}
                </div>
            </div>
        )
    }
})
