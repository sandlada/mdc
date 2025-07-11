import { customElement } from 'lit/decorators.js'
import { IconButton } from './icon-button'
import { standardIconButtonStyle } from './icon-button.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-standard-icon-button": StandardIconButton
    }
}

@customElement('mdc-standard-icon-button')
export class StandardIconButton extends IconButton {
    static override styles = standardIconButtonStyle
}
