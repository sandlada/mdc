import { css, unsafeCSS } from 'lit'
import { createWrappedTokens, stringTokens } from '../../utils'
import { NavigationBarDefinition } from '../../definitions'

const tokens = createWrappedTokens('--mdc-navigation-bar', NavigationBarDefinition)
const tS = unsafeCSS(stringTokens(tokens))

type Direction = 'vertical' | 'horizonal' | 'vertical-xr'
const Directions = {
    Vertical: 'vertical',
    Horizonal: 'horizonal',
    VerticalXR: 'vertical-xr'
} as const satisfies Record<string, Direction>

const createContainerStyle = (d: Direction) => {
    return unsafeCSS(`
        height: var(--_${d}-container-height);
        padding-inline-start: var(--_${d}-container-block-leading-space);
        padding-inline-end: var(--_${d}-container-block-trailing-space);
        padding-block-start: var(--_${d}-container-inline-leading-space);
        padding-block-end: var(--_${d}-container-inline-trailing-space);
        gap: var(--_${d}-tab-between-space);
        border-top-left-radius: var(--_${d}-container-shape-radius-start-start);
        border-top-right-radius: var(--_${d}-container-shape-radius-start-end);
        border-bottom-right-radius: var(--_${d}-container-shape-radius-end-end);
        border-bottom-left-radius: var(--_${d}-container-shape-radius-end-start);
    `)
}
const createBackgroundStyle = (d: Direction) => {
    return unsafeCSS(`
        background-color: var(--_${d}-container-color);
    `)
}


export const NavigationBarStyles = css`
    :host {
        ${tS};
    }

    :host {
        position: relative;
        vertical-align: top;
        display: inline-flex;
        box-sizing: border-box;
    }

    .container {
        position: relative;
        display: flex;
        align-items: center;
    }
    .vertical.container {
        ${createContainerStyle(Directions.Vertical)};
    }
    .horizonal.container {
        ${createContainerStyle(Directions.Horizonal)};
    }
    .vertical-xr.container {
        ${createContainerStyle(Directions.VerticalXR)};
    }

    .background {
        position: absolute;
        inset: 0;
        z-index: -1;
        pointer-events: none;
    }
    .vertical .background {
        ${createBackgroundStyle(Directions.Vertical)};
    }
    .horizonal .background {
        ${createBackgroundStyle(Directions.Horizonal)};
    }
    .vertical-xr .background {
        ${createBackgroundStyle(Directions.VerticalXR)};
    }
`
