var selectedPoint = null;
var selectedShape = null;
var editedShape = null;
var selectedAnim = null;
var activeKeyframeLists = null;
var preKeyframeLists = null;
var postKeyframeLists = null;
var preAnim = null;
var postAnim = null;
var keyframeSource = null;


const propTypes = {
    point: [
        { name: 'position x', type: 'num', varName: 'px', propId: '#pxProp' },
        { name: 'position y', type: 'num', varName: 'py', propId: '#pyProp' },
        { name: 'origin x', type: 'num', varName: 'ox', propId: '#oxProp' },
        { name: 'origin y', type: 'num', varName: 'oy', propId: '#oyProp' },
        { name: 'rotation', type: 'deg', varName: 'r', propId: '#rProp' },
        { name: 'scale x', type: 'num', varName: 'sx', propId: '#sxProp' },
        { name: 'scale y', type: 'num', varName: 'sy', propId: '#syProp' }
    ],
    polygon: [
        { name: 'color', type: 'col', varName: 'colorRGB', propId: '#pcProp' }
    ],
    line: [
        { name: 'color', type: 'col', varName: 'colorRGB', propId: '#lcProp' }
    ],
    circleF: [
        { name: 'radius', type: 'num', varName: 'radius', propId: '#cfrProp' },
        { name: 'color', type: 'col', varName: 'colorRGB', propId: '#cfcProp' }
    ],
    circleO: [
        { name: 'radius', type: 'num', varName: 'radius', propId: '#corProp' },
        { name: 'color', type: 'col', varName: 'colorRGB', propId: '#cocProp' }
    ],
    bezier: [
        { name: 'color', type: 'col', varName: 'colorRGB', propId: '#bcProp' }
    ]
}

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
        if (globalPlaying) {
            return;
        }
        if (editedShape !== null) {
            return;
        }
        openRename(item, isShape);
    });
}

function openRename(item, isShape) {
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
function applyRename(item, isShape, nameChange = null) {
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
    $('#elementTitle').text(newName);
}

function cancelRename(item, isShape) {
    let name = item.name;
    let nameSpan = $((isShape ? '#shapeNameSpan-' : '#pointNameSpan-') + name);
    let renameInput = $((isShape ? '#shapeRenameInput-' : '#pointRenameInput-') + name);
    renameInput.hide();
    renameInput.val(nameSpan.text());
    nameSpan.show();
}

function genListNameSpan(name, isShape) {
    let spanId = (isShape ? 'shapeNameSpan-' : 'pointNameSpan-') + name;
    let inputId = (isShape ? 'shapeRenameInput-' : 'pointRenameInput-') + name;
    return '<span id="' + spanId + '">' + name + '</span><input id="' + inputId + '" class="rename-box"></input>';
}

function genShapeListName(isShape) {
    let spanId = 'shapeSpan-' + isShape.name;
    let itemSymbol = shapeTypes[isShape.type].unicode;
    return genListNameSpan(isShape.name, true) + '<span id="' + spanId + '" style="color:' + isShape.color + ';float:right;">' + itemSymbol + '</span>';
}

var propWindowType = 'none';
function updatePropWindow() {
    let element = selectedPoint || selectedShape || editedShape;
    let props = propTypes[propWindowType];
    for (let p in props) {
        if (props[p].type == 'col') {
            let col = element[props[p].varName];
            $(props[p].propId).val(rgbToHex(col[0], col[1], col[2]));
        }
        else if (props[p].type == 'deg') {
            $(props[p].propId).val(element[props[p].varName] * degrees);
        }
        else {
            $(props[p].propId).val(element[props[p].varName]);
        }
    }
}

function setPropWindow(type, elementName) {
    propWindowType = type;
    let shape = null;
    let shapeTypeSelect = $('#shapeTypeSelect');
    let keyLists = null;
    if (selectedShape !== null) {
        shape = selectedShape;
        keyLists = vec.getElementKeyLists(shape);
    }
    else {
        shape = editedShape;
        keyLists = vec.getElementKeyLists(shape);
    }
    if (selectedPoint !== null) {
        keyLists = vec.getElementKeyLists(selectedPoint);
    }
    $('.props-box').hide();
    if (type == 'point') {
        for (let p in propTypes[type]) {
            $(propTypes[type][p].propId).val(selectedPoint[propTypes[type][p].varName]);
        }
        $('#pointPropsBox').show();
        shapeTypeSelect.hide();
        timeline.setObjType(type);
    }
    else {
        for (let p in propTypes[type]) {
            if (propTypes[type][p].type == 'col') {
                let col = shape[propTypes[type][p].varName];
                $(propTypes[type][p].propId).val(rgbToHex(col[0], col[1], col[2]));
            }
            else {
                $(propTypes[type][p].propId).val(shape[propTypes[type][p].varName]);
            }
        }
        shapeTypeSelect.show();
        if (type == 'polygon') {
            $('#polygonPropsBox').show();
            timeline.setObjType(type);
        }
        else if (type == 'line') {
            $('#linePropsBox').show();
            timeline.setObjType(type);
        }
        else if (type == 'circleF') {
            $('#circleFPropsBox').show();
            timeline.setObjType(type);
        }
        else if (type == 'circleO') {
            $('#circleOPropsBox').show();
            timeline.setObjType(type);
        }
        else if (type == 'bezier') {
            $('#bezierPropsBox').show();
            timeline.setObjType(type);
        }
        else {
            shapeTypeSelect.hide();
            return;
        }
        shapeTypeSelect.val(type);
    }
    $('#elementTitle').text(elementName);
}

function setPreAnim(anim) {
    if (preAnim) {
        $('#animItem-' + preAnim.name).children('.anim-pre').hide();
    }
    preAnim = anim;
    if (preAnim) {
        $('#animItem-' + anim.name).children('.anim-pre').show();
    }
}
function setPostAnim(anim) {
    if (postAnim) {
        $('#animItem-' + postAnim.name).children('.anim-post').hide();
    }
    postAnim = anim;
    if (postAnim) {
        $('#animItem-' + anim.name).children('.anim-post').show();
    }
}
function buildTimeline() {
    activeKeyframeLists = vec.getElementKeyLists(keyframeSource);
    preKeyframeLists = vec.getElementKeyLists(keyframeSource, preAnim);
    postKeyframeLists = vec.getElementKeyLists(keyframeSource, postAnim);
    timeline.setKeyLists(activeKeyframeLists, preKeyframeLists, postKeyframeLists);
}
function selectPoint(point) {
    if (selectedPoint !== null) {
        $('#pointItem-' + selectedPoint.name).removeClass('selected-point');
    }
    if (selectedShape !== null) {
        $('#shapeItem-' + selectedShape.name).removeClass('selected-shape');
    }
    if (editedShape !== null) {
        $('#shapeItem-' + editedShape.name).removeClass('edited-shape');
    }
    keyframeSource = point;
    buildTimeline();
    selectedPoint = point;
    selectedShape = null;
    editedShape = null;
    $('#pointItem-' + point.name).addClass('selected-point');
    setPropWindow('point', point.name);
}

function selectShape(shape) {
    if (selectedPoint !== null) {
        $('#pointItem-' + selectedPoint.name).removeClass('selected-point');
    }
    if (selectedShape !== null) {
        $('#shapeItem-' + selectedShape.name).removeClass('selected-shape');
    }
    if (editedShape !== null) {
        $('#shapeItem-' + editedShape.name).removeClass('edited-shape');
    }
    keyframeSource = shape;
    buildTimeline();
    selectedPoint = null;
    selectedShape = shape;
    editedShape = null;
    $('#shapeItem-' + shape.name).addClass('selected-shape');
    setPropWindow(shape.type, shape.name);
}

function editShape(shape) {
    if (selectedPoint !== null) {
        $('#pointItem-' + selectedPoint.name).removeClass('selected-point');
    }
    if (selectedShape !== null) {
        $('#shapeItem-' + selectedShape.name).removeClass('selected-shape');
    }
    if (editedShape !== null) {
        $('#shapeItem-' + editedShape.name).removeClass('edited-shape');
    }
    keyframeSource = shape;
    buildTimeline();
    selectedPoint = null;
    selectedShape = shape;
    editedShape = shape;
    $('#shapeItem-' + shape.name).addClass('edited-shape');
    setPropWindow(shape.type, shape.name);
}

function selectAnim(anim) {
    if (selectedAnim === anim) {
        return;
    }
    vec.currentAnim = anim;
    keyframeSource = null;
    if (editedShape !== null) keyframeSource = editedShape;
    else if (selectedShape !== null) keyframeSource = selectedShape;
    else if (selectedPoint !== null) keyframeSource = selectedPoint;
    if (keyframeSource !== null) {
        buildTimeline(keyframeSource);
    }
    timeline.selectKeyframe(null);
    if (selectedAnim !== null) {
        $('#animItem-' + selectedAnim.name).removeClass('selected-anim');
    }
    selectedAnim = anim;
    $('#animItem-' + anim.name).addClass('selected-anim');
    $('#apProp').text(' (' + anim.name + ')');
    // update timeline period
    $('#atProp').val(anim.period);
    let period = parseInt($('#atProp').val());
    timeline.period = period;
    vec.currentAnim.period = period;
    // stop play
    pauseGlobalTime();
    setGlobalTime(0);
    //setPropWindow(anim.type, anim.name);
}

var currentPointID = 0;
var currentShapeID = 0;
var currentAnimID = 0;

function removePointFromShape(point, shape) {
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

function removePointRefs(pointToRemove) {
    let divId = '#pointDiv-' + pointToRemove.name;
    let pointRefDiv = '.point-ref-div-' + pointToRemove.name;
    // remove references to point
    $(pointRefDiv).remove();
    for (let e in vec.shapes) {
        let result = vec.shapes[e].getPointsByName(pointToRemove.name);
        for (let r in result) {
            let index = vec.shapes[e].points.indexOf(result[r]);
            if (index > -1) {
                vec.shapes[e].points.splice(index, 1);
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

function removeShape(shapeToRemove) {
    let divId = '#shapeDiv-' + shapeToRemove.name;
    $(divId).remove();
    vec.removeShape(shapeToRemove);
    if (shapeToRemove === selectedShape || shapeToRemove === editedShape || vec.shapes.length == 0) {
        selectedShape = null;
        editedShape = null;
        setPropWindow('none');
    }
}

function stopEditing() {
    if (editedShape !== null) {
        $('#shapeItem-' + editedShape.name).removeClass('edited-shape');
    }
    editedShape = null;
}

function pushPointToShape(point) {
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
    li.off('mouseenter');
    li.off('mouseleave');
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
            selectPoint(point);
            if (globalPlaying) {
                return;
            }
            grabPointRef(li.parent());
        }
        else if (event.which == 2) { // middle click
            if (globalPlaying) {
                return;
            }
            li.parent().remove();
            removePointFromShape(point, shape);
            pointRefsLo(point);
        }
    });
    li.mouseup((event) => {
        if (globalPlaying) {
            return;
        }
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

function addPoint(point, parent = selectedPoint, name = null) {
    let parentListId = '';
    if (parent === null) {
        parentListId = '#pointListBox';
    }
    else {
        parentListId = '#pointList-' + parent.name;
        point.p = opList(point.p, parent.pf, (a, b) => a - b);
    }
    vec.addPoint(point, parent);
    vec.updateKeyLists(point);
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
                if (globalPlaying) {
                    return;
                }
                pushPointToShape(point);
            }
        }
        else if (event.which == 2) { // middle click
            if (globalPlaying) {
                return;
            }
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
        if (globalPlaying) {
            return;
        }
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

function addShape(shape) {
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
            if (globalPlaying) {
                return;
            }
            removeShape(shape);
        }
        else if (event.which == 3) {
            if (globalPlaying) {
                return;
            }
            edit();
        }
    });
    $(id).contextmenu(() => { return false; });
    vec.addShape(shape);
    currentShapeID += 1;
}

function addAnim(anim) {
    if (anim.name === null) {
        anim.name = 'a' + currentAnimID;
    }
    let itemId = 'animItem-' + anim.name;
    let id = '#' + itemId;
    $('#animList').append('<div id="animDiv-' + anim.name + '" class="nesting-box"><li id="' + itemId + '" class="no-select anim-list">' + anim.name + '<span class="anim-post" title="next animation">&#8680;</span><span class="anim-pre" title="previous animation">&#8678;</span></li></div>');
    $(id).mousedown((event) => {
        if (event.which == 1) {
            selectAnim(anim);
        }
    });
    $(id).mouseup((event) => {
        if (event.which == 3) { // right
            let menu = $('#contextMenu');
            menu.css('left', event.pageX);
            menu.css('top', event.pageY);
            clearContextMenu();
            let checked = (preAnim === anim);
            addContextMenuItem('Set as pre-animation', checked, () => {
                setPreAnim((preAnim === anim ? null : anim));
                buildTimeline();
            });
            checked = (postAnim === anim);
            addContextMenuItem('Set as post-animation', checked, () => {
                setPostAnim((postAnim === anim ? null : anim));
                buildTimeline();
            });
            menu.show();
        }
    })
    $(id).contextmenu(() => { return false; });
    vec.addAnim(anim);
    currentAnimID += 1;
}


var grabbedPointRef = null;

function grabPointRef(refDiv) {
    grabbedPointRef = refDiv;
}

function dropPointRef() {
    if (grabbedPointRef === null) {
        return;
    }
    grabbedPointRef = null;
}

function swapPointRefs(div1, pointList) {
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


var grabbedPoint = null;

function grabPoint(point) {
    grabbedPoint = point;
    selectPoint(grabbedPoint);
    setPropWindow('point', point.name);
}

function dropPoint() {
    if (grabbedPoint === null) {
        return;
    }
    pointRefsLo(grabbedPoint, true);
    grabbedPoint = null;
}

function dragPoint(screenPos) {
    if (grabbedPoint === null) {
        return;
    }
    if (grabbedPoint.parent !== null) {
        screenPos = grabbedPoint.parent.inverseTransform(screenPos);
    }
    grabbedPoint.p = screenPos;
    $('#pxProp').val(grabbedPoint.px);
    $('#pyProp').val(grabbedPoint.py);
    $('#pxProp').trigger('input');
    $('#pyProp').trigger('input');
}


function addContextMenuItem(text, checked, func) {
    console.log(checked);
    let menu = $('#contextMenu');
    let menuItem = $('<div class="context-menu-item no-select"><span>&#10004;</span>' + text + '</div>');
    if (!checked) {
        menuItem.children('span').addClass('invisible-text');
    }
    menuItem.click(func);
    menu.append(menuItem);
}

function clearContextMenu() {
    $('#contextMenu').html('');
}


function initUI() {
    // document-level stuff
    $('body').addClass('noscroll');
    // init animations
    let defaultAnim = new anim('default', true);
    defaultAnim.period = 0;
    addAnim(defaultAnim);
    let anotherAnim = new anim('anim2', false);
    addAnim(anotherAnim);
    selectAnim(defaultAnim);
    // init shape list
    let shapeTypeSelect = $('#shapeTypeSelect');
    $.each(shapeTypes, (key, val) => {
        shapeTypeSelect.append($('<option/>', {
            value: key,
            text: val.name
        }));
    });
    // init keyframe type list
    let keyframeTypeSelect = $('#keyframeTypeSelect');
    $.each(keyframeTypes, (key, val) => {
        keyframeTypeSelect.append($('<option/>', {
            value: key,
            text: val.name
        }));
    });
    // camera
    centerCamera();
    // init point list
    let root = new pnt();
    addPoint(root, null, 'rootPoint');
    selectPoint(vec.rootPnt);
    let points = [];
    let pos = [[20, 40], [50, -70], [-10, -80], [-30, -30]];
    for (let a = 0; a < 4; a++) {
        let p = new pnt();
        points.push(p);
        p.p = pos[a];
        addPoint(p, vec.rootPnt);
    }
    let s = new shape('bezier', [], 'white');
    addShape(s);
    editShape(s);
    for (let p in points) {
        pushPointToShape(points[p]);
    }
    stopEditing();
    selectAnim(anotherAnim);
    keyLists = vec.getElementKeyLists(vec.rootPnt);
    if (keyLists !== null) {
        keyLists[0].addKeyframe(new Keyframe(400, keyframeTypes.cosine, 600));
        keyLists[1].addKeyframe(new Keyframe(400, keyframeTypes.cosine, 600));
    }
    selectPoint(vec.rootPnt);
    // context menu
    $('#contextMenu').click(() => $('#contextMenu').hide());
}