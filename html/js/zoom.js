; (function (document, window, undefined) {
    'use strict';

    var div_ref = null;
    var img_ref = null;

    let double_clip_last = 0;

    var
        div_half_width = null,
        div_half_height = null,
        img_original_width = null,
        img_original_height = null,
        img_current_width = null,
        img_current_height = null,
        img_current_left = null,
        img_current_top = null,
        zoom_levels = [],
        zoom_level_count = 0,
        zoom_limit = null,
        zoom_min_width = null,
        zoom_max_width = null,
        move_origin_cords = null,
        move_origin_left = null,
        move_origin_top = null

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

    function image_zoom_update(new_width) {
        var new_limit = 0,
            new_height = 0,
            ratio = 0;

        if (new_width == zoom_max_width) new_limit = (new_limit | 1);
        if (new_width == zoom_min_width) new_limit = (new_limit | 2);

        console.logTable({
            new_limit: new_limit,
            new_width: new_width,
            zoom_limit: zoom_limit,
            img_current_width: img_current_width
        })

        if (new_limit != 0 && new_limit != 3 && new_limit != zoom_limit && zoom_limit !== null) {
            div_ref.style.opacity = 0.5;
            setTimeout(function () { div_ref.style.opacity = 1; }, 150);
        }

        new_height = ((img_original_height / img_original_width) * new_width);

        if (img_current_left === null) {
            img_current_left = (div_half_width - (new_width / 2));
            img_current_top = (div_half_height - (new_height / 2));
        } else {
            ratio = (new_width / img_current_width);
            img_current_left = (div_half_width - ((div_half_width - img_current_left) * ratio));
            img_current_top = (div_half_height - ((div_half_height - img_current_top) * ratio));
        }

        img_current_width = new_width;
        img_current_height = new_height;

        img_ref.style.width = img_current_width + 'px';
        img_ref.style.height = img_current_height + 'px';
        img_ref.style.left = img_current_left + 'px';
        img_ref.style.top = img_current_top + 'px';

        return true;
    }

    function image_zoom_change(change) {
        var current_zoom = 0;

        for (let k = zoom_level_count; k >= 0; k--) {
            if (zoom_levels[k] <= img_current_width) {
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
        if (new_zoom > zoom_level_count) new_zoom = zoom_level_count;

        let new_width = zoom_levels[new_zoom];

        image_zoom_update(new_width);
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
        var max_left = (div_half_width - img_current_width),
            max_top = (div_half_height - img_current_height);

        if (new_left > div_half_width) { new_left = div_half_width; }
        if (new_top > div_half_height) { new_top = div_half_height; }
        if (new_left < max_left) { new_left = max_left; }
        if (new_top < max_top) { new_top = max_top; }

        img_current_left = new_left;
        img_current_top = new_top;

        img_ref.style.left = img_current_left + 'px';
        img_ref.style.top = img_current_top + 'px';
    }

    function image_move_event(e) {
        console.logger('image_move_event', e.type);
        //--------------------------------------------------
        // Calculations

        var new_cords = event_move_coords(e),
            new_left = (move_origin_left + (new_cords[0] - move_origin_cords[0])),
            new_top = (move_origin_top + (new_cords[1] - move_origin_cords[1]));

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

        move_origin_left = img_current_left;
        move_origin_top = img_current_top;
        move_origin_cords = event_move_coords(e);

        console.logTable({
            move_origin_left: move_origin_left,
            move_origin_top: move_origin_top,
            move_origin_cords: move_origin_cords
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
                div_half_width = div_style.getPropertyValue('width');
                div_half_height = div_style.getPropertyValue('height');
            } catch (e) {
                div_half_width = div_ref.currentStyle.width;
                div_half_height = div_ref.currentStyle.height;
            }

            div_half_width = Math.round(parseInt(div_half_width, 10) / 2);
            div_half_height = Math.round(parseInt(div_half_height, 10) / 2);

            img_original_width = img_ref.width;
            img_original_height = img_ref.height;

            let div_width = (div_half_width * 2);
            let div_height = (div_half_height * 2);

            let width = img_original_width;
            let height = img_original_height;

            img_current_width = null;
            img_current_height = null;
            img_current_left = null;
            img_current_top = null;

            zoom_limit = null;
            zoom_levels = [];
            zoom_levels[zoom_levels.length] = width * 3;
            zoom_levels[zoom_levels.length] = Math.round(img_original_width * 1.75);
            zoom_levels[zoom_levels.length] = width;

            while (width > div_width || height > div_height) {
                width = (width * 0.75);
                height = (height * 0.75);
                zoom_levels[zoom_levels.length] = Math.round(width);
            }

            console.logger(JSON.stringify(zoom_levels, null, 2));
            zoom_levels.reverse();
            zoom_level_count = (zoom_levels.length - 1);
            console.logger(JSON.stringify(zoom_levels, null, 2));

            zoom_min_width = zoom_levels[0];
            zoom_max_width = zoom_levels[zoom_level_count];

            image_zoom_update(zoom_levels[0]);
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
