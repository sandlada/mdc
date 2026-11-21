/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { ISelectionControllerHost } from '../selection-controller'

export const getSelectionControls = (getGroupRoot?: (host: ISelectionControllerHost) => ParentNode | null) =>
    (host: ISelectionControllerHost): ISelectionControllerHost[] => {
        const name = host.getAttribute('name')
        if (!name || !host.isConnected) return [host]
        const root = getGroupRoot ? getGroupRoot(host) : host.getRootNode() as Document | ShadowRoot
        return root
            ? Array.from(root.querySelectorAll<ISelectionControllerHost>(`[name="${CSS.escape(name)}"]`))
                .filter((control) => typeof control.checked === 'boolean')
            : [host]
    }

export const enforceSelectionMutex = (selected: ISelectionControllerHost) =>
    (controls: readonly ISelectionControllerHost[]): void => {
        for (const control of controls) {
            if (control !== selected && control.checked) control.checked = false
        }
    }
