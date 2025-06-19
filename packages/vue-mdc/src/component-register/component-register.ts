/**
 * @license
 * Copyright 2024 sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { Banner } from '../components/banner'
import { BottomAppBar } from '../components/bottom-app-bar/bottom-app-bar'
import { Button } from '../components/button/button'
import { Checkbox } from '../components/checkbox/checkbox'
import { Dialog } from '../components/dialog/dialog'
import { Divider } from '../components/divider/divider'
import { Elevation } from '../components/elevation/elevation'
import { Fab } from '../components/fab/fab'
import { Field } from '../components/field/field'
import { FocusRing } from '../components/focus-ring/focus-ring'
import { IconButton } from '../components/icon-button/icon-button'
import { ToggleIconButton } from '../components/icon-button/toggle-icon-button'
import { Icon } from '../components/icon/icon'
import { NavigationBar } from '../components/navigation-bar/navigation-bar'
import { NavigationDrawer, } from '../components/navigation-drawer/navigation-drawer'
import { NavigationDrawerHeadline } from '../components/navigation-drawer/navigation-drawer-headline'
import { NavigationDrawerIndicator } from '../components/navigation-drawer/navigation-drawer-indicator'
import { NavigationRailTab } from '../components/navigation-rail-tab/navigation-rail-tab'
import { NavigationRail } from '../components/navigation-rail/navigation-rail'
import { NavigationTab } from '../components/navigation-tab/navigation-tab'
import { CircularProgress } from '../components/progress/circular-progress'
import { LinearProgress } from '../components/progress/linear-progress'
import { ThemeProvider } from '../components/provider/theme-provider'
import { Radio } from '../components/radio/radio'
import { Ripple } from '../components/ripple/ripple'
import { SplitButton } from '../components/split-button/split-button'
import { SplitButtonGroup } from '../components/split-button/split-button-group'
import { Switch } from '../components/switch/switch'
import { PlainTooltip } from '../components/tooltip/plain-tooltip'
import { RichTooltip } from '../components/tooltip/rich-tooltip'
import { Typography } from '../components/typography/typography'
import { componentNamePrefix } from '../internals/component-name-prefix/component-name-prefix'

export const registerComponents = (prefix = componentNamePrefix) => ({
    install: (instance: import('vue').App<any>) => {
        instance.component(`${prefix}-banner`, Banner)
        instance.component(`${prefix}-bottom-app-bar`, BottomAppBar)
        instance.component(`${prefix}-button`, Button)
        instance.component(`${prefix}-checkbox`, Checkbox)
        instance.component(`${prefix}-dialog`, Dialog)
        instance.component(`${prefix}-divider`, Divider)
        instance.component(`${prefix}-elevation`, Elevation)
        instance.component(`${prefix}-fab`, Fab)
        instance.component(`${prefix}-field`, Field)
        instance.component(`${prefix}-focus-ring`, FocusRing)
        instance.component(`${prefix}-icon`, Icon)
        instance.component(`${prefix}-icon-button`, IconButton)
        instance.component(`${prefix}-toggle-icon-button`, ToggleIconButton)
        instance.component(`${prefix}-navigation-bar`, NavigationBar)
        instance.component(`${prefix}-navigation-drawer`, NavigationDrawer)
        instance.component(`${prefix}-navigation-drawer-headline`, NavigationDrawerHeadline)
        instance.component(`${prefix}-navigation-drawer-indicator`, NavigationDrawerIndicator)
        instance.component(`${prefix}-navigation-rail`, NavigationRail)
        instance.component(`${prefix}-navigation-rail-tab`, NavigationRailTab)
        instance.component(`${prefix}-navigation-tab`, NavigationTab)
        instance.component(`${prefix}-linear-progress`, LinearProgress)
        instance.component(`${prefix}-circular-progress`, CircularProgress)
        instance.component(`${prefix}-theme-provider`, ThemeProvider)
        instance.component(`${prefix}-radio`, Radio)
        instance.component(`${prefix}-ripple`, Ripple)
        instance.component(`${prefix}-split-button`, SplitButton)
        instance.component(`${prefix}-split-button-group`, SplitButtonGroup)
        instance.component(`${prefix}-switch`, Switch)
        instance.component(`${prefix}-rich-tooltip`, RichTooltip)
        instance.component(`${prefix}-plain-tooltip`, PlainTooltip)
        instance.component(`${prefix}-typography`, Typography)
    }
})
