

export function Timeline() {
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
    this.draw = (ctx) => {
        // main box
        ctx.beginPath();
        ctx.rect(pos[0], pos[1], this.size[0], this.size[1]);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        // time area
        ctx.beginPath();
        ctx.rect(pos[0], pos[1], this.size[0], timeAreaHeight);
        ctx.fill();
        ctx.stroke();
        // line
        ctx.beginPath();
        let linePixelPos = linePos * this.size[0] + pos[0];
        ctx.moveTo(linePixelPos, this.top + timeAreaHeight);
        ctx.lineTo(linePixelPos, this.bottom);
        ctx.stroke();
        console.log(linePixelPos);
    }
}