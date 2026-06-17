# 测试步骤

## 1. 启动开发服务器

```bash
cd d:/MYCODE/MRReP_web
npm run dev
```

浏览器打开显示的地址（通常是 `http://localhost:5173`）。

## 2. 无 ROS 环境测试（纯前端）

不需要 ROS 也能测试核心交互：

1. **3D 场景** — 打开后应看到深色地面 + 网格，右键拖拽旋转、中键平移、滚轮缩放
2. **HRZ 禁区编辑** — 侧边栏切换到 "HRZ Edit"，左键点击地面放顶点，画 3+ 个点后点击第一个顶点（黄色大球）闭合多边形
3. **HRP 路径编辑** — 切换到 "HRP Edit"，左键按住拖拽画路径，松开结束
4. **操作面板** — 侧边栏有 Send/Clear 按钮，状态栏底部显示模式和连接状态

## 3. 有 ROS 环境测试

```bash
# 终端1: 启动 rosbridge
roslaunch rosbridge_server rosbridge_websocket.launch

# 终端2: 启动桥接节点（如果 catkin 工作空间已配置）
roslaunch mrrep_web_bridge web_bridge.launch

# 终端3: 发布测试地图
rostopic pub /map nav_msgs/OccupancyGrid "..." --once
```

网页端输入 `ws://localhost:9090`，点击 Connect，连接成功后地图和机器人位姿会自动显示。

## 4. 检查点

| 检查项 | 预期 |
|--------|------|
| 页面加载 | 左侧灰色侧边栏 + 右侧 3D 场景 + 底部状态栏 |
| 右键拖拽 | 视角旋转 |
| 中键拖拽 | 视角平移 |
| 滚轮 | 缩放 |
| HRZ 模式左键点击 | 地面出现黄色小球（顶点） |
| 3+ 个顶点后点第一个 | 多边形闭合，填充红色半透明区域 |
| HRP 模式左键拖拽 | 画出绿色路径线 |
| ROS 连接 | 状态栏显示 "ROS Connected" |
