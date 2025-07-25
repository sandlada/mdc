import { css } from 'lit'
import { SearchBarDefinition } from '../../component-definitions/search.definition'
import { createWrappedTokens, stringTokens } from '../../utils'

const t = createWrappedTokens('--mdc-search-bar', SearchBarDefinition)
const s = stringTokens(t)

export const searchBarStyle = css`
    :host { ${s}; }

    :host {
        display: contents;
        vertical-align: top;
        -webkit-tap-highlight-color: transparent;
        background: transparent;
    }

    .search {
        position: relative;
        z-index: 0;
        display: flex;
        align-items: center;
        min-width: var(--_container-width-minimum);
        max-width: var(--_container-width-maximum);
        height: var(--_container-height);
        padding-inline-start: var(--_container-inline-leading-space);
        padding-inline-end: var(--_container-inline-trailing-space);
        padding-block-start: var(--_container-block-leading-space);
        padding-block-end: var(--_container-block-trailing-space);
        border-start-start-radius: var(--_container-shape-start-start);
        border-start-end-radius: var(--_container-shape-start-end);
        border-end-start-radius: var(--_container-shape-end-start);
        border-end-end-radius: var(--_container-shape-end-end);
        background: transparent;
    }

    .background {
        position: absolute;
        border-radius: inherit;
        inset: 0;
        z-index: -1;
        background: var(--_container-color);
    }

    .icon {
        fill: currentColor;
    }
    .leading-icon {
        color: var(--_leading-icon-color);
    }
    .trailing-icon {
        color: var(--_trailing-icon-color);
    }
    .search:not(.has-avatar) .avatar {
        color: var(--_trailing-icon-color);
    }

    .search.has-leading-icon .input {
        margin-inline-start: var(--_leading-icon-and-label-between-space);
    }
    .search.has-trailing-icon .input {
        margin-inline-end: var(--_trailing-icon-and-label-between-space);
    }
    .search:not(.has-leading-icon) .leading-icon {
        display: none;
    }
    .search:not(.has-trailing-icon) .trailing-icon {
        display: none;
    }
    .search.hide-avatar .avatar {
        display: none;
    }
    .search:not(.hide-avatar) .trailing-icon {
        margin-inline-end: var(--_trailing-icon-and-label-between-space);
    }

    .trailing-icon {
        display: flex;
        gap: var(--_trailing-icons-between-space);
        align-items: center;
    }

    .input {
        all: unset;
        height: 100%;
        width: 100%;
        color: var(--_input-text-color);
        font-family: var(--_input-text-font);
        line-height: var(--_input-text-line-height);
        font-size: var(--_input-text-size);
        font-weight: var(--_input-text-weight);
        letter-spacing: var(--_input-text-tracking);
    }
    .input:placeholder-shown {
        color: var(--_supporting-text-color);
        font-family: var(--_supporting-text-font);
        line-height: var(--_supporting-text-line-height);
        font-size: var(--_supporting-text-size);
        font-weight: var(--_supporting-text-weight);
        letter-spacing: var(--_supporting-text-tracking);
    }
    .input:placeholder-shown,
    .input:-webkit-autofill,
    .input:-webkit-autofill:focus {
        background: transparent;
    }
    .input:-webkit-autofill {
        -webkit-box-shadow: 0 0 0px var(--_container-height) var(--_container-color) inset !important;
        -webkit-text-fill-color: var(--_input-text-color);
    }
    .touch-target {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
    }

    .avatar {
        all: unset;
        cursor: pointer;
        position: relative;
        /* height: max(48px, var(--_avatar-size));
        width: max(48px, var(--_avatar-size)); */
        display: flex;
        align-items: center;
        justify-content: center;
        border-start-start-radius: var(--_avatar-shape-start-start);
        border-start-end-radius: var(--_avatar-shape-start-end);
        border-end-start-radius: var(--_avatar-shape-end-start);
        border-end-end-radius: var(--_avatar-shape-end-end);

        &>mdc-ripple {
            border-radius: 50%;
            inset: unset;
            height: max(40px, var(--_avatar-size));
            width: max(40px, var(--_avatar-size));
            z-index: -1;
        }
    }
    .avatar-icon {
        fill: currentColor;
        inline-size: var(--_avatar-size);
        block-size: var(--_avatar-size);
    }
`
