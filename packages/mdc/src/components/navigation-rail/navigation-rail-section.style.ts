import { css } from 'lit'
import { stringifyTokens } from '../../utils/style'
import { NavigationRailSectionDefinition } from './navigation-rail-section.definition'

const tokens = stringifyTokens('--mdc-navigation-rail-section')(NavigationRailSectionDefinition)

export const NavigationRailSectionStyles = [
    css`@layer mdc.navigation-rail-section.variables{:host{${tokens};}}`,
    css`
        @layer mdc.navigation-rail-section.base {
            :host {
                display: contents;
            }
            .section {
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                gap: var(--_item-between);
                padding-inline-start: var(--_padding-inline-start);
                padding-inline-end: var(--_padding-inline-end);
                padding-block-start: var(--_padding-block-start);
                padding-block-end: var(--_padding-block-end);

                margin-block-end: 12px;
            }
        }
    `,
]
