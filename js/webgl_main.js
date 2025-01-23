import OutputLog from "./OutputLog.js";
import WebGL from "./WebGL.js";
import {Color} from "./GLUtils.js";

// Initializing log
const log_div = document.getElementById('log_output');
const log = new OutputLog(log_div);

// WebGL initialization
const canvas = document.getElementById('glcanvas');
const webgl = new WebGL(canvas, log);

let clear_color = new Color(0.8, 0.8, 0.8, 1.0);

webgl.clearCanvas(clear_color);