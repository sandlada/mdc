/**
 * Runtime smoke test for mdc-loading-indicator.
 *
 * Bundles the real component source into one self-contained ESM chunk with
 * rolldown, then evaluates it under Node with minimal browser global stubs and
 * drives the component's actual code paths — geometry, morph, spring
 * integration, rotation accumulation, determinate mapping and the
 * `loading-indicator-complete` event. No browser, no jsdom: `computeRender()`,
 * `stepIndeterminate()`, `resolveFill()` and `updated()` are pure / stub-able.
 */
import { writeFile, rm, mkdir } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { rolldown } from 'rolldown'

const here = dirname(fileURLToPath(import.meta.url))
const mdcDir = join(here, '..')
const tmpDir = join(here, '.bundle')
const bundlePath = join(tmpDir, 'bundle.mjs')

// ── 1. bundle the component ──────────────────────────────────────────────────
const bundler = await rolldown({
    cwd: mdcDir,
    input: 'src/components/loading-indicator/loading-indicator.ts',
    platform: 'node',
})
const { output } = await bundler.generate({ format: 'esm' })
const code = output[0].code
await mkdir(tmpDir, { recursive: true })
await writeFile(bundlePath, code, 'utf8')

// Also bundle the token definition, to assert the renames / variant keys.
const defBundler = await rolldown({
    cwd: mdcDir,
    input: 'src/component-definitions/loading-indicator.definition.ts',
    platform: 'node',
})
const { output: defOut } = await defBundler.generate({ format: 'esm' })
const defPath = join(tmpDir, 'definition.mjs')
await writeFile(defPath, defOut[0].code, 'utf8')

// ── 2. minimal browser global stubs (before importing the bundle) ────────────
const cssToComputed = new Map([
    ['red', 'rgb(255, 0, 0)'],
    ['blue', 'rgb(0, 0, 255)'],
    ['teal', 'rgb(0, 128, 128)'],
])

globalThis.HTMLElement = class HTMLElement {
    static get observedAttributes() { return [] }
    constructor() { this.attributes = {} }
    attachShadow() { return {} }
}
globalThis.customElements = { define: (name, ctor) => { registered.push([name, ctor]) } }
globalThis.performance = { now: () => 1000 }
globalThis.window = globalThis // lit checks window.ShadowRoot at import time
globalThis.requestAnimationFrame = (cb) => { rafCbs.push(cb); return ++rafSeq }
globalThis.cancelAnimationFrame = () => {}
globalThis.matchMedia = () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
})
globalThis.document = {
    documentElement: { appendChild() {} },
    createElement: () => ({ style: {} }),
    // lit-html's Template module creates a walker once at import time.
    createTreeWalker: () => ({ nextNode: () => null }),
}
globalThis.getComputedStyle = (el) => ({
    color: cssToComputed.get(el.style.color) ?? 'rgb(0, 0, 0)',
})
globalThis.Event = class Event { constructor(type) { this.type = type } }
globalThis.CustomEvent = class CustomEvent extends Event {
    constructor(type, init = {}) {
        super(type)
        this.detail = init.detail
        this.bubbles = init.bubbles
        this.composed = init.composed
    }
}

const registered = []
const rafCbs = []
let rafSeq = 0

// ── 3. import the real (bundled) component + definition ─────────────────────
const { MDCLoadingIndicator } = await import(pathToFileURL(bundlePath).href)
const { LoadingIndicatorDefinition } = await import(pathToFileURL(defPath).href)
// Never render into the stub DOM: every update cycle becomes a no-op.
MDCLoadingIndicator.prototype.performUpdate = () => {}

// ── 4. assertions ────────────────────────────────────────────────────────────
let failures = 0
const ok = (cond, label) => {
    if (cond) { console.log(`  ✓ ${label}`) } else { failures++; console.error(`  ✗ ${label}`) }
}
const countL = (d) => (d.match(/\bL /g) ?? []).length
const firstPt = (d) => d.match(/^M ([\d.-]+) ([\d.-]+)/)?.slice(1)

console.log('element registration')
ok(registered.some(([n, c]) => n === 'mdc-loading-indicator' && c === MDCLoadingIndicator),
    'mdc-loading-indicator registered to MDCLoadingIndicator')

console.log('token definition')
const defKeys = Object.keys(LoadingIndicatorDefinition)
ok(defKeys.includes('indicator-size') && !defKeys.includes('active-size'),
    'active-size renamed to indicator-size')
for (const k of ['uncontained-container-color', 'uncontained-indicator-color',
    'contained-container-color', 'contained-indicator-color']) {
    ok(defKeys.includes(k), `token ${k} present`)
}
for (const v of ['secondary', 'tertiary', 'error', 'surface']) {
    ok(defKeys.includes(`uncontained-indicator-color-${v}`)
        && defKeys.includes(`contained-container-color-${v}`)
        && defKeys.includes(`contained-indicator-color-${v}`),
        `variant ${v} color tokens present`)
}
ok(!defKeys.includes('active-indicator-color') && !defKeys.includes('contained-active-color')
    && !defKeys.includes('container-color'), 'legacy token names removed')

// Indeterminate at rest: SoftBurst (normalized first point = [1, 0]).
console.log('indeterminate render')
const ind = new MDCLoadingIndicator()
ind.indeterminate = true
ind.progress = 0
const rest = ind.computeRender()
ok(typeof rest.path === 'string' && rest.path.endsWith('Z'), 'path is a closed polyline')
ok(countL(rest.path) === 71, '72 sampled points (71 L segments + Z)')
ok(firstPt(rest.path)[0] === '1.0000' && firstPt(rest.path)[1] === '0.0000',
    `SoftBurst rest starts at [1,0], got [${firstPt(rest.path)}]`)
ok(rest.rotation === 0, `rest rotation is 0, got ${rest.rotation}`)
ok(!('fill' in rest), 'computeRender returns geometry only — fill comes from CSS tokens')

// Variant / contained are CSS-driven concerns; the component defaults and
// geometry must stay orthogonal to them.
console.log('variant / contained')
ok(ind.variant === 'primary', `variant defaults to primary, got ${ind.variant}`)
ok(ind.contained === false, 'contained defaults to false')
ind.variant = 'error'
ind.contained = true
const vr = ind.computeRender()
ok(vr.path === rest.path && vr.rotation === 0,
    'variant/contained leave geometry untouched (coloring is CSS-only)')

// Render structure: the background is its own span, decoupled from the
// progressbar container and the indicator. Inline `style` is banned outright —
// variant bg / fill colors are driven purely by the `variant-{v}` / `contained`
// classes on the render root via the stylesheet.
console.log('render structure')
const template = ind.render().strings.join('')
ok(template.includes('class="background"'), 'background is a dedicated span element')
ok(template.includes('aria-hidden="true"'), 'background span is aria-hidden')
ok(template.includes('role="progressbar"'), 'progressbar role stays on the container')
ok(template.includes('<svg class="indicator"'), 'indicator remains a sibling svg')
ok(!template.includes('style='), 'no inline style attribute anywhere in the template')
ok(!template.includes('background:'), 'no inline background declaration anywhere')

// Class-driven variant coloring: the stylesheet re-keys the color tokens per
// `.container.variant-{v}` class and gates the contained background / fill on
// the `contained` class — no attribute selectors, no per-instance inline css.
console.log('class-driven variant coloring')
const cssText = MDCLoadingIndicator.styles.cssText
ok(cssText.includes('.container.variant-secondary')
    && cssText.includes('.container.variant-tertiary')
    && cssText.includes('.container.variant-error')
    && cssText.includes('.container.variant-surface'),
    'stylesheet re-keys colors per .container.variant-{v} class')
ok(cssText.includes('.container.contained .background')
    && cssText.includes('.container.contained .indicator path'),
    'contained bg / fill gated on the .contained class')
ok(!cssText.includes(':host([variant'), 'no :host([variant]) attribute-selector styling')
ok(!cssText.includes(':host([contained])'), 'no :host([contained]) attribute-selector styling')

// Advance the spring across several morphs.
console.log('spring / morph advance')
let reachedSecondMorph = false
for (let i = 0; i < 40; i++) { ind.stepIndeterminate(0.1) }
reachedSecondMorph = ind.morphIndex === 1
const advanced = ind.computeRender()
ok(reachedSecondMorph, `morphIndex advanced to 1 after ~4s simulated, got ${ind.morphIndex}`)
ok(ind.rotationTarget === 90, `per-morph spin accumulated 90°, got ${ind.rotationTarget}`)
ok(ind.globalRotation > 0 && ind.globalRotation < 360, `global rotation advanced, got ${ind.globalRotation.toFixed(1)}`)
ok(advanced.path !== rest.path, 'path changed after advancing the sequence')

// Rate multiplier scales the whole timeline. The hold precedes each spring, so
// at 0.5s wall (speed=1) the first shape is still held while speed=2 (1.0s sim)
// has already advanced into the second morph.
console.log('speed scaling')
const slow = new MDCLoadingIndicator()
slow.indeterminate = true
slow.speed = 1
for (let i = 0; i < 10; i++) { slow.stepIndeterminate(0.05) } // 0.5s sim
ok(slow.morphIndex === 0, `speed=1 after 0.5s wall: still holding first shape, got ${slow.morphIndex}`)
const fast = new MDCLoadingIndicator()
fast.indeterminate = true
fast.speed = 2
for (let i = 0; i < 10; i++) { fast.stepIndeterminate(0.05) } // 1.0s sim
ok(fast.morphIndex === 1, `speed=2 after 0.5s wall: advanced to second morph (1.0s sim), got ${fast.morphIndex}`)
ok(fast.globalRotation > slow.globalRotation,
    `global rotation scales with speed (${fast.globalRotation.toFixed(1)} vs ${slow.globalRotation.toFixed(1)})`)
ok(slow.speed === 1, `speed defaults to 1, got ${slow.speed}`)

// Determinate mapping.
console.log('determinate render')
const det = new MDCLoadingIndicator()
det.indeterminate = false
det.progress = 0
const p0 = det.computeRender()
ok(p0.rotation === 0 && firstPt(p0.path)[0] === '1.0000', 'progress 0 → circle, rotation 0')
det.progress = 0.25
const p25 = det.computeRender()
ok(Math.abs(p25.rotation - -45) < 1e-6, `progress 0.25 → rotation -45, got ${p25.rotation}`)
ok(p25.path !== p0.path && p25.path !== rest.path, 'progress 0.25 → mid-morph path (neither circle nor SoftBurst)')
det.progress = 1
const p1 = det.computeRender()
ok(Math.abs(p1.rotation - -180) < 1e-6, `progress 1 → rotation -180, got ${p1.rotation}`)
ok(p1.path === rest.path, 'progress 1 → full SoftBurst (same as indeterminate rest)')
det.progress = 2 // out of range must clamp, not crash
const p2 = det.computeRender()
ok(Math.abs(p2.rotation - -180) < 1e-6 && p2.path === rest.path, 'progress >1 clamps safely')

// Complete event lifecycle.
console.log('loading-indicator-complete event')
const fired = []
const ev = new MDCLoadingIndicator()
ev.dispatchEvent = (e) => { fired.push(e); return true }
ev.indeterminate = false
ev.progress = 1
ev.completeFired = false
ev.updated(new Map([['progress', 0.5]]))
ok(fired.length === 1 && fired[0].type === 'loading-indicator-complete',
    `complete event dispatched once, got ${fired.length}`)
ok(fired[0].detail.value === 1 && fired[0].bubbles === true && fired[0].composed === true,
    'event carries detail { value: 1 }, bubbles and composed')
// Dropping progress below 1 re-arms; staying at 1 does not re-fire.
ev.progress = 0.5
ev.updated(new Map([['progress', 1]]))
ev.updated(new Map())
ok(fired.length === 1, 'event does not re-fire after progress drops below 1 and stays')
// Indeterminate never fires complete.
const ind2 = new MDCLoadingIndicator()
ind2.dispatchEvent = (e) => { fired.push(e); return true }
ind2.indeterminate = true
ind2.progress = 1
ind2.completeFired = false
ind2.updated(new Map([['indeterminate', false]]))
ok(fired.length === 1, 'indeterminate mode never dispatches complete')

// ── 5. cleanup + report ──────────────────────────────────────────────────────
await rm(tmpDir, { recursive: true, force: true })
if (failures) {
    console.error(`\nSMOKE TEST FAILED: ${failures} assertion(s) failed`)
    process.exit(1)
}
console.log('\nSMOKE TEST PASSED')
