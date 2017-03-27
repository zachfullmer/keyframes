import $ from 'jquery'
import { pnt, VectorDrawing, shape } from './VectorDrawing.js'


export function Hitbox(circle = false) {
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    this.r = 0;
    this.circle = circle;
    this.setPos = (x, y) => {
        this.x = x;
        this.y = y;
    }
    this.setBox = (w, h) => {
        this.w = w;
        this.h = h;
    }
    this.setRad = (r) => {
        this.r = r;
    }
    this.contains = (x, y) => {
        if (this.circle) {
            let dist = Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
            return (dist < this.r);
        }
        return (x >= this.x && x < this.x + this.w && y >= this.y && y < this.y + this.h);
    }
    this.draw = (ctx) => {
        if (this.circle) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'red';
            ctx.stroke();
        }
        else {
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.w, this.h);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'red';
            ctx.stroke();
        }
    }
}


// global drawing constants
const maxDelta = 20;
// canvas stuff
var ctx = null;
var canvas = null;
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


export var vec = new VectorDrawing();
export function initCanvas(context) {
    ctx = context;
    canvas = $('#drawingArea')[0];
    window.requestAnimationFrame(drawCanvas);
}

function resizeCanvas() {
    if (ctx.canvas.width != window.innerWidth ||
        ctx.canvas.height != window.innerHeight) {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
        if (canvas.resize !== undefined) {
            canvas.resize(ctx.canvas.width, ctx.canvas.height);
        }
    }
}

var lastT = null;
function drawCanvas(timestamp) {
    if (lastT === null) {
        lastT = timestamp;
    }
    let delta = Math.min(timestamp - lastT, maxDelta);
    lastT = timestamp;
    resizeCanvas();
    // animation
    vec.update();
    //
    // drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let h in hitboxes) {
        hitboxes[h].draw(ctx);
    }
    vec.draw(ctx);
    vec.debugDraw(ctx);
    //
    window.requestAnimationFrame(drawCanvas);
}