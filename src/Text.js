// this text object is adapted from code posted here: https://tinyurl.com/hdj777h
// it has added color and stroke attributes

// The Text object type.
export var Text = {
    // static
    measureText: function (text, fontSize, fontFamily) {
        var w, h, div = Text.measureText.div || document.createElement('div');
        div.style.font = fontSize + 'px/' + fontSize + 'px ' + fontFamily;
        div.style.padding = '0';
        div.style.margin = '0';
        div.style.position = 'absolute';
        div.style.visibility = 'hidden';
        div.innerHTML = text;
        if (!Text.measureText.div) document.body.appendChild(div);
        w = div.clientWidth;
        h = div.clientHeight;
        Text.measureText.div = div;
        return { width: w, height: h };
    },
    text: '',
    fontSize: 24,
    fontFamily: 'Arial',
    prevState: '',
    x: 0,
    y: 0,
    originX: 0.0,
    originY: 0.0,
    strokeWidth: 0,
    color: 'white',
    strokeColor: 'black',
    dirty: false,
    c: null,
    ctx: null,
    init: function (text) {
        if (text) this.text = text + '';
        this.c = document.createElement('canvas');
        this.ctx = this.c.getContext('2d');
        return this;
    },
    state: function () {
        return [this.fontSize, this.fontFamily, this.text, this.strokeWidth, this.color, this.strokeColor].join(',');
    },
    update: function () {
        var s = this.state();
        this.dirty = s !== this.prevState;
        this.prevState = s;

        // Measure phase
        if (this.dirty) this.measure();
    },
    measure: function () {
        var m = Text.measureText(this.text, this.fontSize, this.fontFamily);
        this.c.width = m.width + this.strokeWidth;
        this.c.height = m.height + this.strokeWidth;
    },
    draw: function (ctx) {
        this.render();
        ctx.save();
        // Offset the result by our registration point.
        ctx.translate(-this.originX * this.c.width, -this.originY * this.c.height);
        // Draw and translate.
        ctx.drawImage(this.c, this.x, this.y);
        ctx.restore();
    },
    render: function () {
        if (!this.dirty) return;
        this.ctx.font = this.fontSize + 'px/' + this.fontSize + 'px ' + this.fontFamily;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        if (this.strokeWidth > 0) {
            this.ctx.lineWidth = this.strokeWidth;
            this.ctx.strokeStyle = this.strokeColor;
            this.ctx.strokeText(this.text, this.c.width / 2, this.c.height / 2);
        }
        this.ctx.fillStyle = this.color;
        this.ctx.fillText(this.text, this.c.width / 2, this.c.height / 2);
        this.dirty = false;
    }
};