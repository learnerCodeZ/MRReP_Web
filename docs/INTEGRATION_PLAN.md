# 集成计划：将 web1（Harriet9410）的功能合并到 MRReP_web（你的项目）

## Context

你有一个项目 MRReP_web（`D:\MYCODE\MRReP_web`），Harriet9410 有一个功能更完整的版本 web1（`D:\MYCODE\zy\web1`）。web1 已经可以 demo，包含 Mock 模式、导航、地图编辑、详细机器人模型等功能，而你的项目缺少这些。目标是**只修改你的项目**，让它拥有 web1 的所有 demo 功能，不碰 Harriet9410 的代码。

## 两个项目核心差异

| 功能 | web1（Harriet9410） | MRReP_web（你的） |
|------|-------------|-------------------|
| Mock 模式 | 完整模拟（A*寻路、机器人运动、地图编辑） | 无 |
| 导航模式 | 点击导航、路径可视化、目标标记 | Navigate 仅浏览 |
| 地图编辑 | 画墙/擦除/矩形/放置机器人 | 无 |
| 地图选择器 | 默认地图/空白地图 | 无 |
| 机器人模型 | 详细3D模型（底盘、轮子、雷达、传感器、LED） | 简单圆柱+圆锥 |
| 摄像机控制 | 独立 CameraControls 组件 | 内联 OrbitControls |
| 地图编辑预览 | 笔刷/矩形光标预览 | 无 |
| 导航路径可视化 | NavPathVisual 组件 | 无 |
| 额外 Store | robotPoseStore, navTargetStore, mapEditorStore | 无 |
| 持久化 | 已接入 App.tsx 自动保存/加载 | 工具函数存在但未接入 |
| Mock 日志面板 | 侧边栏事件日志 | 无 |
| 依赖版本 | Three 0.184, roslib 2.1, Vite 8, Tailwind 4, TS 6 | Three 0.172, roslib 1.4, Vite 6, Tailwind 3, TS 5.7 |

## 架构对齐决策

1. **模式状态**：保留 `rosStore.editMode`（你的模式），不搬到 App 层级（web1 的模式）
2. **机器人位姿**：新增 `robotPoseStore`（含 x, z, yaw），从 `hrpStore` 移除 `robotPos`
3. **地图数据类型**：从 `Int8Array` 改为 `number[]`，兼容 ROS 和 Mock 两种数据源
4. **坐标系**：保留你的动态 `sceneToRos/rosToScene`（更准确），Mock 设置 originX=0 即可
5. **连接状态**：保留你的 `connected/connecting/error` 字段，新增 `isMock` 标志
6. **事件处理**：改为 Scene3D 中集中处理（web1 的模式），编辑器组件变为纯渲染
7. **HRZ 数据**：保留 `points` 字段名，不改为 `vertices`，减少下游改动

## 实施步骤

### Step 1: 基础设施更新

修改文件：
- `package.json` — 升级依赖版本（Three 0.184, roslib 2.1, Vite 8, Tailwind 4, TS 6 等）
- `postcss.config.js` — 改为 Tailwind v4 插件格式（`@tailwindcss/postcss`）
- `src/index.css` — `@tailwind` 指令改为 `@import "tailwindcss"`
- `vite.config.ts` — 添加 `server: { host: '0.0.0.0', port: 3000 }`
- `tsconfig.app.json` — 关闭 `verbatimModuleSyntax`
- `index.html` — 标题改为 "MRReP / MRHaD Web Editor"

新增文件：
- `src/r3f.d.ts` — R3F JSX 类型声明（支持 `<line>` 元素）

然后运行 `npm install`

### Step 2: Store 和工具函数

新增文件：
- `src/stores/robotPoseStore.ts` — 机器人位姿 `{x, z, yaw}`（从 web1 移植）
- `src/stores/navTargetStore.ts` — 导航目标、规划路径、导航状态
- `src/stores/mapEditorStore.ts` — 地图编辑工具、笔刷大小、矩形起点

修改文件：
- `src/stores/rosStore.ts` — 添加 `isMock` 字段和 `setMock` action；EditMode 增加 `'mapedit'`
- `src/stores/mapStore.ts` — data 类型从 `Int8Array | null` 改为 `number[] | null`
- `src/stores/hrpStore.ts` — 移除 `robotPos`/`setRobotPos`（迁移到 robotPoseStore）；增加 `isDrawing`、`startDrawing`、`addPoint`、`finishDrawing`、`cancelDrawing`
- `src/stores/hrzStore.ts` — 增加 `isDrawing`、`loadZones`、`cancelDrawing`；addPoint 中增加靠近首点自动闭合逻辑
- `src/utils/coordinate.ts` — 增加 `quaternionToYaw`、`Vec2`/`Vec3` 类型、`dist` 函数
- `src/utils/mapRenderer.ts` — 适配 `number[]`，移植 web1 的 `renderMapToCanvas` 方法
- `src/utils/persistence.ts` — 增加统一的 `save`/`load` 函数

### Step 3: ROS 层

新增文件：
- `src/ros/mock.ts` — 完整 Mock 模式（~660 行，含 A* 寻路、机器人运动模拟、地图编辑、HRZ 区域应用、HRP 路径跟随）

修改文件：
- `src/ros/types.ts` — 增加 `RosMsg_String` 接口
- `src/ros/connection.ts` — 里程计更新改为写入 `robotPoseStore`（含 yaw）；增加 `publishNavGoal` 函数；`publishHrpPath` 改为接受 `{x, z}[]` 参数

### Step 4: 3D 场景组件

新增文件：
- `src/components/scene/CameraControls.tsx` — 自定义 OrbitControls（左键禁用、右键旋转、中键缩放）
- `src/components/scene/MapEditPreview.tsx` — 地图编辑光标预览
- `src/components/scene/NavPathVisual.tsx` — 导航路径可视化

修改文件：
- `src/components/scene/RobotModel.tsx` — 替换为详细3D模型（底盘、轮子、雷达旋转、传感器、LED、保险杠）
- `src/components/scene/MapFloor.tsx` — 适配 `number[]` 数据类型，改用离屏 Canvas 渲染方式
- `src/components/scene/Scene3D.tsx` — **核心改动**：增加集中式 SceneEvents 处理所有模式点击事件；集成 CameraControls、NavPathVisual、MapEditPreview、NavTargetMarker；根据模式显示不同3D覆盖层

### Step 5: 编辑器组件

修改文件：
- `src/components/editor/HRZPolygon.tsx` — 改用 buffer geometry 渲染，增加首点高亮
- `src/components/editor/HRZEditor3D.tsx` — 移除事件处理代码，变为纯渲染组件
- `src/components/editor/HRPEditor3D.tsx` — 移除事件处理代码，接受 `robotX`/`robotZ` props，增加动画虚线连接线

### Step 6: UI 组件

修改文件：
- `src/components/ui/ModeSelector.tsx` — 增加 mapedit 模式（仅 Mock 下可见）
- `src/components/ui/ActionPanel.tsx` — **大幅重写**：按模式分区显示不同操作面板（导航/地图编辑/HRZ/HRP），Mock 模式调用 mock 函数，ROS 模式调用 publish 函数
- `src/components/layout/Sidebar.tsx` — 增加 MapSelector（Mock 下选择地图）、MockLogPanel（事件日志）
- `src/components/layout/StatusBar.tsx` — 增加 Mock 指示器、区域数量、路径点数
- `src/components/ros/ROSConnection.tsx` — 增加 Mock Mode 按钮，Mock 状态指示

### Step 7: App 集成

修改文件：
- `src/App.tsx` — 接入持久化自动保存/加载；isMock 变为 false 时自动从 mapedit 切回 navigate

## 文件汇总

| 操作 | 文件数 | 文件 |
|------|--------|------|
| 新增 | 8 | robotPoseStore, navTargetStore, mapEditorStore, mock.ts, CameraControls, MapEditPreview, NavPathVisual, r3f.d.ts |
| 修改 | 17 | package.json, postcss.config.js, index.css, vite.config.ts, tsconfig.app.json, index.html, rosStore, mapStore, hrpStore, hrzStore, coordinate.ts, mapRenderer.ts, persistence.ts, types.ts, connection.ts, Scene3D, RobotModel, MapFloor, HRZPolygon, HRZEditor3D, HRPEditor3D, ModeSelector, ActionPanel, Sidebar, StatusBar, ROSConnection, App.tsx |

## Git 提交规范

所有涉及借鉴 web1 代码的 commit，必须在 commit message 末尾添加：

```
Co-authored-by: Harriet9410 <Harriet9410@users.noreply.github.com>
```

这样 Harriet9410 会自动出现在仓库贡献者列表中。

## 验证方式

1. `npm install` 无报错
2. `npm run dev` 启动后访问 localhost:3000
3. 点击 Mock Mode 进入模拟 — 显示默认地图和机器人
4. Navigate 模式 — 点击地图设置导航目标，机器人沿路径移动
5. HRZ 模式 — 点击画多边形，靠近首点闭合，红色半透明区域
6. HRP 模式 — 拖拽画路径，绿色线条，虚线连接到机器人
7. Map Edit 模式（仅Mock）— 画墙/擦除/矩形/放置机器人
8. 地图选择器切换默认/空白地图
9. 刷新页面后 HRZ 区域和 HRP 路径仍然存在（持久化）
10. ROS 连接模式仍可正常连接 rosbridge
