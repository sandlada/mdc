/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Color, Shape } from '@sandlada/mdk';
import { createLogicShapeTokens } from '../utils/tokens';

export const RadioDefinition = {
    ...createLogicShapeTokens('--md-radio-button', {
        'state-layer-shape'     : Shape.Full,
        'button-container-shape': Shape.Full,
    }, 'all', false),

    // Enabled
    'selected-icon-color'  : Color.Primary,
    'unselected-icon-color': Color.OnSurfaceVariant,
    'icon-size'            : `12px`,


} as const;
