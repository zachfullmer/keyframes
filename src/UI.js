import $ from 'jquery'
import { Hitbox, addHitbox, checkHitboxEvents, vec } from './Canvas.js'
import { opList, degrees } from './Helpers.js'
import { shape } from './VectorDrawing.js'


export var selectedPoint = null;
export var selectedShape = null;
export var editedShape = null;
var shapes = {
    polygon: {
        unicode: '\u25A0'
    },
    line: {
        unicode: '\u2015'
    },
    circleF: {
        unicode: '\u25CF'
    },
    circleO: {
        unicode: '\u25CB'
    },
    bezier: {
        unicode: '\u25E0'
    }
}

function genShapeListName(shape) {
    let spanId = 'shapeSpan-' + shape.name;
    let itemSymbol = shapes[shape.type].unicode;
    return '<span id="' + spanId + '">' + itemSymbol + '</span>';
}


export function setPropWindow(type) {
    let shape = null;
    if (selectedShape !== null) {
        shape = selectedShape;
    }
    else {
        shape = editedShape;
    }
    $('.props-box').hide();
    if (type == 'point') {
        $('#pxProp').val(selectedPoint.p[0]);
        $('#pyProp').val(selectedPoint.p[1]);
        $('#oxProp').val(selectedPoint.o[0]);
        $('#oyProp').val(selectedPoint.o[1]);
        $('#rProp').val(selectedPoint.r * degrees);
        $('#sxProp').val(selectedPoint.s[0]);
        $('#syProp').val(selectedPoint.s[1]);
        $('#pointPropsBox').show();
    }
    else if (type == 'polygon') {
        $('#pcProp').val(shape.color);
        $('#polygonPropsBox').show();
    }
    else if (type == 'line') {
        $('#lcProp').val(shape.color);
        $('#linePropsBox').show();
    }
    else if (type == 'circleF') {
        $('#cfrProp').val(shape.radius);
        $('#cfcProp').val(shape.color);
        $('#circleFPropsBox').show();
    }
    else if (type == 'circleO') {
        $('#corProp').val(shape.radius);
        $('#cocProp').val(shape.color);
        $('#circleOPropsBox').show();
    }
    else if (type == 'bezier') {
        $('#bcProp').val(shape.color);
        $('#bezierPropsBox').show();
    }
}

export function selectPoint(name) {
    let p = vec.getPointByName(name);
    if (p === null) {
        console.log('ERROR: unable to find point ' + '"' + name + '"');
        return;
    }
    if (selectedPoint !== null) {
        $('#pointItem-' + selectedPoint.name).removeClass('selected-point');
    }
    if (selectedShape !== null) {
        $('#shapeItem-' + selectedShape.name).removeClass('selected-shape');
    }
    if (editedShape !== null) {
        $('#shapeItem-' + editedShape.name).removeClass('edited-shape');
    }
    selectedPoint = p;
    selectedShape = null;
    editedShape = null;
    $('#pointItem-' + name).addClass('selected-point');
    setPropWindow('point');
}

export function selectShape(name) {
    let s = vec.getShapeByName(name);
    if (s === null) {
        console.log('ERROR: unable to find shape ' + '"' + name + '"');
        return;
    }
    if (selectedPoint !== null) {
        $('#pointItem-' + selectedPoint.name).removeClass('selected-point');
    }
    if (selectedShape !== null) {
        $('#shapeItem-' + selectedShape.name).removeClass('selected-shape');
    }
    if (editedShape !== null) {
        $('#shapeItem-' + editedShape.name).removeClass('edited-shape');
    }
    selectedPoint = null;
    selectedShape = s;
    editedShape = null;
    $('#shapeItem-' + name).addClass('selected-shape');
    setPropWindow(s.type);
}

export function editShape(name) {
    let s = vec.getShapeByName(name);
    if (s === null) {
        console.log('ERROR: unable to find shape ' + '"' + name + '"');
        return;
    }
    if (selectedPoint !== null) {
        $('#pointItem-' + selectedPoint.name).removeClass('selected-point');
    }
    if (selectedShape !== null) {
        $('#shapeItem-' + selectedShape.name).removeClass('selected-shape');
    }
    if (editedShape !== null) {
        $('#shapeItem-' + editedShape.name).removeClass('edited-shape');
    }
    selectedPoint = null;
    selectedShape = null;
    editedShape = s;
    $('#shapeItem-' + name).addClass('edited-shape');
    setPropWindow(s.type);
}

var currentPointID = 1;
var currentShapeID = 1;

export function removePointFromShape(point, shape) {
    var index = shape.points.indexOf(point);
    shape.points.splice(index, 1);
}


export function removePointRefs(pointToRemove) {
    let divId = '#pointDiv-' + pointToRemove.name;
    let pointRef = '.point-ref-' + pointToRemove.name;
    // remove references to point
    $(pointRef).remove();
    for (let e in vec.elements) {
        let result = vec.elements[e].getPointsByName(pointToRemove.name);
        for (let r in result) {
            let index = vec.elements[e].points.indexOf(result[r]);
            vec.elements[e].points.splice(index, 1);
        }
    }
    // remove point itself
    $(divId).remove();
    let result = vec.removePoint(pointToRemove);
    if (result !== null) {
        for (let r in result) {
            removePointRefs(result[r]);
        }
    }
}

export function pushPointToShape(point) {
    let pointList = editedShape.points;
    let pointRef = 'point-ref-' + point.name;
    let element = $('<div class="nesting-box ' + pointRef + '"><li class="no-select point-list">' + point.name + '</li></div>');
    $('#shapeList-' + editedShape.name).append(element);
    element.mousedown((event) => {
        if (event.which == 2) { // middle click
            element.remove();
            removePointFromShape(point, editedShape);
        }
    });
    editedShape.points.push(point);
}

export function addPoint(point, parent = selectedPoint) {
    if (parent === null) {
        parent = vec.rootPnt;
    }
    point.p = opList(point.p, parent.pf, (a, b) => a - b);
    point.name = 'p' + currentPointID;
    let parentListId = '#pointList-' + parent.name;
    let listId = 'pointList-' + point.name;
    let itemId = 'pointItem-' + point.name;
    let element = $('<div id="pointDiv-' + point.name + '" class="nesting-box"><li id="' + itemId + '" class="no-select point-list">' + point.name + '</li><ul id="' + listId + '"></ul></div>');
    $(parentListId).append(element);
    let select = selectPoint.bind(null, point.name);
    $('#' + itemId).mousedown((event) => {
        if (event.which == 1) { // left click
            if (editedShape === null) {
                select();
            }
            else {
                pushPointToShape(point);
            }
        }
        else if (event.which == 2) { // middle click
            removePointRefs(point);
        }
    });
    $('#' + itemId).contextmenu(() => { return false; });
    parent.addChild(point);
    currentPointID += 1;
}

export function addShape(shape) {
    shape.name = 's' + currentShapeID;
    let listId = 'shapeList-' + shape.name;
    let itemId = 'shapeItem-' + shape.name;
    let spanId = 'shapeSpan-' + shape.name;
    $('#shapeList').append('<div class="nesting-box"><li id="' + itemId + '" class="no-select shape-list">' + shape.name + genShapeListName(shape) + '</li><ul id="' + listId + '"></ul></div>');
    let select = selectShape.bind(null, shape.name);
    let edit = editShape.bind(null, shape.name);
    $('#' + itemId).mousedown((event) => {
        if (event.which == 1) {
            select();
        }
        else if (event.which == 3) {
            edit();
        }
    });
    $('#' + itemId).contextmenu(() => { return false; });
    $('#' + spanId).css('color', shape.color);
    $('#' + spanId).css('float', 'right');
    vec.elements.push(shape);
    currentShapeID += 1;
}


export function initUI() {
    // document-level stuff
    $('body').addClass('noscroll');
    // init point list
    let rootName = 'p0';
    $('#pointListBox').append('<ul id="pointList-' + rootName + '"></ul>');
    vec.rootPnt.name = rootName;
    vec.rootPnt.p = [400, 400];
    selectPoint(rootName);
    // init shape list
    $('#shapeListBox').append('<ul id="shapeList"></ul>');
    // init properties box
    $('.props-box').hide();
    $('#pointPropsBox').show();
}