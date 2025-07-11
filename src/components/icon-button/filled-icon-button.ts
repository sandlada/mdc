import { customElement } from 'lit/decorators.js'
import { IconButton } from './icon-button'
import { filledIconButtonStyle } from './icon-button.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-filled-icon-button": FilledIconButton
    }
}

@customElement('mdc-filled-icon-button')
export class FilledIconButton extends IconButton {
    static override styles = filledIconButtonStyle
}
