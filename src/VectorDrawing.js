import { polarToCart, cartToPolar, opList, colorNameToHex, copyList } from './Helpers.js'
import { Hitbox, addHitbox, removeHitbox } from './Canvas.js'


export function pnt() {
    this.name = '';
    var _p = [0.0, 0.0]; // position
    var _o = [0.0, 0.0]; // origin
    var _r = 0.0; // rotation (radians)
    var _s = [1.0, 1.0]; // scale
    this.hitbox = new Hitbox(true);
    this.hitbox.setRad(8);
    addHitbox(this.hitbox);
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
    this._parent = null;
    Object.defineProperties(this, {
        "parent": {
            "get": function () { return this._parent; }
        }
    });
    this.transform = (point) => {
        // origin
        point = opList(point, this.of, (a, b) => a + b);
        // scale
        point = opList(point, this.sf, (a, b) => a * b);
        // rotate
        let polar = cartToPolar(point);
        polar[1] += this.rf;
        point = polarToCart(polar);
        // translate
        point = opList(point, this.pf, (a, b) => a + b);
        return point;
    }
    this.inverseTransform = (point) => {
        point = opList(point, this.pf, (a, b) => a - b);
        // rotate
        let polar = cartToPolar(point);
        polar[1] -= this.rf;
        point = polarToCart(polar);
        // scale
        point = opList(point, this.sf, (a, b) => a / b);
        // origin
        point = opList(point, this.of, (a, b) => a - b);
        return point;
    }
    this.addChild = (child) => {
        child._parent = this;
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
        // hitbox
        this.hitbox.setPos(this.pf[0], this.pf[1]);
        // children
        for (let c in this.children) {
            this.children[c].update(this);
        }
    }
    this.draw = (ctx, hi) => {
        if (hi.indexOf(this) >= 0) {
            ctx.beginPath();
            ctx.arc(this.pf[0], this.pf[1], 10, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.pf[0], this.pf[1], 5, 0, 2 * Math.PI, false);
            ctx.strokeStyle = 'yellow';
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(this.pf[0], this.pf[1], 10, 0, 2 * Math.PI, false);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.rect(this.pf[0], this.pf[1], 1, 1);
        ctx.fillStyle = 'white';
        ctx.fill();
        for (let c in this.children) {
            this.children[c].draw(ctx, hi);
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
    this.removePoint = (point, parent = null, index = null) => {
        if (this === point) {
            if (parent === null) {
                throw "Tried to remove root point";
            }
            removeHitbox(this.hitbox);
            parent.children.splice(index, 1);
            return copyList(this.children);
        }
        for (let c in this.children) {
            let result = this.children[c].removePoint(point, this, c);
            if (result !== null) {
                return result;
            }
        }
        return null;
    }
}


export const shapeTypes = {
    polygon: {
        id: 0,
        name: 'Polygon',
        unicode: '\u25A0',
    },
    line: {
        id: 1,
        name: 'Line',
        unicode: '\u2015'
    },
    circleF: {
        id: 2,
        name: 'Filled Circle',
        unicode: '\u25CF'
    },
    circleO: {
        id: 3,
        name: 'Circle',
        unicode: '\u25CB'
    },
    bezier: {
        id: 4,
        name: 'Bezier Curve',
        unicode: '\u223F'
    }
}


export function shape(type, points, color = 'white', radius = 20) {
    this.name = '';
    this.type = type;
    this.points = points;
    this.color = colorNameToHex(color);
    this.radius = radius;
    this.getPointsByName = (name) => {
        let result = [];
        for (let p in this.points) {
            if (this.points[p].name == name) {
                result.push(this.points[p]);
            }
        }
        return result;
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
    this.rootPnt = null;
    var highlightedPoints = [];
    this.elements = [];
    this.hiPoint = (point) => {
        highlightedPoints.push(point);
    }
    this.loPoint = (point) => {
        let index = highlightedPoints.indexOf(point);
        highlightedPoints.splice(index, 1);
    }
    this.draw = (ctx) => {
        for (let e in this.elements) {
            this.elements[e].draw(ctx);
        }
    }
    this.update = () => {
        this.rootPnt.update(null);
    }
    this.debugDraw = (ctx) => {
        this.rootPnt.draw(ctx, highlightedPoints);
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
    this.removePoint = (point) => {
        return this.rootPnt.removePoint(point);
    }
}