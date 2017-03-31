import $ from 'jquery'
import { Hitbox, addHitbox, checkHitboxEvents, vec } from './Canvas.js'
import { opList, degrees, cartToPolar, polarToCart } from './Helpers.js'
import { shape, pnt, shapeTypes } from './VectorDrawing.js'


export var selectedPoint = null;
export var selectedShape = null;
export var editedShape = null;

export function genShapeListName(shape) {
    let spanId = 'shapeSpan-' + shape.name;
    let itemSymbol = shapeTypes[shape.type].unicode;
    return shape.name + '<span id="' + spanId + '" style="color:' + shape.color + ';float:right;">' + itemSymbol + '</span>';
}


export function setPropWindow(type) {
    let shape = null;
    let shapeTypeSelect = $('#shapeTypeSelect');
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
        shapeTypeSelect.hide();
    }
    else {
        shapeTypeSelect.show();
        if (type == 'polygon') {
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
        else {
            shapeTypeSelect.hide();
            return;
        }
        shapeTypeSelect.val(type);
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
    selectedShape = s;
    editedShape = s;
    $('#shapeItem-' + name).addClass('edited-shape');
    setPropWindow(s.type);
}

var currentPointID = 0;
var currentShapeID = 0;

export function removePointFromShape(point, shape) {
    var index = shape.points.indexOf(point);
    shape.points.splice(index, 1);
}


function pointRefsHi(point, force = false) {
    if (force || grabbedPoint !== point) {
        $('#pointItem-' + point.name).addClass('highlighted');
        $('.point-ref-' + point.name).addClass('highlighted');
        vec.hiPoint(point);
    }
}

function pointRefsLo(point, force = false) {
    if (force || grabbedPoint !== point) {
        $('#pointItem-' + point.name).removeClass('highlighted');
        $('.point-ref-' + point.name).removeClass('highlighted');
        vec.loPoint(point);
    }
}

export function removePointRefs(pointToRemove) {
    let divId = '#pointDiv-' + pointToRemove.name;
    let pointRefDiv = '.point-ref-div-' + pointToRemove.name;
    // remove references to point
    $(pointRefDiv).remove();
    for (let e in vec.elements) {
        let result = vec.elements[e].getPointsByName(pointToRemove.name);
        for (let r in result) {
            let index = vec.elements[e].points.indexOf(result[r]);
            if (index > -1) {
                vec.elements[e].points.splice(index, 1);
            }
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
    if (pointToRemove === selectedPoint || vec.rootPnt.children.length == 0) {
        selectedPoint = vec.rootPnt;
        setPropWindow('none');
    }
}

export function removeShape(shapeToRemove) {
    let divId = '#shapeDiv-' + shapeToRemove.name;
    $(divId).remove();
    let index = vec.elements.indexOf(shapeToRemove);
    if (index > -1) {
        vec.elements.splice(index, 1);
    }
    if (shapeToRemove === selectedShape || shapeToRemove === editedShape || vec.elements.length == 0) {
        selectedShape = null;
        editedShape = null;
        setPropWindow('none');
    }
}

export function stopEditing() {
    if (editedShape !== null) {
        $('#shapeItem-' + editedShape.name).removeClass('edited-shape');
    }
    editedShape = null;
}

export function pushPointToShape(point) {
    let shape = editedShape;
    let pointList = editedShape.points;
    let pointRef = 'point-ref-' + point.name;
    let pointRefDiv = 'point-ref-div-' + point.name;
    let cloneId = '#pointItem-' + point.name;
    let li = $(cloneId).clone(true, false);
    li.addClass(pointRef);
    li.attr('id', '');
    li.off('mousedown');
    let div = $('<div class="nesting-box ' + pointRefDiv + '"></div>');
    div.append(li);
    $('#shapeList-' + editedShape.name).append(div);
    li.mousedown((event) => {
        if (event.which == 1) { // left click
            grabPointRef(li.parent());
        }
        else if (event.which == 2) { // middle click
            li.parent().remove();
            removePointFromShape(point, shape);
            pointRefsLo(point);
        }
    });
    li.mouseup((event) => {
        if (event.which == 1) { // left click
            dropPointRef();
        }
    });
    li.mouseenter(() => {
        if (grabbedPointRef !== null && grabbedPointRef[0] !== li.parent()[0]) {
            swapPointRefs(li.parent(), shape.points);
        }
        else {
            pointRefsHi(point);
        }
    });
    li.mouseleave(() => {
        pointRefsLo(point);
    });
    editedShape.points.push(point);
}

export function addPoint(point, parent = selectedPoint) {
    let parentListId = '';
    if (parent === null) {
        parentListId = '#pointListBox';
        vec.rootPnt = point;
    }
    else {
        parentListId = '#pointList-' + parent.name;
        point.p = opList(point.p, parent.pf, (a, b) => a - b);
        parent.addChild(point);
    }
    point.name = 'p' + currentPointID;
    let listId = 'pointList-' + point.name;
    let itemId = 'pointItem-' + point.name;
    let element = $('<div id="pointDiv-' + point.name + '" class="nesting-box"><li id="' + itemId + '" class="no-select point-list">' + point.name + '</li><ul id="' + listId + '"></ul></div>');
    $(parentListId).append(element);
    let select = selectPoint.bind(null, point.name);
    let id = '#' + itemId;
    $(id).mousedown((event) => {
        if (event.which == 1) { // left click
            if (editedShape === null) {
                select();
            }
            else {
                pushPointToShape(point);
            }
        }
        else if (event.which == 2) { // middle click
            if (point !== vec.rootPnt) {
                removePointRefs(point);
                pointRefsLo(point);
            }
        }
    });
    let pointRef = '.point-ref-' + point.name;
    $(id).contextmenu(() => { return false; });
    $(id).mouseenter(() => {
        pointRefsHi(point);
    });
    $(id).mouseleave(() => {
        pointRefsLo(point);
    });
    point.hitbox.mouseenter(() => {
        pointRefsHi(point);
    });
    point.hitbox.mouseleave(() => {
        pointRefsLo(point);
    });
    point.hitbox.mousedown((event) => {
        if (event.which == 1) { // left
            if (editedShape === null) {
                grabPoint(point);
            }
            else {
                pushPointToShape(point);
            }
        }
        else if (event.which == 2) { // middle
            if (point !== vec.rootPnt) {
                removePointRefs(point);
                pointRefsLo(point);
            }
        }
    });
    currentPointID += 1;
}

export function addShape(shape) {
    shape.name = 's' + currentShapeID;
    let listId = 'shapeList-' + shape.name;
    let itemId = 'shapeItem-' + shape.name;
    let spanId = 'shapeSpan-' + shape.name;
    $('#shapeList').append('<div id="shapeDiv-' + shape.name + '" class="nesting-box"><li id="' + itemId + '" class="no-select shape-list">' + genShapeListName(shape) + '</li><ul id="' + listId + '"></ul></div>');
    let select = selectShape.bind(null, shape.name);
    let edit = editShape.bind(null, shape.name);
    $('#' + itemId).mousedown((event) => {
        if (event.which == 1) {
            select();
        }
        else if (event.which == 2) {
            removeShape(shape);
        }
        else if (event.which == 3) {
            edit();
        }
    });
    $('#' + itemId).contextmenu(() => { return false; });
    vec.elements.push(shape);
    currentShapeID += 1;
}


export var grabbedPointRef = null;

export function grabPointRef(refDiv) {
    grabbedPointRef = refDiv;
}

export function dropPointRef() {
    if (grabbedPointRef === null) {
        return;
    }
    grabbedPointRef = null;
}

export function swapPointRefs(div1, pointList) {
    let div2 = grabbedPointRef;
    let li1 = div1.children().first();
    let li2 = div2.children().first();
    // swap actual points
    pointList[div2.index()] = [pointList[div1.index()], pointList[div1.index()] = pointList[div2.index()]][0];
    // swap list items
    li1.detach();
    li2.detach();
    div1.prepend(li2);
    div2.prepend(li1);
    // swap classes
    let divClass1 = 'point-ref-div-' + li1.text();
    let divClass2 = 'point-ref-div-' + li2.text();
    div1.removeClass(divClass1);
    div1.addClass(divClass2);
    div2.removeClass(divClass2);
    div2.addClass(divClass1);
    // gotta move this over too
    grabbedPointRef = div1;
}


export var grabbedPoint = null;

export function grabPoint(point) {
    grabbedPoint = point;
}

export function dropPoint() {
    if (grabbedPoint === null) {
        return;
    }
    pointRefsLo(grabbedPoint, true);
    grabbedPoint = null;
}

export function dragPoint(screenPos) {
    if (grabbedPoint === null) {
        return;
    }
    if (grabbedPoint.parent !== null) {
        screenPos = grabbedPoint.parent.inverseTransform(screenPos);
    }
    grabbedPoint.p = screenPos;
    return screenPos;
}


export function initUI() {
    // document-level stuff
    $('body').addClass('noscroll');
    // init shape list
    $('#shapeListBox').append('<ul id="shapeList"></ul>');
    let shapeTypeSelect = $('#shapeTypeSelect');
    $.each(shapeTypes, (key, val) => {
        shapeTypeSelect.append($('<option/>', {
            value: key,
            text: val.name
        }));
    });
    // init point list
    addPoint(new pnt());
    vec.rootPnt.p = [$(window).width() / 2, $(window).height() / 2];
    selectPoint('p0');
    let points = [];
    let pos = [[20, 40], [50, -70], [-10, -80], [-30, -30]];
    for (let a = 0; a < 4; a++) {
        let p = new pnt();
        points.push(p);
        addPoint(p, vec.rootPnt);
        p.p = pos[a];
    }
    let s = new shape('bezier', [], 'white');
    addShape(s);
    editShape(s.name);
    for (let p in points) {
        pushPointToShape(points[p]);
    }
    stopEditing();
}