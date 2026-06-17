# AGENTS.md

## Project Overview

MRReP Web is a browser-based 3D interface for editing hand-drawn restricted zones (HRZ) and reference paths (HRP) on robot navigation maps. It connects to ROS1 via rosbridge.

This is a web-based reproduction of two papers:
- **MRHaD** (Kosaka et al., arXiv:2504.00580, 2025) — HRZ polygon zone editing and costmap integration
- **MRReP** (Kosaka et al., arXiv:2604.00059, 2025) — HRP freehand path editing and global planner integration

## Architecture

### Coordinate System

All stores store **scene coordinates** (3D scene x, z). Convert to ROS coordinates via `sceneToRos()` in `src/utils/coordinate.ts` before publishing. Render without conversion.

### 3D Interaction

Uses Canvas native pointer events + manual raycasting to the y=0 ground plane. R3F mesh events are NOT used (they get blocked by 3D objects). The `useGroundRaycast()` hook in `Scene3D.tsx` is the single source of truth for click→world-position mapping.

### Camera Controls

All modes share the same key mapping: **right-click rotate, middle-click pan, scroll zoom**. Left-click is always reserved for business logic (drawing). Configured in `CameraControls` via OrbitControls `mouseButtons` prop.

### HRZ Polygon Rendering

`ShapeGeometry` sits on the X-Y plane; the mesh is rotated -90° around X. This means Shape Y maps to **-Z** in world space. To align the filled shape with the outline line, Shape coordinates use **Y negated**: `s.moveTo(p.x, -p.z)`. See `HRZPolygon.tsx`.

### HRZ Closing

Click the first vertex (distance < 0.3m) to close the polygon. A large yellow transparent sphere hints that it's clickable. No double-click (causes extra single-click events).

### HRP Path

Single path replacement — drawing a new path discards the old one. A dashed line connects the robot to the path start: red if >1m, green if ≤1m.

## Key Files

| File | Purpose |
|------|---------|
| `src/stores/hrzStore.ts` | Zone state (zones array, currentPoints, addPoint, closeZone) |
| `src/stores/hrpStore.ts` | Path state (path array, robotPos) |
| `src/ros/connection.ts` | roslib.js wrapper (connect, subscribe, publish) |
| `src/utils/coordinate.ts` | sceneToRos / rosToScene |
| `src/components/scene/Scene3D.tsx` | Main 3D scene + useGroundRaycast hook |
| `src/components/editor/HRZEditor3D.tsx` | Zone drawing interaction |
| `src/components/editor/HRPEditor3D.tsx` | Path drawing + dash line |
| `src/components/editor/HRZPolygon.tsx` | Zone fill + outline rendering |

## Known Bugs (Previously Fixed)

- Shape fill vs outline misalignment → Shape Y negated
- R3F mesh event blocking → Canvas native pointer events
- Double-click extra point → Click-to-close instead
- OrbitControls left-click conflict → Unified key mapping

## ROS1 Bridge

The `ros1_bridge/` catkin package contains skeleton Python nodes. Core logic (costmap update, move_base goal sending) is marked with TODO comments. These need to be filled in based on the specific ROS1 environment.
