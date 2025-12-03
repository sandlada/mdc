/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { MaterialDesignSystem } from '../../utils'

export type TNavigationDrawerAnimationArgs = Parameters<Element['animate']>

export interface INavigationAnimation {
    dialog?: Array<TNavigationDrawerAnimationArgs>
    scrim?: Array<TNavigationDrawerAnimationArgs>
    container?: Array<TNavigationDrawerAnimationArgs>
    headline?: Array<TNavigationDrawerAnimationArgs>
    // content?: Array<TNavigationDrawerAnimationArgs>
    // actions?: Array<TNavigationDrawerAnimationArgs>
}

export const NavigationDrawerDefaultOpenAnimation: INavigationAnimation = {
    dialog: [
        [
            [{ 'transform': 'translateX(-100%)' }, { 'transform': 'translateX(0)' }],
            { duration: 500, easing: MaterialDesignSystem.Motion.Easing.Emphasized },
        ]
    ],
    scrim: [
        [
            // Scrim fade in
            [{ 'opacity': 0 }, { 'opacity': 0.32 }],
            { duration: 500, easing: 'linear' },
        ],
    ],
    container: [
        [
            // Container fade in
            [{ 'opacity': 0 }, { 'opacity': 1 }],
            { duration: 50, easing: 'linear', pseudoElement: '::before' },
        ],
        [
            // Container grow
            // Note: current spec says to grow from 0dp->100% and shrink from
            // 100%->35%. We change this to 35%->100% to simplify the animation that
            // is supposed to clip content as it grows. From 0dp it's possible to see
            // text/actions appear before the container has fully grown.
            [{ 'width': '35%' }, { 'width': '100%' }],
            { duration: 500, easing: MaterialDesignSystem.Motion.Easing.Emphasized, pseudoElement: '::before' },
        ],
    ],
    headline: [
        [
            // Headline fade in
            [{ 'opacity': 0 }, { 'opacity': 0, offset: 0.2 }, { 'opacity': 1 }],
            { duration: 250, easing: 'linear', fill: 'forwards' },
        ],
    ],
} as const

export const NavigationDrawerDefaultCloseAnimation: INavigationAnimation = {
    dialog: [
        [
            // Dialog slide up
            [{ 'transform': 'translateX(0)' }, { 'transform': 'translateX(-100%)' }],
            { duration: 150, easing: MaterialDesignSystem.Motion.Easing.EmphasizedAccelerate },
        ],
    ],
    scrim: [
        [
            // Scrim fade out
            [{ 'opacity': 0.32 }, { 'opacity': 0 }],
            { duration: 150, easing: 'linear' },
        ],
    ],
    container: [
        [
            // Container shrink
            [{ 'height': '100%' }, { 'height': '35%' }],
            {
                duration: 150,
                easing: MaterialDesignSystem.Motion.Easing.EmphasizedAccelerate,
                pseudoElement: '::before',
            },
        ],
        [
            // Container fade out
            [{ 'opacity': '1' }, { 'opacity': '0' }],
            { delay: 100, duration: 50, easing: 'linear', pseudoElement: '::before' },
        ],
    ],
    headline: [
        [
            // Headline fade out
            [{ 'opacity': 1 }, { 'opacity': 0 }],
            { duration: 100, easing: 'linear', fill: 'forwards' },
        ],
    ],
    // content: [
    //     [
    //         // Content fade out
    //         [{ 'opacity': 1 }, { 'opacity': 0 }],
    //         { duration: 100, easing: 'linear', fill: 'forwards' },
    //     ],
    // ],
    // actions: [
    //     [
    //         // Actions fade out
    //         [{ 'opacity': 1 }, { 'opacity': 0 }],
    //         { duration: 100, easing: 'linear', fill: 'forwards' },
    //     ],
    // ],
} as const
