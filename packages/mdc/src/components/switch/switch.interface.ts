import type { LitElement } from 'lit'
import type { IMixinRippleOptions } from '../ripple/ripple-options.mixin'
import type { IMixinFocusRingOption } from '../focus-ring/focus-ring-options.mixin'
import type { FormAssociated } from '../../utils/form/form-associated'

export interface ISwitch extends LitElement, FormAssociated, IMixinRippleOptions, IMixinFocusRingOption {
    selected: boolean
    required: boolean
    value: string
    hideSelectedIcon: boolean
    showUnselectedIcon: boolean
}
