import type { LitElement } from 'lit'
import type { IAttachable } from '../../utils'

export interface IFocusRing extends LitElement, IAttachable {
    visible     : boolean
    inward      : boolean
    shapeInherit: boolean
}
