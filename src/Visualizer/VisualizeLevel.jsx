import React, { Component } from "react";
import { dijkstra } from "../algorithms/dijkstra";
import {
  getCurrentLevelID,
  getCurrentLevelLives,
  getCurrentLevelName,
  getCurrentLevelNodeCoords,
  getCurrentLevelRandomWallNumber,
  getCurrentLevelRandomWallPresses,
  getCurrentLevelWallsAllowed,
} from "../currentLevelHandling";
import { EnterHome } from "../Navigation";
import Node from "./Node/Node";
import "./Visualizer.css";

// Placeholders for start node coordinates. It gets the current level data
let START_NODE_ROW = getCurrentLevelNodeCoords()[0][1];
let START_NODE_COL = getCurrentLevelNodeCoords()[0][0];
let END_NODE_ROW = getCurrentLevelNodeCoords()[1][1];
let END_NODE_COL = getCurrentLevelNodeCoords()[1][0];

// Specifies the number of rows and columns
const NUM_ROWS = 21;
const NUM_COLUMNS = 51;

// Specifies the number of walls the player can have active at one time
let NUM_WALLS_TOTAL = getCurrentLevelWallsAllowed();
let NUM_WALLS_ACTIVE = 0;

// Wall Presses
let NUM_RANDOM_WALL_PRESSES = getCurrentLevelRandomWallPresses();
let RANDOM_WALL_NUMBER = getCurrentLevelRandomWallNumber();

// Other level constants
let LEVEL_NAME = getCurrentLevelName();
let LEVEL_ID = getCurrentLevelID();
let LIVES = getCurrentLevelLives();
// 0,1,2,3 star ---
