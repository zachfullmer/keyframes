function Hitbox(circle = false) {
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    this.r = 0;
    this.circle = circle;
    this.hover = false;
    var _mouseenter = [];
    var _mouseleave = [];
    var _mousemove = [];
    var _mousedown = [];
    var _mouseup = [];
    var _mousewheel = [];
    var _click = [];
    var _dblclick = [];
    this.execute = (event) => {
        let list = null;
        switch ('_' + event.type) {
            case '_mouseenter':
                list = _mouseenter;
                break;
            case '_mouseleave':
                list = _mouseleave;
                break;
            case '_mousemove':
                list = _mousemove;
                break;
            case '_mousedown':
                list = _mousedown;
                break;
            case '_mouseup':
                list = _mouseup;
                break;
            case '_mousewheel':
                list = _mousewheel;
                break;
            case '_click':
                list = _click;
                break;
            case '_dblclick':
                list = _dblclick;
                break;
            default:
                break;
        }
        for (let e in list) {
            list[e](event);
        }
    }
    this.mouseenter = (func) => {
        _mouseenter.push(func);
    }
    this.mouseleave = (func) => {
        _mouseleave.push(func);
    }
    this.mousemove = (func) => {
        _mousemove.push(func);
    }
    this.mousedown = (func) => {
        _mousedown.push(func);
    }
    this.mouseup = (func) => {
        _mouseup.push(func);
    }
    this.mousewheel = (func) => {
        _mousewheel.push(func);
    }
    this.click = (func) => {
        if (func === undefined) {
            this.execute({ type: 'click' });
            return;
        }
        _click.push(func);
    }
    this.dblclick = (func) => {
        _dblclick.push(func);
    }
    this.setPos = (x, y) => {
        this.x = x;
        this.y = y;
    }
    this.setBox = (w, h) => {
        this.w = w;
        this.h = h;
    }
    this.setRad = (r) => {
        this.r = r;
    }
    this.contains = (x, y) => {
        if (this.circle) {
            let dist = Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
            return (dist < this.r);
        }
        return (x >= this.x && x < this.x + this.w && y >= this.y && y < this.y + this.h);
    }
    this.draw = (ctx) => {
        if (this.circle) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'red';
            ctx.stroke();
        }
        else {
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.w, this.h);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'red';
            ctx.stroke();
        }
    }
}