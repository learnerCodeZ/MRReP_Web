export interface OccupancyGridMsg {
  header: { seq: number; stamp: { secs: number; nsecs: number }; frame_id: string }
  info: {
    map_load_time: { secs: number; nsecs: number }
    resolution: number
    width: number
    height: number
    origin: { position: { x: number; y: number; z: number }; orientation: { x: number; y: number; z: number; w: number } }
  }
  data: number[]
}

export interface OdometryMsg {
  header: { seq: number; stamp: { secs: number; nsecs: number }; frame_id: string }
  child_frame_id: string
  pose: {
    pose: { position: { x: number; y: number; z: number }; orientation: { x: number; y: number; z: number; w: number } }
    covariance: number[]
  }
  twist: {
    twist: { linear: { x: number; y: number; z: number }; angular: { x: number; y: number; z: number } }
    covariance: number[]
  }
}

export interface PathMsg {
  header: { seq: number; stamp: { secs: number; nsecs: number }; frame_id: string }
  poses: {
    header: { seq: number; stamp: { secs: number; nsecs: number }; frame_id: string }
    pose: { position: { x: number; y: number; z: number }; orientation: { x: number; y: number; z: number; w: number } }
  }[]
}

export interface PoseStampedMsg {
  header: { seq: number; stamp: { secs: number; nsecs: number }; frame_id: string }
  pose: { position: { x: number; y: number; z: number }; orientation: { x: number; y: number; z: number; w: number } }
}

export interface RosMsg_String {
  data: string
}
