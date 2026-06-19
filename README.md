# MRReP Web

Web-based reproduction of MRReP/MRHaD — Mixed Reality hand-drawn reference path and restricted zone editing for mobile robot navigation.

## Features

- **HRZ Editing** — Draw polygon restricted zones on the 3D map, publish to ROS costmap
- **HRP Editing** — Draw reference paths by dragging, publish to ROS path planner
- **3D Map Preview** — OccupancyGrid rendered as textured ground plane
- **ROS1 Integration** — roslib.js over rosbridge WebSocket

## Quick Start

```bash
npm install
npm run dev
```

Open the browser, the default rosbridge URL is `ws://localhost:9090`.

## Controls

| Action | Navigate | HRZ Edit | HRP Edit |
|--------|----------|----------|----------|
| Left click | — | Place vertex / Click start to close | Drag to draw path |
| Right click | Rotate | Rotate | Rotate |
| Middle click | Pan | Pan | Pan |
| Scroll | Zoom | Zoom | Zoom |

## ROS1 Topics

| Direction | Topic | Type | Purpose |
|-----------|-------|------|---------|
| Subscribe | `/map` | nav_msgs/OccupancyGrid | Map data |
| Subscribe | `/odom` | nav_msgs/Odometry | Robot pose |
| Publish | `/hrz_zones` | std_msgs/String (JSON) | Zone data |
| Publish | `/hrp_path` | nav_msgs/Path | Reference path |

## ROS1 Bridge

```bash
# In your catkin workspace
catkin_make
roslaunch mrrep_web_bridge web_bridge.launch
```

See [ros1_bridge/](ros1_bridge/) for the Python node sources. Nodes are skeleton implementations with TODO markers for costmap/planner integration.

## Project Structure

```
src/
  stores/        — Zustand state (ros, map, hrz, hrp)
  components/
    scene/       — Scene3D, MapFloor, RobotModel
    editor/      — HRZEditor3D, HRPEditor3D, HRZPolygon
    layout/      — Sidebar, StatusBar
    ui/          — ModeSelector, ActionPanel
    ros/         — ROSConnection
  ros/           — roslib.js connection, message types
  utils/         — Coordinate transform, map renderer, persistence
ros1_bridge/     — ROS1 catkin package with bridge nodes
```

## Tech Stack

Vite · React 18 · TypeScript · @react-three/fiber · drei · Zustand · roslib.js · Tailwind CSS

## Acknowledgements

- [Harriet9410](https://github.com/Harriet9410) — Mock Mode, A* navigation, map editing, and UI patterns are adapted from their [web1](https://github.com/Harriet9410/web1) project.

## Papers

This project reproduces the core functionality of the following papers as a web-based interface:

- **MRHaD**: Kosaka, A., et al., "MRHaD: Mixed Reality-based Hand-drawn Restricted Zone Editing Interface for Mobile Robot Navigation," arXiv:2504.00580, 2025.
  - Reproduced: HRZ polygon drawing on map, zone → costmap update pipeline
- **MRReP**: Kosaka, A., et al., "MRReP: Mixed Reality-based Hand-drawn Reference Path Editing Interface for Mobile Robot Navigation," arXiv:2604.00059, 2025.
  - Reproduced: HRP freehand path drawing, robot-to-path connection, path → global planner pipeline
