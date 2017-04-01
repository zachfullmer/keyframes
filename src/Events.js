import $ from 'jquery'
import { Hitbox, addHitbox, checkHitboxEvents, vec, timeline } from './Canvas.js'
import { pnt, shape } from './VectorDrawing.js'
import { opList, degrees } from './Helpers.js'
import { addPoint, addShape, stopEditing, dropPoint, dragPoint, genShapeListName, setPropWindow } from './UI.js'
import { selectedPoint, selectedShape, grabbedPoint } from './UI.js'


export function initEvents() {
    let canvas = $('#drawingArea');
    $(document).keydown((event) => {
        if (event.which == 37) { // left
            timeline.timeOffset -= 1;
        }
        else if (event.which == 39) { // right
            timeline.timeOffset += 1;
        }
    });
    // disable right click
    $('body').on('contextmenu', '#drawingArea', (e) => { return false; });
    // hitbox checking
    canvas.on('click dblclick mousemove mousedown', (event) => {
        checkHitboxEvents(event);
    });
    $(document).keydown((event) => {
        if (event.which == 27) { // escape
            stopEditing();
        }
    });
    canvas.dblclick((event) => {
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
}