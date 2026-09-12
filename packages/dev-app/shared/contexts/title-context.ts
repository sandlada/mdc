/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { createContext } from '@lit/context'

/**
 * Page-title context for the docs site.
 *
 * Provided by `<mdc-docs-page>` (from its `title` attribute), consumed by
 * `<mdc-docs-shell>` to render the current page title in the header.
 */
export const docsPageTitleContext = createContext<string>(Symbol.for('mdc-docs-page-title'))
