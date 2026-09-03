/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * utils/styles playground runner.
 *
 * Mission AI   = per-case `mustContain` / `mustNotContain` assertions below
 *                (machine contract, enforced by `npm test`, stays silent there).
 * Mission HUMAN = `about` + `input` + full printed CSS per case
 *                (reading material, visible via `npm run playground[:watch]`
 *                which passes `--disable-console-intercept`).
 */

import { describe, expect, it } from 'vitest'
import { cases } from './cases'

describe('utils/styles playground', () => {
    for (const playgroundCase of cases) {
        it(`${playgroundCase.name} — ${playgroundCase.about}`, () => {
            const output = playgroundCase.build()

            // eslint-disable-next-line no-console
            console.log(
                `\n--- [${playgroundCase.name}] ${playgroundCase.about}\n`
                + `input: ${playgroundCase.input}\n`
                + `output:\n${output}\n`
            )

            expect(output.length).toBeGreaterThan(0)
            for (const expected of playgroundCase.mustContain) {
                expect(output).toContain(expected)
            }
            for (const forbidden of playgroundCase.mustNotContain) {
                expect(output).not.toContain(forbidden)
            }
        })
    }
})
