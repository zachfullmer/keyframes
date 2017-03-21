import $ from 'jquery'


// global drawing constants
const maxDelta = 20;
// canvas stuff
var ctx = null;


export function initCanvas(context) {
    ctx = context;
    let canvas = $('#drawingArea')[0];
    window.requestAnimationFrame(drawCanvas);
}

var lastT = null;
function drawCanvas(timestamp) {
    if (lastT === null) {
        lastT = timestamp;
    }
    let delta = Math.min(timestamp - lastT, maxDelta);
    lastT = timestamp;
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    // animation
    //
    // drawing
    //
    window.requestAnimationFrame(drawCanvas);
}