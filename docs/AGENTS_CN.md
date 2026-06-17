# AGENTS_CN.md

## 项目概述

MRReP Web 是一个基于浏览器的 3D 交互界面，用于在机器人导航地图上编辑手绘禁区（HRZ）和参考路径（HRP）。通过 rosbridge 连接 ROS1。

本项目是以下两篇论文的 Web 版复现：
- **MRHaD** (Kosaka 等, arXiv:2504.00580, 2025) — HRZ 多边形禁区编辑与 costmap 集成
- **MRReP** (Kosaka 等, arXiv:2604.00059, 2025) — HRP 手绘参考路径编辑与全局规划器集成

## 架构

### 坐标系

所有 Store 存储**场景坐标**（3D 场景的 x, z）。发布给 ROS 前通过 `src/utils/coordinate.ts` 中的 `sceneToRos()` 转换。渲染时无需转换。

### 3D 交互

使用 Canvas 原生 pointer 事件 + 手动 raycasting 到 y=0 地面平面。不使用 R3F mesh 事件（会被 3D 物体阻挡）。`Scene3D.tsx` 中的 `useGroundRaycast()` hook 是点击→世界坐标映射的唯一入口。

### 视角控制

所有模式共享同一按键映射：**右键旋转、中键平移、滚轮缩放**。左键始终留给业务逻辑（绘制）。通过 OrbitControls 的 `mouseButtons` 属性配置。

### HRZ 多边形渲染

`ShapeGeometry` 位于 X-Y 平面，mesh 绕 X 轴旋转 -90°。这意味着 Shape 的 Y 映射到世界空间的 **-Z**。为了使填充区域和轮廓线对齐，Shape 坐标中 **Y 取反**：`s.moveTo(p.x, -p.z)`。参见 `HRZPolygon.tsx`。

### HRZ 闭合

点击第一个顶点（距离 < 0.3m）闭合多边形。用大号黄色透明球体暗示可点击。不用双击（会触发额外的单击事件）。

### HRP 路径

单条路径替换 — 画新路径自动丢弃旧的。虚线连接机器人到路径起点：距离 >1m 红色，≤1m 绿色。

## 关键文件

| 文件 | 用途 |
|------|------|
| `src/stores/hrzStore.ts` | 禁区状态（zones 数组、currentPoints、addPoint、closeZone） |
| `src/stores/hrpStore.ts` | 路径状态（path 数组、robotPos） |
| `src/ros/connection.ts` | roslib.js 封装（连接、订阅、发布） |
| `src/utils/coordinate.ts` | sceneToRos / rosToScene |
| `src/components/scene/Scene3D.tsx` | 主 3D 场景 + useGroundRaycast hook |
| `src/components/editor/HRZEditor3D.tsx` | 禁区绘制交互 |
| `src/components/editor/HRPEditor3D.tsx` | 路径绘制 + 虚线连接 |
| `src/components/editor/HRZPolygon.tsx` | 禁区填充 + 轮廓渲染 |

## 已修复的关键 Bug

- 填充和轮廓不重合 → Shape 中 Y 取反
- R3F mesh 事件被阻挡 → Canvas 原生 pointer 事件
- 双击多画一个点 → 改为点击起点闭合
- OrbitControls 左键冲突 → 统一按键映射

## ROS1 桥接

`ros1_bridge/` catkin 包包含骨架 Python 节点。核心逻辑（costmap 更新、move_base 目标发送）标有 TODO 注释，需要根据具体 ROS1 环境填充。
