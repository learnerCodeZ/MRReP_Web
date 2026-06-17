#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
HRZ Costmap Node — receives HRZ zones from web frontend and updates costmap.

Ref: Kosaka et al., "MRHaD: Mixed Reality-based Hand-drawn Restricted Zone
Editing Interface for Mobile Robot Navigation," arXiv:2504.00580, 2025.
Implements the zone → costmap update pipeline described in Section III-D.

Subscribes:
  /hrz_zones (std_msgs/String) — JSON array of zones with polygon vertices

This node parses the zone data and publishes costmap updates.
Adapt the costmap layer integration to match your ROS1 setup.
"""

import json
import rospy
from std_msgs.msg import String
from geometry_msgs.msg import Polygon, Point32, PolygonStamped


class HRZCostmapNode:
    def __init__(self):
        rospy.init_node('hrz_costmap_node', anonymous=False)

        self.zones_sub = rospy.Subscriber(
            '/hrz_zones', String, self._on_zones, queue_size=5
        )

        # TODO: create a publisher for your costmap layer updates
        # e.g. self.costmap_pub = rospy.Publisher('/costmap_updates', ...)

        rospy.loginfo('HRZ costmap node started')

    def _on_zones(self, msg):
        try:
            zones = json.loads(msg.data)
        except json.JSONDecodeError:
            rospy.logwarn('Failed to parse HRZ zones JSON')
            return

        rospy.loginfo('Received %d HRZ zones', len(zones))

        for zone in zones:
            points = zone.get('points', [])
            rospy.loginfo(
                '  Zone %s: %d vertices %s',
                zone.get('id', '?'),
                len(points),
                [(p.get('x', 0), p.get('y', 0)) for p in points],
            )

            # TODO: convert points to your costmap's coordinate frame
            # TODO: fill costmap cells inside the polygon with lethal cost
            # Example using geometry_msgs/PolygonStamped:
            #   poly = PolygonStamped()
            #   poly.header.frame_id = 'map'
            #   poly.header.stamp = rospy.Time.now()
            #   poly.polygon.points = [Point32(x=p['x'], y=p['y'], z=0) for p in points]
            #   self.costmap_pub.publish(poly)


if __name__ == '__main__':
    try:
        node = HRZCostmapNode()
        rospy.spin()
    except rospy.ROSInterruptException:
        pass
