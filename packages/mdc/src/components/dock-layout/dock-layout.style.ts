/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'

export const dockLayoutStyles = css`
    /* mdc-dock-layout — root container */
    :host {
        display: flex;
        position: relative;
        width: 100%;
        height: 100%;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
        background: var(--md-sys-color-surface);
        color: var(--md-sys-color-on-surface);
        box-sizing: border-box;
        font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    }

    /* mdc-dock-grid — recursive renderer host. Inherits from layout; no flex direction. */
    :host {
        display: flex;
        flex: 1 1 0%;
        width: 100%;
        height: 100%;
        min-width: 0;
        min-height: 0;
        position: relative;
        overflow: hidden;
    }

    /* mdc-dock-split — directional flex container */
    :host([orientation="horizontal"]) {
        flex-direction: row;
    }
    :host([orientation="vertical"]) {
        flex-direction: column;
    }

    /* mdc-dock-sash — resize handle */
    :host {
        flex: 0 0 auto;
        position: relative;
        user-select: none;
        touch-action: none;
        z-index: 10;
    }
    :host([orientation="horizontal"]) {
        width: 8px;
        margin: 0 -4px;
        cursor: col-resize;
    }
    :host([orientation="vertical"]) {
        height: 8px;
        margin: -4px 0;
        cursor: row-resize;
    }
    .sash-line {
        background: var(--md-sys-color-outline-variant);
        pointer-events: none;
        transition: background-color 0.15s ease, box-shadow 0.15s ease;
    }
    :host([orientation="horizontal"]) .sash-line {
        width: 1px;
        height: 100%;
    }
    :host([orientation="vertical"]) .sash-line {
        height: 1px;
        width: 100%;
    }
    :host(:hover) .sash-line,
    :host([active]) .sash-line {
        background: var(--md-sys-color-primary);
        box-shadow: 0 0 6px rgba(0, 90, 193, 0.4);
    }

    /* mdc-dock-pane — pure content container */
    :host {
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
        position: relative;
        background: var(--md-sys-color-surface-container-low);
        border-radius: 8px;
        border: 1px solid var(--md-sys-color-outline-variant);
        box-sizing: border-box;
        container-type: size;
        container-name: mdc-dock-pane;
        transition: flex-basis 0.2s cubic-bezier(0.2, 0, 0, 1);
    }
    :host([dragging]) {
        opacity: 0.35;
        border: 2px dashed var(--md-sys-color-primary);
    }
    :host([maximized]) {
        position: absolute;
        inset: 0;
        z-index: 1000;
        margin: 0;
        border-radius: 0;
    }
    .pane-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 4px 0 8px;
        height: 38px;
        min-height: 38px;
        background: var(--md-sys-color-surface-container);
        border-bottom: 1px solid var(--md-sys-color-outline-variant);
        user-select: none;
        cursor: grab;
        box-sizing: border-box;
        overflow: hidden;
    }
    .pane-header:active {
        cursor: grabbing;
    }
    .pane-tabs-area {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
        height: 100%;
        overflow-x: auto;
        scrollbar-width: none;
    }
    .pane-tabs-area::-webkit-scrollbar {
        display: none;
    }
    .pane-default-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--md-sys-color-on-surface-variant);
        display: flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding-left: 4px;
    }
    .pane-actions {
        display: flex;
        align-items: center;
        gap: 2px;
        padding-left: 6px;
    }
    .pane-action-btn {
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 13px;
        color: var(--md-sys-color-on-surface-variant);
        padding: 4px 6px;
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s ease, color 0.15s ease;
    }
    .pane-action-btn:hover {
        background: var(--md-sys-color-surface-container-highest);
        color: var(--md-sys-color-on-surface);
    }
    .pane-action-btn.pane-close:hover {
        background: var(--md-sys-color-error-container);
        color: var(--md-sys-color-error);
    }
    .pane-content {
        flex: 1 1 0%;
        width: 100%;
        height: 100%;
        min-width: 0;
        min-height: 0;
        overflow: auto;
        position: relative;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
    }
    /* CRITICAL: slotted children keep their own layout. No !important. */
    ::slotted(*) {
        min-width: 0;
        min-height: 0;
    }
    ::slotted([data-dock-fill]),
    ::slotted(mdc-*) {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
    }
    @container mdc-dock-pane (max-width: 200px) {
        .pane-header {
            padding: 0 4px;
        }
        .pane-default-title {
            font-size: 11px;
        }
        .pane-action-btn:not(.pane-close) {
            display: none;
        }
    }

    /* Drop-indicator overlay */
    .dock-indicator {
        position: absolute;
        pointer-events: none;
        z-index: 99999;
        border: 2px solid var(--md-sys-color-primary);
        background: var(--md-sys-color-primary-container);
        opacity: 0.65;
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(0, 90, 193, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        transition: left 0.12s cubic-bezier(0.2, 0, 0, 1),
                    top 0.12s cubic-bezier(0.2, 0, 0, 1),
                    width 0.12s cubic-bezier(0.2, 0, 0, 1),
                    height 0.12s cubic-bezier(0.2, 0, 0, 1),
                    opacity 0.12s ease;
    }
    .dock-indicator.hidden {
        display: none;
    }
    .dock-indicator-badge {
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        letter-spacing: 0.3px;
        display: flex;
        align-items: center;
        gap: 6px;
    }
`