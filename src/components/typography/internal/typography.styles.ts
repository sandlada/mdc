/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { TypographyDefinition } from '../../../component-definitions/typography.definition'
import { createWrappedTokens } from '../../../utils/tokens'

const tokens = createWrappedTokens('--mdc-typegraphy', TypographyDefinition)

export const typographyStyles = css`
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

        :host(:not([emphasized])[variant="display-large"]) {
            font-family: ${tokens['--_display-large-font']};
            font-size: ${tokens['--_display-large-size']};
            font-weight: ${tokens['--_display-large-weight']};
            line-height: ${tokens['--_display-large-line-height']};
            letter-spacing: ${tokens['--_display-large-tracking']};
        }

        :host(:not([emphasized])[variant="display-medium"]) {
            font-family: ${tokens['--_display-medium-font']};
            font-size: ${tokens['--_display-medium-size']};
            font-weight: ${tokens['--_display-medium-weight']};
            line-height: ${tokens['--_display-medium-line-height']};
            letter-spacing: ${tokens['--_display-medium-tracking']};
        }

        :host(:not([emphasized])[variant="display-small"]) {
            font-family: ${tokens['--_display-small-font']};
            font-size: ${tokens['--_display-small-size']};
            font-weight: ${tokens['--_display-small-weight']};
            line-height: ${tokens['--_display-small-line-height']};
            letter-spacing: ${tokens['--_display-small-tracking']};
        }

        :host(:not([emphasized])[variant="headline-large"]) {
            font-family: ${tokens['--_headline-large-font']};
            font-size: ${tokens['--_headline-large-size']};
            font-weight: ${tokens['--_headline-large-weight']};
            line-height: ${tokens['--_headline-large-line-height']};
            letter-spacing: ${tokens['--_headline-large-tracking']};
        }

        :host(:not([emphasized])[variant="headline-medium"]) {
            font-family: ${tokens['--_headline-medium-font']};
            font-size: ${tokens['--_headline-medium-size']};
            font-weight: ${tokens['--_headline-medium-weight']};
            line-height: ${tokens['--_headline-medium-line-height']};
            letter-spacing: ${tokens['--_headline-medium-tracking']};
        }

        :host(:not([emphasized])[variant="headline-small"]) {
            font-family: ${tokens['--_headline-small-font']};
            font-size: ${tokens['--_headline-small-size']};
            font-weight: ${tokens['--_headline-small-weight']};
            line-height: ${tokens['--_headline-small-line-height']};
            letter-spacing: ${tokens['--_headline-small-tracking']};
        }

        :host(:not([emphasized])[variant="title-large"]) {
            font-family: ${tokens['--_title-large-font']};
            font-size: ${tokens['--_title-large-size']};
            font-weight: ${tokens['--_title-large-weight']};
            line-height: ${tokens['--_title-large-line-height']};
            letter-spacing: ${tokens['--_title-large-tracking']};
        }

        :host(:not([emphasized])[variant="title-medium"]) {
            font-family: ${tokens['--_title-medium-font']};
            font-size: ${tokens['--_title-medium-size']};
            font-weight: ${tokens['--_title-medium-weight']};
            line-height: ${tokens['--_title-medium-line-height']};
            letter-spacing: ${tokens['--_title-medium-tracking']};
        }

        :host(:not([emphasized])[variant="title-small"]) {
            font-family: ${tokens['--_title-small-font']};
            font-size: ${tokens['--_title-small-size']};
            font-weight: ${tokens['--_title-small-weight']};
            line-height: ${tokens['--_title-small-line-height']};
            letter-spacing: ${tokens['--_title-small-tracking']};
        }

        :host(:not([emphasized])[variant="label-large"]) {
            font-family: ${tokens['--_label-large-font']};
            font-size: ${tokens['--_label-large-size']};
            font-weight: ${tokens['--_label-large-weight']};
            line-height: ${tokens['--_label-large-line-height']};
            letter-spacing: ${tokens['--_label-large-tracking']};
        }

        :host(:not([emphasized])[variant="label-medium"]) {
            font-family: ${tokens['--_label-medium-font']};
            font-size: ${tokens['--_label-medium-size']};
            font-weight: ${tokens['--_label-medium-weight']};
            line-height: ${tokens['--_label-medium-line-height']};
            letter-spacing: ${tokens['--_label-medium-tracking']};
        }

        :host(:not([emphasized])[variant="label-small"]) {
            font-family: ${tokens['--_label-small-font']};
            font-size: ${tokens['--_label-small-size']};
            font-weight: ${tokens['--_label-small-weight']};
            line-height: ${tokens['--_label-small-line-height']};
            letter-spacing: ${tokens['--_label-small-tracking']};
        }

        :host(:not([emphasized])[variant="body-large"]) {
            font-family: ${tokens['--_body-large-font']};
            font-size: ${tokens['--_body-large-size']};
            font-weight: ${tokens['--_body-large-weight']};
            line-height: ${tokens['--_body-large-line-height']};
            letter-spacing: ${tokens['--_body-large-tracking']};
        }

        :host(:not([emphasized])[variant="body-medium"]) {
            font-family: ${tokens['--_body-medium-font']};
            font-size: ${tokens['--_body-medium-size']};
            font-weight: ${tokens['--_body-medium-weight']};
            line-height: ${tokens['--_body-medium-line-height']};
            letter-spacing: ${tokens['--_body-medium-tracking']};
        }

        :host(:not([emphasized])[variant="body-small"]) {
            font-family: ${tokens['--_body-small-font']};
            font-size: ${tokens['--_body-small-size']};
            font-weight: ${tokens['--_body-small-weight']};
            line-height: ${tokens['--_body-small-line-height']};
            letter-spacing: ${tokens['--_body-small-tracking']};
        }

        :host([emphasized][variant="display-large"]) {
            font-family: ${tokens['--_emphasized-display-large-font']};
            font-size: ${tokens['--_emphasized-display-large-size']};
            font-weight: ${tokens['--_emphasized-display-large-weight']};
            line-height: ${tokens['--_emphasized-display-large-line-height']};
            letter-spacing: ${tokens['--_emphasized-display-large-tracking']};
        }

        :host([emphasized][variant="display-medium"]) {
            font-family: ${tokens['--_emphasized-display-medium-font']};
            font-size: ${tokens['--_emphasized-display-medium-size']};
            font-weight: ${tokens['--_emphasized-display-medium-weight']};
            line-height: ${tokens['--_emphasized-display-medium-line-height']};
            letter-spacing: ${tokens['--_emphasized-display-medium-tracking']};
        }

        :host([emphasized][variant="display-small"]) {
            font-family: ${tokens['--_emphasized-display-small-font']};
            font-size: ${tokens['--_emphasized-display-small-size']};
            font-weight: ${tokens['--_emphasized-display-small-weight']};
            line-height: ${tokens['--_emphasized-display-small-line-height']};
            letter-spacing: ${tokens['--_emphasized-display-small-tracking']};
        }

        :host([emphasized][variant="headline-large"]) {
            font-family: ${tokens['--_emphasized-headline-large-font']};
            font-size: ${tokens['--_emphasized-headline-large-size']};
            font-weight: ${tokens['--_emphasized-headline-large-weight']};
            line-height: ${tokens['--_emphasized-headline-large-line-height']};
            letter-spacing: ${tokens['--_emphasized-headline-large-tracking']};
        }

        :host([emphasized][variant="headline-medium"]) {
            font-family: ${tokens['--_emphasized-headline-medium-font']};
            font-size: ${tokens['--_emphasized-headline-medium-size']};
            font-weight: ${tokens['--_emphasized-headline-medium-weight']};
            line-height: ${tokens['--_emphasized-headline-medium-line-height']};
            letter-spacing: ${tokens['--_emphasized-headline-medium-tracking']};
        }

        :host([emphasized][variant="headline-small"]) {
            font-family: ${tokens['--_emphasized-headline-small-font']};
            font-size: ${tokens['--_emphasized-headline-small-size']};
            font-weight: ${tokens['--_emphasized-headline-small-weight']};
            line-height: ${tokens['--_emphasized-headline-small-line-height']};
            letter-spacing: ${tokens['--_emphasized-headline-small-tracking']};
        }

        :host([emphasized][variant="title-large"]) {
            font-family: ${tokens['--_emphasized-title-large-font']};
            font-size: ${tokens['--_emphasized-title-large-size']};
            font-weight: ${tokens['--_emphasized-title-large-weight']};
            line-height: ${tokens['--_emphasized-title-large-line-height']};
            letter-spacing: ${tokens['--_emphasized-title-large-tracking']};
        }

        :host([emphasized][variant="title-medium"]) {
            font-family: ${tokens['--_emphasized-title-medium-font']};
            font-size: ${tokens['--_emphasized-title-medium-size']};
            font-weight: ${tokens['--_emphasized-title-medium-weight']};
            line-height: ${tokens['--_emphasized-title-medium-line-height']};
            letter-spacing: ${tokens['--_emphasized-title-medium-tracking']};
        }

        :host([emphasized][variant="title-small"]) {
            font-family: ${tokens['--_emphasized-title-small-font']};
            font-size: ${tokens['--_emphasized-title-small-size']};
            font-weight: ${tokens['--_emphasized-title-small-weight']};
            line-height: ${tokens['--_emphasized-title-small-line-height']};
            letter-spacing: ${tokens['--_emphasized-title-small-tracking']};
        }

        :host([emphasized][variant="label-large"]) {
            font-family: ${tokens['--_emphasized-label-large-font']};
            font-size: ${tokens['--_emphasized-label-large-size']};
            font-weight: ${tokens['--_emphasized-label-large-weight']};
            line-height: ${tokens['--_emphasized-label-large-line-height']};
            letter-spacing: ${tokens['--_emphasized-label-large-tracking']};
        }

        :host([emphasized][variant="label-medium"]) {
            font-family: ${tokens['--_emphasized-label-medium-font']};
            font-size: ${tokens['--_emphasized-label-medium-size']};
            font-weight: ${tokens['--_emphasized-label-medium-weight']};
            line-height: ${tokens['--_emphasized-label-medium-line-height']};
            letter-spacing: ${tokens['--_emphasized-label-medium-tracking']};
        }

        :host([emphasized][variant="label-small"]) {
            font-family: ${tokens['--_emphasized-label-small-font']};
            font-size: ${tokens['--_emphasized-label-small-size']};
            font-weight: ${tokens['--_emphasized-label-small-weight']};
            line-height: ${tokens['--_emphasized-label-small-line-height']};
            letter-spacing: ${tokens['--_emphasized-label-small-tracking']};
        }

        :host([emphasized][variant="body-large"]) {
            font-family: ${tokens['--_emphasized-body-large-font']};
            font-size: ${tokens['--_emphasized-body-large-size']};
            font-weight: ${tokens['--_emphasized-body-large-weight']};
            line-height: ${tokens['--_emphasized-body-large-line-height']};
            letter-spacing: ${tokens['--_emphasized-body-large-tracking']};
        }

        :host([emphasized][variant="body-medium"]) {
            font-family: ${tokens['--_emphasized-body-medium-font']};
            font-size: ${tokens['--_emphasized-body-medium-size']};
            font-weight: ${tokens['--_emphasized-body-medium-weight']};
            line-height: ${tokens['--_emphasized-body-medium-line-height']};
            letter-spacing: ${tokens['--_emphasized-body-medium-tracking']};
        }

        :host([emphasized][variant="body-small"]) {
            font-family: ${tokens['--_emphasized-body-small-font']};
            font-size: ${tokens['--_emphasized-body-small-size']};
            font-weight: ${tokens['--_emphasized-body-small-weight']};
            line-height: ${tokens['--_emphasized-body-small-line-height']};
            letter-spacing: ${tokens['--_emphasized-body-small-tracking']};
        }
    }
`
