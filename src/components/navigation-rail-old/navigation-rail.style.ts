import { css } from 'lit'
import { NavigationRailDefinition } from '../../component-definitions/navigation-rail.definition'
import { createWrappedTokens, stringTokens } from '../../utils'

const t = createWrappedTokens('--mdc-navigation-rail', NavigationRailDefinition)
const s = stringTokens(t)

export const navigationRailStyle = css`
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
        height: inherit;
        outline: none;
        overflow: hidden;
        padding: 0;
        box-sizing: border-box;
    }
    dialog[open] {
        display: flex;
    }

    dialog.collapsed {
        width: var(--_collapsed-container-width);
        border-start-start-radius: min(var(--_collapsed-container-shape-start-start), calc(var(--_collapsed-container-height) / 2));
        border-start-end-radius: min(var(--_collapsed-container-shape-start-end), calc(var(--_collapsed-container-height) / 2));
        border-end-start-radius: min(var(--_collapsed-container-shape-end-start), calc(var(--_collapsed-container-height) / 2));
        border-end-end-radius: min(var(--_collapsed-container-shape-end-end), calc(var(--_collapsed-container-height) / 2));
        padding-inline-start: var(--_collapsed-container-inline-leading-space);
        padding-inline-end: var(--_collapsed-container-inline-trailing-space);
        padding-block-start: var(--_collapsed-container-block-leading-space);
        padding-block-end: var(--_collapsed-container-block-trailing-space);
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
    dialog.expanded {
        min-width: var(--_expanded-container-width-minimum);
        border-start-start-radius: min(var(--_expanded-container-shape-start-start), calc(var(--_expanded-container-height) / 2));
        border-start-end-radius: min(var(--_expanded-container-shape-start-end), calc(var(--_expanded-container-height) / 2));
        border-end-start-radius: min(var(--_expanded-container-shape-end-start), calc(var(--_expanded-container-height) / 2));
        border-end-end-radius: min(var(--_expanded-container-shape-end-end), calc(var(--_expanded-container-height) / 2));
        padding-inline-start: var(--_expanded-container-inline-leading-space);
        padding-inline-end: var(--_expanded-container-inline-trailing-space);
        padding-block-start: var(--_expanded-container-block-leading-space);
        padding-block-end: var(--_expanded-container-block-trailing-space);
    }

    .container {
        border-radius: inherit;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        overflow: hidden;
        position: relative;
        transform-origin: top;
        width: 100%;
    }

    dialog .container .menu-and-fab {
        display: flex;
        flex-direction: column;
    }
    dialog.collapsed .container .menu-and-fab {
        align-items: center;
        gap: var(--_collapsed-menu-fab-between-space);
    }
    dialog.expanded .container .menu-and-fab {
        align-items: start;
        gap: var(--_expanded-menu-fab-between-space);
    }

    dialog :is(.menu-inactive-icon, .menu-active-icon) {
        display: none;
    }
    dialog:not(.has-inactive-menu).collapsed .menu-inactive-icon {
        display: block;
    }
    dialog:not(.has-active-menu).expanded .menu-active-icon {
        display: block;
    }

    dialog .container .content {
        display: flex;
        flex-direction: column;
        width: 100%;
        box-sizing: border-box;
    }
    dialog.collapsed .container .content {
        gap: var(--_collapsed-segments-between-space);
        margin-block-start: var(--_collapsed-segments-block-leading-space);
        margin-block-end: var(--_collapsed-segments-block-trailing-space);
        margin-inline-start: var(--_collapsed-segments-inline-leading-space);
        margin-inline-end: var(--_collapsed-segments-inline-trailig-space);
    }
    dialog.expanded .container .content {
        margin-block-start: var(--_collapsed-segments-block-leading-space);
    }

    .background {
        position: absolute;
        inset: 0;
        z-index: -1;
    }
    dialog.collapsed .background {
        background: var(--_collapsed-container-color);
    }
    dialog.xr .background {
        background: var(--_vertical-xr-container-color);
    }
    dialog.expanded .background {
        background: var(--_expanded-floating-container-color);
    }

    ::backdrop {
        background: none;
    }

    .menu,
    .start,
    .end {
        display: flex;
        flex-direction: column;
        flex-grow: 0;
        flex-shrink: 0;
        align-items: center;
    }

    .anchor {
        position: absolute;
    }

    .top.anchor {
        top: 0;
    }

    .bottom.anchor {
        bottom: 0;
    }

    mdc-divider {
        display: none;
        position: absolute;
    }

    .show-top-divider .start mdc-divider,
    .show-bottom-divider .end mdc-divider {
        display: flex;
    }
`
