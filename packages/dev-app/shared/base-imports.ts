/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

// Side-effect imports — registered on every page so all components are always
// available, avoiding manual imports across individual demo pages and ensuring
// components passed as slot content are automatically registered.
//
// Each folder barrel (`src/components/<name>/index.ts`) re-exports the
// component itself plus its interface, replacing the removed `src/all.ts`.
import '@sandlada/mdc/components/appbar/index'
import '@sandlada/mdc/components/badge/index'
import '@sandlada/mdc/components/bottom-sheet/index'
import '@sandlada/mdc/components/button/index'
import '@sandlada/mdc/components/button-group/index'
import '@sandlada/mdc/components/card/index'
import '@sandlada/mdc/components/carousel/index'
import '@sandlada/mdc/components/checkbox/index'
import '@sandlada/mdc/components/chip/index'
import '@sandlada/mdc/components/dialog/index'
import '@sandlada/mdc/components/divider/index'
import '@sandlada/mdc/components/elevation/index'
import '@sandlada/mdc/components/expressive-progress-indicator/index'
import '@sandlada/mdc/components/expressive-slider/index'
import '@sandlada/mdc/components/fab/index'
import '@sandlada/mdc/components/field/index'
import '@sandlada/mdc/components/focus-ring/index'
import '@sandlada/mdc/components/icon/index'
import '@sandlada/mdc/components/icon-button/index'
import '@sandlada/mdc/components/list/index'
import '@sandlada/mdc/components/loading-indicator/index'
import '@sandlada/mdc/components/navigation-bar/index'
import '@sandlada/mdc/components/navigation-drawer/index'
import '@sandlada/mdc/components/navigation-rail/index'
import '@sandlada/mdc/components/navigation-tab/index'
import '@sandlada/mdc/components/on-this-page/index'
import '@sandlada/mdc/components/progress-indicator/index'
import '@sandlada/mdc/components/radio-button/index'
import '@sandlada/mdc/components/ripple/index'
import '@sandlada/mdc/components/scaffold/index'
import '@sandlada/mdc/components/search/index'
import '@sandlada/mdc/components/segmented-button/index'
import '@sandlada/mdc/components/side-sheet/index'
import '@sandlada/mdc/components/slider/index'
import '@sandlada/mdc/components/snackbar/index'
import '@sandlada/mdc/components/split-button/index'
import '@sandlada/mdc/components/switch/index'
import '@sandlada/mdc/components/tabs/index'
import '@sandlada/mdc/components/text-field/index'
import '@sandlada/mdc/components/tooltip/index'
import '@sandlada/mdc/components/tooltip-box/index'
import '@sandlada/mdc/components/typography/index'

export { }
