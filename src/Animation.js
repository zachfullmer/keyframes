

export function Timeline() {
    this.period = 1.0;
    var pos = [0.0, 0.0];
    this.size = [100.0, 100.0];
    Object.defineProperties(this, {
        "left": {
            "set": function (l) {
                let oldL = pos[0];
                pos[0] = l;
                this.size[0] += oldL - l;
                this.size[0] = Math.max(this.size[0], 1);
            }
        },
        "right": {
            "set": function (r) {
                let oldR = pos[0] + this.size[0];
                this.size[0] += r - oldR;
                pos[0] = Math.min(pos[0], pos[0] + this.size[0]);
                this.size[0] = Math.max(this.size[0], 1);
            }
        },
        "top": {
            "set": function (t) {
                let oldT = pos[1];
                pos[1] = t;
                this.size[1] += oldT - t;
                this.size[1] = Math.max(this.size[1], 1);
            }
        },
        "bottom": {
            "set": function (b) {
                let oldB = pos[1] + this.size[1];
                this.size[1] += b - oldB;
                pos[1] = Math.min(pos[1], pos[1] + this.size[1]);
                this.size[1] = Math.max(this.size[1], 1);
            }
        },
    });
    this.draw = (ctx) => {
        ctx.beginPath();
        ctx.rect(pos[0], pos[1], this.size[0], this.size[1]);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
    }
}