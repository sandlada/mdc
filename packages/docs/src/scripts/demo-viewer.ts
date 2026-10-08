/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

/**
 * Render a demo HTML fragment inside a shadow root so its `<style>` and
 * `<script>` cannot leak into (or be polluted by) the host document.
 *
 * Scripts inserted through `innerHTML` never execute, so they are re-run
 * manually against a `document` proxy scoped to the shadow root - the same
 * approach used by the dev-app showcase.
 */
export function renderDemo(host: HTMLElement, html: string): void {
    const root = host.shadowRoot ?? host.attachShadow({ mode: 'open' })
    root.innerHTML = html
    runScripts(root)
}

function runScripts(root: ShadowRoot): void {
    const scopedDocument = new Proxy(document, {
        get(target, property) {
            if (property === 'getElementById') {
                return (id: string) => root.querySelector('#' + id) ?? target.getElementById(id)
            }
            if (property === 'querySelector') {
                return (selector: string) => root.querySelector(selector) ?? target.querySelector(selector)
            }
            if (property === 'querySelectorAll') {
                return (selector: string) => {
                    const inRoot = root.querySelectorAll(selector)
                    return inRoot.length > 0 ? inRoot : target.querySelectorAll(selector)
                }
            }
            const value = Reflect.get(target, property)
            return typeof value === 'function' ? value.bind(target) : value
        },
    })

    for (const script of Array.from(root.querySelectorAll('script'))) {
        const body = script.textContent ?? ''
        if (!body.trim()) continue
        try {
            const runner = new Function('document', 'root', `(function (document, root) {\n${body}\n})(document, root)`)
            runner(scopedDocument, root)
        } catch (error) {
            console.error('[mdc-docs] demo script failed:', error)
        }
    }
}

/**
 * `<mdc-demo>` lifts the inert `<template data-demo>` child into an isolated
 * shadow root on connect, keeping demos orderable via plain Astro markup.
 */
class MdcDemoElement extends HTMLElement {
    public connectedCallback(): void {
        if (this.shadowRoot) return
        const template = this.querySelector('template[data-demo]')
        if (!template) return
        renderDemo(this, template.innerHTML)
    }
}

if (!customElements.get('mdc-demo')) {
    customElements.define('mdc-demo', MdcDemoElement)
}
