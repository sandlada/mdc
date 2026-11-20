/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { createContext } from '@lit/context'
import type { SkeletonAnimation, SkeletonSize } from '../skeleton.interface'

export interface ISkeletonGroupContext {
    readonly loading: boolean
    readonly animation: SkeletonAnimation
    readonly size: SkeletonSize
    readonly inGroup: true
}

export const SkeletonContext = createContext<ISkeletonGroupContext | undefined>(
    Symbol('mdc-skeleton-context')
)
