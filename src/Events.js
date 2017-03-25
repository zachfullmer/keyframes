import $ from 'jquery'
import { Hitbox, addHitbox, checkHitboxEvents, vec } from './Canvas.js'
import { pnt } from './VectorDrawing.js'
import { opList, degrees } from './Helpers.js'
import { addPoint, selectedPoint } from './UI.js'


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
    //http://stackoverflow.com/questions/1056562/how-do-i-prevent-scrolling-with-arrow-keys-but-not-the-mouse
    var ar = new Array(33, 34, 35, 36, 37, 38, 39, 40);
    $('#pxProp, #pyProp').change(() => {
        selectedPoint.p = [$('#pxProp').val(), $('#pyProp').val()];
    });
    $('#oxProp, #oyProp').change(() => {
        selectedPoint.o = [$('#oxProp').val(), $('#oyProp').val()];
    });
    $('#rProp').change(() => {
        selectedPoint.r = $('#rProp').val() / degrees;
    });
    $('#sxProp, #syProp').change(() => {
        selectedPoint.s = [$('#sxProp').val(), $('#syProp').val()];
    });
}