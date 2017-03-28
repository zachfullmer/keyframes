import $ from 'jquery'
import { Hitbox, addHitbox, checkHitboxEvents, vec } from './Canvas.js'
import { opList, degrees } from './Helpers.js'
import { shape } from './VectorDrawing.js'


export var selectedPoint = null;
export var selectedShape = null;
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
        $('#pcProp').val(selectedShape.color);
        $('#polygonPropsBox').show();
    }
    else if (type == 'line') {
        $('#lcProp').val(selectedShape.color);
        $('#linePropsBox').show();
    }
    else if (type == 'circleF') {
        $('#cfrProp').val(selectedShape.radius);
        $('#cfcProp').val(selectedShape.color);
        $('#circleFPropsBox').show();
    }
    else if (type == 'circleO') {
        $('#corProp').val(selectedShape.radius);
        $('#cocProp').val(selectedShape.color);
        $('#circleOPropsBox').show();
    }
    else if (type == 'bezier') {
        $('#bcProp').val(selectedShape.color);
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
    selectedPoint = p;
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
    selectedShape = s;
    $('#shapeItem-' + name).addClass('selected-shape');
    setPropWindow(s.type);
}

var currentPointID = 1;
var currentShapeID = 1;

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

export function addShape(shape) {
    shape.name = 's' + currentShapeID;
    let itemId = 'shapeItem-' + shape.name;
    let spanId = 'shapeSpan-' + shape.name;
    $('#shapeList').append('<div class="nesting-box"><li id="' + itemId + '" class="no-select point-list">' + shape.name + genShapeListName(shape) + '</li></div>');
    $('#' + itemId).click(selectShape.bind(null, shape.name));
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