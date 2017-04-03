import $ from 'jquery'
import { Text } from './Text.js'
import { Hitbox, addHitbox } from './Canvas.js'

function clr() {
    $('#debugBox').text('');
}
function log(str) {
    $('#debugBox').append(str + '<br/>');
}

function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

function formatTime(ms, decimals = 3) {
    ms = Math.round(ms);
    decimals = Math.min(Math.max(1, decimals), 3);
    let minutes = Math.floor(ms / 60000);
    let seconds = Math.floor(ms / 1000);
    let milli = ms % 1000;
    milli = Math.round(milli / Math.pow(10, (3 - decimals)));
    return pad(minutes, 2) + ':' + pad(seconds, 2) + '.' + pad(milli, decimals);
}

export function Timeline() {
    // hitbox
    var hitbox = new Hitbox();
    var grabbed = false;
    hitbox.mousedown(() => {
        grabbed = true;
    });
    hitbox.mouseup(() => {
        grabbed = false;
    });
    $(document).mousemove((event) => {
        if (!this.lastMouse) this.lastMouse = [0, 0];
        if (grabbed) {
        }
        this.lastMouse = [event.clientX, event.clientY];
    });
    addHitbox(hitbox);
    // text
    const fontSize = 10;
    const fontFace = 'Arial';
    const markerFreq = 18;
    const markersPerStamp = 2;
    this.textRender = Object.create(Text).init(formatTime(10));
    this.textRender.originX = 0.0;
    this.textRender.originY = 0.5;
    this.textRender.fontSize = fontSize;
    this.textRender.fontFamily = fontFace;
    this.textRender.update();
    // time
    var curTime = 0;
    var _period = 0;
    var _timeOffset = 0;
    var _advance = 0;
    // drawing
    const timeAreaHeight = 20;
    var _timelineSize = 3000;
    var _pixelOffset = 0;
    var _minWidth = 1;
    var _minHeight = timeAreaHeight;
    var timelinePos = 0;
    var linePos = 0.0;
    var endLinePos = 0.0;
    var _pos = [0.0, 0.0];
    var _size = [100.0, 100.0];
    Object.defineProperties(this, {
        "posX": {
            "get": function () { return _pos[0]; },
            "set": function (px) {
                _pos[0] = px;
                hitbox.setPos(_pos[0], _pos[1]);
            }
        },
        "posY": {
            "get": function () { return _pos[1]; },
            "set": function (py) {
                _pos[1] = py;
                hitbox.setPos(_pos[0], _pos[1]);
            }
        },
        "advance": {
            "get": function () { return _advance; }
        },
        "width": {
            "get": function () { return _size[0]; },
            "set": function (w) {
                _size[0] = w;
                hitbox.setBox(_size[0], _size[1]);
                _pixelOffset = Math.round(this.timeOffset / this.timelineSize * this.width);
            }
        },
        "height": {
            "get": function () { return _size[1]; },
            "set": function (h) {
                _size[1] = h;
                hitbox.setBox(_size[0], _size[1]);
            }
        },
        "minHeight": {
            "get": function () { return _minHeight; },
            "set": function (mh) {
                _minHeight = Math.max(mh, 1);
            }
        },
        "minWidth": {
            "get": function () { return _minWidth; },
            "set": function (mw) {
                _minWidth = Math.max(mw, 1);
            }
        },
        "left": {
            "get": function () {
                return this.posX;
            },
            "set": function (l) {
                let oldL = this.posX;
                this.posX = l;
                this.width += oldL - l;
                this.width = Math.max(this.width, this.minWidth);
            }
        },
        "right": {
            "get": function () {
                return this.posX + this.width;
            },
            "set": function (r) {
                let oldR = this.posX + this.width;
                this.width += r - oldR;
                this.posX = Math.min(this.posX, this.posX + this.width);
                this.width = Math.max(this.width, this.minWidth);
            }
        },
        "top": {
            "get": function () {
                return this.posY;
            },
            "set": function (t) {
                let oldT = this.posY;
                this.posY = t;
                this.height += oldT - t;
                this.height = Math.max(this.height, this.minHeight);
            }
        },
        "bottom": {
            "get": function () {
                return this.posY + this.height;
            },
            "set": function (b) {
                let oldB = this.posY + this.height;
                this.height += b - oldB;
                this.posY = Math.min(this.posY, this.posY + this.height);
                this.height = Math.max(this.height, this.minHeight);
            }
        },
        "period": {
            "get": function () { return _period; },
            "set": function (p) {
                _period = p;
                _pixelOffset = Math.round(this.timeOffset / this.timelineSize * this.width);
                _advance = this.timelineSize / markerFreq;
            }
        },
        "timelineSize": {
            "get": function () { return _timelineSize; },
            "set": function (ts) {
                _timelineSize = ts;
                _advance = _timelineSize / markerFreq;
            }
        },
        "timeOffset": {
            "get": function () { return _timeOffset; },
            "set": function (to) {
                _timeOffset = Math.max(to, 0);
                _pixelOffset = Math.round(this.timeOffset / this.timelineSize * this.width);
            }
        },
        "pixelOffset": {
            "get": function () { return _pixelOffset; },
            "set": function (po) {
                _pixelOffset = Math.max(Math.round(po), 0);
                _timeOffset = Math.round(this.timeOffset / this.timelineSize * this.width);
            }
        }
    });
    this.period = 5000;



    this.updateAnim = (delta) => {
        curTime = (curTime + delta) % this.period;
        linePos = (curTime - this.timeOffset) / this.timelineSize;
        endLinePos = (this.period - this.timeOffset) / this.timelineSize;
    }
    var drawTimeMarker = (ctx, f, markerNum) => {
        let withStamp = (markerNum % markersPerStamp == 0);
        // line
        ctx.beginPath();
        let linePixelPos = f * this.width + this.posX - (this.pixelOffset % Math.floor(this.width / markerFreq));
        clr();
        log(Math.floor(this.width));
        log(Math.floor(markerFreq));
        log(Math.floor(this.width / markerFreq));
        // log((this.pixelOffset));
        // log(Math.floor(this.width / markerFreq));
        // log((this.pixelOffset % Math.floor(this.width / markerFreq)));
        // log(Math.floor(this.pixelOffset / Math.floor(this.width / markerFreq)));
        ctx.moveTo(linePixelPos, this.top);
        if (withStamp) { ctx.lineTo(linePixelPos, this.top + timeAreaHeight); }
        else { ctx.lineTo(linePixelPos, this.top + timeAreaHeight * 0.5); }
        ctx.strokeStyle = '#999';
        ctx.stroke();
        if (withStamp) {
            // timestamp
            let ms = this.advance * markerNum;
            this.textRender.text = formatTime(ms, 1);
            this.textRender.update();
            this.textRender.x = linePixelPos + 5;
            this.textRender.y = this.top + timeAreaHeight / 2;
            ctx.fillStyle = '#fff';
            this.textRender.draw(ctx);
        }
    }
    this.draw = (ctx) => {
        this.timelineSize = this.width;
        // main box
        ctx.beginPath();
        ctx.rect(this.posX, this.posY, this.width, this.height);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.lineWidth = 0;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        // time area
        ctx.beginPath();
        ctx.rect(this.posX, this.posY, this.width, timeAreaHeight);
        ctx.fill();
        ctx.stroke();
        let endTime = this.timelineSize + this.timeOffset + this.advance;
        let startMarker = Math.floor(this.pixelOffset / Math.floor(this.width / markerFreq));
        clr();
        for (let m = this.timeOffset, ma = startMarker; m < endTime; m += this.advance, ma++) {
            drawTimeMarker(ctx, (m - this.timeOffset) / this.timelineSize, ma);
        }
        // lines
        if (linePos >= 0.0 && linePos <= 1.0) {
            ctx.beginPath();
            let linePixelPos = linePos * this.width + this.posX;
            ctx.moveTo(linePixelPos, this.top + timeAreaHeight);
            ctx.lineTo(linePixelPos, this.bottom);
            ctx.strokeStyle = '#ff9';
            ctx.stroke();
        }
        if (endLinePos >= 0.0 && endLinePos <= 1.0) {
            ctx.beginPath();
            //(m - this.timeOffset) / timelineSize
            //endLinePos = (this.period - this.timeOffset) / timelineSize;
            let linePixelPos = endLinePos * this.width + this.posX;
            ctx.moveTo(linePixelPos, this.top + timeAreaHeight);
            ctx.lineTo(linePixelPos, this.bottom);
            ctx.strokeStyle = '#f99';
            ctx.stroke();
        }
    }
}