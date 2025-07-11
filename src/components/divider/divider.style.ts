import { css, unsafeCSS } from 'lit'
import { DividerDefinition } from '../../component-definitions/divider.definition'
import { createWrappedTokens, stringTokens } from '../../utils/tokens'

const tokens = createWrappedTokens('--mdc-divider', DividerDefinition)
const tokenString = unsafeCSS(stringTokens(tokens))

export const DividerStyles = css`
    @layer mdc.divider.variant {
        :host { ${tokenString}; }
    }
    @layer mdc.divider.base {
        :host {
            box-sizing: border-box;
            color: var(--_color);
            display: flex;
            height: var(--_thickness);
            width: 100%;
        }

        :host([inset]),
        :host([inset-start]) {
            padding-inline-start: 16px;
        }

        :host([inset]),
        :host([inset-end]) {
            padding-inline-end: 16px;
        }

        :host::before {
            background: currentColor;
            content: '';
            height: 100%;
            width: 100%;
        }

        @media (forced-colors: active) {
            :host::before {
            background: CanvasText;
            }
        }
    }
`
