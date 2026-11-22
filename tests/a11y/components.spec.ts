/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.beforeEach(async ({ page }) => {
    await page.goto('/a11y-test.html')
    await page.evaluate(async () => {
        await import('/shared/base-imports.ts')
        document.body.innerHTML = ''
    })
})

test('form reset applies defaults independently of initial state', async ({ page }) => {
    await page.evaluate(() => {
        document.body.innerHTML = `<form>
            <mdc-checkbox name="first" value="yes" default-checked aria-label="First"></mdc-checkbox>
            <mdc-checkbox name="second" value="yes" checked aria-label="Second"></mdc-checkbox>
            <button type="reset">Reset</button>
        </form>`
    })
    const first = page.getByRole('checkbox', { name: 'First' })
    const second = page.getByRole('checkbox', { name: 'Second' })
    await expect(first).not.toBeChecked()
    await expect(second).toBeChecked()
    await page.getByRole('button', { name: 'Reset' }).click()
    await expect(first).toBeChecked()
    await expect(second).not.toBeChecked()
    await expect.poll(() => page.locator('form').evaluate(form => Array.from(new FormData(form as HTMLFormElement).entries()))).toEqual([['first', 'yes']])
})

for (const [tag, state, resetAttribute] of [
    ['mdc-toggle-button', 'checked', 'default-checked'],
    ['mdc-toggle-icon-button', 'checked', 'default-checked'],
    ['mdc-radio-button', 'checked', 'default-checked'],
    ['mdc-navigation-tab', 'checked', 'default-checked'],
    ['mdc-switch', 'selected', 'default-selected'],
] as const) {
    test(`${tag} uses its default only on reset`, async ({ page }) => {
        await page.evaluate(({ tag, resetAttribute }) => {
            document.body.innerHTML = `<form><${tag} name="choice" value="yes" ${resetAttribute}></${tag}></form>`
        }, { tag, resetAttribute })
        const control = page.locator(tag)
        await expect.poll(() => control.evaluate((el, state) => (el as unknown as Record<string, boolean>)[state], state)).toBe(false)
        await page.locator('form').evaluate(form => (form as HTMLFormElement).reset())
        await expect.poll(() => control.evaluate((el, state) => (el as unknown as Record<string, boolean>)[state], state)).toBe(true)
        await expect.poll(() => page.locator('form').evaluate(form => Array.from(new FormData(form as HTMLFormElement).entries()))).toEqual([['choice', 'yes']])
        await control.evaluate((el, attr) => el.removeAttribute(attr), resetAttribute)
        await page.locator('form').evaluate(form => (form as HTMLFormElement).reset())
        await expect.poll(() => control.evaluate((el, state) => (el as unknown as Record<string, boolean>)[state], state)).toBe(false)
    })
}

test('select exposes its active option during keyboard navigation', async ({ page }) => {
    await page.evaluate(() => {
        document.body.innerHTML = `<mdc-select label="Fruit" quick>
            <mdc-select-option value="a">Apple</mdc-select-option>
            <mdc-select-option value="b" disabled>Banana</mdc-select-option>
            <mdc-select-option value="c">Cherry</mdc-select-option>
        </mdc-select>`
    })
    const select = page.getByRole('combobox', { name: 'Fruit' })
    await select.focus()
    await page.keyboard.press('ArrowDown')
    await expect(select).toHaveAttribute('aria-expanded', 'true')
    await expect.poll(() => select.evaluate(el => el.ariaActiveDescendantElement?.textContent?.trim())).toBe('Apple')
    await page.keyboard.press('ArrowDown')
    await expect.poll(() => select.evaluate(el => el.ariaActiveDescendantElement?.textContent?.trim())).toBe('Cherry')
    const cdp = await page.context().newCDPSession(page)
    const tree = await cdp.send('Accessibility.getFullAXTree')
    const combobox = tree.nodes.find(node => node.role?.value === 'combobox' && node.name?.value === 'Fruit')
    const active = combobox?.properties?.find(property => property.name === 'activedescendant')
    expect(active?.value?.relatedNodes?.[0]?.backendDOMNodeId).toBeTruthy()
    await page.keyboard.press('Enter')
    await expect(select).toHaveAttribute('aria-expanded', 'false')
    await expect.poll(() => select.evaluate(el => el.ariaActiveDescendantElement)).toBeNull()
})

test('switch exposes its name and checked state at keyboard focus', async ({ page }) => {
    await page.evaluate(() => {
        document.body.innerHTML = '<mdc-switch aria-label="Notifications"></mdc-switch>'
    })
    const control = page.getByRole('switch', { name: 'Notifications' })
    await control.focus()
    await expect(control).toBeFocused()
    await expect(control).not.toBeChecked()
    await page.keyboard.press('Space')
    await expect(control).toBeChecked()
})

test('switch accepts an associated label', async ({ page }) => {
    await page.evaluate(() => {
        document.body.innerHTML = '<label for="notifications">Notifications</label><mdc-switch id="notifications"></mdc-switch>'
    })
    await expect(page.getByRole('switch', { name: 'Notifications' })).toBeVisible()
})

test('checkbox accepts an associated label', async ({ page }) => {
    await page.evaluate(() => {
        document.body.innerHTML = '<label for="subscribe">Subscribe</label><mdc-checkbox id="subscribe"></mdc-checkbox>'
    })
    await expect(page.getByRole('checkbox', { name: 'Subscribe' })).toBeVisible()
})

for (const tag of ['mdc-toggle-button', 'mdc-toggle-icon-button', 'mdc-radio-button']) {
    test(`${tag} exposes selection when operated by keyboard`, async ({ page }) => {
        await page.evaluate(tag => {
            document.body.innerHTML = `<${tag} aria-label="Choice"></${tag}>`
        }, tag)
        const control = tag === 'mdc-radio-button' ? page.locator(tag) : page.getByRole('checkbox', { name: 'Choice' })
        await expect.poll(() => page.locator(tag).evaluate(el => (el as unknown as { checked: boolean }).checked)).toBe(false)
        await control.focus()
        await page.keyboard.press('Space')
        await expect.poll(() => page.locator(tag).evaluate(el => (el as unknown as { checked: boolean }).checked)).toBe(true)
        if (tag === 'mdc-radio-button') {
            const session = await page.context().newCDPSession(page)
            const tree = await session.send('Accessibility.getFullAXTree')
            expect(tree.nodes.some(node => node.role?.value === 'radio' && node.name?.value === 'Choice')).toBe(true)
        } else {
            await expect(control).toBeChecked()
        }
    })
}

test('tabs move focus with the arrow keys', async ({ page }) => {
    await page.evaluate(() => {
        document.body.innerHTML = `<mdc-tabs label="Sections" active-tab-index="0">
            <mdc-tab>Overview</mdc-tab><mdc-tab>Details</mdc-tab>
        </mdc-tabs>`
    })
    const overview = page.getByRole('tab', { name: 'Overview' })
    const details = page.getByRole('tab', { name: 'Details' })
    await overview.focus()
    await page.keyboard.press('ArrowRight')
    await expect(details).toBeFocused()
})

test('modal dialog returns focus to its opener', async ({ page }) => {
    await page.evaluate(() => {
        document.body.innerHTML = `<button id="opener">Open</button>
            <mdc-basic-dialog quick><span slot="headline">Settings</span>
            <button slot="content">Inside</button></mdc-basic-dialog>`
        document.querySelector('#opener')!.addEventListener('click', () => {
            void (document.querySelector('mdc-basic-dialog') as HTMLElement & { show(): Promise<void> }).show()
        })
    })
    const opener = page.getByRole('button', { name: 'Open' })
    await opener.click()
    await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Inside' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(opener).toBeFocused()
})

test('representative controls have no automatically detectable WCAG violations', async ({ page }) => {
    await page.evaluate(() => {
        document.body.innerHTML = `<main>
            <mdc-checkbox aria-label="Subscribe"></mdc-checkbox>
            <mdc-switch aria-label="Notifications"></mdc-switch>
            <mdc-radio-button name="delivery" aria-label="Delivery"></mdc-radio-button>
            <mdc-toggle-button aria-label="Mute"></mdc-toggle-button>
            <mdc-toggle-icon-button aria-label="Favorite"></mdc-toggle-icon-button>
            <mdc-select label="Fruit"><mdc-select-option value="a">Apple</mdc-select-option></mdc-select>
            <mdc-tabs label="Sections"><mdc-tab>Overview</mdc-tab><mdc-tab>Details</mdc-tab></mdc-tabs>
        </main>`
    })
    await expect(page.getByRole('combobox', { name: 'Fruit' })).toBeVisible()
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
    expect(results.violations).toEqual([])
})
