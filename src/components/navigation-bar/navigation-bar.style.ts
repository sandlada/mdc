import { css, unsafeCSS } from 'lit'
import { NavigationBarDefinition } from '../../definitions'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'

const tokenRecord = defineTokenRefsRecord(NavigationBarDefinition, {
    expandShapes: false,
    useBaseFallback: true,
    prefix: '--mdc-navigation-bar'
})
const tS = unsafeCSS(defineVars(tokenRecord, true).join(''))

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
        /* In-flow collapse: clip the translated inner content so the host can
           shrink without leaving a blank gap. */
        overflow: hidden;
    }

    /* The inner container is the translate target driven by WAAPI in
       base-navigation-bar. will-change hints the compositor for smoothness. */
    .container {
        position: relative;
        display: flex;
        align-items: center;
        will-change: transform;
        /* Keep the container from wrapping/shrinking while the host collapses,
           so its natural size is preserved for measurement + translate math. */
        flex: 0 0 auto;
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

    /* ---- In-flow collapse: per-edge resting states ------------------------ */

    /* Vertical edges collapse the host height; the inner container slides
       along the Y axis. Horizontal edges collapse the host width; the inner
       container slides along the X axis. The base class sets inline
       height/width + transform during/after animation, so no static hidden
       rules are needed here. The peek sliver size is exposed as a token for
       JS fallback / theming. */
    :host {
        --_peek-size: var(--mdc-navigation-bar-peek-size, 24px);
    }
`
