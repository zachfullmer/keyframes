
function showTooltip(mousePos, text) {
    let tooltip = $('#tooltip');
    tooltip.show();
    tooltip.offset({ left: mousePos[0] + 10, top: mousePos[1] + 15 });
    let offset = tooltip.offset();
    if (offset.left + tooltip.outerWidth() >= $(window).innerWidth()) {
        tooltip.offset({ left: $(window).innerWidth() - tooltip.outerWidth() });
    }
    if (offset.top + tooltip.outerHeight() >= $(window).innerHeight()) {
        tooltip.offset({ top: $(window).innerHeight() - tooltip.outerHeight() });
    }
    tooltip.text(text);
}

function hideTooltip() {
    let tooltip = $('#tooltip');
    tooltip.hide();
}

var snackbarTimeout = null;
function showSnackbar(text) {
    $('#snackbar').text(text);
    if (snackbarTimeout !== null) {
        clearTimeout(snackbarTimeout);
        $('#snackbar').removeClass('show');
    }
    $('#snackbar').addClass('show');
    snackbarTimeout = setTimeout(() => { $('#snackbar').removeClass('show') }, 1800);
}

var currentFilename = null;
var loading = false;

function updateDocTitle() {
    document.title = currentFilename.replace(/\.json$/, '') + ' - ' + 'Vector Anim';
}

function validateFilename(filename) {
    if (filename === null) {
        return null;
    }
    filename = filename.replace(/\.json$/, '');
    if (filename.search(/\W/) >= 0 || filename.length == 0) {
        return null;
    }
    filename += '.json';
    return filename;
}

function saveDrawing() {
    console.log('saving drawing "' + currentFilename + '"...');
    $.post('/save', { filename: currentFilename }, (res) => {
        $.post('/save', { filename: currentFilename, text: JSON.stringify(vec.toJson()) }, (res) => {
            console.log(res);
            showSnackbar('Saved!');
            updateDocTitle();
        });
    });
}

function loadDrawing() {
    console.log('loading drawing "' + currentFilename + '"...');
    $.post('/save', { filename: currentFilename }, (res) => {
        $.post('/load', { filename: currentFilename, text: JSON.stringify(vec.toJson()) }, (res) => {
            console.log(res);
            showSnackbar('Loaded file ' + currentFilename);
            updateDocTitle();
        });
    });
}

function confirmSave() {
    currentFilename = validateFilename($('#saveBox').val());
    if (currentFilename === null) {
        $('#saveMessage').text('Can\'t save: invalid filename');
        $('#saveMessage').css('color', '#dd4444');
    }
    else {
        saveDrawing();
        $('#saveWindow').hide();
    }
}

function confirmLoad() {
    currentFilename = validateFilename($('#saveBox').val());
    if (currentFilename === null) {
        $('#saveMessage').text('Can\'t load: invalid filename');
        $('#saveMessage').css('color', '#dd4444');
    }
    else {
        loadDrawing();
        $('#saveWindow').hide();
    }
}

function initEvents() {
    let canvas = $('#drawingArea');
    // disable right click
    $('body').on('contextmenu', '#drawingArea', (e) => { return false; });
    // hitbox checking
    initHitboxEvents(canvas);
    $(document).on('contextmenu', (event) => {
        event.preventDefault();
    });
    $(document).keydown((event) => {
        if (event.which == 27) { // escape
            stopEditing();
            $('#saveWindow').hide();
        }
        else if (event.which == 36) { // home
            centerCamera();
        }
        else if (event.which == 13) { // enter
            if ($('#saveWindow').is(':visible')) {
                if (loading) {
                    confirmLoad();
                }
                else {
                    confirmSave();
                }
            }
        }
        else if (event.which == 83) { // s
            if (event.ctrlKey) {
                $('#saveMessage').text('Enter a filename to save:');
                currentFilename = validateFilename(currentFilename);
                if (event.shiftKey || currentFilename === null) {
                    $('#saveWindow').show();
                    $('#saveBox').focus();
                    $('#saveBox').select();
                    loading = false;
                }
                else {
                    confirmSave();
                }
                event.preventDefault();
            }
        }
        else if (event.which == 79) { // o
            if (event.ctrlKey) {
                $('#saveMessage').text('Open which drawing?');
                currentFilename = validateFilename(currentFilename);
                $('#saveWindow').show();
                $('#saveBox').focus();
                $('#saveBox').select();
                event.preventDefault();
                loading = true;
            }
        }
    });
    $('#saveConfirm').click(() => {
        if (loading) {
            confirmLoad();
        }
        else {
            confirmSave();
        }
    });
    $('#saveCancel').click(() => {
        $('#saveWindow').hide();
    });
    canvas.dblclick((event) => {
        if (globalPlaying) {
            return;
        }
        if (selectedPoint === null) {
            return;
        }
        if (timeline.hitbox.contains(event.pageX, event.pageY)) {
            return;
        }
        let p1 = new pnt();
        p1.p = [event.pageX, event.pageY];
        addPoint(p1, selectedPoint);
    });
    canvas.mousemove((event) => {
        if (grabbedPoint !== null) {
            dragPoint([event.pageX, event.pageY]);
        }
    });
    $(document).mouseup((event) => {
        if (event.which == 1) { // left
            dropPoint();
        }
    });
    $(document).click(() => {
        $('#contextMenu').hide();
    });
    $(window).on('resize', (event) => {
        checkHitboxEvents(event, timelineHitboxes);
        checkHitboxEvents(event, pointHitboxes);
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
    $('.prop-window-item').on('input', function () {
        let id = '#' + this.id;
        for (let h in timeline.hiKeyframes) {
            if (timeline.hiKeyframes[h].propInfo.propId == id) {
                let finalVal = this.value;
                if (timeline.hiKeyframes[h].propInfo.type == 'deg') {
                    finalVal /= degrees;
                }
                timeline.hiKeyframes[h].val = finalVal;
                break;
            }
        }
    });
    // point properties
    $('#pxProp, #pyProp').on('input', function () {
        if (selectedPoint === null) {
            return;
        }
        selectedPoint.p = [$('#pxProp').val(), $('#pyProp').val()];
    });
    $('#oxProp, #oyProp').on('input', function () {
        if (selectedPoint === null) {
            return;
        }
        selectedPoint.o = [$('#oxProp').val(), $('#oyProp').val()];
    });
    $('#rProp').on('input', function () {
        if (selectedPoint === null) {
            return;
        }
        selectedPoint.r = $('#rProp').val() / degrees;
    });
    $('#sxProp, #syProp').on('input', function () {
        if (selectedPoint === null) {
            return;
        }
        selectedPoint.s = [$('#sxProp').val(), $('#syProp').val()];
    });
    // polygon properties
    $('#pcProp').on('input', function () {
        if (selectedShape === null) {
            return;
        }
        selectedShape.color = $('#pcProp').val();
        let spanId = 'shapeSpan-' + selectedShape.name;
        $('#' + spanId).css('color', selectedShape.color);
    });
    // line properties
    $('#lcProp').on('input', function () {
        if (selectedShape === null) {
            return;
        }
        selectedShape.color = $('#lcProp').val();
        let spanId = 'shapeSpan-' + selectedShape.name;
        $('#' + spanId).css('color', selectedShape.color);
    });
    // filled circle properties
    $('#cfrProp, #cfcProp').on('input', function () {
        if (selectedShape === null) {
            return;
        }
        selectedShape.radius = $('#cfrProp').val();
        selectedShape.color = $('#cfcProp').val();
        let spanId = 'shapeSpan-' + selectedShape.name;
        $('#' + spanId).css('color', selectedShape.color);
    });
    // circle properties
    $('#corProp, #cocProp').on('input', function () {
        if (selectedShape === null) {
            return;
        }
        selectedShape.radius = $('#corProp').val();
        selectedShape.color = $('#cocProp').val();
        let spanId = 'shapeSpan-' + selectedShape.name;
        $('#' + spanId).css('color', selectedShape.color);
    });
    // bezier properties
    $('#bcProp').on('input', function () {
        if (selectedShape === null) {
            return;
        }
        selectedShape.color = $('#bcProp').val();
        let spanId = 'shapeSpan-' + selectedShape.name;
        $('#' + spanId).css('color', selectedShape.color);
    });
    // animation properties
    $('#atProp').on('input', function () {
        let period = parseInt($('#atProp').val());
        timeline.period = period;
        vec.currentAnim.period = period;
    });
    // keyframe properties
    $('#ktProp').on('input', function () {
        if (timeline.selectedKeyframe === null) {
            console.log('no keyframe selected');
            return;
        }
        timeline.moveKeyframe(timeline.selectedKeyframe, parseInt($('#ktProp').val()));
    });
    $('#keyframeTypeSelect').on('change', function () {
        timeline.selectedKeyframe.type = keyframeTypes[$('#keyframeTypeSelect').val()];
    });
    $('#krProp').on('change', function () {
        timeline.selectedKeyframe.relative = $('#krProp').prop('checked');
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