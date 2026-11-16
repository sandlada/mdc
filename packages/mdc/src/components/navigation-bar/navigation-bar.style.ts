import { css, unsafeCSS } from 'lit'
import { NavigationBarDefinition } from './navigation-bar.definition'
import { stringifyTokens } from '../../utils/style'

const TS = stringifyTokens('--mdc-navigation-bar')(NavigationBarDefinition)

const Directions = {
    Vertical: 'vertical',
    Horizontal: 'horizontal',
    VerticalXR: 'vertical-xr'
} as const
type Directions = (typeof Directions)[keyof typeof Directions]

const createContainerStyle = (d: Directions) => {
    return unsafeCSS(`
        height: var(--_${d}-container-height);
        padding-inline-start: var(--_${d}-container-inline-leading-space);
        padding-inline-end: var(--_${d}-container-inline-trailing-space);
        padding-block-start: var(--_${d}-container-block-leading-space);
        padding-block-end: var(--_${d}-container-block-trailing-space);
        gap: var(--_${d}-tab-between-space);
        border-top-left-radius: var(--_${d}-container-shape-start-start);
        border-top-right-radius: var(--_${d}-container-shape-start-end);
        border-bottom-right-radius: var(--_${d}-container-shape-end-end);
        border-bottom-left-radius: var(--_${d}-container-shape-end-start);
    `)
}
const createBackgroundStyle = (d: Directions) => {
    return unsafeCSS(`
        background-color: var(--_${d}-container-color);
    `)
}


export const NavigationBarStyles = css`
    :host {
        ${TS};
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

    :host([variant="vertical"]),
    :host([variant="horizontal"]),
    :host(:not([variant])) {
        display: flex;
        width: 100%;
    }

    :host([variant="vertical-xr"]) {
        display: inline-flex;
        width: fit-content;
    }

    /* The inner container is the translate target driven by WAAPI in
       base-navigation-bar. will-change hints the compositor for smoothness. */
    .container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        will-change: transform;
        /* Keep the container from wrapping/shrinking while the host collapses,
           so its natural size is preserved for measurement + translate math. */
        flex: 0 0 auto;
    }

    .container:is(.vertical, .horizontal) {
        width: 100%;
    }

    .container:is(.vertical, .horizontal) ::slotted(mdc-navigation-tab) {
        flex: 1 0 0;
        min-width: 0;
        height: 100%;
    }

    .vertical-xr.container ::slotted(mdc-navigation-tab) {
        flex: 0 0 auto;
    }
    .vertical.container {
        ${createContainerStyle(Directions.Vertical)};
    }
    .horizontal.container {
        ${createContainerStyle(Directions.Horizontal)};
    }
    .vertical-xr.container {
        ${createContainerStyle(Directions.VerticalXR)};
    }

    .background {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        z-index: -1;
        pointer-events: none;
    }
    .vertical .background {
        ${createBackgroundStyle(Directions.Vertical)};
    }
    .horizontal .background {
        ${createBackgroundStyle(Directions.Horizontal)};
    }
    .vertical-xr .background {
        ${createBackgroundStyle(Directions.VerticalXR)};
    }

    /* ---- In-flow collapse: per-edge resting states ------------------------ */

    /* Vertical edges collapse the host height; the inner container slides
       along the Y axis. Horizontal edges collapse the host width; the inner
       container slides along the X axis. The base class sets inline
       height/width + transform during/after animation, so no static hidden
       rules are needed here. */

    @media (prefers-reduced-motion: reduce) {
        .container,
        .container * {
            transition: none;
            animation: none;
        }
    }

    @media (forced-colors: active) {
        .background {
            background: Canvas;
            border: 1px solid CanvasText;
        }

        .container {
            outline: 1px solid CanvasText;
            outline-offset: -1px;
        }
    }

    @media (prefers-contrast: more) {
        .background {
            border: 1px solid CanvasText;
        }

        .container {
            outline: 1px solid CanvasText;
            outline-offset: -1px;
        }
    }

    @media (prefers-contrast: less) {
        .background {
            border: 1px solid GrayText;
        }

        .container {
            outline: 1px solid GrayText;
            outline-offset: -1px;
        }
    }
`
