const debug = false;

console.logger = function (a) {
    if (debug) console.log(a);
}

console.logTable = function (a) {
    if (debug) console.table(a);
}

$(document).ready(function () {
    let resName = "";

    window.addEventListener('message', function (event) {
        var type = event.data.type;
        var data = event.data.data;

        console.logger(`[DEBUG] type: ${type}, data: ${data}`);
        switch (type) {
            case 'open':
                $("body").style({ 'display': 'block' });
                break;
            case 'resName':
                console.logger(`[DEBUG] resName: ${data}`);
                resName = data;
                break;
        }
    });

    // onkeydown
    $(document).on('keydown', function (e) {
        if (e.which == 27) {
            $.post(`https://${resName}/close`, JSON.stringify({}));
        }
    });
});