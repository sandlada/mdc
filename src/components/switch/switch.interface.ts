import type { LitElement } from 'lit'
import type { IMixinRippleOptions } from '../ripple/mixin-ripple-options'
import type { IMixinFocusRingOption } from '../focus-ring/mixin-focus-ring-options'
import type { FormAssociated } from '../../utils/form/form-associated'

export interface ISwitch extends LitElement, FormAssociated, IMixinRippleOptions, IMixinFocusRingOption {
    selected: boolean
    required: boolean
    value: string
    hideSelectedIcon: boolean
    showUnselectedIcon: boolean
}
