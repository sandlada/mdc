/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { replaceTargetInSelector } from './replace-target'

describe("replaceTargetInSelector: nested pseudo-class challenger", () => {
    it("correctly replaces inside nested pseudo-classes without text corruption", () => {
        const res1 = replaceTargetInSelector("div:is(span:has(button))", "button", ".small")
        expect(res1).toEqual({
            result: "div:is(span:has(button.small))",
            matched: true
        })

        const res2 = replaceTargetInSelector(":is(button, a:has(button))", "button", ".small")
        expect(res2).toEqual({
            result: ":is(button.small, a:has(button.small))",
            matched: true
        })

        const res3 = replaceTargetInSelector(":has(:is(button))", "button", ".small")
        expect(res3).toEqual({
            result: ":has(:is(button.small))",
            matched: true
        })

        const res4 = replaceTargetInSelector("button:has(:is(button))", "button", ".small")
        expect(res4).toEqual({
            result: "button:has(:is(button.small)).small",
            matched: true
        })

        const res5 = replaceTargetInSelector(":where(:has(:is(button)))", "button", ".small")
        expect(res5).toEqual({
            result: ":where(:has(:is(button.small)))",
            matched: true
        })

        const res6 = replaceTargetInSelector(":is(span:has(.other))", "button", ".small")
        expect(res6).toEqual({
            result: ":is(span:has(.other))",
            matched: false
        })
    })
})
