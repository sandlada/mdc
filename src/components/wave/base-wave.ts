/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { LitElement } from 'lit'
import { property } from 'lit/decorators.js'

export class BaseWave extends LitElement {

    @property({ type: Number })
    public wavelength: number = 12

    @property({ type: Number, attribute: 'wave-amplitude' })
    public waveAmplitude: number = 4

    @property({ type: Number })
    public height: number = 4

}
