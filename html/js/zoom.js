; (function (document, window, undefined) {
    'use strict';

    var div_ref = null;
    var img_ref = null;

    let double_clip_last = 0;

    var
        divHalfWidth = null,
        divHalfHeight = null,
        imgOriginalWidth = null,
        imgOriginalHeight = null,
        imgCurrentWidth = null,
        imgCurrentHeight = null,
        imgCurrentLeft = null,
        imgCurrentTop = null,
        zoomLevels = [],
        zoomLevelCount = 0,
        zoomLimit = null,
        zoomMinWidth = null,
        zoomMaxWidth = null,
        moveOriginCoords = null,
        moveOriginLeft = null,
        moveOriginTop = null

    if (typeof (Math) === 'undefined') {
        return false;
    }

    function addEventListener(obj, type, fn) {
        if (obj.addEventListener) {
            obj.addEventListener(type, fn, false);
        } else if (obj.attachEvent) {
            obj['e' + type + fn] = fn;
            obj[type + fn] = function () { obj['e' + type + fn](window.event); }
            obj.attachEvent('on' + type, obj[type + fn]);
        } else {
            obj['on' + type] = obj['e' + type + fn];
        }
    }

    function removeEventListener(obj, type, fn) {
        if (obj.removeEventListener) {
            obj.removeEventListener(type, fn, false);
        } else if (obj.detachEvent) {
            try {
                obj.detachEvent('on' + type, obj[type + fn]);
            } catch (e) {
            }
        } else {
            obj['on' + type] = null;
        }
    }

    function preventDefault(e) {
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
        return false;
    }

    function preventPropagationAndDefault(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        return preventDefault(e);
    }

    function event_move_coords(e) {
        var coords = [];
        if (e.touches && e.touches.length) {
            coords[0] = e.touches[0].clientX;
            coords[1] = e.touches[0].clientY;
        } else {
            coords[0] = e.clientX;
            coords[1] = e.clientY;
        }
        return coords;
    }

    function image_zoom_update(newWidth) {
        var new_limit = 0,
            newHeight = 0,
            ratio = 0;

        if (newWidth == zoomMaxWidth) new_limit = (new_limit | 1);
        if (newWidth == zoomMinWidth) new_limit = (new_limit | 2);

        console.logTable({
            new_limit: new_limit,
            newWidth: newWidth,
            zoomLimit: zoomLimit,
            imgCurrentWidth: imgCurrentWidth
        })

        if (new_limit != 0 && new_limit != 3 && new_limit != zoomLimit && zoomLimit !== null) {
            div_ref.style.opacity = 0.5;
            setTimeout(function () { div_ref.style.opacity = 1; }, 150);
        }

        newHeight = ((imgOriginalHeight / imgOriginalWidth) * newWidth);

        if (imgCurrentLeft === null) {
            imgCurrentLeft = (divHalfWidth - (newWidth / 2));
            imgCurrentTop = (divHalfHeight - (newHeight / 2));
        } else {
            ratio = (newWidth / imgCurrentWidth);
            imgCurrentLeft = (divHalfWidth - ((divHalfWidth - imgCurrentLeft) * ratio));
            imgCurrentTop = (divHalfHeight - ((divHalfHeight - imgCurrentTop) * ratio));
        }

        imgCurrentWidth = newWidth;
        imgCurrentHeight = newHeight;

        img_ref.style.width = imgCurrentWidth + 'px';
        img_ref.style.height = imgCurrentHeight + 'px';
        img_ref.style.left = imgCurrentLeft + 'px';
        img_ref.style.top = imgCurrentTop + 'px';

        return true;
    }

    function image_zoom_change(change) {
        var current_zoom = 0;

        for (let k = zoomLevelCount; k >= 0; k--) {
            if (zoomLevels[k] <= imgCurrentWidth) {
                current_zoom = k;
                break;
            }
        }

        if (current_zoom === 1) {
            img_ref.style.cursor = "grab";
        }
        console.logger("image_zoom_change", change, current_zoom);

        let new_zoom = (current_zoom + change);
        if (new_zoom < 0) new_zoom = 0;
        if (new_zoom > zoomLevelCount) new_zoom = zoomLevelCount;

        let newWidth = zoomLevels[new_zoom];

        image_zoom_update(newWidth);
    }

    function image_zoom_in(e) {
        image_zoom_change(1);
        return preventPropagationAndDefault(e);
    }

    function scroll_event(e) {
        var wheelData = 0;
        if (e.wheelDelta) wheelData = e.wheelDelta / -40;
        if (e.deltaY) wheelData = e.deltaY;
        if (e.detail) wheelData = e.detail;

        image_zoom_change(wheelData > 0 ? -1 : 1);
        return preventPropagationAndDefault(e);
    }

    function image_move_update(new_left, new_top) {
        var max_left = (divHalfWidth - imgCurrentWidth),
            max_top = (divHalfHeight - imgCurrentHeight);

        if (new_left > divHalfWidth) { new_left = divHalfWidth; }
        if (new_top > divHalfHeight) { new_top = divHalfHeight; }
        if (new_left < max_left) { new_left = max_left; }
        if (new_top < max_top) { new_top = max_top; }

        imgCurrentLeft = new_left;
        imgCurrentTop = new_top;

        img_ref.style.left = imgCurrentLeft + 'px';
        img_ref.style.top = imgCurrentTop + 'px';
    }

    function image_move_event(e) {
        console.logger('image_move_event', e.type);
        //--------------------------------------------------
        // Calculations

        var new_cords = event_move_coords(e),
            new_left = (moveOriginLeft + (new_cords[0] - moveOriginCoords[0])),
            new_top = (moveOriginTop + (new_cords[1] - moveOriginCoords[1]));

        console.logTable({
            new_cords: new_cords,
            new_left: new_left,
            new_top: new_top
        })

        image_move_update(new_left, new_top);

        return preventDefault(e);
    }

    //--------------------------------------------------
    // Image events

    function image_event_start(e) {
        image_event_end();
        console.logger('image_event_start', e.type);

        var now = new Date().getTime();
        if (double_clip_last > (now - 200)) {
            image_zoom_in(e);
        } else {
            double_clip_last = now;
        }

        moveOriginLeft = imgCurrentLeft;
        moveOriginTop = imgCurrentTop;
        moveOriginCoords = event_move_coords(e);

        console.logTable({
            moveOriginLeft: moveOriginLeft,
            moveOriginTop: moveOriginTop,
            moveOriginCoords: moveOriginCoords
        })

        console.logger('image_event_start registering events: image_move_event | image_event_end', e.type);
        addEventListener(document, 'mousemove', image_move_event);
        addEventListener(document, 'mouseup', image_event_end);
        if (e.target == img_ref) {
            return preventDefault(e);
        } else {
            return true;
        }
    }

    function image_event_end() {
        console.logger('image_event_end');

        removeEventListener(document, 'mousemove', image_move_event);
        removeEventListener(document, 'mouseup', image_event_end);
    }

    function init() {
        div_ref = document.getElementById('mapContainer');
        img_ref = document.getElementById('map');

        if (div_ref && img_ref) {
            try {
                let div_style = getComputedStyle(div_ref, '');
                divHalfWidth = div_style.getPropertyValue('width');
                divHalfHeight = div_style.getPropertyValue('height');
            } catch (e) {
                divHalfWidth = div_ref.currentStyle.width;
                divHalfHeight = div_ref.currentStyle.height;
            }

            divHalfWidth = Math.round(parseInt(divHalfWidth, 10) / 2);
            divHalfHeight = Math.round(parseInt(divHalfHeight, 10) / 2);

            imgOriginalWidth = img_ref.width;
            imgOriginalHeight = img_ref.height;

            let div_width = (divHalfWidth * 2);
            let div_height = (divHalfHeight * 2);

            let width = imgOriginalWidth;
            let height = imgOriginalHeight;

            imgCurrentWidth = null;
            imgCurrentHeight = null;
            imgCurrentLeft = null;
            imgCurrentTop = null;

            zoomLimit = null;
            zoomLevels = [];
            zoomLevels[zoomLevels.length] = width * 3;
            zoomLevels[zoomLevels.length] = Math.round(imgOriginalWidth * 1.75);
            zoomLevels[zoomLevels.length] = width;

            while (width > div_width || height > div_height) {
                width = (width * 0.75);
                height = (height * 0.75);
                zoomLevels[zoomLevels.length] = Math.round(width);
            }

            console.logger(JSON.stringify(zoomLevels, null, 2));
            zoomLevels.reverse();
            zoomLevelCount = (zoomLevels.length - 1);
            console.logger(JSON.stringify(zoomLevels, null, 2));

            zoomMinWidth = zoomLevels[0];
            zoomMaxWidth = zoomLevels[zoomLevelCount];

            image_zoom_update(zoomLevels[0]);
            img_ref.style.visibility = 'visible';

            // ty stack
            const wheel = 'onwheel' in document.createElement('div') ? 'wheel' :
                document.onmousewheel !== undefined ? 'mousewheel' :
                    'DOMMouseScroll';

            addEventListener(div_ref, wheel, scroll_event);
            addEventListener(div_ref, 'mousedown', image_event_start);

            div_ref.tabIndex = '0';
        }
    }

    addEventListener(window, 'load', init);
})(document, window);
