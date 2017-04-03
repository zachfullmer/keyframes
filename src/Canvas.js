import $ from 'jquery'
import { pnt, VectorDrawing, shape } from './VectorDrawing.js'
import { Timeline } from './Animation.js'


export function Hitbox(circle = false) {
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    this.r = 0;
    this.circle = circle;
    this.hover = false;
    var _mouseenter = [];
    var _mouseleave = [];
    var _mousemove = [];
    var _mousedown = [];
    var _mouseup = [];
    var _click = [];
    var _dblclick = [];
    this.execute = (event) => {
        let list = null;
        switch ('_' + event.type) {
            case '_mouseenter':
                list = _mouseenter;
                break;
            case '_mouseleave':
                list = _mouseleave;
                break;
            case '_mousemove':
                list = _mousemove;
                break;
            case '_mousedown':
                list = _mousedown;
                break;
            case '_mouseup':
                list = _mouseup;
                break;
            case '_click':
                list = _click;
                break;
            case '_dblclick':
                list = _dblclick;
                break;
            default:
                break;
        }
        for (let e in list) {
            list[e](event);
        }
    }
    this.mouseenter = (func) => {
        _mouseenter.push(func);
    }
    this.mouseleave = (func) => {
        _mouseleave.push(func);
    }
    this.mousemove = (func) => {
        _mousemove.push(func);
    }
    this.mousedown = (func) => {
        _mousedown.push(func);
    }
    this.mouseup = (func) => {
        _mouseup.push(func);
    }
    this.click = (func) => {
        _click.push(func);
    }
    this.dblclick = (func) => {
        _dblclick.push(func);
    }
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
export function removeHitbox(hitbox) {
    hitboxes.splice(hitboxes.indexOf(hitbox), 1);
}
export function checkHitboxEvents(event) {
    let hits = [];
    for (let h in hitboxes) {
        if (hitboxes[h].contains(event.pageX, event.pageY)) {
            hits.push(hitboxes[h]);
        }
        else {
            if (hitboxes[h].hover == true) {
                let type = event.type;
                event.type = 'mouseleave';
                hitboxes[h].execute(event);
                event.type = type;
            }
            hitboxes[h].hover = false;
        }
    }
    for (let h in hits) {
        hits[h].execute(event);
        if (hits[h].hover == false) {
            let type = event.type;
            event.type = 'mouseenter';
            hits[h].execute(event);
            event.type = type;
        }
        hits[h].hover = true;
    }
}

export var timeline = new Timeline();
export var vec = new VectorDrawing();
export function initCanvas(context) {
    ctx = context;
    canvas = $('#drawingArea')[0];
    updateTimelinePos();
    window.requestAnimationFrame(drawCanvas);
}

function updateTimelinePos() {
    timeline.left = 300;
    timeline.right = window.innerWidth;
    timeline.bottom = window.innerHeight;
    timeline.top = window.innerHeight - 100;
}

function resizeCanvas() {
    if (ctx.canvas.width != window.innerWidth ||
        ctx.canvas.height != window.innerHeight) {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
        if (canvas.resize !== undefined) {
            canvas.resize(ctx.canvas.width, ctx.canvas.height);
        }
        updateTimelinePos();
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
    timeline.updateAnim(delta);
    vec.update();
    //
    // drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    vec.draw(ctx);
    vec.debugDraw(ctx);
    timeline.draw(ctx);
    //
    window.requestAnimationFrame(drawCanvas);
}