/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Typescale } from '@sandlada/mdk'
import { css, CSSResult } from 'lit'
import { type KebabCase, toKebabCase } from '../../utils/string/to-kebab-case'
import { createWrappedTokens } from '../../utils/tokens'

type TypographyRecord = { [P in keyof typeof Typescale as `${KebabCase<string & P>}`]: CSSResult }

const typescaleTokens = createWrappedTokens<TypographyRecord>(
    '--mdc-typography',
    Object
        .entries(Typescale)
        .reduce((p, [k, v]) => ({ ...p, [toKebabCase(k)]: v }), {}) as TypographyRecord
)

export const typographyStyles = css`
    @layer mdc.typography {
        :host(:not([emphasized])[variant="display-large"]) {
            font-family: ${typescaleTokens['--_display-large-font']};
            font-size: ${typescaleTokens['--_display-large-size']};
            font-weight: ${typescaleTokens['--_display-large-weight']};
            line-height: ${typescaleTokens['--_display-large-line-height']};
            letter-spacing: ${typescaleTokens['--_display-large-tracking']};
        }

        :host(:not([emphasized])[variant="display-medium"]) {
            font-family: ${typescaleTokens['--_display-medium-font']};
            font-size: ${typescaleTokens['--_display-medium-size']};
            font-weight: ${typescaleTokens['--_display-medium-weight']};
            line-height: ${typescaleTokens['--_display-medium-line-height']};
            letter-spacing: ${typescaleTokens['--_display-medium-tracking']};
        }

        :host(:not([emphasized])[variant="display-small"]) {
            font-family: ${typescaleTokens['--_display-small-font']};
            font-size: ${typescaleTokens['--_display-small-size']};
            font-weight: ${typescaleTokens['--_display-small-weight']};
            line-height: ${typescaleTokens['--_display-small-line-height']};
            letter-spacing: ${typescaleTokens['--_display-small-tracking']};
        }

        :host(:not([emphasized])[variant="headline-large"]) {
            font-family: ${typescaleTokens['--_headline-large-font']};
            font-size: ${typescaleTokens['--_headline-large-size']};
            font-weight: ${typescaleTokens['--_headline-large-weight']};
            line-height: ${typescaleTokens['--_headline-large-line-height']};
            letter-spacing: ${typescaleTokens['--_headline-large-tracking']};
        }

        :host(:not([emphasized])[variant="headline-medium"]) {
            font-family: ${typescaleTokens['--_headline-medium-font']};
            font-size: ${typescaleTokens['--_headline-medium-size']};
            font-weight: ${typescaleTokens['--_headline-medium-weight']};
            line-height: ${typescaleTokens['--_headline-medium-line-height']};
            letter-spacing: ${typescaleTokens['--_headline-medium-tracking']};
        }

        :host(:not([emphasized])[variant="headline-small"]) {
            font-family: ${typescaleTokens['--_headline-small-font']};
            font-size: ${typescaleTokens['--_headline-small-size']};
            font-weight: ${typescaleTokens['--_headline-small-weight']};
            line-height: ${typescaleTokens['--_headline-small-line-height']};
            letter-spacing: ${typescaleTokens['--_headline-small-tracking']};
        }

        :host(:not([emphasized])[variant="title-large"]) {
            font-family: ${typescaleTokens['--_title-large-font']};
            font-size: ${typescaleTokens['--_title-large-size']};
            font-weight: ${typescaleTokens['--_title-large-weight']};
            line-height: ${typescaleTokens['--_title-large-line-height']};
            letter-spacing: ${typescaleTokens['--_title-large-tracking']};
        }

        :host(:not([emphasized])[variant="title-medium"]) {
            font-family: ${typescaleTokens['--_title-medium-font']};
            font-size: ${typescaleTokens['--_title-medium-size']};
            font-weight: ${typescaleTokens['--_title-medium-weight']};
            line-height: ${typescaleTokens['--_title-medium-line-height']};
            letter-spacing: ${typescaleTokens['--_title-medium-tracking']};
        }

        :host(:not([emphasized])[variant="title-small"]) {
            font-family: ${typescaleTokens['--_title-small-font']};
            font-size: ${typescaleTokens['--_title-small-size']};
            font-weight: ${typescaleTokens['--_title-small-weight']};
            line-height: ${typescaleTokens['--_title-small-line-height']};
            letter-spacing: ${typescaleTokens['--_title-small-tracking']};
        }

        :host(:not([emphasized])[variant="label-large"]) {
            font-family: ${typescaleTokens['--_label-large-font']};
            font-size: ${typescaleTokens['--_label-large-size']};
            font-weight: ${typescaleTokens['--_label-large-weight']};
            line-height: ${typescaleTokens['--_label-large-line-height']};
            letter-spacing: ${typescaleTokens['--_label-large-tracking']};
        }

        :host(:not([emphasized])[variant="label-medium"]) {
            font-family: ${typescaleTokens['--_label-medium-font']};
            font-size: ${typescaleTokens['--_label-medium-size']};
            font-weight: ${typescaleTokens['--_label-medium-weight']};
            line-height: ${typescaleTokens['--_label-medium-line-height']};
            letter-spacing: ${typescaleTokens['--_label-medium-tracking']};
        }

        :host(:not([emphasized])[variant="label-small"]) {
            font-family: ${typescaleTokens['--_label-small-font']};
            font-size: ${typescaleTokens['--_label-small-size']};
            font-weight: ${typescaleTokens['--_label-small-weight']};
            line-height: ${typescaleTokens['--_label-small-line-height']};
            letter-spacing: ${typescaleTokens['--_label-small-tracking']};
        }

        :host(:not([emphasized])[variant="body-large"]) {
            font-family: ${typescaleTokens['--_body-large-font']};
            font-size: ${typescaleTokens['--_body-large-size']};
            font-weight: ${typescaleTokens['--_body-large-weight']};
            line-height: ${typescaleTokens['--_body-large-line-height']};
            letter-spacing: ${typescaleTokens['--_body-large-tracking']};
        }

        :host(:not([emphasized])[variant="body-medium"]) {
            font-family: ${typescaleTokens['--_body-medium-font']};
            font-size: ${typescaleTokens['--_body-medium-size']};
            font-weight: ${typescaleTokens['--_body-medium-weight']};
            line-height: ${typescaleTokens['--_body-medium-line-height']};
            letter-spacing: ${typescaleTokens['--_body-medium-tracking']};
        }

        :host(:not([emphasized])[variant="body-small"]) {
            font-family: ${typescaleTokens['--_body-small-font']};
            font-size: ${typescaleTokens['--_body-small-size']};
            font-weight: ${typescaleTokens['--_body-small-weight']};
            line-height: ${typescaleTokens['--_body-small-line-height']};
            letter-spacing: ${typescaleTokens['--_body-small-tracking']};
        }

        :host([emphasized][variant="display-large"]) {
            font-family: ${typescaleTokens['--_emphasized-display-large-font']};
            font-size: ${typescaleTokens['--_emphasized-display-large-size']};
            font-weight: ${typescaleTokens['--_emphasized-display-large-weight']};
            line-height: ${typescaleTokens['--_emphasized-display-large-line-height']};
            letter-spacing: ${typescaleTokens['--_emphasized-display-large-tracking']};
        }

        :host([emphasized][variant="display-medium"]) {
            font-family: ${typescaleTokens['--_emphasized-display-medium-font']};
            font-size: ${typescaleTokens['--_emphasized-display-medium-size']};
            font-weight: ${typescaleTokens['--_emphasized-display-medium-weight']};
            line-height: ${typescaleTokens['--_emphasized-display-medium-line-height']};
            letter-spacing: ${typescaleTokens['--_emphasized-display-medium-tracking']};
        }

        :host([emphasized][variant="display-small"]) {
            font-family: ${typescaleTokens['--_emphasized-display-small-font']};
            font-size: ${typescaleTokens['--_emphasized-display-small-size']};
            font-weight: ${typescaleTokens['--_emphasized-display-small-weight']};
            line-height: ${typescaleTokens['--_emphasized-display-small-line-height']};
            letter-spacing: ${typescaleTokens['--_emphasized-display-small-tracking']};
        }

        :host([emphasized][variant="headline-large"]) {
            font-family: ${typescaleTokens['--_emphasized-headline-large-font']};
            font-size: ${typescaleTokens['--_emphasized-headline-large-size']};
            font-weight: ${typescaleTokens['--_emphasized-headline-large-weight']};
            line-height: ${typescaleTokens['--_emphasized-headline-large-line-height']};
            letter-spacing: ${typescaleTokens['--_emphasized-headline-large-tracking']};
        }

        :host([emphasized][variant="headline-medium"]) {
            font-family: ${typescaleTokens['--_emphasized-headline-medium-font']};
            font-size: ${typescaleTokens['--_emphasized-headline-medium-size']};
            font-weight: ${typescaleTokens['--_emphasized-headline-medium-weight']};
            line-height: ${typescaleTokens['--_emphasized-headline-medium-line-height']};
            letter-spacing: ${typescaleTokens['--_emphasized-headline-medium-tracking']};
        }

        :host([emphasized][variant="headline-small"]) {
            font-family: ${typescaleTokens['--_emphasized-headline-small-font']};
            font-size: ${typescaleTokens['--_emphasized-headline-small-size']};
            font-weight: ${typescaleTokens['--_emphasized-headline-small-weight']};
            line-height: ${typescaleTokens['--_emphasized-headline-small-line-height']};
            letter-spacing: ${typescaleTokens['--_emphasized-headline-small-tracking']};
        }

        :host([emphasized][variant="title-large"]) {
            font-family: ${typescaleTokens['--_emphasized-title-large-font']};
            font-size: ${typescaleTokens['--_emphasized-title-large-size']};
            font-weight: ${typescaleTokens['--_emphasized-title-large-weight']};
            line-height: ${typescaleTokens['--_emphasized-title-large-line-height']};
            letter-spacing: ${typescaleTokens['--_emphasized-title-large-tracking']};
        }

        :host([emphasized][variant="title-medium"]) {
            font-family: ${typescaleTokens['--_emphasized-title-medium-font']};
            font-size: ${typescaleTokens['--_emphasized-title-medium-size']};
            font-weight: ${typescaleTokens['--_emphasized-title-medium-weight']};
            line-height: ${typescaleTokens['--_emphasized-title-medium-line-height']};
            letter-spacing: ${typescaleTokens['--_emphasized-title-medium-tracking']};
        }

        :host([emphasized][variant="title-small"]) {
            font-family: ${typescaleTokens['--_emphasized-title-small-font']};
            font-size: ${typescaleTokens['--_emphasized-title-small-size']};
            font-weight: ${typescaleTokens['--_emphasized-title-small-weight']};
            line-height: ${typescaleTokens['--_emphasized-title-small-line-height']};
            letter-spacing: ${typescaleTokens['--_emphasized-title-small-tracking']};
        }

        :host([emphasized][variant="label-large"]) {
            font-family: ${typescaleTokens['--_emphasized-label-large-font']};
            font-size: ${typescaleTokens['--_emphasized-label-large-size']};
            font-weight: ${typescaleTokens['--_emphasized-label-large-weight']};
            line-height: ${typescaleTokens['--_emphasized-label-large-line-height']};
            letter-spacing: ${typescaleTokens['--_emphasized-label-large-tracking']};
        }

        :host([emphasized][variant="label-medium"]) {
            font-family: ${typescaleTokens['--_emphasized-label-medium-font']};
            font-size: ${typescaleTokens['--_emphasized-label-medium-size']};
            font-weight: ${typescaleTokens['--_emphasized-label-medium-weight']};
            line-height: ${typescaleTokens['--_emphasized-label-medium-line-height']};
            letter-spacing: ${typescaleTokens['--_emphasized-label-medium-tracking']};
        }

        :host([emphasized][variant="label-small"]) {
            font-family: ${typescaleTokens['--_emphasized-label-small-font']};
            font-size: ${typescaleTokens['--_emphasized-label-small-size']};
            font-weight: ${typescaleTokens['--_emphasized-label-small-weight']};
            line-height: ${typescaleTokens['--_emphasized-label-small-line-height']};
            letter-spacing: ${typescaleTokens['--_emphasized-label-small-tracking']};
        }

        :host([emphasized][variant="body-large"]) {
            font-family: ${typescaleTokens['--_emphasized-body-large-font']};
            font-size: ${typescaleTokens['--_emphasized-body-large-size']};
            font-weight: ${typescaleTokens['--_emphasized-body-large-weight']};
            line-height: ${typescaleTokens['--_emphasized-body-large-line-height']};
            letter-spacing: ${typescaleTokens['--_emphasized-body-large-tracking']};
        }

        :host([emphasized][variant="body-medium"]) {
            font-family: ${typescaleTokens['--_emphasized-body-medium-font']};
            font-size: ${typescaleTokens['--_emphasized-body-medium-size']};
            font-weight: ${typescaleTokens['--_emphasized-body-medium-weight']};
            line-height: ${typescaleTokens['--_emphasized-body-medium-line-height']};
            letter-spacing: ${typescaleTokens['--_emphasized-body-medium-tracking']};
        }

        :host([emphasized][variant="body-small"]) {
            font-family: ${typescaleTokens['--_emphasized-body-small-font']};
            font-size: ${typescaleTokens['--_emphasized-body-small-size']};
            font-weight: ${typescaleTokens['--_emphasized-body-small-weight']};
            line-height: ${typescaleTokens['--_emphasized-body-small-line-height']};
            letter-spacing: ${typescaleTokens['--_emphasized-body-small-tracking']};
        }
    }
`
