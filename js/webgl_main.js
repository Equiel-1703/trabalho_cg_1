import OutputLog from "./OutputLog.js";

// Initializing log
const log_div = document.getElementById('log_output');
const log = new OutputLog(log_div);

// WebGL initialization
const canvas = document.getElementById('glcanvas');
let gl = canvas.getContext('webgl');

if (!gl) {
    log.warning_log('WebGL not supported, falling back on experimental-webgl.');
    gl = canvas.getContext('experimental-webgl');

    if (!gl) {
        log.error_log('Your browser does not support WebGL.');
        throw new Error('WebGL not supported.');
    }
}

log.success_log('WebGL is supported and the context was created.');

