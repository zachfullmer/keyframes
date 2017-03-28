import { polarToCart, cartToPolar, opList, colorNameToHex } from './Helpers.js'


export function pnt() {
    this.name = '';
    var _p = [0.0, 0.0]; // position
    var _o = [0.0, 0.0]; // origin
    var _r = 0.0; // rotation (radians)
    var _s = [1.0, 1.0]; // scale
    // getters and setters
    Object.defineProperties(this, {
        "p": {
            "get": function () { return _p; },
            "set": function (p) { _p[0] = parseFloat(p[0]); _p[1] = parseFloat(p[1]); }
        },
        "o": {
            "get": function () { return _o; },
            "set": function (o) { _o[0] = parseFloat(o[0]); _o[1] = parseFloat(o[1]); }
        },
        "r": {
            "get": function () { return _r; },
            "set": function (r) { _r = parseFloat(r); }
        },
        "s": {
            "get": function () { return _s; },
            "set": function (s) { _s[0] = parseFloat(s[0]); _s[1] = parseFloat(s[1]); }
        }
    });
    this.pf = [0.0, 0.0];
    this.of = [0.0, 0.0];
    this.rf = 0.0;
    this.sf = [1.0, 1.0];
    this.children = [];
    this.addChild = (child) => {
        this.children.push(child);
    }
    this.update = (parent) => {
        this.pf = opList(this.pf, this.p, (a, b) => b);
        if (parent === null) {
            this.pf = this.p;
            this.of = this.o;
            this.rf = this.r;
            this.sf = this.s;
        }
        else {
            // origin
            this.pf = opList(this.pf, parent.of, (a, b) => a + b);
            this.of = opList(this.o, parent.of, (a, b) => a + b);
            // scale
            this.pf = opList(this.pf, parent.sf, (a, b) => a * b);
            this.sf = opList(this.s, parent.sf, (a, b) => a * b);
            // rotate
            let polar = cartToPolar(this.pf);
            polar[1] += parent.rf;
            this.pf = polarToCart(polar);
            this.rf = this.r + parent.rf;
            // translate
            this.pf = opList(this.pf, parent.pf, (a, b) => a + b);
        }
        for (let c in this.children) {
            this.children[c].update(this);
        }
    }
    this.draw = (ctx) => {
        ctx.beginPath();
        ctx.rect(this.pf[0], this.pf[1], 1, 1);
        ctx.fillStyle = 'white';
        ctx.fill();
        for (let c in this.children) {
            this.children[c].draw(ctx);
        }
    }
    this.getPointByName = (name) => {
        if (this.name == name) {
            return this;
        }
        for (let c in this.children) {
            let result = this.children[c].getPointByName(name);
            if (result !== null) {
                return result;
            }
        }
        return null;
    }
}


export function shape(type, points, color = 'white', radius = undefined) {
    this.name = '';
    this.type = type;
    this.points = points;
    this.color = colorNameToHex(color);
    if (radius !== undefined) {
        this.radius = radius;
    }
    this.draw = (ctx) => {
        if (this.type == 'polygon') {
            if (this.points.length < 1) {
                return;
            }
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.points[0].pf[0], this.points[0].pf[1]);
            for (let p = 1; p < this.points.length; p++) {
                ctx.lineTo(this.points[p].pf[0], this.points[p].pf[1]);
            }
            ctx.closePath();
            ctx.fill();
        }
        else if (this.type == 'line') {
            if (this.points.length < 2) {
                return;
            }
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.points[0].pf[0], this.points[0].pf[1]);
            for (let p = 1; p < this.points.length; p++) {
                ctx.lineTo(this.points[p].pf[0], this.points[p].pf[1]);
            }
            ctx.stroke();
        }
        else if (this.type == 'circleF') {
            if (this.points.length < 1) {
                return;
            }
            ctx.beginPath();
            ctx.arc(this.points[0].pf[0], this.points[0].pf[1], this.radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        else if (this.type == 'circleO') {
            if (this.points.length < 1) {
                return;
            }
            ctx.beginPath();
            ctx.arc(this.points[0].pf[0], this.points[0].pf[1], this.radius, 0, 2 * Math.PI, false);
            ctx.strokeStyle = this.color;
            ctx.stroke();
        }
        else if (this.type == 'bezier') {
            if (this.points.length < 4) {
                return;
            }
            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.moveTo(this.points[0].pf[0], this.points[0].pf[1]);
            ctx.bezierCurveTo(this.points[1].pf[0], this.points[1].pf[1],
                this.points[2].pf[0], this.points[2].pf[1],
                this.points[3].pf[0], this.points[3].pf[1]);
            ctx.stroke();
        }
    }
}


export function VectorDrawing() {
    this.rootPnt = new pnt();
    this.elements = [];
    this.draw = (ctx) => {
        for (let e in this.elements) {
            this.elements[e].draw(ctx);
        }
    }
    this.update = () => {
        this.rootPnt.update(null);
    }
    this.debugDraw = (ctx) => {
        this.rootPnt.draw(ctx);
    }
    this.getPointByName = (name) => {
        return this.rootPnt.getPointByName(name);
    }
    this.getShapeByName = (name) => {
        for (let e in this.elements) {
            if (this.elements[e].name == name) {
                return this.elements[e];
            }
        }
        return null;
    }
}