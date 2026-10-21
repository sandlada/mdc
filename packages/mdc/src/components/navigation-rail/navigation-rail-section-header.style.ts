import { css } from 'lit'
import { stringifyTokens } from '../../utils/style'
import { NavigationRailSectionHeaderDefinition } from './navigation-rail-section-header.definition'

const tokens = stringifyTokens('--mdc-navigation-rail-section-header')(NavigationRailSectionHeaderDefinition)

export const NavigationRailSectionHeaderStyles = [
    css`@layer mdc.navigation-rail-section-header.variables{:host{${tokens};}}`,
    css`
        @layer mdc.navigation-rail-section-header.base {
            :host {
                display: contents;
            }
            .section-header {
                display: inline-flex;
                align-items: center;
                box-sizing: border-box;
                fill: currentColor;
                color: var(--_color);
                size: var(--_size);
                letter-spacing: var(--_tracking);
                line-height: var(--_leading);
                font-family: var(--_font);
                font-weight: var(--_weight);
                padding-inline-start: var(--_padding-inline-start);
                padding-inline-end: var(--_padding-inline-end);
                padding-block-start: var(--_padding-block-start);
                padding-block-end: var(--_padding-block-end);

                min-height: 36px;
            }
        }
    `,
]
