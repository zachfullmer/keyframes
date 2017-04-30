// global drawing constants
const maxDelta = 20;
// canvas stuff
var ctx = null;
var canvas = null;
var hitboxes = [];
function addHitbox(hitbox) {
    hitboxes.push(hitbox);
}
function removeHitbox(hitbox) {
    hitboxes.splice(hitboxes.indexOf(hitbox), 1);
}
function checkHitboxEvents(event) {
    let hits = [];
    for (let h in hitboxes) {
        if (hitboxes[h].contains(event.pageX, event.pageY)) {
            hits.push(hitboxes[h]);
        }
        else {
            if (hitboxes[h].hover == true) {
                let type = event.type;
                event.type = 'mouseleave';
                hitboxes[h].execute(event);
                event.type = type;
            }
            hitboxes[h].hover = false;
        }
    }
    for (let h in hits) {
        hits[h].execute(event);
        if (hits[h].hover == false) {
            let type = event.type;
            event.type = 'mouseenter';
            hits[h].execute(event);
            event.type = type;
        }
        hits[h].hover = true;
    }
}

var globalPlaying = false;
var globalTime = 0;
var timeline = new Timeline();
var vec = new VectorDrawing();
function initCanvas(context) {
    ctx = context;
    canvas = $('#drawingArea')[0];
    updateTimelinePos();
    window.requestAnimationFrame(drawCanvas);
}

function setGlobalTime(newTime) {
    timeline.curTime = newTime;
    globalTime = newTime;
    for (let e in vec.currentAnim) {
        for (let k in vec.currentAnim[e][1]) {
            let keyList = vec.currentAnim[e][1][k];
            let finalVal = keyList.getValue(globalTime);
            vec.currentAnim[e][0][keyList.propInfo.varName] = finalVal;
        }
    }
    updatePropWindow();
}
function pauseGlobalTime() {
    globalPlaying = false;
    $('.prop-window-item').prop('disabled', false);
}
function playGlobalTime() {
    globalPlaying = true;
    $('.prop-window-item').prop('disabled', true);
}

function updateTimelinePos() {
    timeline.left = 200;
    timeline.right = window.innerWidth;
    timeline.bottom = window.innerHeight;
    timeline.top = window.innerHeight - 150;
}

function resizeCanvas() {
    if (ctx.canvas.width != window.innerWidth ||
        ctx.canvas.height != window.innerHeight) {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
        if (canvas.resize !== undefined) {
            canvas.resize(ctx.canvas.width, ctx.canvas.height);
        }
        updateTimelinePos();
    }
}

var lastT = null;
function drawCanvas(timestamp) {
    if (lastT === null) {
        lastT = timestamp;
    }
    let delta = Math.min(timestamp - lastT, maxDelta);
    lastT = timestamp;
    resizeCanvas();
    // animation
    vec.update();
    if (globalPlaying) {
        setGlobalTime((globalTime + delta) % timeline.period);
    }
    //
    // drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    vec.draw(ctx);
    vec.debugDraw(ctx);
    timeline.draw(ctx);
    //
    window.requestAnimationFrame(drawCanvas);
}

function initHitboxEvents(eventRoot) {
    eventRoot.on('click dblclick mousemove mousedown mouseup mousewheel DOMMouseScroll', (event) => {
        if (event.type == 'DOMMouseScroll') {
            event.type = 'mousewheel';
            event.originalEvent.wheelDelta = event.originalEvent.detail;
        }
        checkHitboxEvents(event);
    });
}