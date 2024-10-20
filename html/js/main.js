$(document).ready(function () {
    let resName = "";

    window.addEventListener('message', function (event) {
        var type = event.data.type;
        var data = event.data.data;

        switch (type) {
            case 'open':
                $("body").style({ 'display': 'block' });
                break;
            case 'resName':
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