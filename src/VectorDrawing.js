import { polarToCart, cartToPolar, opList, colorNameToHex } from './Helpers.js'


export function pnt() {
    this.p = [0, 0]; // position
    this.o = [0, 0]; // origin
    this.r = 0; // rotation (radians)
    this.s = [1.0, 1.0]; // scale
    this.final = [0, 0];
    var children = [];
    this.addChild = (child) => {
        children.push(child);
    }
    this.update = (parent) => {
        this.final = opList(this.final, this.p, (a, b) => b);
        if (parent !== null) {
            // origin
            this.final = opList(this.final, parent.o, (a, b) => a + b);
            // scale
            this.final = opList(this.final, parent.s, (a, b) => a * b);
            // rotate
            let polar = cartToPolar(this.final);
            polar[1] += parent.r;
            this.final = polarToCart(polar);
            // translate
            this.final = opList(this.final, parent.p, (a, b) => a + b);
        }
        for (let c in children) {
            children[c].update(this);
        }
    }
    this.draw = (ctx) => {
        ctx.beginPath();
        ctx.rect(this.final[0], this.final[1], 1, 1);
        ctx.fillStyle = 'white';
        ctx.fill();
        for (let c in children) {
            children[c].draw(ctx);
        }
    }
}


export function shape(type, points, color = 'white') {
    this.type = type;
    this.points = points;
    this.color = colorNameToHex(color);
    this.draw = (ctx) => {
        if (this.type == 'polygon') {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(points[0].final[0], points[0].final[1]);
            for (let p = 1; p < points.length; p++) {
                ctx.lineTo(points[p].final[0], points[p].final[1]);
            }
            ctx.closePath();
            ctx.fill();
        }
        else if (this.type == 'line') {
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(points[0].final[0], points[0].final[1]);
            ctx.lineTo(points[1].final[0], points[1].final[1]);
            ctx.closePath();
            ctx.stroke();
        }
        else if (this.type == 'circleF') {
            ctx.beginPath();
            ctx.arc(points[0].final[0], points[0].final[1], this.radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = color;
            ctx.fill();
        }
        else if (this.type == 'circleO') {
            ctx.beginPath();
            ctx.arc(points[0].final[0], points[0].final[1], this.radius, 0, 2 * Math.PI, false);
            ctx.strokeStyle = color;
            ctx.stroke();
        }
        else if (this.type == 'bezier') {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.moveTo(points[0].final[0], points[0].final[1]);
            ctx.bezierCurveTo(points[1].final[0], points[1].final[1],
                points[2].final[0], points[2].final[1],
                points[3].final[0], points[3].final[1]);
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
}