const keyframeTypes = {
    instant: {
        id: 'instant',
        name: 'Instant',
        func: (a, b, f) => a,
        funcArr: (a, b, f) => a
    },
    linear: {
        id: 'linear',
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
        id: 'cosine',
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

function Keyframe(time, type, val = null, relative = false) {
    this.time = time;
    if (typeof type == 'string') {
        this.type = keyframeTypes[type];
    }
    else {
        this.type = type;
    }
    var _val = val;
    this.relative = relative;
    this.propInfo = null;
    this.parentList = null;
    this.toJson = () => {
        let obj = {};
        obj.time = this.time;
        obj.type = this.type.id;
        obj.relative = this.relative;
        obj.val = this.val.toString();
        return obj;
    }
    Object.defineProperties(this, {
        "val": {
            "get": function () { return _val; },
            "set": function (v) {
                if (typeof v == 'string') {
                    if (v[0] == '#') {
                        v = hexToRgb(v);
                    }
                    else if (v.indexOf(',') >= 0) {
                        let arr = v.split(',');
                        if (arr.length != 3) {
                            throw 'ERROR: invalid keyframe value "' + v + '"';
                        }
                        v = arr;
                    }
                    else {
                        v = parseFloat(v);
                    }
                }
                _val = v;
            }
        }
    });
    if (val !== null) {
        this.val = val;
    }
}

function KeyframeList(propInfo) {
    this.anim = null;
    var _propInfo = propInfo;
    Object.defineProperties(this, {
        "propInfo": {
            "get": function () { return _propInfo; }
        }
    });
    this.funcName = 'func';
    if (this.propInfo.type == 'num' || this.propInfo.type == 'deg') this.funcName = 'func';
    else if (this.propInfo.type == 'col') this.funcName = 'funcArr';
    this.keyframes = [];
    this.toJson = () => {
        let frames = [];
        for (let k in this.keyframes) {
            frames.push(this.keyframes[k].toJson());
        }
        let obj = {
            attr: _propInfo.jsonProp,
            keyframes: frames
        }
        return obj;
    }
    this.addKeyframe = (keyframe) => {
        keyframe.propInfo = this.propInfo;
        keyframe.parentList = this;
        if (this.anim !== null) {
            keyframe.time = Math.min(keyframe.time, this.anim.period);
        }
        keyframe.time = Math.max(keyframe.time, 0);
        if (keyframe.val === null) {
            if (this.propInfo.type == 'col') {
                keyframe.val = [255, 255, 255];
            }
            else {
                keyframe.val = 0;
            }
        }
        for (let k in this.keyframes) {
            if (keyframe.time < this.keyframes[k].time) {
                this.keyframes.splice(k, 0, keyframe);
                return;
            }
        }
        this.keyframes.push(keyframe);
    }
    this.removeKeyframe = (keyframe) => {
        let index = this.keyframes.indexOf(keyframe);
        if (index >= 0) {
            this.keyframes.splice(index, 1);
        }
    }
    this.sort = () => {
        this.keyframes.sort((a, b) => a.time - b.time);
    }
}

function pnt(name = '') {
    this.name = name;
    var _p = [0.0, 0.0]; // position
    var _o = [0.0, 0.0]; // origin
    var _r = 0.0; // rotation (radians)
    var _s = [1.0, 1.0]; // scale
    this.hitbox = new Hitbox(true);
    this.hitbox.setRad(8);
    addHitbox(this.hitbox, pointHitboxes);
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
        },
        "family": {
            "get": function () {
                let fam = [this];
                for (let c in this.children) {
                    fam = fam.concat(this.children[c].family);
                }
                return fam;
            }
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
    this.toJson = (parentJson = null) => {
        let obj = {};
        obj.name = this.name;
        if (this.children.length > 0) {
            obj.children = [];
            for (let c in this.children) {
                obj.children.push(this.children[c].toJson());
            }
        }
        return obj;
    }
    this.loadFromJson = (json) => {
        this.children.length = 0;
        this.name = json.name;
        for (let c in json.children) {
            let p = new pnt();
            p.loadFromJson(json.children[c]);
            this.children.push(p);
        }
    }
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
    this.draw = (ctx, offset, hi) => {
        if (hi.indexOf(this) >= 0) {
            ctx.beginPath();
            ctx.arc(this.pf[0] + offset[0], this.pf[1] + offset[1], 10, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.pf[0] + offset[0], this.pf[1] + offset[1], 5, 0, 2 * Math.PI, false);
            ctx.strokeStyle = 'yellow';
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(this.pf[0] + offset[0], this.pf[1] + offset[1], 10, 0, 2 * Math.PI, false);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.rect(this.pf[0] + offset[0], this.pf[1] + offset[1], 1, 1);
        ctx.fillStyle = 'white';
        ctx.fill();
        for (let c in this.children) {
            this.children[c].draw(ctx, offset, hi);
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
            removeHitbox(this.hitbox, pointHitboxes);
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


const shapeTypes = {
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


function shape(type, points, color = 'white', radius = 20) {
    var _color = '';
    var _colorRGB = [0, 0, 0];
    Object.defineProperties(this, {
        "colorRGB": {
            "get": function () { return _colorRGB; },
            "set": function (c) {
                _colorRGB = c;
                _color = rgbToHex(c[0], c[1], c[2]);
            }
        },
        "color": {
            "get": function () { return _color; },
            "set": function (c) {
                _color = colorNameToHex(c) || c;
                _colorRGB = hexToRgb(_color);
            }
        }
    });
    this.name = null;
    this.type = type;
    this.points = points;
    this.color = color;
    this.radius = radius;
    this.toJson = () => {
        let obj = {};
        obj.name = this.name;
        obj.type = this.type;
        obj.points = points.map(x => x.name);
        return obj;
    }
    this.getPointsByName = (name) => {
        let result = [];
        for (let p in this.points) {
            if (this.points[p].name == name) {
                result.push(this.points[p]);
            }
        }
        return result;
    }
    this.draw = (ctx, offset) => {
        if (this.type == 'polygon') {
            if (this.points.length < 1) {
                return;
            }
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.points[0].pf[0] + offset[0], this.points[0].pf[1] + offset[1]);
            for (let p = 1; p < this.points.length; p++) {
                ctx.lineTo(this.points[p].pf[0] + offset[0], this.points[p].pf[1] + offset[1]);
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
            ctx.moveTo(this.points[0].pf[0] + offset[0], this.points[0].pf[1] + offset[1]);
            for (let p = 1; p < this.points.length; p++) {
                ctx.lineTo(this.points[p].pf[0] + offset[0], this.points[p].pf[1] + offset[1]);
            }
            ctx.stroke();
        }
        else if (this.type == 'circleF') {
            if (this.points.length < 1) {
                return;
            }
            ctx.beginPath();
            ctx.arc(this.points[0].pf[0] + offset[0], this.points[0].pf[1] + offset[1], this.radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        else if (this.type == 'circleO') {
            if (this.points.length < 1) {
                return;
            }
            ctx.beginPath();
            ctx.arc(this.points[0].pf[0] + offset[0], this.points[0].pf[1] + offset[1], this.radius, 0, 2 * Math.PI, false);
            ctx.strokeStyle = this.color;
            ctx.stroke();
        }
        else if (this.type == 'bezier') {
            if (this.points.length < 4) {
                return;
            }
            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.moveTo(this.points[0].pf[0] + offset[0], this.points[0].pf[1] + offset[1]);
            ctx.bezierCurveTo(this.points[1].pf[0] + offset[0], this.points[1].pf[1] + offset[1],
                this.points[2].pf[0] + offset[0], this.points[2].pf[1] + offset[1],
                this.points[3].pf[0] + offset[0], this.points[3].pf[1] + offset[1]);
            ctx.stroke();
        }
    }
}


function anim(name, isDefault) {
    this.name = name;
    this.isDefault = isDefault;
    var _period = 1000;
    this.animData = [];
    this.toJson = () => {
        let obj = {};
        obj.name = this.name;
        obj.period = this.period;
        obj.refs = [];
        for (let d in this.animData) {
            let lists = {};
            lists.keyLists = [];
            for (let l in this.animData[d][1]) {
                let lJson = this.animData[d][1][l].toJson();
                if (lJson.keyframes.length > 0) {
                    lists.keyLists.push(lJson);
                }
            }
            if (lists.keyLists.length > 0) {
                lists.ref = this.animData[d][0].name;
                obj.refs.push(lists);
            }
        }
        return obj;
    }
    Object.defineProperties(this, {
        "period": {
            "get": function () { return _period; },
            "set": function (p) {
                if (p < 0) {
                    return;
                }
                _period = p;
                for (let a in this.animData) {
                    for (let l in this.animData[a][1]) {
                        for (let k in this.animData[a][1][l].keyframes) {
                            let key = this.animData[a][1][l].keyframes[k];
                            timeline.moveKeyframe(key, key.time);
                        }
                    }
                }
            }
        }
    });
    function getKeyValue(list, kIndex) {
        if (list[kIndex][1].relative) {
            let lookBackIndex = kIndex - 1;
            let val = list[kIndex][1].val;
            while (lookBackIndex >= 0) {
                if (list[lookBackIndex][1].relative) {
                    val += list[lookBackIndex][1].val;
                }
                else {
                    break;
                }
                lookBackIndex--;
            }
            if (lookBackIndex >= 0) {
                val += list[lookBackIndex][1].val;
            }
            return val;
        }
        else {
            return list[kIndex][1].val;
        }
    }
    function getKeyListValue(time, listInfo, listPeriod, prevList, prevListPeriod, nextList) {
        let fullList = prevList.map(t => [0, t]).concat(
            listInfo.keyframes.map(t => [prevListPeriod, t])).concat(
                nextList.map(t => [listPeriod + prevListPeriod, t]));
        let k = 0;
        if (fullList.length == 0) {
            return null;
        }
        else {
            while (k < fullList.length) {
                if (fullList[k][1].time + fullList[k][0] > time) {
                    k -= 1;
                    break;
                }
                k++;
            }
        }
        if (k < 0) {
            return getKeyValue(fullList, 0);
        }
        else if (k >= fullList.length - 1) {
            return getKeyValue(fullList, fullList.length - 1);
        }
        else {
            let kVal = getKeyValue(fullList, k);
            let kNextVal = null;
            if (fullList[k + 1][1].relative) {
                kNextVal = kVal + fullList[k + 1][1].val;
            }
            else {
                kNextVal = fullList[k + 1][1].val;
            }
            let cTime = fullList[k][1].time + fullList[k][0];
            let nextTime = fullList[k + 1][1].time + fullList[k + 1][0];
            let dt = time - cTime;
            let keyDiff = nextTime - cTime;
            return fullList[k + 1][1].type[listInfo.funcName](kVal, kNextVal, dt / keyDiff);
        }
    }
    this.updateValues = (time, prevAnim = null, nextAnim = null) => {
        for (let e in this.animData) {
            for (let k in this.animData[e][1]) {
                let keyListInfo = this.animData[e][1][k];
                let prevKeyList = (prevAnim ? prevAnim.animData[e][1][k].keyframes : []);
                let nextKeyList = (nextAnim ? nextAnim.animData[e][1][k].keyframes : []);
                let prevKeyPeriod = (prevAnim ? prevAnim.period : 0);
                let nextKeyPeriod = (nextAnim ? nextAnim.period : 0);
                let finalVal = getKeyListValue(time, keyListInfo, this.period, prevKeyList, prevKeyPeriod, nextKeyList);
                if (finalVal !== null) {
                    this.animData[e][0][keyListInfo.propInfo.varName] = finalVal;
                }
            }
        }
    }
    this.addAnimData = (animData) => {
        this.animData.push(animData);
        for (let a in animData[1]) {
            animData[1][a].anim = this;
        }
    }
    this.setAnimData = (index, animData) => {
        this.animData[index] = animData;
        for (let a in animData[1]) {
            animData[1][a].anim = this;
        }
    }
}


function VectorDrawing() {
    this.rootPnt = null;
    var highlightedPoints = [];
    this.shapes = [];
    this.anims = [];
    var _currentAnim = null;
    this.preAnim = null;
    this.postAnim = null;
    Object.defineProperties(this, {
        "currentAnim": {
            "get": function () { return _currentAnim; },
            "set": function (a) { _currentAnim = a; }
        },
    });
    this.hiPoint = (point) => {
        highlightedPoints.push(point);
    }
    this.loPoint = (point) => {
        let index = highlightedPoints.indexOf(point);
        highlightedPoints.splice(index, 1);
    }
    this.draw = (ctx, offset) => {
        for (let e in this.shapes) {
            this.shapes[e].draw(ctx, offset);
        }
    }
    this.update = () => {
        this.rootPnt.update(null);
    }
    this.debugDraw = (ctx, offset) => {
        this.rootPnt.draw(ctx, offset, highlightedPoints);
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
    this.getInitPointInfo = (point, anim) => {
        let pointInfo = [point];
        let propInfo = [];
        let pointType = propTypes['point'];
        for (let p in pointType) {
            let kl = new KeyframeList(pointType[p]);
            if (anim.isDefault) {
                kl.addKeyframe(new Keyframe(0, keyframeTypes.instant, point[pointType[p].jsonProp]));
            }
            propInfo.push(kl);
        }
        pointInfo.push(propInfo);
        return pointInfo;
    }
    this.addPoint = (point, parent) => {
        if (parent === null) {
            this.rootPnt = point;
        }
        else {
            parent.addChild(point);
        }
        for (let a in this.anims) {
            let pointInfo = this.getInitPointInfo(point, this.anims[a]);
            this.anims[a].addAnimData(pointInfo);
        }
    }
    this.removePoint = (point) => {
        let result = this.rootPnt.removePoint(point);
        if (result !== null) {
            for (let a in this.anims) {
                for (let k in this.anims[a].animData) {
                    if (this.anims[a].animData[k][0] === point) {
                        this.anims[a].animData.splice(k, 1);
                        break;
                    }
                }
            }
        }
        return result;
    }
    this.getInitShapeInfo = (shape, anim) => {
        let shapeInfo = [shape];
        let propInfo = [];
        let shapeType = propTypes[shape.type];
        for (let p in shapeType) {
            let kl = new KeyframeList(shapeType[p]);
            if (anim.isDefault) {
                kl.addKeyframe(new Keyframe(0, keyframeTypes.instant, shape[shapeType[p].jsonProp]));
            }
            propInfo.push(kl);
        }
        shapeInfo.push(propInfo);
        return shapeInfo;
    }
    this.addShape = (shape) => {
        for (let a in this.anims) {
            let shapeInfo = this.getInitShapeInfo(shape, this.anims[a]);
            this.anims[a].addAnimData(shapeInfo);
        }
        this.shapes.push(shape);
    }
    this.updateShapeType = (shape) => {
        for (let a in this.anims) {
            let shapeInfo = this.getInitShapeInfo(shape, this.anims[a]);
            for (var s in this.anims[a].animData) {
                if (this.anims[a].animData[s][0] === shape) {
                    this.anims[a].setAnimData(s, shapeInfo);
                    break;
                }
            }
        }
    }
    this.removeShape = (shape) => {
        let index = this.shapes.indexOf(shape);
        if (index > -1) {
            this.shapes.splice(index, 1);
            for (let a in this.anims) {
                for (let k in this.anims[a].animData) {
                    if (this.anims[a].animData[k][0] === shape) {
                        this.anims[a].animData.splice(k, 1);
                        break;
                    }
                }
            }
        }
    }
    this.addAnim = (anim) => {
        for (let s in this.shapes) {
            anim.addAnimData(this.getInitShapeInfo(this.shapes[s], anim));
        }
        if (this.rootPnt !== null) {
            let points = this.rootPnt.family;
            for (let p in points) {
                anim.addAnimData(this.getInitPointInfo(points[p], anim));
            }
        }
        this.anims.push(anim);
    }
    this.getElementKeyLists = (element, anim = this.currentAnim) => {
        if (anim !== null) {
            for (let k in anim.animData) {
                if (anim.animData[k][0] === element) {
                    return anim.animData[k][1];
                }
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
    this.toJson = () => {
        let obj = {};
        obj.root = this.rootPnt.toJson();
        obj.shapes = [];
        for (let s in this.shapes) {
            obj.shapes.push(this.shapes[s].toJson());
        }
        obj.anims = [];
        for (let a in this.anims) {
            obj.anims.push(this.anims[a].toJson());
        }
        return obj;
    }
    this.loadFromJson = (json) => {
        this.clear();
        this.rootPnt.loadFromJson(json.root);
        for (let js in json.shapes) {
            let shapeJson = json.shapes[js];
            let points = [];
            for (let p in shapeJson.points) {
                points.push(this.getPointByName(shapeJson.points[p]));
            }
            let s = new shape(shapeJson.type, points);
            s.name = shapeJson.name;
            this.shapes.push(s);
        }
        this.anims.length = 0;
        for (let a in json.anims) {
            let an = new anim(json.anims[a].name, false);
            an.period = json.anims[a].period;
            isDefault = false;
            let refList = [];
            this.addAnim(an);
            for (let r in json.anims[a].refs) {
                let refJson = json.anims[a].refs[r];
                let ref = this.getPointByName(refJson.ref);
                let type = null;
                let keyLists = [];
                if (ref === null) {
                    ref = this.getShapeByName(refJson.ref);
                    type = ref.type;
                }
                else {
                    type = 'point';
                }
                let destRef = null;
                for (let re in an.animData) {
                    if (an.animData[re][0] === ref) {
                        destRef = an.animData[re];
                    }
                }
                if (destRef === null) {
                    throw 'ERROR: ref not found';
                }
                for (let l in refJson.keyLists) {
                    let listJson = refJson.keyLists[l];
                    let propType = null;
                    let kl = null;
                    for (let j in destRef[1]) {
                        if (listJson.attr == destRef[1][j].propInfo.jsonProp) {
                            kl = destRef[1][j];
                            break;
                        }
                    }
                    if (kl === null) {
                        throw 'unable to find keylist "' + refJson.keyLists[l].attr + '"'
                    }
                    for (let k in listJson.keyframes) {
                        let key = listJson.keyframes[k];
                        kl.addKeyframe(new Keyframe(key.time, key.type, key.val, key.relative));
                    }
                }
            }
        }
    }
    this.clear = () => {
        // clear points
        pointHitboxes.length = 0;
        this.rootPnt = new pnt('rootPoint');
        // clear shapes
        this.shapes.length = 0;
        // clear anims
        this.anims = [new anim('default', true)];
        // other properties
        this.preAnim = null;
        this.postAnim = null;
    }
    function executeOnPoint(point, parent, func) {
        func(point, parent);
        for (let c in point.children) {
            executeOnPoint(point.children[c], point, func);
        }
    }
    this.forEachPoint = (func) => {
        executeOnPoint(this.rootPnt, null, func);
    }

    this.clear();
}