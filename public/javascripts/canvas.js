// global drawing constants
const maxDelta = 20;
// canvas stuff
var ctx = null;
var canvas = null;
var globalCamera = [0, 0];
var draggingCamera = false;
var pointHitboxes = [];
var timelineHitboxes = [];
function addHitbox(hitbox, hitboxList) {
    hitboxList.push(hitbox);
}
function removeHitbox(hitbox, hitboxList) {
    hitboxList.splice(hitboxList.indexOf(hitbox), 1);
}
function checkHitboxEvents(event, hitboxList, cam) {
    event.pageX -= cam[0];
    event.pageY -= cam[1];
    let hits = [];
    for (let h in hitboxList) {
        if (hitboxList[h].contains(event.pageX, event.pageY)) {
            hits.push(hitboxList[h]);
        }
        else {
            if (hitboxList[h].hover == true) {
                let type = event.type;
                event.type = 'mouseleave';
                hitboxList[h].execute(event);
                event.type = type;
            }
            hitboxList[h].hover = false;
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
    return (hits.length > 0);
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
    vec.currentAnim.updateValues(newTime, preAnim, postAnim);
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

function drawCrosshair(ctx) {
    ctx.strokeStyle = '#0b1639';
    ctx.beginPath();
    ctx.moveTo(0, 0 + globalCamera[1]);
    ctx.lineTo(window.innerWidth, 0 + globalCamera[1]);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0 + globalCamera[0], 0);
    ctx.lineTo(0 + globalCamera[0], window.innerHeight);
    ctx.stroke();
}

function centerCamera() {
    globalCamera = [$(window).width() / 2, $(window).height() / 2];
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
        setGlobalTime((globalTime + delta) % (timeline.period + timeline.prePeriod + timeline.postPeriod));
    }
    //
    // drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCrosshair(ctx);
    vec.draw(ctx, globalCamera);
    vec.debugDraw(ctx, globalCamera);
    timeline.draw(ctx);
    //
    window.requestAnimationFrame(drawCanvas);
}

function initHitboxEvents(eventRoot) {
    var lastMouse = null;
    let moved = null;
    eventRoot.on('click dblclick mousemove mousedown mouseup mousewheel DOMMouseScroll mouseleave', (event) => {
        if (event.type == 'DOMMouseScroll') {
            event.type = 'mousewheel';
            event.originalEvent.wheelDelta = event.originalEvent.detail;
        }
        if (event.type == 'mouseup' || event.type == 'mouseleave') {
            draggingCamera = false;
        }
        if (event.type == 'mousemove') {
            if (lastMouse === null) {
                lastMouse = [0, 0];
            }
            let last = [lastMouse[0], lastMouse[1]];
            lastMouse = [event.pageX, event.pageY];
            let current = [lastMouse[0], lastMouse[1]];
            moved = [current[0] - last[0], current[1] - last[1]];
        }
        if (!checkHitboxEvents(event, timelineHitboxes, [0, 0]) &&
            !checkHitboxEvents(event, pointHitboxes, globalCamera)) {
            if (event.type == 'mousedown') {
                draggingCamera = true;
            }
            else if (event.type == 'mousemove' && draggingCamera) {
                //$('#pointNameSpan-rootPoint').text('[' + (event.pageX - lastMouse[0]) + ',' + (event.pageY - lastMouse[1]) + ']');
                globalCamera[0] += moved[0];
                globalCamera[1] += moved[1];
            }
        }
    });
}