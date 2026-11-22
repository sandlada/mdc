/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { expect, test } from '@playwright/test'

test('opens the current group and keeps keyboard toggles independent', async ({ page }) => {
    await page.goto('/components/navigation-rail/')
    const sidebar = page.locator('mdc-docs-sidebar')
    const navigation = sidebar.getByRole('button', { name: 'Navigation', exact: true })
    const buttons = sidebar.getByRole('button', { name: 'Buttons', exact: true })
    const rail = sidebar.getByRole('link', { name: 'Navigation Rail', exact: true })

    await expect(navigation).toHaveAttribute('aria-expanded', 'true')
    await expect(sidebar.getByRole('button', { expanded: false })).toHaveCount(9)
    await expect(rail).toHaveAttribute('aria-current', 'page')
    await expect(sidebar.getByRole('link', { name: 'Navigation Bar', exact: true })).toBeVisible()
    await expect(sidebar.getByRole('link', { name: 'Navigation Drawer', exact: true })).toBeVisible()
    await expect(sidebar.getByRole('link', { name: 'Navigation Tab', exact: true })).toBeVisible()

    await buttons.press('Enter')
    await expect(buttons).toHaveAttribute('aria-expanded', 'true')
    await expect(navigation).toHaveAttribute('aria-expanded', 'true')
    await navigation.press('Space')
    await expect(navigation).toHaveAttribute('aria-expanded', 'false')
    await expect(rail).toBeHidden()
    await page.keyboard.press('Tab')
    await expect(sidebar.getByRole('link', { name: 'On This Page', exact: true })).toBeFocused()

    await sidebar.getByRole('link', { name: 'Accordion', exact: true }).click()
    await expect(page).toHaveURL(/\/components\/accordion\/$/)
    await page.goBack()
    await expect(rail).toHaveAttribute('aria-current', 'page')
    await expect(navigation).toHaveAttribute('aria-expanded', 'true')
    await expect(buttons).toHaveAttribute('aria-expanded', 'true')
    await page.goForward()
    await expect(sidebar.getByRole('link', { name: 'Accordion', exact: true }))
        .toHaveAttribute('aria-current', 'page')
})

test('opening a group keeps the narrow sidebar open until a link is selected', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/components/divider/')
    const menu = page.getByRole('button', { name: 'Toggle navigation menu' })
    const dialog = page.getByRole('dialog', { name: 'Documentation navigation' })

    await menu.click()
    await dialog.getByRole('button', { name: 'Navigation', exact: true }).click()
    await expect(dialog).toBeVisible()
    await dialog.getByRole('link', { name: 'Navigation Bar', exact: true }).click()
    await expect(page).toHaveURL(/\/components\/navigation-bar\/$/)
    await expect(dialog).toBeHidden()
    await menu.click()
    await expect(dialog.getByRole('link', { name: 'Navigation Bar', exact: true }))
        .toHaveAttribute('aria-current', 'page')
})
