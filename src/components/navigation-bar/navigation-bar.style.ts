import { css } from 'lit'
import { NavigationBarDefinition } from '../../component-definitions/navigation-bar.definition'
import { createWrappedTokens, stringTokens } from '../../utils'

const t = createWrappedTokens('--mdc-navigation-bar', NavigationBarDefinition)
const s = stringTokens(t)

export const navigationBarStyle = css`
    :host { ${s}; }

    :host {
        display: contents;
        cursor: default;
        -webkit-tap-highlight-color: transparent;
        width: fit-content;
        position: relative;
    }

    dialog {
        position: relative;
        background: transparent;
        border: none;
        flex-direction: column;
        margin: inherit;
        max-height: inherit;
        max-width: inherit;
        min-height: inherit;
        min-width: inherit;
        outline: none;
        overflow: hidden;
        padding: 0;
        width: inherit;
        box-sizing: border-box;
    }
    dialog[open] {
        display: flex;
    }

    dialog.vertical {
        height: var(--_vertical-container-height);
        border-start-start-radius: min(var(--_vertical-container-shape-start-start), calc(var(--_vertical-container-height) / 2));
        border-start-end-radius: min(var(--_vertical-container-shape-start-end), calc(var(--_vertical-container-height) / 2));
        border-end-start-radius: min(var(--_vertical-container-shape-end-start), calc(var(--_vertical-container-height) / 2));
        border-end-end-radius: min(var(--_vertical-container-shape-end-end), calc(var(--_vertical-container-height) / 2));
        padding-inline-start: var(--_vertical-container-inline-leading-space);
        padding-inline-end: var(--_vertical-container-inline-trailing-space);
        padding-block-start: var(--_vertical-container-block-leading-space);
        padding-block-end: var(--_vertical-container-block-trailing-space);
    }
    dialog.xr {
        height: var(--_vertical-xr-container-height);
        border-start-start-radius: min(var(--_vertical-xr-container-shape-start-start), calc(var(--_vertical-xr-container-height) / 2));
        border-start-end-radius: min(var(--_vertical-xr-container-shape-start-end), calc(var(--_vertical-xr-container-height) / 2));
        border-end-start-radius: min(var(--_vertical-xr-container-shape-end-start), calc(var(--_vertical-xr-container-height) / 2));
        border-end-end-radius: min(var(--_vertical-xr-container-shape-end-end), calc(var(--_vertical-xr-container-height) / 2));
        padding-inline-start: var(--_vertical-xr-container-inline-leading-space);
        padding-inline-end: var(--_vertical-xr-container-inline-trailing-space);
        padding-block-start: var(--_vertical-xr-container-block-leading-space);
        padding-block-end: var(--_vertical-xr-container-block-trailing-space);
    }
    dialog.horizonal {
        height: var(--_horizonal-container-height);
        border-start-start-radius: min(var(--_horizonal-container-shape-start-start), calc(var(--_horizonal-container-height) / 2));
        border-start-end-radius: min(var(--_horizonal-container-shape-start-end), calc(var(--_horizonal-container-height) / 2));
        border-end-start-radius: min(var(--_horizonal-container-shape-end-start), calc(var(--_horizonal-container-height) / 2));
        border-end-end-radius: min(var(--_horizonal-container-shape-end-end), calc(var(--_horizonal-container-height) / 2));
        padding-inline-start: var(--_horizonal-container-inline-leading-space);
        padding-inline-end: var(--_horizonal-container-inline-trailing-space);
        padding-block-start: var(--_horizonal-container-block-leading-space);
        padding-block-end: var(--_horizonal-container-block-trailing-space);
    }

    .container {
        border-radius: inherit;
        display: flex;
        flex-grow: 1;
        overflow: hidden;
        position: relative;
        transform-origin: top;
        width: 100%;
    }

    .content {
        display: flex;
    }

    dialog.start {
        justify-content: start
    }
    dialog.middle .container {
        justify-content: center;
    }
    dialog.end .container {
        justify-content: end;
    }
    
    .background {
        position: absolute;
        inset: 0;
        z-index: -1;
    }
    dialog.vertical .background {
        background: var(--_vertical-container-color);
    }
    dialog.xr .background {
        background: var(--_vertical-xr-container-color);
    }
    dialog.horizonal .background {
        background: var(--_horizonal-container-color);
    }

    ::backdrop {
        background: none;
    }

`
