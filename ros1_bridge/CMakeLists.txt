cmake_minimum_required(VERSION 3.0.2)
project(mrrep_web_bridge)

find_package(catkin REQUIRED COMPONENTS
  rospy
  std_msgs
  geometry_msgs
  nav_msgs
  move_base_msgs
  actionlib
  rosbridge_server
)

catkin_python_setup()

catkin_package()

install(PROGRAMS
  scripts/hrz_costmap_node.py
  scripts/hrp_planner_node.py
  DESTINATION ${CATKIN_PACKAGE_BIN_DESTINATION}
)

install(DIRECTORY launch/
  DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION}/launch
)
