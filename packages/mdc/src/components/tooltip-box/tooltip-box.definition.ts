/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// tooltip-box is a behavioral controller with no visual surface of its own.
// It delegates all visual styling to the slotted mdc-tooltip element.
// This file re-exports the tooltip schema for the behavioral controller.
import { TooltipSchema } from '../tooltip/tooltip.definition'

export const TooltipBoxSchema = TooltipSchema
