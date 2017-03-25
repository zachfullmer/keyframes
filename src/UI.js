import $ from 'jquery'
import { Hitbox, addHitbox, checkHitboxEvents, vec } from './Canvas.js'
import { opList } from './Helpers.js'


var selectedPoint = vec.rootPnt;
export function selectPoint(event) {
    let name = event.target.id.split(/-(.+)/)[1];
    let p = vec.getPointByName(name);
    if (p === null) {
        return;
    }
    if (selectedPoint !== null) {
        $('#pointItem-' + selectedPoint.name).removeClass('selected-point');
    }
    selectedPoint = p;
    $('#' + event.target.id).addClass('selected-point');
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
    $('#' + itemId).click(selectPoint);
    parent.addChild(point);
    currentPointID += 1;
}


export function initUI() {
    let rootName = 'p0';
    vec.rootPnt.name = rootName;
    $('#pointListContainer').append('<ul id="pointList-' + rootName + '"></ul>');
}