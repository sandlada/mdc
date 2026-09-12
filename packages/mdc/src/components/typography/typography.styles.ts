/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { createStyleSheet, stringifyTokens } from '@sandlada/styles/adapters/lit'
import { flow } from '@sandlada/styles/foundation'
import { emptyTables, withState } from '@sandlada/styles/schema'
import { css } from 'lit'
import { TypographyDefinition } from './typography.definition'

const tokens = stringifyTokens('--mdc-typography')(TypographyDefinition)

const tables = flow(
    withState({
        'display': '[variant^="display-"]',
        'headline': '[variant^="headline-"]',
        'title': '[variant^="title-"]',
        'label': '[variant^="label-"]',
        'body': '[variant^="body-"]',
        'small': '[variant$="-small"]',
        'medium': '[variant$="-medium"]',
        'large': '[variant$="-large"]',
        'regular': ':not([emphasized])',
        'emphasized': '[emphasized]'
    }),
)(emptyTables)

const createStylePart = createStyleSheet(tables)(TypographyDefinition)

export const typographyStyles = createStylePart(() => css`
    @layer mdc.typography {
        @layer variable, component, hcm, contrast, motion;
    }

    @layer mdc.typography.variable {
        :host{${tokens};}
    }

    @layer mdc.typography {

        :host([block]) {
            display: block;
        }

        :host([inline]) {
            display: inline;
        }

        :host([inline-block]) {
            display: inline-block;
        }

        @state(:host) :host {
            font-family: var(--_font);
            font-size: var(--_size);
            font-weight: var(--_weight);
            line-height: var(--_leading);
            letter-spacing: var(--_tracking);
        }
    }
`)
