import { css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { FilledIconButtonDefinition } from '../../definitions'
import { createLogicShapeTokens, overrideComponentTokens, stringTokens } from '../../utils'
import { BaseButtonGroup } from './base-button-group'

const buttonSideLeftStyles = stringTokens(overrideComponentTokens<keyof typeof FilledIconButtonDefinition>('--mdc-icon-button', {
    'extra-large-container-shape-round-start-start': `calc(var(--mdc-icon-button-extra-large-container-height) / 2)`,
    'extra-large-container-shape-round-end-start': `calc(var(--mdc-icon-button-extra-large-container-height) / 2)`,
    'extra-large-container-shape-round-start-end': `20px`,
    'extra-large-container-shape-round-end-end': `20px`,
    'large-container-shape-round-start-start': `calc(var(--mdc-icon-button-large-container-height) / 2)`,
    'large-container-shape-round-end-start': `calc(var(--mdc-icon-button-large-container-height) / 2)`,
    'large-container-shape-round-start-end': `16px`,
    'large-container-shape-round-end-end': `16px`,
    'medium-container-shape-round-start-start': `calc(var(--mdc-icon-button-medium-container-height) / 2)`,
    'medium-container-shape-round-end-start': `calc(var(--mdc-icon-button-medium-container-height) / 2)`,
    'medium-container-shape-round-start-end': `8px`,
    'medium-container-shape-round-end-end': `8px`,
    'small-container-shape-round-start-start': `calc(var(--mdc-icon-button-small-container-height) / 2)`,
    'small-container-shape-round-end-start': `calc(var(--mdc-icon-button-small-container-height) / 2)`,
    'small-container-shape-round-start-end': `8px`,
    'small-container-shape-round-end-end': `8px`,
    'extra-small-container-shape-round-start-start': `calc(var(--mdc-icon-button-extra-small-container-height) / 2)`,
    'extra-small-container-shape-round-end-start': `calc(var(--mdc-icon-button-extra-small-container-height) / 2)`,
    'extra-small-container-shape-round-start-end': `4px`,
    'extra-small-container-shape-round-end-end': `4px`,

    'extra-large-container-shape-square-start-start': `calc(var(--mdc-icon-button-extra-large-container-height) / 2)`,
    'extra-large-container-shape-square-end-start': `calc(var(--mdc-icon-button-extra-large-container-height) / 2)`,
    'extra-large-container-shape-square-start-end': `20px`,
    'extra-large-container-shape-square-end-end': `20px`,
    'large-container-shape-square-start-start': `calc(var(--mdc-icon-button-large-container-height) / 2)`,
    'large-container-shape-square-end-start': `calc(var(--mdc-icon-button-large-container-height) / 2)`,
    'large-container-shape-square-start-end': `16px`,
    'large-container-shape-square-end-end': `16px`,
    'medium-container-shape-square-start-start': `calc(var(--mdc-icon-button-medium-container-height) / 2)`,
    'medium-container-shape-square-end-start': `calc(var(--mdc-icon-button-medium-container-height) / 2)`,
    'medium-container-shape-square-start-end': `8px`,
    'medium-container-shape-square-end-end': `8px`,
    'small-container-shape-square-start-start': `calc(var(--mdc-icon-button-small-container-height) / 2)`,
    'small-container-shape-square-end-start': `calc(var(--mdc-icon-button-small-container-height) / 2)`,
    'small-container-shape-square-start-end': `8px`,
    'small-container-shape-square-end-end': `8px`,
    'extra-small-container-shape-square-start-start': `calc(var(--mdc-icon-button-extra-small-container-height) / 2)`,
    'extra-small-container-shape-square-end-start': `calc(var(--mdc-icon-button-extra-small-container-height) / 2)`,
    'extra-small-container-shape-square-start-end': `4px`,
    'extra-small-container-shape-square-end-end': `4px`,
}))
const buttonSideRightStyles = stringTokens(overrideComponentTokens<keyof typeof FilledIconButtonDefinition>('--mdc-icon-button', {
    'extra-large-container-shape-round-start-end': `calc(var(--_extra-large-container-height) / 2)`,
    'extra-large-container-shape-round-end-end': `calc(var(--_extra-large-container-height) / 2)`,
    'extra-large-container-shape-round-start-start': `20px`,
    'extra-large-container-shape-round-end-start': `20px`,
    'large-container-shape-round-start-end': `calc(var(--_large-container-height) / 2)`,
    'large-container-shape-round-end-end': `calc(var(--_large-container-height) / 2)`,
    'large-container-shape-round-start-start': `16px`,
    'large-container-shape-round-end-start': `16px`,
    'medium-container-shape-round-start-end': `calc(var(--_medium-container-height) / 2)`,
    'medium-container-shape-round-end-end': `calc(var(--_medium-container-height) / 2)`,
    'medium-container-shape-round-start-start': `8px`,
    'medium-container-shape-round-end-start': `8px`,
    'small-container-shape-round-start-end': `calc(var(--_small-container-height) / 2)`,
    'small-container-shape-round-end-end': `calc(var(--_small-container-height) / 2)`,
    'small-container-shape-round-start-start': `8px`,
    'small-container-shape-round-end-start': `8px`,
    'extra-small-container-shape-round-start-end': `calc(var(--_extra-small-container-height) / 2)`,
    'extra-small-container-shape-round-end-end': `calc(var(--_extra-small-container-height) / 2)`,
    'extra-small-container-shape-round-start-start': `4px`,
    'extra-small-container-shape-round-end-start': `4px`,
}))

const buttonCenterStyles = stringTokens(overrideComponentTokens<keyof typeof FilledIconButtonDefinition>('--mdc-icon-button', {
    ...createLogicShapeTokens('--mdc-icon-button', {
        'extra-large-container-shape-round': `20px`,
        'large-container-shape-round': `16px`,
        'medium-container-shape-round': `8px`,
        'small-container-shape-round': `8px`,
        'extra-small-container-shape-round': `4px`,

        'extra-large-container-shape-square': `20px`,
        'large-container-shape-square': `16px`,
        'medium-container-shape-square': `8px`,
        'small-container-shape-square': `8px`,
        'extra-small-container-shape-square': `4px`,
    }, 'all', false),
}))

const buttonCheckedStyles = stringTokens(overrideComponentTokens<keyof typeof FilledIconButtonDefinition>('--mdc-icon-button', {
    ...createLogicShapeTokens('--_', {
        'extra-large-selected-container-shape-round': `calc(var(--_extra-large-container-height) / 2)`,
        'large-selected-container-shape-round': `calc(var(--_large-container-height) / 2)`,
        'medium-selected-container-shape-round': `calc(var(--_medium-container-height) / 2)`,
        'small-selected-container-shape-round': `calc(var(--_small-container-height) / 2)`,
        'extra-small-selected-container-shape-round': `calc(var(--_extra-small-container-height) / 2)`,
        'extra-large-selected-container-shape-square': `calc(var(--_extra-large-container-height) / 2)`,
        'large-selected-container-shape-square': `calc(var(--_large-container-height) / 2)`,
        'medium-selected-container-shape-square': `calc(var(--_medium-container-height) / 2)`,
        'small-selected-container-shape-square': `calc(var(--_small-container-height) / 2)`,
        'extra-small-selected-container-shape-square': `calc(var(--_extra-small-container-height) / 2)`,
    }, 'all', false),
}))

/**
 * @experimental
 */
@customElement('mdc-connected-button-group')
export class MDCConnectedButtonGroup extends BaseButtonGroup {

    static override styles = css`
        :host {
            vertical-align: top;
        }
        
        .container {
            display: inline-flex;
            gap: 2px;
        }

        ::slotted(*) {
            ${buttonCheckedStyles};
        }

        ::slotted(:not(.side)) {
            ${buttonCenterStyles};
        }
        ::slotted(.start-side) {
            ${buttonSideLeftStyles};
        }
        ::slotted(.end-side) {
            ${buttonSideRightStyles};
        }

    `
}
