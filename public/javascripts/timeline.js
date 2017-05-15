function clr() {
    $('#keyframeBox').text('');
}
function log(str) {
    $('#keyframeBox').append(str + '<br/>');
}

function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

function formatTime(ms, decimals) {
    let overflow = Math.pow(10, decimals);
    ms = Math.round(ms);
    decimals = Math.min(Math.max(0, decimals), 3);
    let minutes = Math.floor(ms / 60000);
    let seconds = Math.floor(ms / 1000);
    while (seconds >= 60) {
        seconds -= 60;
        minutes += 1;
    }
    if (decimals == 0) {
        return pad(minutes, 2) + ':' + pad(seconds, 2);
    }
    let milli = ms % 1000;
    milli = Math.round(milli / Math.pow(10, (3 - decimals)));
    while (milli >= overflow) {
        milli -= overflow;
        seconds += 1;
    }
    return pad(minutes, 2) + ':' + pad(seconds, 2) + '.' + pad(milli, decimals);
}

function Timeline() {
    // hitbox
    this.hitbox = new Hitbox();
    var movingCursor = false;
    var grabbed = false;
    addHitbox(this.hitbox, timelineHitboxes);
    // text
    const stampFontSize = 10;
    const propFontSize = 12;
    const fontFace = 'Arial';
    const markerFreq = 18;
    const markersPerStamp = 3;
    const defaultTimelinePeriod = 3000;
    var _displayDecimals = 1;
    var _magnification = 1.0;
    const minMagnification = 0.01;
    const maxMagnification = 100;
    this.stampText = Object.create(Text).init('');
    this.stampText.originX = 0.0;
    this.stampText.originY = 0.5;
    this.stampText.fontSize = stampFontSize;
    this.stampText.fontFamily = fontFace;
    this.stampText.update();
    this.propText = Object.create(Text).init('');
    this.propText.originX = 1.0;
    this.propText.originY = 0.5;
    this.propText.fontSize = propFontSize;
    this.propText.fontFamily = fontFace;
    this.propText.update();
    this.magText = Object.create(Text).init('100%');
    this.magText.originX = 0.5;
    this.magText.originY = 0.5;
    this.magText.fontSize = stampFontSize;
    this.magText.fontFamily = fontFace;
    var laneNames = [];
    // time
    var _period = 0;
    var _timeOffset = 0;
    var _advance = 0;
    var _timelinePeriod = defaultTimelinePeriod;
    var _curTime = 0;
    // keyframes
    var keyLists = null;
    var preKeyLists = null;
    var postKeyLists = null;
    this.hiKeyframes = [];
    this.selectedKeyframe = null;
    var grabbedKeyframe = null;
    var keyframeGrabTool = false;
    const kSelectedFillColor = '#22664f';
    const kSelectedStrokeColor = '#99ffd6';
    const kActiveFillColor = '#662';
    const kActiveStrokeColor = '#ff9';
    const kInactiveFillColor = '#000';
    const kInactiveStrokeColor = '#ff9';
    const kDisabledFillColor = '#111';
    const kDisabledStrokeColor = '#aaa';
    // drawing
    const timeAreaHeight = 20;
    const infoAreaWidth = 100;
    var _pixelOffset = 0;
    var _minWidth = infoAreaWidth;
    var _minHeight = timeAreaHeight;
    var linePos = 0.0;
    var endLinePos = 0.0;
    var _pos = [0.0, 0.0];
    var _size = [100.0, 100.0];
    var _laneNum = 5;
    var _laneSize = 10;
    var objType = 'none';
    // buttons
    const buttonSpacing = 5;
    const buttonPadding = 0.2;
    var buttonHeight = timeAreaHeight * (1.0 - buttonPadding * 2);
    var buttonWidth = buttonHeight;
    var playButtonTop = 0;
    var playButtonLeft = 0;
    var playHitbox = new Hitbox();
    playHitbox.setBox(buttonWidth, buttonHeight);
    playHitbox.click(() => {
        if (globalPlaying) {
            pauseGlobalTime();
        }
        else {
            playGlobalTime();
        }
    });
    addHitbox(playHitbox, timelineHitboxes);
    //
    var stopHitbox = new Hitbox();
    var stopButtonTop = 0;
    var stopButtonLeft = 0;
    stopHitbox.setBox(buttonWidth, buttonHeight);
    stopHitbox.click(() => {
        pauseGlobalTime();
        setGlobalTime(0);
    });
    addHitbox(stopHitbox, timelineHitboxes);
    //
    var grabButtonTop = 0;
    var grabButtonLeft = 0;
    var grabHitbox = new Hitbox();
    grabHitbox.setBox(buttonWidth, buttonHeight);
    grabHitbox.click(() => {
        keyframeGrabTool = !keyframeGrabTool;
    });
    addHitbox(grabHitbox, timelineHitboxes);
    //
    var magHitbox = new Hitbox();
    var magButtonPadding = 2;
    var magButtonTop = 0;
    var magButtonLeft = 0;
    var _magButtonWidth = 0;
    var magButtonHeight = buttonHeight;
    magHitbox.click(() => {
        this.magnification = 1.0;
    });
    addHitbox(magHitbox, timelineHitboxes);
    let findHighlighted = (keys, offset) => {
        for (let k in keys) {
            for (let f in keys[k].keyframes) {
                let kTime = keys[k].keyframes[f].time + offset;
                let highlight = (kTime == this.curTime && !globalPlaying);
                if (highlight) {
                    this.hiKeyframes.push(keys[k].keyframes[f]);
                }
            }
        }
    }
    //
    Object.defineProperties(this, {
        "magButtonWidth": {
            "get": function () { return _magButtonWidth; },
            "set": function (mbw) {
                _magButtonWidth = mbw;
                magButtonLeft = this.left + infoAreaWidth - (buttonWidth + buttonSpacing) * 3 - (_magButtonWidth + buttonSpacing);
                magHitbox.setPos(magButtonLeft, magButtonTop);
                magHitbox.setBox(_magButtonWidth, magButtonHeight);
            }
        },
        "magnification": {
            "get": function () { return _magnification; },
            "set": function (m) {
                if (m > minMagnification && m < maxMagnification) {
                    _magnification = m;
                }
                this.timelinePeriod = defaultTimelinePeriod * _magnification;
                this.magText.text = Math.round(1 / _magnification * 100) + '%';
                this.magText.update();
                this.magButtonWidth = this.magText.c.width + magButtonPadding * 2;
            }
        },
        "curTime": {
            "get": function () { return _curTime; },
            "set": function (ct) {
                _curTime = ct;
                this.hiKeyframes.length = 0;
                findHighlighted(keyLists, this.prePeriod);
                findHighlighted(preKeyLists, 0);
                findHighlighted(postKeyLists, this.prePeriod + this.period);
                $('.prop-window-item').removeClass('active-keyframe');
                $('.prop-window-item').prop('disabled', true);
                for (let h in this.hiKeyframes) {
                    $(this.hiKeyframes[h].propInfo.propId).addClass('active-keyframe');
                    $(this.hiKeyframes[h].propInfo.propId).prop('disabled', false);
                }
            }
        },
        "laneNum": {
            "get": function () {
                return _laneNum;
            },
            "set": function (ln) {
                _laneNum = ln;
                _laneSize = (this.height - timeAreaHeight) / _laneNum;
            }
        },
        "laneSize": { "get": function () { return _laneSize; } },
        "posX": {
            "get": function () { return _pos[0]; },
            "set": function (px) {
                _pos[0] = px;
                this.hitbox.setPos(_pos[0], _pos[1]);
                playButtonLeft = this.left + infoAreaWidth - (buttonWidth + buttonSpacing);
                playHitbox.setPos(playButtonLeft, playButtonTop);
                stopButtonLeft = this.left + infoAreaWidth - (buttonWidth + buttonSpacing) * 2;
                stopHitbox.setPos(stopButtonLeft, stopButtonTop);
                grabButtonLeft = this.left + infoAreaWidth - (buttonWidth + buttonSpacing) * 3;
                grabHitbox.setPos(grabButtonLeft, grabButtonTop);
                this.magButtonWidth = this.magButtonWidth;
            }
        },
        "posY": {
            "get": function () { return _pos[1]; },
            "set": function (py) {
                _pos[1] = py;
                this.hitbox.setPos(_pos[0], _pos[1]);
                playButtonTop = this.top + timeAreaHeight * buttonPadding;
                playHitbox.setPos(playButtonLeft, playButtonTop);
                stopButtonTop = this.top + timeAreaHeight * buttonPadding;
                stopHitbox.setPos(stopButtonLeft, stopButtonTop);
                grabButtonTop = this.top + timeAreaHeight * buttonPadding;
                grabHitbox.setPos(grabButtonLeft, grabButtonTop);
                magButtonTop = this.top + timeAreaHeight * buttonPadding;
                magHitbox.setPos(magButtonLeft, magButtonTop);
            }
        },
        "timeAreaWidth": {
            "get": function () { return this.width - infoAreaWidth; }
        },
        "advance": {
            "get": function () { return _advance; },
            "set": function (a) {
                _advance = a;
                let adv = _advance * markersPerStamp;
                _displayDecimals = 3;
                // if (adv >= 10000) {
                //     _displayDecimals = 0;
                // }
                // else if (adv >= 1000) {
                //     _displayDecimals = 1;
                // }
                // else if (adv >= 100) {
                //     _displayDecimals = 2;
                // }
                // else {
                //     _displayDecimals = 3;
                // }
            }
        },
        "displayDecimals": {
            "get": function () { return _displayDecimals; }
        },
        "width": {
            "get": function () { return _size[0]; },
            "set": function (w) {
                _size[0] = w;
                this.hitbox.setBox(_size[0], _size[1]);
                _pixelOffset = this.timeOffset / this.timelinePeriod * this.timeAreaWidth;
            }
        },
        "height": {
            "get": function () { return _size[1]; },
            "set": function (h) {
                _size[1] = h;
                this.hitbox.setBox(_size[0], _size[1]);
                _laneSize = (this.height - timeAreaHeight) / _laneNum;
            }
        },
        "minHeight": {
            "get": function () { return _minHeight; },
            "set": function (mh) {
                _minHeight = Math.max(mh, 1);
            }
        },
        "minWidth": {
            "get": function () { return _minWidth; },
            "set": function (mw) {
                _minWidth = Math.max(mw, 1);
            }
        },
        "left": {
            "get": function () {
                return this.posX;
            },
            "set": function (l) {
                let oldL = this.posX;
                this.posX = l;
                this.width += oldL - l;
                this.width = Math.max(this.width, this.minWidth);
            }
        },
        "right": {
            "get": function () {
                return this.posX + this.width;
            },
            "set": function (r) {
                let oldR = this.posX + this.width;
                this.width += r - oldR;
                this.posX = Math.min(this.posX, this.posX + this.width);
                this.width = Math.max(this.width, this.minWidth);
            }
        },
        "top": {
            "get": function () {
                return this.posY;
            },
            "set": function (t) {
                let oldT = this.posY;
                this.posY = t;
                this.height += oldT - t;
                this.height = Math.max(this.height, this.minHeight);
            }
        },
        "bottom": {
            "get": function () {
                return this.posY + this.height;
            },
            "set": function (b) {
                let oldB = this.posY + this.height;
                this.height += b - oldB;
                this.posY = Math.min(this.posY, this.posY + this.height);
                this.height = Math.max(this.height, this.minHeight);
            }
        },
        "period": {
            "get": function () { return _period; },
            "set": function (p) {
                _period = p;
                _pixelOffset = this.timeOffset / this.timelinePeriod * this.timeAreaWidth;
                this.advance = this.timelinePeriod / markerFreq;
            }
        },
        "prePeriod": {
            "get": function () {
                if (preKeyLists === null || preKeyLists.length == 0) {
                    return 0;
                }
                return preKeyLists[0].anim.period;
            }
        },
        "postPeriod": {
            "get": function () {
                if (postKeyLists === null || postKeyLists.length == 0) {
                    return 0;
                }
                return postKeyLists[0].anim.period;
            }
        },
        "timelinePeriod": {
            "get": function () { return _timelinePeriod; },
            "set": function (ts) {
                _timelinePeriod = ts;
                this.advance = _timelinePeriod / markerFreq;
            }
        },
        "timeOffset": {
            "get": function () { return _timeOffset; },
            "set": function (to) {
                _timeOffset = Math.max(to, 0);
                _pixelOffset = (this.timeOffset / this.timelinePeriod * this.timeAreaWidth);
            }
        },
        "pixelOffset": {
            "get": function () { return _pixelOffset; },
            "set": function (po) {
                _pixelOffset = Math.max((po), 0);
                _timeOffset = (this.timelinePeriod / this.timeAreaWidth * _pixelOffset);
            }
        }
    });
    this.left = 0;
    this.top = 0;
    this.magnification = 1.0;
    this.period = 1000;
    var pThis = this;
    this.selectKeyframe = (keyframe, lane = -1) => {
        this.selectedKeyframe = keyframe;
        if (keyframe === null) {
            $('#keyframePropsBox').hide();
            $('#kpProp').text('');
        }
        else {
            $('#kpProp').text(' (' + activeKeyframeLists[lane].propInfo.name + ')');
            $('#keyframePropsBox').show();
            $('#ktProp').val(keyframe.time);
            $('#krProp').prop('checked', keyframe.relative);
            $('#keyframeTypeSelect').val(keyframe.type.id);
        }
    }
    function grabKeyframe(keyframe) {
        grabbedKeyframe = keyframe;
    }
    this.moveKeyframe = (keyframe, time) => {
        time = Math.min(keyframe.parentList.anim.period, Math.max(Math.round(time), 0));
        keyframe.time = time;
        if (keyframe === this.selectedKeyframe) {
            $('#ktProp').val(keyframe.time);
        }
        keyframe.parentList.sort();
    }
    this.findKeyframe = (event) => {
        if (keyLists !== null) {
            let l = Math.floor((event.pageY - (pThis.top + timeAreaHeight)) / pThis.laneSize);
            if (l >= 0 && l < keyLists.length) {
                let uPos = event.pageX - pThis.posX - infoAreaWidth;
                for (let f in keyLists[l].keyframes) {
                    if (Math.abs(uPos - getPixelPos(keyLists[l].keyframes[f].time + this.prePeriod)) < keyframeSize) {
                        if (event.type == 'mousedown') {
                            if (event.which == 1) { // left button
                                pThis.selectKeyframe(keyLists[l].keyframes[f], l);
                                grabKeyframe(keyLists[l].keyframes[f]);
                            }
                            else if (event.which == 2) { // middle button
                                keyLists[l].removeKeyframe(keyLists[l].keyframes[f]);
                            }
                        }
                        else if (event.type == 'mousemove') {
                            pThis.selectKeyframe(keyLists[l].keyframes[f], l);
                        }
                        return;
                    }
                }
            }
        }
    }
    function checkKeyframes(event, list, lane, offset) {
        let uPos = event.pageX - pThis.posX - infoAreaWidth;
        for (let f in list.keyframes) {
            if (Math.abs(uPos - getPixelPos(list.keyframes[f].time + offset)) < keyframeSize) {
                if (event.type == 'mousedown') {
                    if (event.which == 1) { // left button
                        console.log('selected');
                        pThis.selectKeyframe(list.keyframes[f], lane);
                    }
                    else if (event.which == 2) { // middle button
                        list.removeKeyframe(list.keyframes[f]);
                        return null;
                    }
                }
                else if (event.type == 'mousemove') {
                    pThis.selectKeyframe(list.keyframes[f], lane);
                }
                return list.keyframes[f];
            }
        }
        return null;
    }
    this.moveTimeCursor = (event) => {
        let t = Math.round(getTime(event.pageX - this.left - infoAreaWidth) + 2 * this.timeOffset);
        let keyFound = null;
        if (keyLists !== null && !globalPlaying) {
            let l = Math.floor((event.pageY - (this.top + timeAreaHeight)) / this.laneSize);
            if (l >= 0 && l < keyLists.length) {
                keyFound = checkKeyframes(event, keyLists[l], l, this.prePeriod);
                if (keyFound === null) {
                    if (preKeyLists !== null) {
                        keyFound = checkKeyframes(event, preKeyLists[l], l, 0);
                        if (keyFound === null) {
                            if (postKeyLists !== null) {
                                keyFound = checkKeyframes(event, postKeyLists[l], l, this.prePeriod + this.period);
                                if (keyFound !== null) {
                                    t = keyFound.time + this.prePeriod + this.period;
                                }
                            }
                        }
                        else {
                            t = keyFound.time;
                        }
                    }
                }
                else {
                    t = keyFound.time + this.prePeriod;
                }
            }
        }
        if (keyFound === null) {
            pThis.selectKeyframe(null);
        }
        if (t >= 0) {
            setGlobalTime(t);
        }
    }
    $(document).keydown((event) => {
        if (event.which == 192) { // `
            stopHitbox.click();
        }
        else if (event.which == 32) { // space
            playHitbox.click();
        }
    });
    this.hitbox.dblclick((event) => {
        if (keyLists === null) {
            return;
        }
        let l = Math.floor((event.pageY - (pThis.top + timeAreaHeight)) / pThis.laneSize);
        if (l >= 0 && l < keyLists.length) {
            let t = Math.round(getTime(event.pageX - pThis.left - infoAreaWidth) + 2 * pThis.timeOffset);
            if (t < 0) {
                t = this.curTime;
            }
            let val = $(keyLists[l].propInfo.propId).val();
            let newKey = new Keyframe(t, keyframeTypes.instant, val);
            keyLists[l].addKeyframe(newKey);
            this.curTime = this.curTime;
        }
    });
    this.hitbox.mousedown((event) => {
        movingCursor = false;
        grabbed = false;
        if (event.which == 1) { // left button
            if (keyframeGrabTool) {
                this.findKeyframe(event);
            }
            else {
                pThis.moveTimeCursor(event);
                movingCursor = true;
            }
        }
        else if (event.which == 3) { // right button
            grabbed = true;
        }
        else if (event.which == 2) { // middle button
            pThis.moveTimeCursor(event);
        }
    });
    $(document).mouseup(() => {
        movingCursor = false;
        grabbed = false;
        grabKeyframe(null);
    });
    $(document).mousemove(function (event) {
        if (!this.lastMouse) this.lastMouse = [0, 0];
        if (movingCursor) {
            pThis.moveTimeCursor(event);
        }
        else if (grabbed) {
            let moved = [event.pageX - this.lastMouse[0], event.pageY - this.lastMouse[1]];
            pThis.pixelOffset -= moved[0];
        }
        else if (grabbedKeyframe !== null) {
            pThis.moveKeyframe(grabbedKeyframe, getTime(event.pageX - pThis.left - infoAreaWidth) + 2 * pThis.timeOffset - pThis.prePeriod);
        }
        this.lastMouse = [event.pageX, event.pageY];
        if (pThis.hitbox.contains(this.lastMouse[0], this.lastMouse[1])) {
            let t = getTime(event.pageX - pThis.left - infoAreaWidth) + 2 * pThis.timeOffset;
            if (t < 0) {
                hideTooltip();
            }
            else {
                showTooltip(this.lastMouse, formatTime(t, 3));
            }
        }
        else {
            hideTooltip();
        }
    });
    this.hitbox.mousewheel((e) => {
        if (e.originalEvent.wheelDelta > 0) {
            this.magnification *= 0.9;
        }
        else {
            this.magnification /= 0.9;
        }
    });

    this.setObjType = (type) => {
        objType = type;
        if (type === null) {
            this.laneNum = 1;
            laneNames = [''];
            return;
        }
        this.laneNum = propTypes[type].length;
        laneNames.length = 0;
        for (let p in propTypes[type]) {
            laneNames.push(propTypes[type][p].name);
        }
    }
    this.setKeyLists = (keys, preKeys = null, postKeys = null) => {
        preKeyLists = preKeys;
        postKeyLists = postKeys;
        keyLists = keys;
        // reset keyframe values
        this.curTime = this.curTime;
    }
    var getPixelPos = (time) => {
        let oTime = time - this.timeOffset;
        return oTime * this.timeAreaWidth / this.timelinePeriod;
    }
    var getPixelWidth = (time) => {
        return time * this.timeAreaWidth / this.timelinePeriod;
    }
    var getTime = (pixel) => {
        let oPixel = pixel - this.pixelOffset;
        return oPixel * this.timelinePeriod / this.timeAreaWidth;
    }
    var drawTimeMarker = (ctx, time, markerNum) => {
        let markerAdvance = this.timeAreaWidth / markerFreq;
        let withStamp = ((markerNum + Math.floor(this.pixelOffset / markerAdvance) % markersPerStamp) % markersPerStamp == 0);
        let linePixelPos = this.posX + infoAreaWidth + (markerNum * markerAdvance);
        linePixelPos -= this.pixelOffset % markerAdvance;
        // line
        ctx.beginPath();
        ctx.moveTo(linePixelPos, this.top);
        if (withStamp) { ctx.lineTo(linePixelPos, this.top + timeAreaHeight); }
        else { ctx.lineTo(linePixelPos, this.top + timeAreaHeight * 0.5); }
        ctx.strokeStyle = '#999';
        ctx.stroke();
        if (withStamp) {
            // timestamp
            this.stampText.text = formatTime(time, this.displayDecimals);
            this.stampText.update();
            this.stampText.x = linePixelPos + 5;
            this.stampText.y = this.top + timeAreaHeight / 2;
            ctx.fillStyle = '#fff';
            this.stampText.draw(ctx);
        }
    }
    const keyframeSize = 5;
    var drawKeyframe = (ctx, lane, time, status) => {
        //time += 300;
        let pixPos = getPixelPos(time);
        if (pixPos + keyframeSize < 0 || pixPos - keyframeSize >= this.width) {
            return;
        }
        if (status == 'selected') {
            ctx.fillStyle = kSelectedFillColor;
            ctx.strokeStyle = kSelectedStrokeColor;
        }
        else if (status == 'active') {
            ctx.fillStyle = kActiveFillColor;
            ctx.strokeStyle = kActiveStrokeColor;
        }
        else if (status == 'disabled') {
            ctx.fillStyle = kDisabledFillColor;
            ctx.strokeStyle = kDisabledStrokeColor;
        }
        else {
            ctx.fillStyle = kInactiveFillColor;
            ctx.strokeStyle = kInactiveStrokeColor;
        }
        let kPos = [this.left + infoAreaWidth + pixPos, this.top + timeAreaHeight + this.laneSize * (lane + 0.5)];
        ctx.beginPath();
        ctx.moveTo(kPos[0], kPos[1] - keyframeSize);
        ctx.lineTo(kPos[0] + keyframeSize, kPos[1]);
        ctx.lineTo(kPos[0], kPos[1] + keyframeSize);
        ctx.lineTo(kPos[0] - keyframeSize, kPos[1]);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    this.draw = (ctx) => {
        ctx.strokeStyle = '#fff';

        /* timeline area */
        // box bg
        ctx.beginPath();
        ctx.rect(this.posX + infoAreaWidth, this.posY, this.width - infoAreaWidth, this.height);
        ctx.fillStyle = '#000';
        ctx.fill();
        let pixelWidth = getPixelPos(this.period);
        // pre bg
        let prePixelWidth = getPixelWidth(this.prePeriod);
        ctx.beginPath();
        ctx.rect(this.posX + infoAreaWidth + getPixelPos(0), this.posY, prePixelWidth, this.height);
        ctx.fillStyle = kDisabledFillColor;
        ctx.fill();
        // post bg
        let postPixelWidth = getPixelWidth(this.postPeriod);
        ctx.beginPath();
        ctx.rect(this.posX + infoAreaWidth + prePixelWidth + pixelWidth, this.posY, postPixelWidth, this.height);
        ctx.fillStyle = kDisabledFillColor;
        ctx.fill();
        // current time
        let linePixelPos = getPixelPos(this.curTime) + this.left + infoAreaWidth;
        if (linePixelPos >= this.left + infoAreaWidth && linePixelPos < this.right) {
            ctx.beginPath();
            ctx.moveTo(linePixelPos, this.top + timeAreaHeight);
            ctx.lineTo(linePixelPos, this.bottom);
            ctx.strokeStyle = '#ff9';
            ctx.stroke();
        }
        // end time
        linePixelPos = getPixelPos(this.period + this.prePeriod + this.postPeriod) + this.left + infoAreaWidth;
        if (linePixelPos >= this.left + infoAreaWidth && linePixelPos < this.right) {
            ctx.beginPath();
            ctx.moveTo(linePixelPos, this.top + timeAreaHeight);
            ctx.lineTo(linePixelPos, this.bottom);
            ctx.strokeStyle = '#f99';
            ctx.stroke();
        }
        // keyframes
        if (keyLists !== null) {
            for (let k in preKeyLists) {
                for (let f in preKeyLists[k].keyframes) {
                    let kTime = preKeyLists[k].keyframes[f].time;
                    let status = 'disabled';
                    if (preKeyLists[k].keyframes[f] === this.selectedKeyframe) {
                        status = 'selected';
                    }
                    else if (this.hiKeyframes.indexOf(preKeyLists[k].keyframes[f]) >= 0) {
                        status = 'active';
                    }
                    drawKeyframe(ctx, parseInt(k), kTime, status);
                }
            }
            for (let k in postKeyLists) {
                for (let f in postKeyLists[k].keyframes) {
                    let kTime = postKeyLists[k].keyframes[f].time + this.prePeriod + this.period;
                    let status = 'disabled';
                    if (postKeyLists[k].keyframes[f] === this.selectedKeyframe) {
                        status = 'selected';
                    }
                    else if (this.hiKeyframes.indexOf(postKeyLists[k].keyframes[f]) >= 0) {
                        status = 'active';
                    }
                    drawKeyframe(ctx, parseInt(k), kTime, status);
                }
            }
            for (let k in keyLists) {
                for (let f in keyLists[k].keyframes) {
                    let kTime = keyLists[k].keyframes[f].time + this.prePeriod;
                    let status = 'inactive';
                    if (keyLists[k].keyframes[f] === this.selectedKeyframe) {
                        status = 'selected';
                    }
                    else if (this.hiKeyframes.indexOf(keyLists[k].keyframes[f]) >= 0) {
                        status = 'active';
                    }
                    drawKeyframe(ctx, parseInt(k), kTime, status);
                }
            }
        }

        /* time area */
        ctx.beginPath();
        ctx.rect(this.posX + infoAreaWidth, this.posY, this.width, timeAreaHeight);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        let endTime = this.timelinePeriod + this.timeOffset + this.advance;
        let markerAdvance = this.timeAreaWidth / markerFreq;
        let ta = Math.floor(this.timeOffset / this.advance);
        for (let m = this.timeOffset, ma = 0; m < endTime; m += this.advance, ma++) {
            drawTimeMarker(ctx, (m - this.timeOffset) + (this.advance * ta), ma);
        }

        /* info area */
        // box bg
        ctx.beginPath();
        ctx.rect(this.posX, this.posY, infoAreaWidth, this.height);
        ctx.fillStyle = '#000';
        ctx.fill();
        // text
        for (let t in laneNames) {
            this.propText.text = laneNames[t];
            this.propText.update();
            // this.propText.c.width
            let tPos = [this.left + infoAreaWidth - 20, this.top + timeAreaHeight + this.laneSize * (parseInt(t) + 0.5)];
            this.propText.x = tPos[0];
            this.propText.y = tPos[1];
            ctx.fillStyle = '#fff';
            this.propText.draw(ctx);
        }
        // lanes
        let startPos = this.top + timeAreaHeight;
        let laneEnd = Math.max(this.left + infoAreaWidth, Math.min(this.right, linePixelPos));
        for (let k = 0; k < this.laneNum; k++) {
            ctx.beginPath();
            let yPos = startPos + k * this.laneSize;
            ctx.moveTo(this.left, yPos);
            ctx.lineTo(laneEnd, yPos);
            ctx.strokeStyle = '#333';
            ctx.stroke();
        }
        // box
        ctx.beginPath();
        ctx.rect(this.posX, this.posY, infoAreaWidth, this.height);
        ctx.lineWidth = 0;
        ctx.strokeStyle = '#fff';
        ctx.stroke();

        /* all */
        // box
        ctx.beginPath();
        ctx.rect(this.posX, this.posY, this.width, this.height);
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        // buttons
        if (globalPlaying) {
            ctx.beginPath();
            ctx.rect(playButtonLeft, playButtonTop, buttonWidth * 0.3, buttonHeight);
            ctx.fillStyle = '#776622';
            ctx.strokeStyle = '#ffb933';
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.rect(playButtonLeft + buttonWidth * 0.7, playButtonTop, buttonWidth * 0.3, buttonHeight);
            ctx.fill();
            ctx.stroke();
        }
        else {
            ctx.beginPath();
            ctx.moveTo(playButtonLeft, playButtonTop);
            ctx.lineTo(playButtonLeft, playButtonTop + buttonHeight);
            ctx.lineTo(playButtonLeft + buttonWidth, playButtonTop + buttonHeight / 2);
            ctx.closePath();
            ctx.fillStyle = '#227722';
            ctx.strokeStyle = '#33ff33';
            ctx.fill();
            ctx.stroke();
        }
        // stop button
        ctx.beginPath();
        ctx.rect(stopButtonLeft, stopButtonTop, buttonWidth, buttonHeight);
        ctx.fillStyle = '#772222';
        ctx.strokeStyle = '#ff3333';
        ctx.fill();
        ctx.stroke();
        // grab button
        let grabMidX = grabButtonLeft + buttonWidth / 2;
        let grabMidY = grabButtonTop + buttonHeight / 2;
        ctx.beginPath();
        ctx.moveTo(grabMidX, grabButtonTop);
        ctx.lineTo(grabButtonLeft + buttonWidth, grabMidY);
        ctx.lineTo(grabMidX, grabButtonTop + buttonHeight);
        ctx.lineTo(grabButtonLeft, grabMidY);
        ctx.closePath();
        if (keyframeGrabTool) {
            ctx.fillStyle = kActiveFillColor;
            ctx.strokeStyle = kActiveStrokeColor;
        }
        else {
            ctx.fillStyle = kInactiveFillColor;
            ctx.strokeStyle = kInactiveStrokeColor;
        }
        ctx.fill();
        ctx.stroke();
        // mag button
        ctx.beginPath();
        ctx.rect(magButtonLeft, magButtonTop, this.magButtonWidth, magButtonHeight);
        ctx.fillStyle = '#224c77';
        ctx.strokeStyle = '#3363ff';
        ctx.fill();
        ctx.stroke();
        this.magText.x = magButtonLeft + this.magButtonWidth / 2;
        this.magText.y = magButtonTop + magButtonHeight / 2;
        ctx.fillStyle = '#fff';
        this.magText.draw(ctx);
    }
    this.reset = () => {
        this.setKeyLists(null);
        this.setObjType(null);
        this.selectKeyframe(null);
        this.period = 0;
        this.timeOffset = 0;
        this.magnification = 1.0;
        pauseGlobalTime();
        setGlobalTime(0);
    }
}