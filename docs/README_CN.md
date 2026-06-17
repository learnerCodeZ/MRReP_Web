# MRReP Web

MRReP/MRHaD 的 Web 版复现 — 基于混合现实的手绘参考路径和禁区编辑，用于移动机器人导航。

## 功能

- **HRZ 禁区编辑** — 在 3D 地图上绘制多边形禁区，发布到 ROS 代价地图
- **HRP 参考路径编辑** — 拖拽绘制参考路径，发布到 ROS 路径规划器
- **3D 地图预览** — OccupancyGrid 渲染为带纹理的地面
- **ROS1 集成** — 通过 rosbridge WebSocket 连接 roslib.js

## 快速开始

```bash
npm install
npm run dev
```

打开浏览器，默认 rosbridge 地址为 `ws://localhost:9090`。

## 操作说明

| 操作 | 导航模式 | 禁区编辑 | 路径编辑 |
|------|---------|---------|---------|
| 左键 | — | 放置顶点 / 点击起点闭合 | 拖拽画路径 |
| 右键 | 旋转 | 旋转 | 旋转 |
| 中键 | 平移 | 平移 | 平移 |
| 滚轮 | 缩放 | 缩放 | 缩放 |

## ROS1 话题

| 方向 | 话题 | 类型 | 用途 |
|------|------|------|------|
| 订阅 | `/map` | nav_msgs/OccupancyGrid | 地图数据 |
| 订阅 | `/odom` | nav_msgs/Odometry | 机器人位姿 |
| 发布 | `/hrz_zones` | std_msgs/String (JSON) | 禁区数据 |
| 发布 | `/hrp_path` | nav_msgs/Path | 参考路径 |

## ROS1 桥接

```bash
# 在 catkin 工作空间中
catkin_make
roslaunch mrrep_web_bridge web_bridge.launch
```

参见 [ros1_bridge/](ros1_bridge/) 目录下的 Python 节点源码。节点为骨架实现，costmap/planner 集成部分标有 TODO。

## 项目结构

```
src/
  stores/        — Zustand 状态管理 (ros, map, hrz, hrp)
  components/
    scene/       — Scene3D, MapFloor, RobotModel
    editor/      — HRZEditor3D, HRPEditor3D, HRZPolygon
    layout/      — Sidebar, StatusBar
    ui/          — ModeSelector, ActionPanel
    ros/         — ROSConnection
  ros/           — roslib.js 连接封装、消息类型
  utils/         — 坐标转换、地图渲染、持久化
ros1_bridge/     — ROS1 catkin 桥接包
```

## 技术栈

Vite · React 18 · TypeScript · @react-three/fiber · drei · Zustand · roslib.js · Tailwind CSS

## 论文

本项目以 Web 形式复现了以下论文的核心功能：

- **MRHaD**: Kosaka, A. 等, "MRHaD: Mixed Reality-based Hand-drawn Restricted Zone Editing Interface for Mobile Robot Navigation," arXiv:2504.00580, 2025.
  - 复现内容：HRZ 多边形禁区绘制、禁区→costmap 更新管线
- **MRReP**: Kosaka, A. 等, "MRReP: Mixed Reality-based Hand-drawn Reference Path Editing Interface for Mobile Robot Navigation," arXiv:2604.00059, 2025.
  - 复现内容：HRP 手绘参考路径、机器人到路径起点的虚线连接、路径→全局规划器管线
