import { polarToCart, cartToPolar, opList } from './Helpers.js'


export function pnt() {
    this.p = [0, 0];
    this.r = 0;
    this.s = [1.0, 1.0];
    var final = [0, 0];
    var children = [];
    this.addChild = (child) => {
        children.push(child);
    }
    this.update = (parent) => {
        final = opList(final, this.p, (a, b) => b);
        if (parent !== null) {
            // scale
            final = opList(final, parent.s, (a, b) => a * b);
            // rotate
            let polar = cartToPolar(final);
            polar[1] += parent.r;
            final = polarToCart(polar);
            // translate
            final = opList(final, parent.p, (a, b) => a + b);
        }
        for (let c in children) {
            children[c].update(this);
        }
    }
    this.draw = (ctx) => {
        ctx.beginPath();
        ctx.rect(final[0], final[1], 1, 1);
        ctx.fillStyle = 'white';
        ctx.fill();
        for (let c in children) {
            children[c].draw(ctx);
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