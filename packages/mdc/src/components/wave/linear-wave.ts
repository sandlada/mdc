import { css, html } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { BaseWave } from './base-wave'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-linear-wave": LinearWave
    }
}

const SMOOTHING_FACTOR = 0.38;

@customElement('mdc-linear-wave')
export class LinearWave extends BaseWave {

    /**
     * The thickness of the wave line.
     */
    @property({ type: Number })
    public override height: number = 8;

    @property({ type: Number })
    public speed: number = 0.1;

    @property({ type: Number })
    public phase: number = 0;

    @query('canvas')
    private _canvas!: HTMLCanvasElement;

    private _ctx!: CanvasRenderingContext2D;
    private _resizeObserver!: ResizeObserver;
    private _animationFrameId: number = 0;


    override connectedCallback() {
        super.connectedCallback();
        this._animate();
        this._resizeObserver = new ResizeObserver(() => this.requestUpdate());
        this._resizeObserver.observe(this);
    }

    override disconnectedCallback() {
        super.disconnectedCallback();
        if (this._animationFrameId) cancelAnimationFrame(this._animationFrameId);
        if (this._resizeObserver) this._resizeObserver.disconnect();
    }

    protected override updated(changedProperties: Map<string, unknown>): void {
        super.updated(changedProperties);
        this._drawWave();
    }


    private _drawWave() {
        if (!this._canvas) return;


        if (!this._ctx) {
            const context = this._canvas.getContext('2d');
            if (!context) return;
            this._ctx = context;
        }


        const dpr = window.devicePixelRatio || 1;
        const rect = this.getBoundingClientRect();
        this._canvas.width = rect.width * dpr;
        this._canvas.height = rect.height * dpr;
        this._ctx.scale(dpr, dpr);

        const { width, height: canvasHeight } = rect;
        this._ctx.clearRect(0, 0, width, canvasHeight);


        this._ctx.lineWidth = this.height;
        this._ctx.strokeStyle = getComputedStyle(this).getPropertyValue('color') || 'purple';
        this._ctx.lineCap = 'round';
        this._ctx.lineJoin = 'round';


        if (this.waveAmplitude === 0 || this.wavelength === 0) {
            this._ctx.beginPath();
            const y = canvasHeight / 2;
            this._ctx.moveTo(0, y);
            this._ctx.lineTo(width, y);
            this._ctx.stroke();
            return;
        }


        this._ctx.beginPath();

        const amplitude = this.waveAmplitude;
        const lambda = this.wavelength;
        const halfLambda = lambda / 2;
        const controlPointOffset = halfLambda * SMOOTHING_FACTOR;


        const yCenter = canvasHeight / 2;

        const phaseOffset = (this.phase / (2 * Math.PI)) * lambda;
        let currentX = -halfLambda - (phaseOffset % lambda);


        const initialAngle = (currentX / lambda) * 2 * Math.PI;
        let currentY = yCenter - amplitude * Math.cos(initialAngle);

        this._ctx.moveTo(currentX, currentY);

        let isCrest = true;
        while (currentX < width) {
            const nextX = currentX + halfLambda;

            const nextY = yCenter + (isCrest ? amplitude : -amplitude);

            const cp1x = currentX + controlPointOffset;
            const cp1y = currentY;
            const cp2x = nextX - controlPointOffset;
            const cp2y = nextY;

            this._ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, nextX, nextY);

            currentX = nextX;
            currentY = nextY;
            isCrest = !isCrest;
        }

        this._ctx.stroke();
    }

    private _animate() {
        if (this.speed !== 0 && this.isConnected) {
            this.phase += this.speed / 10;
            this.requestUpdate();
            this._animationFrameId = requestAnimationFrame(() => this._animate());
        } else {
            this._animationFrameId = 0;
        }
    }

    static override styles = css`
        :host {
            display: block;
            width: 100%;
            height: fit-content;
            min-height: 50px;
            color: var(--mdc-linear-wave-color, var(--mdc-wave-color, var(--md-sys-color-primary, var(--md-sys-palette-primary-40, #6750a4))));

        }
        canvas {
            display: block;
            /* width: 100%; */
            height: auto;
        }
    `;

    override render() {
        return html`<canvas></canvas>`;
    }
}
