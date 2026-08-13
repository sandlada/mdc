/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */
import { html, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, query } from 'lit/decorators.js'
import { BaseProgressIndicator } from './base-progress-indicator'
import { linearProgressIndicatorStyle } from './progress-indicator.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-linear-progress-indicator": LinearProgressIndicator
    }
}

/**
 * A progress component.
 *
 * @todo
 * - wavy
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/progress-indicators/specs
 */
@customElement('mdc-linear-progress-indicator')
export class LinearProgressIndicator extends BaseProgressIndicator {

    static override styles = linearProgressIndicatorStyle

    @query('.inactive-track.left')
    private inactiveLeftTrack!: HTMLElement
    @query('.inactive-track.right')
    private inactiveRightTrack!: HTMLElement
    @query('.active-track')
    private activeTrack!: HTMLElement

    protected override renderIndicator(): TemplateResult {
        return html`
            <span aria-hidden="true" class="stop-indicators"></span>
            ${this.wavy ? this.renderWavy() : this.renderLine()}
        `
    }

    protected override renderWavy(): TemplateResult {
        return html`
            <div class="tracks">
                <span aria-hidden="true" class="inactive-track left"></span>
                ${this.renderWaveLine('active-track')}
                <span aria-hidden="true" class="inactive-track right"></span>
            </div>
        `
    }

    protected renderWaveLine(classes: string = '') {
        const { pathData, svgHeight, svgViewBox, svgWidth, strokeWidth } = this.updateWave()
        return html`
            <svg class="wave ${classes}" height="${svgHeight}px" width="${svgWidth}px" view-box=${svgViewBox} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <g class="bar-inner">
                    <path d=${pathData} stroke-width="${strokeWidth}px"></path>
                </g>
            </svg>
        `
    }

    protected override renderLine(): TemplateResult {
        return html`
            <div class="tracks">
                <span aria-hidden="true" class="active-track"></span>
                <span aria-hidden="true" class="inactive-track"></span>
            </div>
            <div class="indeteminate-bar">
                <div class="bar primary-bar">
                    <div class="bar-inner"></div>
                </div>
                <div class="bar secondary-bar">
                    <div class="bar-inner"></div>
                </div>
            </div>
        `
    }

    private generateSmoothWavePath(wavelength, totalHeight, amplitude, segments) {
            const centerY = totalHeight / 2;
            // M = MoveTo (绝对坐标)
            let d = `M 0 ${centerY}`;

            for (let i = 0; i < segments; i++) {
                const xBase = i * wavelength;
                // 从中心线到下一个中心线，以波峰为控制点（上半部分）
                d += ` Q ${xBase + wavelength / 4},${centerY - amplitude} ${xBase + wavelength / 2},${centerY}`;
                // 从中心线到下一个中心线，以波谷为控制点（下半部分）
                d += ` Q ${xBase + wavelength * 3 / 4},${centerY + amplitude} ${xBase + wavelength},${centerY}`;
            }
            return d;
    }

    private updateWave() {
        const wavelength = 32 || parseFloat(getComputedStyle(this).getPropertyValue('--_wave-wavelength'))
        const amplitude = 8 || parseFloat(getComputedStyle(this).getPropertyValue('--_wave-amplitude'))
        const thickness = 4 || parseFloat(getComputedStyle(this).getPropertyValue('--_active-indicator-thickness'))

        const totalHeight = (amplitude * 2) + thickness

        const progressWidth = this.clientWidth;
        // this.waveWrapperElement.style.setProperty('height', `${totalHeight}px`)
        // this.svgElement.forEach(svg => svg.setAttribute('width', progressWidth.toString()))
        // this.svgElement.forEach(svg => svg.setAttribute('height', totalHeight.toString()))
        // this.svgElement.forEach(svg => svg.setAttribute('viewBox', `0 0 ${progressWidth} ${totalHeight}`))

        // this.waveGroupElement.forEach(wave => wave.innerHTML = '')

        // 计算需要多少个波浪段来填充屏幕并提供动画缓冲
        const segments = Math.ceil(progressWidth / wavelength) + 2
        const pathData = this.generateSmoothWavePath(wavelength, totalHeight, amplitude, segments)

        const wavePath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        // wavePath.setAttribute('d', pathData)
        // wavePath.setAttribute('class', 'wave')
        // wavePath.style.strokeWidth = `${thickness}px`
        // this.waveGroupElement.forEach(waveG => waveG.appendChild(wavePath))

        return ({
            pathData,
            svgWidth: progressWidth,
            svgHeight: totalHeight,
            svgViewBox: `0 0 ${progressWidth} ${totalHeight}`,
            strokeWidth: thickness,
        })

        // 动画需要移动一个完整波长的距离来无缝循环
        // const animationDistance = wavelength;
        // const animationDuration = wavelength / 30;
        // this.waveGroupElement.style.setProperty('--wave-animation-distance', `-${animationDistance}px`);
        // this.waveGroupElement.style.animation = `wave-animation ${animationDuration}s linear infinite`;
    }

    private animations: Animation[] = [];
    /**
     *
     * value >= 90%
     * /``\__/``\ -> ------
     *
     */
    private animateProgress() {
        const needFlatLine = this.value >= 0.9

        const clippath = {
            inactiveStart: '',
            active: '',
            inactiveEnd: '',
        }

        // 清理旧动画
        this.animations.forEach(anim => anim.cancel());

        const GAP_PERCENTAGE = 2; // 活动轨道与非活动轨道之间的间隙，占总宽度的百分比

    const activeTrackKeyframes = [
        // 阶段 1: 长条动画
        { clipPath: 'inset(0 100% 0 0)', offset: 0 },
        { clipPath: 'inset(0 60% 0 0)', offset: 0.15 },
        { clipPath: 'inset(0 0 0 60%)', offset: 0.3 },
        { clipPath: 'inset(0 0 0 100%)', offset: 0.4 },
        // 阶段 2: 短条动画
        { clipPath: 'inset(0 0 0 100%)', offset: 0.5799 },
        { clipPath: 'inset(0 100% 0 0)', offset: 0.58 },
        { clipPath: 'inset(0 70% 0 0)', offset: 0.73 },
        { clipPath: 'inset(0 0 0 70%)', offset: 0.9 },
        // 【修正】在循环结束前完成动画
        { clipPath: 'inset(0 0 0 100%)', offset: 0.999 },
        // 【修正】在循环的最后一刻，立即重置到初始状态
        { clipPath: 'inset(0 100% 0 0)', offset: 1.0 },
    ];

const trackCornerRadiusVar = '999px';

// -- Keyframes for Inactive Left Track (converted to inset) --
const inactiveLeftKeyframes = [
    // 阶段 1
    { clipPath: `inset(0 100% 0 0 round ${trackCornerRadiusVar})`, offset: 0 },
    { clipPath: `inset(0 100% 0 0 round ${trackCornerRadiusVar})`, offset: 0.15 },
    { clipPath: `inset(0 ${100 - (60 - GAP_PERCENTAGE)}% 0 0 round ${trackCornerRadiusVar})`, offset: 0.3 }, // 相当于 inset(0 40% + GAP ... )
    { clipPath: `inset(0 0% 0 0 round ${trackCornerRadiusVar})`, offset: 0.4 }, // 相当于 inset(0 GAP ... )
    // 阶段 2
    { clipPath: `inset(0 0% 0 0 round ${trackCornerRadiusVar})`, offset: 0.5799 },
    { clipPath: `inset(0 100% 0 0 round ${trackCornerRadiusVar})`, offset: 0.58 },
    { clipPath: `inset(0 100% 0 0 round ${trackCornerRadiusVar})`, offset: 0.73 },
    { clipPath: `inset(0 ${100 - (70 - GAP_PERCENTAGE)}% 0 0 round ${trackCornerRadiusVar})`, offset: 0.9 }, // 相当于 inset(0 30% + GAP ... )
    { clipPath: `inset(0 0% 0 0 round ${trackCornerRadiusVar})`, offset: 0.999 },
    { clipPath: `inset(0 100% 0 0 round ${trackCornerRadiusVar})`, offset: 1.0 },
];

// -- Keyframes for Inactive Right Track (converted to inset) --
const inactiveRightKeyframes = [
    // 阶段 1
    { clipPath: `inset(0 0 0 ${0 + GAP_PERCENTAGE}% round ${trackCornerRadiusVar})`, offset: 0 },
    { clipPath: `inset(0 0 0 ${40 + GAP_PERCENTAGE}% round ${trackCornerRadiusVar})`, offset: 0.15 },
    { clipPath: `inset(0 0 0 100% round ${trackCornerRadiusVar})`, offset: 0.3 },
    { clipPath: `inset(0 0 0 100% round ${trackCornerRadiusVar})`, offset: 0.4 },
    // 阶段 2
    { clipPath: `inset(0 0 0 100% round ${trackCornerRadiusVar})`, offset: 0.5799 },
    { clipPath: `inset(0 0 0 ${0 + GAP_PERCENTAGE}% round ${trackCornerRadiusVar})`, offset: 0.58 },
    { clipPath: `inset(0 0 0 ${30 + GAP_PERCENTAGE}% round ${trackCornerRadiusVar})`, offset: 0.73 },
    { clipPath: `inset(0 0 0 100% round ${trackCornerRadiusVar})`, offset: 0.9 },
    { clipPath: `inset(0 0 0 100% round ${trackCornerRadiusVar})`, offset: 0.999 },
    { clipPath: `inset(0 0 0 0% round ${trackCornerRadiusVar})`, offset: 1.0 },
];
        const animationOptions: KeyframeAnimationOptions = {
            duration: 1500,
            easing: 'linear',
            iterations: Infinity,
        };

        // 创建并存储所有动画
        this.animations = [
            this.activeTrack.animate(activeTrackKeyframes, animationOptions),
            this.inactiveLeftTrack.animate(inactiveLeftKeyframes, animationOptions),
            this.inactiveRightTrack.animate(inactiveRightKeyframes, animationOptions),
        ];
    }


    private getActiveWidthFrom() {

    }

    protected override firstUpdated(_changedProperties: PropertyValues): void {
        super.firstUpdated(_changedProperties)

        this.animateProgress()
    }
}
