/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

export const SDialogController = Symbol("dialogController")

export interface IDialogControllerHost extends HTMLElement {
    [SDialogController]: IDialogController
}

export interface IDialogController {
    show: () => void
    close: () => void
}
