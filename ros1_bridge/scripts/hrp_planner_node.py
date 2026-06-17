#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
HRP Planner Node — receives hand-drawn reference path from web frontend.

Ref: Kosaka et al., "MRReP: Mixed Reality-based Hand-drawn Reference Path
Editing Interface for Mobile Robot Navigation," arXiv:2604.00059, 2025.
Implements the reference path → global planner pipeline from Section III-D,
including the robot pose prepend (Section III-D, "starting point衔接").

Subscribes:
  /hrp_path (nav_msgs/Path) — reference path from web UI

This node prepends the robot's current pose to the path and sends it
to move_base as a navigation goal.

Adapt the planner integration to match your ROS1 setup.
"""

import rospy
from nav_msgs.msg import Path, Odometry
from geometry_msgs.msg import PoseStamped
from actionlib import SimpleActionClient
from move_base_msgs.msg import MoveBaseAction, MoveBaseGoal


class HRPPlannerNode:
    def __init__(self):
        rospy.init_node('hrp_planner_node', anonymous=False)

        self.robot_pose = None

        self.odom_sub = rospy.Subscriber(
            '/odom', Odometry, self._on_odom, queue_size=1
        )
        self.path_sub = rospy.Subscriber(
            '/hrp_path', Path, self._on_path, queue_size=1
        )

        # TODO: initialize move_base action client
        # self.client = SimpleActionClient('/move_base', MoveBaseAction)
        # self.client.wait_for_server(timeout=rospy.Duration(5))

        rospy.loginfo('HRP planner node started')

    def _on_odom(self, msg):
        self.robot_pose = msg.pose.pose

    def _on_path(self, msg):
        if len(msg.poses) == 0:
            rospy.logwarn('Received empty HRP path')
            return

        rospy.loginfo('Received HRP path with %d poses', len(msg.poses))

        # Prepend robot current pose to the path (design decision #8)
        full_path = Path()
        full_path.header = msg.header
        if self.robot_pose is not None:
            start = PoseStamped()
            start.header.frame_id = 'map'
            start.header.stamp = rospy.Time.now()
            start.pose = self.robot_pose
            full_path.poses.append(start)
        full_path.poses.extend(msg.poses)

        rospy.loginfo('Full path: %d poses (robot + reference)', len(full_path.poses))

        # TODO: send the last pose as a move_base goal
        # goal = MoveBaseGoal()
        # goal.target_pose = full_path.poses[-1]
        # self.client.send_goal(goal)

        # TODO: or use a custom planner that follows the full path


if __name__ == '__main__':
    try:
        node = HRPPlannerNode()
        rospy.spin()
    except rospy.ROSInterruptException:
        pass
