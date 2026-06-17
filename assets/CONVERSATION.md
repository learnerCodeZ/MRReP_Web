# MRReP/MRHaD Web版复现 — 完整对话记录

> 导出时间: 2026-06-17 14:22
> 项目路径: `d:/720/dog/creative/MRReP Mixed Reality-based Hand-drawn Reference Path Editing Interface for Mobile Robot Navigation/mrrep-web/`

---

## 一、项目背景

复现两篇论文的核心功能，不做Unity版，做Web版：

- **MRHaD** (arXiv: 2504.00580) — 手绘禁区(HRZ)编辑，用户通过MR手势在地图上绘制多边形禁区，填充到costmap
- **MRReP** (arXiv: 2604.00059) — 手绘参考路径(HRP)编辑，用户在物理地面画参考路径，转为全局导航路径

用户要求：3D预览 + 连真实ROS1（非ROS2）

---

## 二、技术选型

| 层次 | 技术 |
|------|------|
| 构建 | Vite |
| 前端 | React 18 + TypeScript |
| 3D | @react-three/fiber + @react-three/drei |
| 状态 | Zustand |
| ROS1桥接 | roslib.js + rosbridge_suite |
| 样式 | Tailwind CSS |

---

## 三、核心设计决策（对话中逐步确定）

### 1. 坐标系
- Store存储**场景坐标**（3D场景的x, z），发送给ROS时通过`sceneToRos()`转换
- 渲染时不需要反复转换

### 2. ROS1集成
- Web端通过roslib.js连接rosbridge WebSocket
- 自定义ROS1节点：`hrz_costmap_node.py`（禁区→costmap更新）、`hrp_planner_node.py`（HRP→全局规划器）

### 3. 3D交互 — Canvas原生事件 + 手动raycasting
- 初版用R3F mesh事件（onClick/onPointerDown），被MapFloor等3D物体阻挡
- 重写为Canvas原生pointer事件 + 手动raycasting到y=0平面，彻底解决事件穿透问题

### 4. 视角控制 — 统一按键映射
- 初版：导航模式左键旋转，编辑模式左键绘制→切换模式时按键习惯不连续
- 修正：所有模式统一 **右键旋转 · 中键平移 · 滚轮缩放**，左键始终留给业务逻辑

### 5. HRZ闭合 — 点击起点闭合
- 初版：双击闭合→双击先触发单击，多画一个点
- 修正：点击第一个顶点（距离<0.3m）闭合，黄色大球暗示可点击，主流绘图工具标准交互

### 6. HRZ多边形渲染 — Shape坐标Y取反
- `ShapeGeometry`在X-Y平面，mesh旋转-90°后Y映射到**-Z**
- 但Line直接用Z=+v.y，导致填充和轮廓不重合
- 修正：Shape中Y取反`(-v.y)`，旋转后映射到Z=+v.y，与Line一致

### 7. HRP路径 — 单条替换
- 初版：paths数组可存多条路径→ROS1端hrp_planner_node覆盖存储，第一条丢失
- 修正：画新路径自动替换旧的，始终只保留一条，与论文设计一致

### 8. 机器人起点衔接 — 方案2
- 问题：机器人R₀不在路径起点P₁时，直接导航行为不可预测
- 方案2：hrp_planner_node在make_plan时把机器人当前位姿插入路径最前面
- 虚线连接：始终显示机器人→路径起点的虚线，>1m红色，≤1m绿色
- 侧边栏：>1m时额外显示黄色警告

---

## 四、项目结构

```
mrrep-web/
├── src/
│   ├── main.tsx
│   ├── App.tsx                          # 主布局
│   ├── stores/
│   │   ├── rosStore.ts                  # ROS连接状态
│   │   ├── mapStore.ts                  # OccupancyGrid地图数据
│   │   ├── hrzStore.ts                  # MRHaD禁区数据
│   │   └── hrpStore.ts                  # MRReP路径数据
│   ├── components/
│   │   ├── scene/
│   │   │   ├── Scene3D.tsx              # R3F Canvas主场景
│   │   │   ├── MapFloor.tsx             # 地图3D地面纹理
│   │   │   ├── RobotModel.tsx           # 机器人3D模型
│   │   │   └── CameraControls.tsx       # OrbitControls(统一按键)
│   │   ├── editor/
│   │   │   ├── HRZEditor3D.tsx          # 禁区多边形绘制
│   │   │   ├── HRPEditor3D.tsx          # 参考路径绘制+虚线连接
│   │   │   └── HRZPolygon.tsx           # 渲染单个禁区(填充+轮廓)
│   │   ├── ros/
│   │   │   └── ROSConnection.tsx        # ROS连接管理UI
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx              # 侧边栏
│   │   │   └── StatusBar.tsx            # 状态栏
│   │   └── ui/
│   │       ├── ModeSelector.tsx         # 编辑模式选择
│   │       └── ActionPanel.tsx          # 操作面板+警告提示
│   ├── ros/
│   │   ├── connection.ts                # roslib.js封装
│   │   └── types.ts                     # ROS消息类型
│   └── utils/
│       ├── coordinate.ts                # 坐标系转换
│       ├── mapRenderer.ts               # OccupancyGrid→Canvas纹理
│       └── persistence.ts               # localStorage持久化
├── ros1_bridge/
│   ├── scripts/
│   │   ├── hrz_costmap_node.py          # 禁区→costmap更新
│   │   └── hrp_planner_node.py          # HRP→全局规划器(含起点衔接)
│   ├── launch/
│   │   └── web_bridge.launch           # rosbridge + 桥接节点
│   ├── CMakeLists.txt
│   └── package.xml
└── README.md
```

---

## 五、ROS1话题/服务

| 方向 | 话题/服务 | 消息类型 | 用途 |
|------|----------|---------|------|
| 订阅 | `/map` | nav_msgs/OccupancyGrid | 获取地图 |
| 订阅 | `/odom` | nav_msgs/Odometry | 机器人位姿 |
| 发布 | `/hrz_zones` | std_msgs/String(JSON) | 发送禁区数据 |
| 发布 | `/hrp_path` | nav_msgs/Path | 发送参考路径 |
| Action | `/move_base` | move_base_msgs/MoveBaseAction | 导航目标 |

---

## 六、按键操作

| 操作 | 导航模式 | 禁区编辑 | 路径编辑 |
|------|---------|---------|---------|
| 左键 | — | 放顶点/点击起点闭合 | 拖拽画路径 |
| 右键 | 旋转视角 | 旋转视角 | 旋转视角 |
| 中键 | 平移 | 平移 | 平移 |
| 滚轮 | 缩放 | 缩放 | 缩放 |

---

## 七、拓展设计讨论

### Web版可拓展
1. **导航实时路径叠加** — 订阅move_base规划路径，和手绘路径对比
2. **路径分段速度标注** — 不同段标注快/慢速
3. **路径可达性预检** — 前端A*验算路径是否穿墙
4. **拖拽顶点调整** — 已画禁区/路径可微调
5. **机器人足迹投影** — 地面显示机器人实际大小圆
6. **Undo/Redo** — Ctrl+Z撤销
7. **吸附网格** — Shift按住吸附0.5m网格
8. **禁区等级** — 硬禁止(红) vs 软禁止(黄)
9. **小地图** — 右上角2D俯视
10. **场景快照** — 保存/加载配置

### HoloLens拓展
1. **Spatial Mapping自动禁区** — 环境扫描自动生成
2. **动态人体禁区** — 检测人自动生成临时禁区
3. **语音+手势混合交互** — "删除这个禁区"
4. **眼动追踪选区** — 注视1秒选中
5. **多用户空间锚点共享** — Azure Spatial Anchors
6. **机器人意图可视化** — 规划路径投射到地面
7. **路径预演动画** — 全息机器人沿路径走一遍
8. **禁区3D体素化** — 不同高度不同禁区
9. **空间音频警告** — 接近禁区方向发警告音
10. **边缘计算降级模式** — 断网本地规划

### 点云大模型拓展
1. **物体级禁区自动标注** — 识别物体类型→自动建议禁区
2. **场景理解自动分区** — 走廊/房间/门口语义标注
3. **动态物体跟踪+轨迹预测** — 推车预测路径
4. **自然语言+点云指代** — "把那个垃圾桶周围设为禁区"
5. **变更检测提醒** — 新物体/移走物体自动提示
6. **点云风格化渲染** — 按语义类别着色
7. **语义costmap** — 不同物体不同代价值
8. **路径可行度评分** — 0-100%渐变色显示风险
9. **社交意识路径** — 避开人正面、经过背后
10. **多层地图管理** — 楼层识别+切换

---

## 八、已解决的关键Bug

| Bug | 原因 | 修复 |
|-----|------|------|
| HRZ填充和轮廓不重合 | ShapeGeometry旋转后Y映射到-Z，Line用Z=+v.y | Shape中Y取反 |
| HRP路径画不出来 | R3F mesh事件被3D物体阻挡+opacity=0 mesh不参与raycasting | 改用Canvas原生pointer事件+手动raycasting |
| 画路径时视角跟着转 | OrbitControls左键同时控制旋转和绘制 | 统一按键：左键绘制，右键旋转 |
| 双击闭合多画一个点 | 双击先触发单击 | 改为点击起点闭合 |
| roslib导入报错 | roslib使用命名导出非默认导出 | `import { Ros, Topic, ... } from 'roslib'` |
| ROS连接失败后状态显示不对 | close事件覆盖error状态 | close回调中检查是否已是error状态 |
