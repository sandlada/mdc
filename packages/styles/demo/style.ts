/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Demo stylesheet exercising the full at-rules surface in one sheet:
 * `@state` × `@variant` × `@when`, property expanders and a11y macros.
 * Every block mirrors a green shape from `at-rules-sheet.spec.ts` /
 * `at-rules-integration.spec.ts`, so the demo doubles as a living index
 * of proven compiler behavior. Core (DOM-free) entrypoint on purpose —
 * no `lit` import, runnable under plain Node.
 */

import { createStyleSheet, emptyTables, flow, withState, withVariant } from '@sandlada/styles'
import { DemoDefinition } from './definition.ts'

const tables = flow(
    withState({
        'small': '.small',
        'large': '.large'
    }),
    withVariant({
        'filled': ':host([variant="filled"])',
        'outlined': ':host([variant="outlined"])'
    })
)(emptyTables)

export const DemoStyles = createStyleSheet(tables)(DemoDefinition)(`
    @state(demo) demo {
        background: var(--_demo-color);
        shape: var(--_demo-shape);
        padding: var(--_demo-padding);
        @reduced-motion { transition: none; }

        @when(:host([filled])) {
            margin: 4px;
        }
    }

    @state(demo) demo {
        @forced-colors { outline: 1px solid CanvasText; }
    }

    @variant(filled) {
        @state(demo) demo { border-color: var(--_demo-color); }
    }

    @when(:host([disabled])) {
        @state(demo) demo { opacity: 0.5; }
    }

    @forced-colors {
        demo { forced-color-adjust: none; }
    }
`)
