import $ from 'jquery'
import { Hitbox, addHitbox, checkHitboxEvents, vec, timeline, initHitboxEvents, globalPlaying } from './Canvas.js'
import { pnt, shape } from './VectorDrawing.js'
import { Keyframe, KeyframeList, keyframeTypes } from './VectorDrawing.js'
import { opList, degrees } from './Helpers.js'
import { addPoint, addShape, stopEditing, dropPoint, dragPoint, genShapeListName, setPropWindow } from './UI.js'
import { selectedPoint, selectedShape, grabbedPoint } from './UI.js'


export function showTooltip(mousePos, text) {
    let tooltip = $('#tooltip');
    tooltip.show();
    tooltip.offset({ left: mousePos[0] + 10, top: mousePos[1] + 15 });
    let offset = tooltip.offset();
    if (offset.left + tooltip.outerWidth() >= $(window).innerWidth()) {
        tooltip.offset({ left: $(window).innerWidth() - tooltip.outerWidth() });
    }
    if (offset.top + tooltip.outerHeight() >= $(window).innerHeight()) {
        tooltip.offset({ top: $(window).innerHeight() - tooltip.outerHeight() });
    }
    tooltip.text(text);
}

export function hideTooltip() {
    let tooltip = $('#tooltip');
    tooltip.hide();
}

export function initEvents() {
    let canvas = $('#drawingArea');
    // disable right click
    $('body').on('contextmenu', '#drawingArea', (e) => { return false; });
    // hitbox checking
    initHitboxEvents(canvas);
    $(document).keydown((event) => {
        if (event.which == 27) { // escape
            stopEditing();
        }
    });
    canvas.dblclick((event) => {
        if (globalPlaying) {
            return;
        }
        if (selectedPoint === null) {
            return;
        }
        let p1 = new pnt();
        p1.p = [event.pageX, event.pageY];
        addPoint(p1, selectedPoint);
    });
    canvas.mousemove((event) => {
        if (grabbedPoint === null) {
            return
        }
        dragPoint([event.pageX, event.pageY]);
    });
    $(document).mouseup((event) => {
        if (event.which == 1) { // left
            dropPoint();
        }
    });
    $(window).on('resize', (event) => {
        checkHitboxEvents(event);
    });
    // properties
    $('#shapeTypeSelect').on('change', function () {
        if (selectedShape === null) {
            return;
        }
        selectedShape.type = this.value;
        let itemId = '#shapeItem-' + selectedShape.name;
        $(itemId).html(genShapeListName(selectedShape));
        setPropWindow(this.value);
    });
    // point properties
    $('#pxProp, #pyProp').on('input', () => {
        if (selectedPoint === null) {
            return;
        }
        selectedPoint.p = [$('#pxProp').val(), $('#pyProp').val()];
    });
    $('#oxProp, #oyProp').on('input', () => {
        if (selectedPoint === null) {
            return;
        }
        selectedPoint.o = [$('#oxProp').val(), $('#oyProp').val()];
    });
    $('#rProp').on('input', () => {
        if (selectedPoint === null) {
            return;
        }
        selectedPoint.r = $('#rProp').val() / degrees;
    });
    $('#sxProp, #syProp').on('input', () => {
        if (selectedPoint === null) {
            return;
        }
        selectedPoint.s = [$('#sxProp').val(), $('#syProp').val()];
    });
    // polygon properties
    $('#pcProp').on('input', () => {
        if (selectedShape === null) {
            return;
        }
        selectedShape.color = $('#pcProp').val();
        let spanId = 'shapeSpan-' + selectedShape.name;
        $('#' + spanId).css('color', selectedShape.color);
    });
    // line properties
    $('#lcProp').on('input', () => {
        if (selectedShape === null) {
            return;
        }
        selectedShape.color = $('#lcProp').val();
        let spanId = 'shapeSpan-' + selectedShape.name;
        $('#' + spanId).css('color', selectedShape.color);
    });
    // filled circle properties
    $('#cfrProp, #cfcProp').on('input', () => {
        if (selectedShape === null) {
            return;
        }
        selectedShape.radius = $('#cfrProp').val();
        selectedShape.color = $('#cfcProp').val();
        let spanId = 'shapeSpan-' + selectedShape.name;
        $('#' + spanId).css('color', selectedShape.color);
    });
    // circle properties
    $('#corProp, #cocProp').on('input', () => {
        if (selectedShape === null) {
            return;
        }
        selectedShape.radius = $('#corProp').val();
        selectedShape.color = $('#cocProp').val();
        let spanId = 'shapeSpan-' + selectedShape.name;
        $('#' + spanId).css('color', selectedShape.color);
    });
    // bezier properties
    $('#bcProp').on('input', () => {
        if (selectedShape === null) {
            return;
        }
        selectedShape.color = $('#bcProp').val();
        let spanId = 'shapeSpan-' + selectedShape.name;
        $('#' + spanId).css('color', selectedShape.color);
    });
    //
    $(document).keypress((event) => {
        if (event.which == 122) { // z
            addShape(new shape('polygon', [], 'white'));
        }
        else if (event.which == 120) { // x
            addShape(new shape('line', [], 'white'));
        }
        else if (event.which == 99) { // c
            addShape(new shape('circleF', [], 'white', 20));
        }
        else if (event.which == 118) { // v
            addShape(new shape('circleO', [], 'white', 20));
        }
        else if (event.which == 98) { // b
            addShape(new shape('bezier', [], 'white'));
        }
    });
    let keyLists = vec.getElementKeyLists(vec.rootPnt);
    keyLists[0].addKeyframe(new Keyframe(2000, keyframeTypes.cosine, 200));
    keyLists[0].addKeyframe(new Keyframe(300, keyframeTypes.linear, 300));
    keyLists[0].addKeyframe(new Keyframe(1000, keyframeTypes.instant, 350));
}