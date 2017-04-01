import { Text } from './Text.js'

function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

function formatTime(ms, decimals = 3) {
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
    const stampFreq = 3;
    this.textRender = Object.create(Text).init(formatTime(10));
    this.textRender.originX = 0.0;
    this.textRender.originY = 0.5;
    this.textRender.fontSize = fontSize;
    this.textRender.fontFamily = fontFace;
    this.textRender.update();
    // time
    var curTime = 0;
    var period = 5000;
    // drawing
    const timeAreaHeight = 20;
    var _minWidth = 1;
    var _minHeight = timeAreaHeight;
    var linePos = 0.0;
    var pos = [0.0, 0.0];
    this.size = [100.0, 100.0];
    Object.defineProperties(this, {
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
                this.size[0] += oldL - l;
                this.size[0] = Math.max(this.size[0], _minWidth);
            }
        },
        "right": {
            "get": function () {
                return pos[0] + this.size[0];
            },
            "set": function (r) {
                let oldR = pos[0] + this.size[0];
                this.size[0] += r - oldR;
                pos[0] = Math.min(pos[0], pos[0] + this.size[0]);
                this.size[0] = Math.max(this.size[0], _minWidth);
            }
        },
        "top": {
            "get": function () {
                return pos[1];
            },
            "set": function (t) {
                let oldT = pos[1];
                pos[1] = t;
                this.size[1] += oldT - t;
                this.size[1] = Math.max(this.size[1], _minHeight);
            }
        },
        "bottom": {
            "get": function () {
                return pos[1] + this.size[1];
            },
            "set": function (b) {
                let oldB = pos[1] + this.size[1];
                this.size[1] += b - oldB;
                pos[1] = Math.min(pos[1], pos[1] + this.size[1]);
                this.size[1] = Math.max(this.size[1], _minHeight);
            }
        }
    });
    this.updateAnim = (delta) => {
        curTime = (curTime + delta) % period;
        linePos = curTime / period;
    }
    var drawTimeMarker = (ctx, f, withStamp) => {
        // line
        ctx.beginPath();
        let linePixelPos = f * this.size[0] + pos[0];
        ctx.moveTo(linePixelPos, this.top);
        if (withStamp) {
            ctx.lineTo(linePixelPos, this.top + timeAreaHeight);
        }
        else {
            ctx.lineTo(linePixelPos, this.top + timeAreaHeight * 0.5);
        }
        ctx.stroke();
        if (withStamp) {
            // timestamp
            let ms = period * f;
            this.textRender.text = formatTime(ms, 1);
            this.textRender.update();
            this.textRender.x = linePixelPos + 5;
            this.textRender.y = this.top + timeAreaHeight / 2;
            ctx.fillStyle = '#ffffff';
            this.textRender.draw(ctx);
        }
    }
    this.draw = (ctx) => {
        // main box
        ctx.beginPath();
        ctx.rect(pos[0], pos[1], this.size[0], this.size[1]);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.lineWidth = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        // time area
        ctx.beginPath();
        ctx.rect(pos[0], pos[1], this.size[0], timeAreaHeight);
        ctx.fill();
        ctx.stroke();
        let stampCount = -1;
        for (let m = 0, ma = 0; m < period; m += period / markerFreq, ma++) {
            let newStampCount = Math.floor(stampFreq / markerFreq * ma);
            if (stampCount != newStampCount) {
                drawTimeMarker(ctx, m / period, true);
                stampCount = newStampCount;
            }
            else {
                drawTimeMarker(ctx, m / period, false);
            }
        }
        // drawTimeMarker(ctx, 0.25, true);
        // drawTimeMarker(ctx, 0.50, true);
        // drawTimeMarker(ctx, 0.75, true);
        // line
        ctx.beginPath();
        let linePixelPos = linePos * this.size[0] + pos[0];
        ctx.moveTo(linePixelPos, this.top + timeAreaHeight);
        ctx.lineTo(linePixelPos, this.bottom);
        ctx.stroke();
    }
}