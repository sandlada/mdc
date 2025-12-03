// @ts-nocheck

import { defineComponent, nextTick, onMounted, ref, type SlotsType } from 'vue'
import { componentNamePrefix } from '../../../internals/component-name-prefix/component-name-prefix'
import { isServer } from '../../../utils'


// 定义常量，使用对象组织，方便传递
const Constants = {
    NUM_POINTS: 8, // 多边形的外凸点数 (类似齿轮或花瓣的数量)
    OUTER_RADIUS: 75, // 外半径
    INNER_RADIUS: 100,  // 内半径，决定了中心区域的凹陷程度和圆角的饱满度
    ROTATION_SPEED: 0.005, // 旋转速度 (弧度每帧)
    SHAPE_COLOR: '#4CAF50', // 绿色
}

// --- 状态管理 ---

// 创建初始状态
const createInitialState = (canvasWidth, canvasHeight) => ({
    x: canvasWidth / 2, // 形状中心X坐标
    y: canvasHeight / 2, // 形状中心Y坐标
    angle: 0 // 当前旋转角度 (弧度)
})

// 更新状态，返回新的状态对象
const updateState = (currentState, constants) => ({
    ...currentState, // 复制当前状态的所有属性
    angle: currentState.angle + constants.ROTATION_SPEED // 更新角度
})

// --- 绘制函数 ---

// 绘制带圆角的星形/多边形
// 使用 quadraticCurveTo 方法，它接收两个控制点和终点，可以创建平滑曲线
const drawRoundedStar = (ctx, centerX, centerY, outerRadius, innerRadius, numPoints, color) => {
    ctx.beginPath()

    const angleStep = (Math.PI * 2) / (numPoints * 2) // 每个顶点之间的角度步长
    let currentAngle = -Math.PI / 2 // 从顶部开始绘制 (可选，决定初始朝向)

    // 计算所有理论顶点 (交替使用外半径和内半径)
    const vertices = []
    for (let i = 0; i < numPoints * 2; i++) {
        const radius = (i % 2 === 0) ? outerRadius : innerRadius // 偶数点用外半径，奇数点用内半径
        const x = radius * Math.cos(currentAngle)
        const y = radius * Math.sin(currentAngle)
        vertices.push({ x, y })
        currentAngle += angleStep
    }

    // 计算相邻顶点之间的中点，这些将是 quadraticCurveTo 的锚点 (终点)
    const midpoints = []
    for (let i = 0; i < numPoints * 2; i++) {
        const v1 = vertices[i]
        const v2 = vertices[(i + 1) % (numPoints * 2)] // 最后一个点连接回第一个点
        midpoints.push({ x: (v1.x + v2.x) / 2, y: (v1.y + v2.y) / 2 })
    }

    // 绘制路径
    // 从最后一个中点开始移动 (或任意一个中点)
    ctx.moveTo(midpoints[midpoints.length - 1].x, midpoints[midpoints.length - 1].y)

    // 循环遍历所有顶点，使用 quadraticCurveTo 从当前点画到下一个中点，以当前顶点为控制点
    for (let i = 0; i < numPoints * 2; i++) {
        // 从当前位置画一条平滑曲线到 midpoints[i]，使用 vertices[i] 作为控制点
        ctx.quadraticCurveTo(vertices[i].x, vertices[i].y, midpoints[i].x, midpoints[i].y)
    }

    ctx.closePath() // 关闭路径
    ctx.fillStyle = color
    ctx.fill() // 填充颜色
}

// 绘制整个场景 (清除画布并绘制所有元素)
const drawScene = (ctx, state, constants) => {
    // 清除整个画布
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // 保存当前的Canvas状态 (转换矩阵、颜色、样式等)
    ctx.save()

    // 将Canvas的原点移动到形状的中心
    ctx.translate(state.x, state.y)
    // 围绕新的原点旋转Canvas
    ctx.rotate(state.angle)

    // 在已经平移和旋转的Canvas上绘制形状
    // 形状的绘制坐标现在是相对于其中心 (0,0)
    drawRoundedStar(ctx, 0, 0, constants.OUTER_RADIUS, constants.INNER_RADIUS, constants.NUM_POINTS, constants.SHAPE_COLOR)
    // 恢复之前保存的Canvas状态
    ctx.restore()

    // 如果有其他不随形状旋转的元素，可以在这里绘制 (在 restore() 之后)
}


// --- 动画循环 ---

// 主动画函数
const animate = (ctx, currentState) => {
    // 1. 更新状态
    const newState = updateState(currentState, Constants)

    // 2. 绘制场景 (基于新状态)
    drawScene(ctx, newState, Constants)

    // 3. 请求下一帧动画
    // 使用箭头函数保持 currentState 的上下文
    requestAnimationFrame(() => animate(ctx, newState))
}


export const Loading = defineComponent({
    name: `${componentNamePrefix}-loading`,
    emits: [],
    slots: {} as SlotsType<{}>,
    props: {},
    setup(props, { }) {
        const root = ref<HTMLCanvasElement | null>(null)
        const ctx = ref<CanvasRenderingContext2D | null | undefined>(null)

        onMounted(() => {
            if (isServer()) {
                return
            }

            ctx.value = root.value?.getContext("2d")

            if (!ctx.value) {
                return
            }

            nextTick(() => {

                if (!ctx.value || !root.value) {
                    return
                }

                // 创建初始状态
                const initialState = createInitialState(root.value.width, root.value.height)

                // 启动动画循环
                animate(ctx.value, initialState)
            })

        })

        return () => {

            return (
                <canvas ref={root} width={200} height={200}></canvas>
            )
        }
    },
})
