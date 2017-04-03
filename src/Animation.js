import $ from 'jquery'
import { Text } from './Text.js'

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
    // text
    const fontSize = 10;
    const fontFace = 'Arial';
    const markerFreq = 18;
    const markersPerStamp = 3;
    var _timeOffset = 0;
    var _pixelOffset = 0;
    var _advance = 0;
    this.textRender = Object.create(Text).init(formatTime(10));
    this.textRender.originX = 0.0;
    this.textRender.originY = 0.5;
    this.textRender.fontSize = fontSize;
    this.textRender.fontFamily = fontFace;
    this.textRender.update();
    // time
    var curTime = 0;
    var _period = 0;
    // drawing
    const timeAreaHeight = 20;
    var _minWidth = 1;
    var _minHeight = timeAreaHeight;
    var linePos = 0.0;
    var pos = [0.0, 0.0];
    var _size = [100.0, 100.0];
    Object.defineProperties(this, {
        "advance": {
            "get": function () { return _advance; }
        },
        "width": {
            "get": function () { return _size[0]; },
            "set": function (w) { _size[0] = w; }
        },
        "height": {
            "get": function () { return _size[1]; },
            "set": function (h) { _size[1] = h; }
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
                return pos[0];
            },
            "set": function (l) {
                let oldL = pos[0];
                pos[0] = l;
                this.width += oldL - l;
                this.width = Math.max(this.width, this.minWidth);
                _pixelOffset = this.timeOffset / this.period * this.width;
            }
        },
        "right": {
            "get": function () {
                return pos[0] + this.width;
            },
            "set": function (r) {
                let oldR = pos[0] + this.width;
                this.width += r - oldR;
                pos[0] = Math.min(pos[0], pos[0] + this.width);
                this.width = Math.max(this.width, this.minWidth);
                _pixelOffset = this.timeOffset / this.period * this.width;
            }
        },
        "top": {
            "get": function () {
                return pos[1];
            },
            "set": function (t) {
                let oldT = pos[1];
                pos[1] = t;
                this.height += oldT - t;
                this.height = Math.max(this.height, this.minHeight);
            }
        },
        "bottom": {
            "get": function () {
                return pos[1] + this.height;
            },
            "set": function (b) {
                let oldB = pos[1] + this.height;
                this.height += b - oldB;
                pos[1] = Math.min(pos[1], pos[1] + this.height);
                this.height = Math.max(this.height, this.minHeight);
            }
        },
        "period": {
            "get": function () { return _period; },
            "set": function (p) {
                _period = p;
                _pixelOffset = this.timeOffset / this.period * this.width;
                _advance = _period / markerFreq;
            }
        },
        "timeOffset": {
            "get": function () { return _timeOffset; },
            "set": function (to) {
                _timeOffset = Math.max(to, 0);
                _pixelOffset = this.timeOffset / this.period * this.width;
            }
        },
        "pixelOffset": {
            "get": function () { return _pixelOffset; }
        }
    });
    this.period = 5000;



    this.updateAnim = (delta) => {
        curTime = (curTime + delta) % this.period;
        linePos = curTime / this.period;
    }
    var drawTimeMarker = (ctx, f, markerNum) => {
        let withStamp = (markerNum % markersPerStamp == 0);
        // line
        ctx.beginPath();
        let linePixelPos = f * this.width + pos[0] - this.pixelOffset % (this.width / markerFreq);
        ctx.moveTo(linePixelPos, this.top);
        if (withStamp) {
            ctx.lineTo(linePixelPos, this.top + timeAreaHeight);
        }
        else {
            ctx.lineTo(linePixelPos, this.top + timeAreaHeight * 0.5);
        }
        ctx.strokeStyle = '#999';
        ctx.stroke();
        if (withStamp) {
            // timestamp
            let ms = this.advance * markerNum;
            this.textRender.text = formatTime(ms, 3);
            this.textRender.update();
            this.textRender.x = linePixelPos + 5;
            this.textRender.y = this.top + timeAreaHeight / 2;
            ctx.fillStyle = '#fff';
            this.textRender.draw(ctx);
        }
    }
    this.draw = (ctx) => {
        // main box
        ctx.beginPath();
        ctx.rect(pos[0], pos[1], this.width, this.height);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.lineWidth = 0;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        // time area
        ctx.beginPath();
        ctx.rect(pos[0], pos[1], this.width, timeAreaHeight);
        ctx.fill();
        ctx.stroke();
        // const markerFreq = 18;
        // const stampFreq = 6;
        // var _period = 5000;
        let endTime = this.period + this.timeOffset;
        for (let m = this.timeOffset, ma = Math.floor(this.timeOffset / this.advance); m < endTime; m += this.advance, ma++) {
            drawTimeMarker(ctx, (m - this.timeOffset) / this.period, ma);
        }
        // line
        ctx.beginPath();
        let linePixelPos = linePos * this.width + pos[0];
        ctx.moveTo(linePixelPos, this.top + timeAreaHeight);
        ctx.lineTo(linePixelPos, this.bottom);
        ctx.strokeStyle = '#f99';
        ctx.stroke();
    }
}