/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, html } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { BaseWave } from './base-wave'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-circular": CircularWave
    }
}

@customElement('mdc-circular-wave')
export class CircularWave extends BaseWave {
    /**
     * The base radius of the circle around which the wave oscillates.
     */
    @property({ type: Number })
    public radius: number = 80;

    /**
     * The number of waves (crests) around the circle's circumference.
     */
    @property({ type: Number, attribute: 'wave-count' })
    public waveCount: number = 20;

    /**
     * Animation speed.
     */
    @property({ type: Number })
    public speed: number = 0.05;

    /**
     * The current phase shift of the wave.
     */
    @property({ type: Number })
    public phase: number = 0;

    @query('canvas')
    private _canvas!: HTMLCanvasElement
    private _ctx!: CanvasRenderingContext2D
    private _resizeObserver!: ResizeObserver
    private _animationFrameId: number = 0;

    override connectedCallback() {
        super.connectedCallback()
        this._animate()
        this._resizeObserver = new ResizeObserver(() => this.requestUpdate())
        this._resizeObserver.observe(this)
    }

    override disconnectedCallback() {
        super.disconnectedCallback()
        if (this._animationFrameId) cancelAnimationFrame(this._animationFrameId)
        if (this._resizeObserver) this._resizeObserver.disconnect()
    }

    protected override updated(changedProperties: Map<string, unknown>): void {
        super.updated(changedProperties)
        this._drawWave()
    }

    private _drawWave() {
        if (!this._canvas) return
        if (!this._ctx) {
            const context = this._canvas.getContext('2d')
            if (!context) return
            this._ctx = context
        }

        const dpr = window.devicePixelRatio || 1
        const rect = this.getBoundingClientRect()
        this._canvas.width = rect.width * dpr
        this._canvas.height = rect.height * dpr
        this._ctx.scale(dpr, dpr)

        const { width, height: canvasHeight } = rect
        this._ctx.clearRect(0, 0, width, canvasHeight)

        this._ctx.lineWidth = this.height
        this._ctx.strokeStyle = getComputedStyle(this).getPropertyValue('color') || 'purple'
        this._ctx.lineCap = 'round'
        this._ctx.lineJoin = 'round'

        if (this.waveAmplitude === 0 || this.waveCount === 0) {
            this._drawPerfectCircle(width / 2, canvasHeight / 2)
            return
        }

        this._ctx.beginPath()

        const centerX = width / 2
        const centerY = canvasHeight / 2
        const segments = 360

        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * 2 * Math.PI

            const waveAngle = angle * this.waveCount + this.phase
            const currentRadius = this.radius + this.waveAmplitude * Math.sin(waveAngle)

            const x = centerX + currentRadius * Math.cos(angle)
            const y = centerY + currentRadius * Math.sin(angle)

            if (i === 0) {
                this._ctx.moveTo(x, y)
            } else {
                this._ctx.lineTo(x, y)
            }
        }

        this._ctx.closePath()
        this._ctx.stroke()
    }

    private _drawPerfectCircle(centerX: number, centerY: number) {
        this._ctx.beginPath()
        this._ctx.arc(centerX, centerY, this.radius, 0, 2 * Math.PI)
        this._ctx.stroke()
    }

    private _animate() {
        if (this.speed !== 0 && this.isConnected) {
            this.phase += this.speed
            this.requestUpdate()
            this._animationFrameId = requestAnimationFrame(() => this._animate())
        } else {
            this._animationFrameId = 0
        }
    }

    static override styles = css`
        :host {
            display: inline-block;
            width: 250px;
            aspect-ratio: 1 / 1;
            color: var(--mdc-circular-wave-color, var(--mdc-wave-color, var(--md-sys-color-primary, var(--md-sys-palette-primary-40, #6750a4))));
        }
        canvas {
            display: block;
            width: 100%;
            height: 100%;
        }
    `;

    override render() {
        return html`<canvas></canvas>`
    }
}
