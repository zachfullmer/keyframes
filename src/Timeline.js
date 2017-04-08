import $ from 'jquery'
import { Text } from './Text.js'
import { Hitbox, addHitbox, setGlobalTime } from './Canvas.js'
import { showTooltip, hideTooltip } from './Events.js'
import { propTypes } from './UI.js'

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

function formatTime(ms, decimals) {
    let overflow = Math.pow(10, decimals);
    ms = Math.round(ms);
    decimals = Math.min(Math.max(0, decimals), 3);
    let minutes = Math.floor(ms / 60000);
    let seconds = Math.floor(ms / 1000);
    while (seconds >= 60) {
        seconds -= 60;
        minutes += 1;
    }
    if (decimals == 0) {
        return pad(minutes, 2) + ':' + pad(seconds, 2);
    }
    let milli = ms % 1000;
    milli = Math.round(milli / Math.pow(10, (3 - decimals)));
    while (milli >= overflow) {
        milli -= overflow;
        seconds += 1;
    }
    return pad(minutes, 2) + ':' + pad(seconds, 2) + '.' + pad(milli, decimals);
}

export function Timeline() {
    var pThis = this;
    // hitbox
    var hitbox = new Hitbox();
    var grabbed = false;
    hitbox.mousedown((event) => {
        if (event.which == 1) { // left button
            grabbed = true;
        }
        else if (event.which == 2) { // middle button
            pThis.timelinePeriod = defaultTimelinePeriod;
        }
    });
    hitbox.click((event) => {
        if (event.which == 1) { // left button
            let t = getTime(event.pageX - pThis.left - infoAreaWidth) + 2 * pThis.timeOffset;
            if (t >= 0) {
                setGlobalTime(t);
            }
        }
    });
    $(document).mouseup(() => {
        grabbed = false;
    });
    $(document).mousemove(function (event) {
        if (!this.lastMouse) this.lastMouse = [0, 0];
        if (grabbed) {
            let moved = [event.pageX - this.lastMouse[0], event.pageY - this.lastMouse[1]];
            pThis.pixelOffset -= moved[0];
        }
        this.lastMouse = [event.pageX, event.pageY];
        if (hitbox.contains(this.lastMouse[0], this.lastMouse[1])) {
            let t = getTime(event.pageX - pThis.left - infoAreaWidth) + 2 * pThis.timeOffset;
            if (t < 0) {
                hideTooltip();
            }
            else {
                showTooltip(this.lastMouse, formatTime(t, 3));
            }
        }
        else {
            hideTooltip();
        }
    });
    hitbox.mousewheel((e) => {
        if (e.originalEvent.wheelDelta > 0) {
            pThis.timelinePeriod *= 1.2;
        }
        else {
            pThis.timelinePeriod /= 1.2;
        }
    });
    addHitbox(hitbox);
    // text
    const stampFontSize = 10;
    const propFontSize = 12;
    const fontFace = 'Arial';
    const markerFreq = 18;
    const markersPerStamp = 3;
    const defaultTimelinePeriod = 3000;
    var _displayDecimals = 1;
    this.stampText = Object.create(Text).init('');
    this.stampText.originX = 0.0;
    this.stampText.originY = 0.5;
    this.stampText.fontSize = stampFontSize;
    this.stampText.fontFamily = fontFace;
    this.stampText.update();
    this.propText = Object.create(Text).init('');
    this.propText.originX = 1.0;
    this.propText.originY = 0.5;
    this.propText.fontSize = propFontSize;
    this.propText.fontFamily = fontFace;
    this.propText.update();
    var laneNames = [];
    // time
    var _period = 0;
    var _timeOffset = 0;
    var _advance = 0;
    var _timelinePeriod = defaultTimelinePeriod;
    // drawing
    const timeAreaHeight = 20;
    const infoAreaWidth = 100;
    var _pixelOffset = 0;
    var _minWidth = infoAreaWidth;
    var _minHeight = timeAreaHeight;
    var linePos = 0.0;
    var endLinePos = 0.0;
    var _pos = [0.0, 0.0];
    var _size = [100.0, 100.0];
    var _laneNum = 5;
    var _laneSize = 10;
    var objType = 'none';
    Object.defineProperties(this, {
        "laneNum": {
            "get": function () {
                return _laneNum;
            },
            "set": function (ln) {
                _laneNum = ln;
                _laneSize = (this.height - timeAreaHeight) / _laneNum;
            }
        },
        "laneSize": { "get": function () { return _laneSize; } },
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
        "timeAreaWidth": {
            "get": function () { return this.width - infoAreaWidth; }
        },
        "advance": {
            "get": function () { return _advance; },
            "set": function (a) {
                _advance = a;
                let adv = _advance * markersPerStamp;
                _displayDecimals = 3;
                // if (adv >= 10000) {
                //     _displayDecimals = 0;
                // }
                // else if (adv >= 1000) {
                //     _displayDecimals = 1;
                // }
                // else if (adv >= 100) {
                //     _displayDecimals = 2;
                // }
                // else {
                //     _displayDecimals = 3;
                // }
            }
        },
        "displayDecimals": {
            "get": function () { return _displayDecimals; }
        },
        "width": {
            "get": function () { return _size[0]; },
            "set": function (w) {
                _size[0] = w;
                hitbox.setBox(_size[0], _size[1]);
                _pixelOffset = this.timeOffset / this.timelinePeriod * this.timeAreaWidth;
            }
        },
        "height": {
            "get": function () { return _size[1]; },
            "set": function (h) {
                _size[1] = h;
                hitbox.setBox(_size[0], _size[1]);
                _laneSize = (this.height - timeAreaHeight) / _laneNum;
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
                _pixelOffset = this.timeOffset / this.timelinePeriod * this.timeAreaWidth;
                this.advance = this.timelinePeriod / markerFreq;
            }
        },
        "timelinePeriod": {
            "get": function () { return _timelinePeriod; },
            "set": function (ts) {
                _timelinePeriod = ts;
                this.advance = _timelinePeriod / markerFreq;
            }
        },
        "timeOffset": {
            "get": function () { return _timeOffset; },
            "set": function (to) {
                _timeOffset = Math.max(to, 0);
                _pixelOffset = (this.timeOffset / this.timelinePeriod * this.timeAreaWidth);
            }
        },
        "pixelOffset": {
            "get": function () { return _pixelOffset; },
            "set": function (po) {
                _pixelOffset = Math.max((po), 0);
                _timeOffset = (this.timelinePeriod / this.timeAreaWidth * _pixelOffset);
            }
        }
    });
    this.period = 10000;

    this.setObjType = (type) => {
        objType = type;
        this.laneNum = propTypes[type].length;
        laneNames.length = 0;
        for (let p in propTypes[type]) {
            laneNames.push(propTypes[type][p].name);
        }
    }
    var getPixelPos = (time) => {
        let oTime = time - this.timeOffset;
        return oTime * this.timeAreaWidth / this.timelinePeriod;
    }
    var getTime = (pixel) => {
        let oPixel = pixel - this.pixelOffset;
        return oPixel * this.timelinePeriod / this.timeAreaWidth;
    }
    var drawTimeMarker = (ctx, time, markerNum) => {
        let markerAdvance = this.timeAreaWidth / markerFreq;
        let withStamp = ((markerNum + Math.floor(this.pixelOffset / markerAdvance) % markersPerStamp) % markersPerStamp == 0);
        let linePixelPos = this.posX + infoAreaWidth + (markerNum * markerAdvance);
        linePixelPos -= this.pixelOffset % markerAdvance;
        // line
        ctx.beginPath();
        ctx.moveTo(linePixelPos, this.top);
        if (withStamp) { ctx.lineTo(linePixelPos, this.top + timeAreaHeight); }
        else { ctx.lineTo(linePixelPos, this.top + timeAreaHeight * 0.5); }
        ctx.strokeStyle = '#999';
        ctx.stroke();
        if (withStamp) {
            // timestamp
            this.stampText.text = formatTime(time, this.displayDecimals);
            this.stampText.update();
            this.stampText.x = linePixelPos + 5;
            this.stampText.y = this.top + timeAreaHeight / 2;
            ctx.fillStyle = '#fff';
            this.stampText.draw(ctx);
        }
    }
    const keyframeSize = 5;
    var drawKeyframe = (ctx, lane, time) => {
        let pixPos = getPixelPos(time);
        if (pixPos + keyframeSize < 0 || pixPos - keyframeSize >= this.width) {
            return;
        }
        let kPos = [this.left + infoAreaWidth + pixPos, this.top + timeAreaHeight + this.laneSize * (lane + 0.5)];
        ctx.beginPath();
        ctx.moveTo(kPos[0], kPos[1] - keyframeSize);
        ctx.lineTo(kPos[0] + keyframeSize, kPos[1]);
        ctx.lineTo(kPos[0], kPos[1] + keyframeSize);
        ctx.lineTo(kPos[0] - keyframeSize, kPos[1]);
        ctx.closePath();
        ctx.fillStyle = '#662';
        ctx.fill();
        ctx.strokeStyle = '#ff9';
        ctx.stroke();
    }
    this.draw = (ctx, time, keyLists) => {
        ctx.strokeStyle = '#fff';

        /* timeline area */
        // box bg
        ctx.beginPath();
        ctx.rect(this.posX + infoAreaWidth, this.posY, this.width - infoAreaWidth, this.height);
        ctx.fillStyle = '#000';
        ctx.fill();
        // current time
        let linePixelPos = getPixelPos(time) + this.left + infoAreaWidth;
        if (linePixelPos >= this.left + infoAreaWidth && linePixelPos < this.right) {
            ctx.beginPath();
            ctx.moveTo(linePixelPos, this.top + timeAreaHeight);
            ctx.lineTo(linePixelPos, this.bottom);
            ctx.strokeStyle = '#ff9';
            ctx.stroke();
        }
        // end time
        linePixelPos = getPixelPos(this.period) + this.left + infoAreaWidth;
        if (linePixelPos >= this.left + infoAreaWidth && linePixelPos < this.right) {
            ctx.beginPath();
            ctx.moveTo(linePixelPos, this.top + timeAreaHeight);
            ctx.lineTo(linePixelPos, this.bottom);
            ctx.strokeStyle = '#ff9';
            ctx.stroke();
        }
        // keyframes
        if (keyLists !== null) {
            if (keyLists.length != this.laneNum) {
                throw 'ERROR';
            }
            for (let k in keyLists) {
                for (let f in keyLists[k].keyframes) {
                    drawKeyframe(ctx, parseInt(k), keyLists[k].keyframes[f].time);
                }
            }
        }

        /* time area */
        ctx.beginPath();
        ctx.rect(this.posX + infoAreaWidth, this.posY, this.width, timeAreaHeight);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        let endTime = this.timelinePeriod + this.timeOffset + this.advance;
        let markerAdvance = this.timeAreaWidth / markerFreq;
        let ta = Math.floor(this.timeOffset / this.advance);
        for (let m = this.timeOffset, ma = 0; m < endTime; m += this.advance, ma++) {
            drawTimeMarker(ctx, (m - this.timeOffset) + (this.advance * ta), ma);
        }

        /* info area */
        // box bg
        ctx.beginPath();
        ctx.rect(this.posX, this.posY, infoAreaWidth, this.height);
        ctx.fillStyle = '#000';
        ctx.fill();
        // text
        for (let t in laneNames) {
            this.propText.text = laneNames[t];
            this.propText.update();
            // this.propText.c.width
            let tPos = [this.left + infoAreaWidth - 20, this.top + timeAreaHeight + this.laneSize * (parseInt(t) + 0.5)];
            this.propText.x = tPos[0];
            this.propText.y = tPos[1];
            ctx.fillStyle = '#fff';
            this.propText.draw(ctx);
        }
        // lanes
        let startPos = this.top + timeAreaHeight;
        for (let k = 0; k < this.laneNum; k++) {
            ctx.beginPath();
            let yPos = startPos + k * this.laneSize;
            ctx.moveTo(this.left, yPos);
            ctx.lineTo(this.right, yPos);
            ctx.strokeStyle = '#333';
            ctx.stroke();
        }
        // box
        ctx.beginPath();
        ctx.rect(this.posX, this.posY, infoAreaWidth, this.height);
        ctx.lineWidth = 0;
        ctx.strokeStyle = '#fff';
        ctx.stroke();

        /* all */
        // box
        ctx.beginPath();
        ctx.rect(this.posX, this.posY, this.width, this.height);
        ctx.strokeStyle = '#fff';
        ctx.stroke();
    }
}