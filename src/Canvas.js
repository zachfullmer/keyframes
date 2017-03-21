import $ from 'jquery'


export function Hitbox() {
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    this.set = (x, y, w, h) => {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    this.contains = (x, y) => {
        return (x >= this.x && x < this.x + this.w && y >= this.y && y < this.y + this.h);
    }
}


// global drawing constants
const maxDelta = 20;
// canvas stuff
var ctx = null;
var hitboxes = [];
export function addHitbox(hitbox) {
    hitboxes.push(hitbox);
}
export function checkHitboxEvents(event) {
    let hits = [];
    for (let h in hitboxes) {
        if (hitboxes[h].contains(event.pageX, event.pageY)) {
            hits.push(hitboxes[h]);
        }
    }
    for (let h in hits) {
        if (hits[h][event.type] !== undefined) {
            if (hits[h][event.type](event) === false) {
                break;
            }
        }
    }
}


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