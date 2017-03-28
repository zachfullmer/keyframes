import $ from 'jquery'
import { Hitbox, addHitbox, checkHitboxEvents, vec } from './Canvas.js'
import { pnt, shape } from './VectorDrawing.js'
import { opList, degrees } from './Helpers.js'
import { addPoint, selectedPoint, addShape, selectedShape } from './UI.js'


export function initEvents() {
    let canvas = $('#drawingArea')[0];
    // disable right click
    $('body').on('contextmenu', '#drawingArea', (e) => { return false; });
    $('#drawingArea').on('click dblclick', (event) => {
        checkHitboxEvents(event);
    });
    $('#drawingArea').dblclick((event) => {
        let p1 = new pnt();
        p1.p = [event.pageX, event.pageY];
        addPoint(p1);
    });
    $(window).on('resize', (event) => {
        checkHitboxEvents(event);
    });
    // point properties
    $('#pxProp, #pyProp').on('input', () => {
        selectedPoint.p = [$('#pxProp').val(), $('#pyProp').val()];
    });
    $('#oxProp, #oyProp').on('input', () => {
        selectedPoint.o = [$('#oxProp').val(), $('#oyProp').val()];
    });
    $('#rProp').on('input', () => {
        selectedPoint.r = $('#rProp').val() / degrees;
    });
    $('#sxProp, #syProp').on('input', () => {
        selectedPoint.s = [$('#sxProp').val(), $('#syProp').val()];
    });
    // polygon properties
    $('#pcProp').on('input', () => {
        selectedShape.color = $('#pcProp').val();
    });
    // line properties
    $('#lcProp').on('input', () => {
        selectedShape.color = $('#lcProp').val();
    });
    // filled circle properties
    $('#cfrProp, #cfcProp').on('input', () => {
        selectedShape.radius = $('#cfrProp').val();
        selectedShape.color = $('#cfcProp').val();
    });
    // circle properties
    $('#corProp, #cocProp').on('input', () => {
        selectedShape.radius = $('#corProp').val();
        selectedShape.color = $('#cocProp').val();
    });
    // bezier properties
    $('#bcProp').on('input', () => {
        selectedShape.color = $('#bcProp').val();
    });
}