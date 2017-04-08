import { polarToCart, cartToPolar, opList, colorNameToHex, copyList, hexToRgb, rgbToHex } from './Helpers.js'
import { Hitbox, addHitbox, removeHitbox } from './Canvas.js'
import { propTypes } from './UI.js';


export const keyframeTypes = {
    instant: {
        name: 'Instant',
        func: (a, b, f) => a,
        funcArr: (a, b, f) => a
    },
    linear: {
        name: 'Linear',
        func: (a, b, f) => a + (b - a) * f,
        funcArr: (a, b, f) => {
            let col = [];
            for (let x in a) {
                col.push(a[x] + (b[x] - a[x]) * f);
            }
            return col;
        }
    },
    cosine: {
        name: 'Cosine',
        func: (a, b, f) => {
            let fCosine = (1 - Math.cos(f * Math.PI)) / 2;
            return (a * (1 - fCosine) + b * fCosine);
        },
        funcArr: (a, b, f) => {
            let fCosine = (1 - Math.cos(f * Math.PI)) / 2;
            let col = [];
            for (let x in a) {
                col.push((a[x] * (1 - fCosine) + b[x] * fCosine));
            }
            return col;
        }
    }
};

export function Keyframe(time, type, val) {
    this.time = time;
    this.type = type;
    this.val = val;
}

export function KeyframeList(kType, name) {
    this.name = name;
    var _type = kType;
    Object.defineProperties(this, {
        "type": {
            "get": function () { return _type; }
        },
    });
    var funcName = 'func';
    if (kType == 'num') funcName = 'func';
    else if (kType == 'col') funcName = 'funcArr';
    this.keyframes = [];
    this.addKeyframe = (keyframe) => {
        for (let k in this.keyframes) {
            if (keyframe.time < this.keyframes[k].time) {
                this.keyframes.splice(k, 0, keyframe);
                return;
            }
        }
        this.keyframes.push(keyframe);
        if (this.keyframes.length > 1)
            console.log(this.keyframes);
    }
    this.getValue = (time) => {
        let k = 0;
        while (k < this.keyframes.length) {
            if (this.keyframes[k].time > time) {
                k -= 1;
                break;
            }
            k++;
        }
        if (k >= this.keyframes.length - 1) {
            return this.keyframes[k - 1].val;
        }
        else {
            let dt = time - this.keyframes[k].time;
            let keyDiff = this.keyframes[k + 1].time - this.keyframes[k].time;
            return this.keyframes[k + 1].type[funcName](this.keyframes[k].val, this.keyframes[k + 1].val, dt / keyDiff);
        }
    }
}

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
        "px": {
            "get": function () { return _p[0]; },
            "set": function (px2) { _p[0] = parseFloat(px2); }
        },
        "py": {
            "get": function () { return _p[1]; },
            "set": function (py2) { _p[1] = parseFloat(py2); }
        },
        "ox": {
            "get": function () { return _o[0]; },
            "set": function (ox2) { _o[0] = parseFloat(ox2); }
        },
        "oy": {
            "get": function () { return _o[1]; },
            "set": function (oy2) { _o[1] = parseFloat(oy2); }
        },
        "r": {
            "get": function () { return _r; },
            "set": function (r2) { _r = parseFloat(r2); }
        },
        "sx": {
            "get": function () { return _s[0]; },
            "set": function (sx2) { _s[0] = parseFloat(sx2); }
        },
        "sy": {
            "get": function () { return _s[1]; },
            "set": function (sy2) { _s[1] = parseFloat(sy2); }
        },
        "p": {
            "get": function () { return _p; },
            "set": function (p2) { _p[0] = parseFloat(p2[0]); _p[1] = parseFloat(p2[1]); }
        },
        "o": {
            "get": function () { return _o; },
            "set": function (o2) { _o[0] = parseFloat(o2[0]); _o[1] = parseFloat(o2[1]); }
        },
        "r": {
            "get": function () { return _r; },
            "set": function (r2) { _r = parseFloat(r2); }
        },
        "s": {
            "get": function () { return _s; },
            "set": function (s2) { _s[0] = parseFloat(s2[0]); _s[1] = parseFloat(s2[1]); }
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
        unicode: '\u25A0'
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
    var _color = '';
    var _colorRGB = [0, 0, 0];
    Object.defineProperties(this, {
        "colorRGB": {
            "get": function () { return _colorRGB; },
            "set": function (c) { _colorRGB = c; _color = rgbToHex(c[0], c[1], c[2]); }
        },
        "color": {
            "get": function () { return _color; },
            "set": function (c) { _color = colorNameToHex(c); _colorRGB = hexToRgb(_color); }
        }
    });
    this.name = '';
    this.type = type;
    this.points = points;
    this.color = color;
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
    this.shapes = [];
    this.anims = [[]];
    var _currentAnim = null;
    Object.defineProperties(this, {
        "currentAnim": {
            "get": function () { return _currentAnim; },
            "set": function (a) { _currentAnim = a; }
        },
    });
    this.currentAnim = this.anims[0];
    this.hiPoint = (point) => {
        highlightedPoints.push(point);
    }
    this.loPoint = (point) => {
        let index = highlightedPoints.indexOf(point);
        highlightedPoints.splice(index, 1);
    }
    this.draw = (ctx) => {
        for (let e in this.shapes) {
            this.shapes[e].draw(ctx);
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
        for (let e in this.shapes) {
            if (this.shapes[e].name == name) {
                return this.shapes[e];
            }
        }
        return null;
    }
    this.addPoint = (point, parent) => {
        if (parent === null) {
            this.rootPnt = point;
        }
        else {
            parent.addChild(point);
        }
        let pointInfo = [point];
        let propInfo = [];
        let pointType = propTypes['point'];
        for (let p in pointType) {
            let kl = new KeyframeList(pointType[p].type, pointType[p].varName);
            kl.addKeyframe(new Keyframe(0, keyframeTypes.instant, point[pointType[p].varName]));
            propInfo.push(kl);
        }
        pointInfo.push(propInfo);
        for (let a in this.anims) {
            this.anims[a].push(pointInfo);
        }
    }
    this.removePoint = (point) => {
        let result = this.rootPnt.removePoint(point);
        if (result !== null) {
            for (let a in this.anims) {
                for (let k in this.anims[a]) {
                    if (this.anims[a][k][0] === point) {
                        this.anims[a].splice(k, 1);
                        break;
                    }
                }
            }
        }
        return result;
    }
    this.addShape = (shape) => {
        let shapeInfo = [shape];
        let propInfo = [];
        let shapeType = propTypes[shape.type];
        for (let p in shapeType) {
            let kl = new KeyframeList(shapeType[p].type, shapeType[p].varName);
            kl.addKeyframe(new Keyframe(0, keyframeTypes.instant, shape[shapeType[p].varName]));
            propInfo.push(kl);
        }
        shapeInfo.push(propInfo);
        for (let a in this.anims) {
            this.anims[a].push(shapeInfo);
        }
        this.shapes.push(shape);
    }
    this.removeShape = (shape) => {
        let index = this.shapes.indexOf(shape);
        if (index > -1) {
            this.shapes.splice(index, 1);
            for (let a in this.anims) {
                for (let k in this.anims[a]) {
                    if (this.anims[a][k][0] === shape) {
                        this.anims[a].splice(k, 1);
                        break;
                    }
                }
            }
        }
    }
    this.getElementKeyLists = (element) => {
        for (let k in this.currentAnim) {
            if (this.currentAnim[k][0] === element) {
                return this.currentAnim[k][1];
            }
        }
        return null;
    }
    this.updateKeyLists = (element) => {
        let keyLists = this.getElementKeyLists(element);
        for (let k in keyLists) {
            //console.log(keyLists[k].keyframes[0].val);
        }
    }
}