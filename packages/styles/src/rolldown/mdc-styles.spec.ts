/**
 * @version 2026.9.8
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * Contract spec for the `@sandlada/styles/rolldown` pre-build plugin.
 *
 * Scope: marker protocol (comment marker, never a bare at-rule), literal
 * scanning with `${...}` awareness, call-shape gating (direct + pipe with
 * inline triggers only), fail-fast rejections, compiled-marker idempotency,
 * and plugin hook passthrough. The VM definition loader is intentionally
 * NOT covered here (needs built outputs); it is exercised by the manual
 * marker rollout on real `*.style.ts` files.
 */

import { describe, expect, it, vi } from 'vitest'
import {
    COMPILED_MARKER,
    compileMarkedFile,
    extractMarkedCssLiterals,
    hasCompiledMarker,
    hasMarker,
    mdcStyles,
    STYLE_MARKER,
} from './index'
import { evaluateTriggers, extractBalancedBody, extractTriggersSource, findDefinitionImport } from './compile-marked'

const marked = (body: string): string =>
    `import { BadgeDefinition } from '../../component-definitions/badge.definition'\n` +
    `const stylePart = createStyleSheet(BadgeDefinition)(() => css\`\n/* ${STYLE_MARKER} */\n${body}\n\`)`

describe('marker protocol', () => {
    it('uses a comment marker so unprocessed sources stay parseable', () => {
        expect(STYLE_MARKER).toBe('@mdc-style')
        expect(hasMarker(STYLE_MARKER)(`css\`/* ${STYLE_MARKER} */\n.a{}\``)).toBe(true)
        expect(hasMarker(STYLE_MARKER)('css`.a{}')).toBe(false)
    })

    it('detects the compiled marker independently', () => {
        expect(hasCompiledMarker(COMPILED_MARKER)(`/* ${COMPILED_MARKER} */`)).toBe(true)
        expect(hasCompiledMarker(COMPILED_MARKER)(`/* ${STYLE_MARKER} */`)).toBe(false)
    })
})

describe('extractMarkedCssLiterals', () => {
    const scan = extractMarkedCssLiterals(STYLE_MARKER)

    it('returns empty for unmarked sources', () => {
        expect(scan('css`.a { color: red }')).toEqual([])
        expect(scan('no templates here')).toEqual([])
    })

    it('extracts a single marked literal with exact spans', () => {
        const code = marked('.a { color: red }')
        const [literal] = scan(code)
        expect(scan(code)).toHaveLength(1)
        expect(code.slice(literal.bodyStart, literal.bodyEnd)).toBe(literal.body)
        expect(literal.body).toContain(STYLE_MARKER)
    })

    it('skips ${} interpolations containing nested backticks', () => {
        const code = marked('.a { height: ${unsafeCSS(`10px`)}; width: ${w}; }')
        const found = scan(code)
        expect(found).toHaveLength(1)
        expect(found[0].body).toContain('unsafeCSS(`10px`)')
    })

    it('finds only the marked literal among several', () => {
        const code = 'css`.a{}\`\n' + marked('.b{}')
        const found = scan(code)
        expect(found).toHaveLength(1)
        expect(found[0].body).toContain('.b{}')
    })

    it('stops at unterminated literals without throwing', () => {
        expect(scan('css`.a{')).toEqual([])
    })
})

describe('shape helpers', () => {
    it('finds the definition import specifier', () => {
        const code = `import { BadgeDefinition } from '../../component-definitions/badge.definition'\ncreateStyleSheet(BadgeDefinition)`
        expect(findDefinitionImport('BadgeDefinition')(code)).toBe('../../component-definitions/badge.definition')
        expect(findDefinitionImport('Missing')(code)).toBe(null)
    })

    it('extracts balanced trigger objects', () => {
        const code = `pipe(mapStateTriggers({ 'small': '.small', 'large': { target: 'self' } }), createStyleSheet)`
        expect(extractTriggersSource(code)).toBe(`{ 'small': '.small', 'large': { target: 'self' } }`)
        expect(extractTriggersSource('createStyleSheet(Def)')).toBe(null)
    })

    it('extractBalancedBody respects strings and nesting', () => {
        expect(extractBalancedBody(`{ a: '}' }`, 0)).toBe(`{ a: '}' }`)
        expect(extractBalancedBody('{ a: { b: 1 } }', 0)).toBe('{ a: { b: 1 } }')
        expect(extractBalancedBody('nope', 0)).toBe(null)
        expect(extractBalancedBody('{ unterminated', 0)).toBe(null)
    })

    it('evaluates inline trigger objects and rejects the rest', () => {
        expect(evaluateTriggers(`{ 'small': '.small' }`)('f.ts')).toEqual({ small: '.small' })
        expect(() => evaluateTriggers('[1, 2]')('f.ts')).toThrowError(/plain object/)
        expect(() => evaluateTriggers('{ a: }')('f.ts')).toThrowError(/statically evaluable/)
    })
})

describe('compileMarkedFile', () => {
    const stubCompile = vi.fn((definition: Record<string, unknown>, body: string) =>
        `/* compiled:${Object.keys(definition).length}:${body.length} */`)
    const stubLoad = vi.fn((exportName: string) => async (_entryPath: string) => {
        if (exportName !== 'BadgeDefinition') throw new Error('missing')
        return { definition: { tokens: {} } }
    })
    const compile = () => compileMarkedFile({ load: stubLoad, compile: stubCompile as never })

    it('passes unmarked files through unchanged', async () => {
        const code = 'css`.a{}`'
        await expect(compile()({ id: 'a.style.ts', code, marker: STYLE_MARKER })).resolves.toEqual({ changed: false, code })
    })

    it('compiles the direct shape and swaps the marker', async () => {
        const code = marked('@state(.container) .container { color: red }')
        const result = await compile()({ id: 'badge.style.ts', code, marker: STYLE_MARKER })
        expect(result.changed).toBe(true)
        expect(result.code).toContain(`/* ${COMPILED_MARKER} */`)
        expect(result.code).not.toContain(STYLE_MARKER)
        expect(result.code).not.toContain('@state(.container)')
        expect(stubLoad).toHaveBeenCalledWith('BadgeDefinition')
    })

    it('supports the pipe shape with inline triggers', async () => {
        const code =
            `import { BadgeDefinition } from './badge.definition'\n` +
            `const s = pipe(mapStateTriggers({ 'small': '.small' }), createStyleSheet)(BadgeDefinition)(() => css\`\n/* ${STYLE_MARKER} */\n.a{}\n\`)`
        const localCompile = vi.fn(() => 'COMPILED')
        const local = compileMarkedFile({ load: stubLoad, compile: localCompile as never })
        const result = await local({ id: 'b.style.ts', code, marker: STYLE_MARKER })
        expect(result.changed).toBe(true)
        expect(localCompile).toHaveBeenCalledWith({ tokens: {} }, expect.any(String), { triggers: { small: '.small' } })
    })

    it('is idempotent: compiled output carries no marker', async () => {
        const code = marked('.a{}')
        const once = await compile()({ id: 'a.style.ts', code, marker: STYLE_MARKER })
        expect(extractMarkedCssLiterals(STYLE_MARKER)(once.code)).toEqual([])
        expect(hasCompiledMarker(COMPILED_MARKER)(once.code)).toBe(true)
    })

    it('rejects multiple marked literals fail-fast', async () => {
        const code = marked('.a{}') + '\n' + marked('.b{}')
        await expect(compile()({ id: 'm.style.ts', code, marker: STYLE_MARKER })).rejects.toThrowError(/exactly one/)
    })

    it('rejects unknown shapes fail-fast', async () => {
        const code = `import { D } from './d'\ncss\`\n/* ${STYLE_MARKER} */\n.a{}\n\``
        await expect(compile()({ id: 'u.style.ts', code, marker: STYLE_MARKER })).rejects.toThrowError(/unsupported shape/)
    })

    it('rejects non-relative definition imports fail-fast', async () => {
        const code = `import { D } from '@sandlada/styles/defs'\nconst s = createStyleSheet(D)(() => css\`\n/* ${STYLE_MARKER} */\n.a{}\n\`)`
        await expect(compile()({ id: 'n.style.ts', code, marker: STYLE_MARKER })).rejects.toThrowError(/non-relative/)
    })
})

describe('mdcStyles plugin', () => {
    const stubCompile = vi.fn(() => 'COMPILED')
    const stubLoad = vi.fn(() => async (_entryPath: string) => ({ definition: {} }))
    const plugin = () => mdcStyles(undefined, { load: stubLoad, compile: stubCompile as never })

    it('is registered as a pre plugin named mdc-styles', () => {
        expect(plugin().name).toBe('mdc-styles')
        expect(plugin().enforce).toBe('pre')
    })

    it('ignores non-style files', async () => {
        await expect(plugin().transform(`css\`/* ${STYLE_MARKER} */\``, 'button.ts')).resolves.toBe(null)
    })

    it('passes unmarked and already-compiled files through', async () => {
        await expect(plugin().transform('css`.a{}`', 'a.style.ts')).resolves.toBe(null)
        await expect(plugin().transform(`css\`/* ${STYLE_MARKER} */ /* ${COMPILED_MARKER} */\``, 'a.style.ts')).resolves.toBe(null)
    })

    it('transforms marked style files', async () => {
        const code = `import { D } from './d'\nconst s = createStyleSheet(D)(() => css\`\n/* ${STYLE_MARKER} */\n.a{}\n\`)`
        const result = await plugin().transform(code, 'x.style.ts')
        expect(result?.code).toContain(`/* ${COMPILED_MARKER} */`)
        expect(result?.map).toBe(null)
    })
})
