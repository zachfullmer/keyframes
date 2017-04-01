import $ from 'jquery'
import { Hitbox, addHitbox, checkHitboxEvents, vec } from './Canvas.js'
import { opList, degrees, cartToPolar, polarToCart } from './Helpers.js'
import { shape, pnt, shapeTypes } from './VectorDrawing.js'


export var selectedPoint = null;
export var selectedShape = null;
export var editedShape = null;

function initRenameInput(item, isShape) {
    let renameInput = $((isShape ? '#shapeRenameInput-' : '#pointRenameInput-') + item.name);
    renameInput.hide();
    renameInput.blur(function () {
        applyRename(item, isShape);
    });
    renameInput.keydown((event) => {
        if (event.which == 27) { // escape
            cancelRename(item, isShape);
        }
        else if (event.which == 13) { // return
            applyRename(item, isShape);
        }
    });
    let id = (isShape ? '#shapeItem-' : '#pointItem-') + item.name;
    $(id).dblclick(() => {
        if (editedShape !== null) {
            return;
        }
        openRename(item, isShape);
    });
}

export function openRename(item, isShape) {
    let name = item.name;
    let nameSpan = $((isShape ? '#shapeNameSpan-' : '#pointNameSpan-') + name);
    let renameInput = $((isShape ? '#shapeRenameInput-' : '#pointRenameInput-') + name);
    nameSpan.hide();
    renameInput.show();
    renameInput.val(nameSpan.text());
    renameInput.focus();
    renameInput.select();
}

const nameLengthLimit = 100;
export function applyRename(item, isShape, nameChange = null) {
    // set up id names
    var name = item.name;
    let nameSpan = $((isShape ? '#shapeNameSpan-' : '#pointNameSpan-') + name);
    let renameInput = null;
    if (nameChange === null) {
        renameInput = $((isShape ? '#shapeRenameInput-' : '#pointRenameInput-') + name);
    }
    let type = (isShape ? 'shape' : 'point');
    // hide the input element
    nameSpan.show();
    if (nameChange === null) {
        renameInput.hide();
    }
    // clean the input string
    let newName = ''
    if (nameChange === null) {
        newName = renameInput.val();
    }
    else {
        newName = nameChange;
    }
    if (!newName) newName = name;
    newName = newName.replace(/[\W]/g, "");
    newName = newName.substr(0, nameLengthLimit);
    if (name == newName || newName.length < 1) {
        return;
    }
    // check if the name already exists
    if ((isShape ? vec.getShapeByName(newName) : vec.getPointByName(newName))) {
        console.log('ERROR: can\'t rename "' + name + '"; ' + type + ' with name "' + newName + '" already exists');
        return;
    }
    // rename the list item
    nameSpan.text(newName);
    // rename associated object
    item.name = newName;
    // change ids and classes on dom elements
    let ids = [];
    if (isShape) {
        ids = ['shapeDiv-', 'shapeItem-', 'shapeList-', 'shapeNameSpan-', 'shapeRenameInput-', 'shapeSpan-'];
    }
    else {
        ids = ['pointDiv-', 'pointItem-', 'pointList-', 'pointNameSpan-', 'pointRenameInput-', 'pointSpan-'];
    }
    for (let i in ids) {
        $('#' + ids[i] + name).attr('id', ids[i] + newName);
    }
    // classes
    if (!isShape) {
        pointRefsLo(item, true);
        let classes = ['point-ref-', 'point-ref-div-', 'point-ref-name-span-', 'point-ref-rename-input-'];
        for (let c in classes) {
            $('.' + classes[c] + name).addClass(classes[c] + newName);
            $('.' + classes[c] + name).removeClass(classes[c] + name);
        }
        $('.point-ref-name-span-' + newName).text(newName);
    }
}

export function cancelRename(item, isShape) {
    let name = item.name;
    let nameSpan = $((isShape ? '#shapeNameSpan-' : '#pointNameSpan-') + name);
    let renameInput = $((isShape ? '#shapeRenameInput-' : '#pointRenameInput-') + name);
    renameInput.hide();
    renameInput.val(nameSpan.text());
    nameSpan.show();
}

export function genListNameSpan(name, isShape) {
    let spanId = (isShape ? 'shapeNameSpan-' : 'pointNameSpan-') + name;
    let inputId = (isShape ? 'shapeRenameInput-' : 'pointRenameInput-') + name;
    return '<span id="' + spanId + '">' + name + '</span><input id="' + inputId + '" class="rename-box"></input>';
}

export function genShapeListName(isShape) {
    let spanId = 'shapeSpan-' + isShape.name;
    let itemSymbol = shapeTypes[isShape.type].unicode;
    return genListNameSpan(isShape.name, true) + '<span id="' + spanId + '" style="color:' + isShape.color + ';float:right;">' + itemSymbol + '</span>';
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

export function selectPoint(point) {
    if (point === null) {
        console.log('ERROR: unable to find point ' + '"' + point.name + '"');
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
    selectedPoint = point;
    selectedShape = null;
    editedShape = null;
    $('#pointItem-' + point.name).addClass('selected-point');
    setPropWindow('point');
}

export function selectShape(shape) {
    if (shape === null) {
        console.log('ERROR: unable to find shape ' + '"' + shape.name + '"');
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
    selectedShape = shape;
    editedShape = null;
    $('#shapeItem-' + shape.name).addClass('selected-shape');
    setPropWindow(shape.type);
}

export function editShape(shape) {
    if (shape === null) {
        console.log('ERROR: unable to find shape ' + '"' + shape.name + '"');
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
    selectedShape = shape;
    editedShape = shape;
    $('#shapeItem-' + shape.name).addClass('edited-shape');
    setPropWindow(shape.type);
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
    let pointRefNameSpan = 'point-ref-name-span-' + point.name;
    let pointRefRenameInput = 'point-ref-rename-input-' + point.name;
    let cloneId = '#pointItem-' + point.name;
    // li
    let li = $(cloneId).clone(true, false);
    li.addClass(pointRef);
    li.attr('id', '');
    li.off('mousedown');
    // nameSpan
    let nameSpan = li.find('span');
    nameSpan.addClass(pointRefNameSpan);
    nameSpan.attr('id', '');
    // renameInput
    let renameInput = li.find('input');
    renameInput.addClass(pointRefRenameInput);
    renameInput.attr('id', '');
    // div
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

export function addPoint(point, parent = selectedPoint, name = null) {
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
    if (name === null) {
        point.name = 'p' + currentPointID;
    }
    else {
        point.name = name;
    }
    let listId = 'pointList-' + point.name;
    let itemId = 'pointItem-' + point.name;
    let element = $('<div id="pointDiv-' + point.name + '" class="nesting-box"><li id="' + itemId + '" class="no-select point-list">' + genListNameSpan(point.name, false) + '</li><ul id="' + listId + '"></ul></div>');
    $(parentListId).append(element);
    initRenameInput(point, false);
    let select = selectPoint.bind(null, point);
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
    initRenameInput(shape, true);
    let select = selectShape.bind(null, shape);
    let edit = editShape.bind(null, shape);
    let id = '#' + itemId;
    $(id).mousedown((event) => {
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
    $(id).contextmenu(() => { return false; });
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
    selectPoint(grabbedPoint);
    setPropWindow('point');
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
    $('#pxProp').val(grabbedPoint.p[0]);
    $('#pyProp').val(grabbedPoint.p[1]);
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
    addPoint(new pnt(), null, 'rootPoint');
    vec.rootPnt.p = [$(window).width() / 2, $(window).height() / 2];
    selectPoint(vec.rootPnt);
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
    editShape(s);
    for (let p in points) {
        pushPointToShape(points[p]);
    }
    stopEditing();
}