/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { IPaneExpansionFlingInput, IPaneExpansionFlingResult, IPaneExpansionSpring } from '../pane-scaffold.interface'
import type { PaneFlingDecay } from './pane-fling-decay'

const formatTracks = (tracks: readonly number[]) => tracks.map(track => `${track}px`).join(' ')

export const resolveCustomFlingTrajectory = (release: IPaneExpansionFlingInput, fling: IPaneExpansionFlingResult): PaneFlingDecay | undefined => {
    const trajectory = fling.trajectory
    if (!trajectory) return
    const { duration, positionAt } = trajectory
    if (!Number.isFinite(duration) || duration <= 0 || typeof positionAt !== 'function') {
        throw new Error('Pane expansion trajectory requires a positive finite duration and a position function')
    }
    const clamp = (position: number) => Math.min(release.maxPosition, Math.max(release.minPosition, position))
    return {
        duration,
        position: clamp(fling.position),
        velocity: fling.velocity,
        positionAt: milliseconds => {
            if (milliseconds === 0) return release.startPosition
            const position = positionAt(milliseconds)
            if (!Number.isFinite(position)) throw new Error('Pane expansion trajectory positions must be finite')
            return clamp(position)
        },
    }
}

export const resolveExpansionSpring = ({ dampingRatio = 0.8, stiffness = 380 }: IPaneExpansionSpring) => {
    if (![dampingRatio, stiffness].every(value => Number.isFinite(value) && value > 0)) {
        throw new Error('Pane expansion spring requires positive finite damping and stiffness')
    }
    return { dampingRatio, stiffness }
}

export const springDisplacementAt = (displacement: number, velocity: number, spring: Required<IPaneExpansionSpring>) => {
    const frequency = Math.sqrt(spring.stiffness)
    const decay = spring.dampingRatio * frequency
    const adjustedVelocity = velocity + decay * displacement
    if (Math.abs(spring.dampingRatio - 1) < 0.0001) {
        return (seconds: number) => Math.exp(-decay * seconds) * (displacement + adjustedVelocity * seconds)
    }
    if (spring.dampingRatio < 1) {
        const oscillation = Math.sqrt(spring.stiffness - decay ** 2)
        return (seconds: number) => Math.exp(-decay * seconds) * (
            displacement * Math.cos(oscillation * seconds) + adjustedVelocity / oscillation * Math.sin(oscillation * seconds)
        )
    }
    const separation = frequency * Math.sqrt(spring.dampingRatio ** 2 - 1)
    const fast = -decay - separation
    const slow = spring.stiffness / fast
    const coefficient = (velocity - fast * displacement) / (slow - fast)
    return (seconds: number) => coefficient * Math.exp(slow * seconds) + (displacement - coefficient) * Math.exp(fast * seconds)
}

export const expandWithSpring = (velocity: number, spring: Required<IPaneExpansionSpring>) =>
    (from: readonly number[], to: readonly number[]) => {
        const width = to.reduce((sum, track) => sum + track, 0)
        const displacement = from[0] - to[0]
        const firstAt = springDisplacementAt(displacement, velocity, spring)
        const gapAt = springDisplacementAt(from[1] - to[1], 0, spring)
        const frames: Keyframe[] = [{ gridTemplateColumns: formatTracks(from) }]
        let stable = 0
        for (let frame = 1; frame < 180; frame++) {
            const seconds = frame / 60
            const first = firstAt(seconds)
            const gap = gapAt(seconds)
            const speed = Math.abs(first - firstAt(seconds - 1 / 60)) * 60
            stable = Math.abs(first) <= 1 && Math.abs(gap) <= 1 && speed <= 5 ? stable + 1 : 0
            if (stable === 3) break
            const spacer = Math.min(Math.max(from[1], to[1]), Math.max(0, to[1] + gap))
            const left = Math.min(width - spacer, Math.max(0, to[0] + first))
            frames.push({ gridTemplateColumns: formatTracks([left, spacer, width - left - spacer]) })
        }
        frames.push({ gridTemplateColumns: formatTracks(to) })
        return { frames, duration: (frames.length - 1) * 1000 / 60 }
    }

export const expandWithDecayAndSpring = (velocity: number, spring: Required<IPaneExpansionSpring>, decay?: PaneFlingDecay) =>
    (from: readonly number[], to: readonly number[]) => {
        const springFrames = expandWithSpring(velocity, spring)
        if (!decay || decay.duration <= 0) return springFrames(from, to)
        const [first, gap, second] = from
        const available = first + second
        const settling = springFrames([decay.position, gap, available - decay.position], to)
        const duration = decay.duration + settling.duration
        const count = Math.min(180, Math.max(1, Math.ceil(decay.duration / (1000 / 60))))
        const frames: Keyframe[] = Array.from({ length: count }, (_, index) => {
            const time = index / count * decay.duration
            const position = decay.positionAt(time)
            return { gridTemplateColumns: formatTracks([position, gap, available - position]), offset: time / duration }
        })
        return {
            duration,
            frames: [...frames, ...settling.frames.map((frame, index) => ({
                ...frame, offset: (decay.duration + index / (settling.frames.length - 1) * settling.duration) / duration,
            }))],
        }
    }
