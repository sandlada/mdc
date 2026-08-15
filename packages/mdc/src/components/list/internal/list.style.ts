/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'

export const ListStyles = css`
    @layer mdc.list.base {
        :host {
            display: block;
            outline: none;
        }

        .container {
            display: flex;
            flex-direction: column;
        }
    }
`
