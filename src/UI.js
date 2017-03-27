import $ from 'jquery'
import { Hitbox, addHitbox, checkHitboxEvents, vec } from './Canvas.js'
import { opList, degrees } from './Helpers.js'


export var selectedPoint = null;
export function selectPoint(name) {
    let p = vec.getPointByName(name);
    if (p === null) {
        return;
    }
    if (selectedPoint !== null) {
        $('#pointItem-' + selectedPoint.name).removeClass('selected-point');
    }
    selectedPoint = p;
    $('#' + name).addClass('selected-point');
    $('#pxProp').val(selectedPoint.p[0]);
    $('#pyProp').val(selectedPoint.p[1]);
    $('#oxProp').val(selectedPoint.o[0]);
    $('#oyProp').val(selectedPoint.o[1]);
    $('#rProp').val(selectedPoint.r * degrees);
    $('#sxProp').val(selectedPoint.s[0]);
    $('#syProp').val(selectedPoint.s[1]);
}

var currentPointID = 1;
export function addPoint(point, parent = selectedPoint) {
    if (parent === null) {
        parent = vec.rootPnt;
    }
    point.p = opList(point.p, parent.pf, (a, b) => a - b);
    point.name = 'p' + currentPointID;
    let parentListId = '#pointList-' + parent.name;
    let listId = 'pointList-' + point.name;
    let itemId = 'pointItem-' + point.name;
    $(parentListId).append('<div class="nesting-box"><li id="' + itemId + '" class="no-select point-list">' + point.name + '</li><ul id="' + listId + '"></ul></div>');
    $('#' + itemId).click(selectPoint.bind(null, point.name));
    parent.addChild(point);
    currentPointID += 1;
}


export function initUI() {
    $('body').addClass('noscroll');
    let rootName = 'p0';
    $('#pointListContainer').append('<ul id="pointList-' + rootName + '"></ul>');
    vec.rootPnt.name = rootName;
    vec.rootPnt.p = [400, 400];
    selectPoint(rootName);
}