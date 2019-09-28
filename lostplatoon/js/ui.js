$('#form').submit(function(e) {
    e.preventDefault();

    let r = new FileReader();
    r.readAsBinaryString($('#stlfile')[0].files[0]);
    $(r).on('load', function(e) {
        console.log(process_model(load_stl(e.target.result), $('#material').val()));

        // TODO: generate a crude bitmap (maybe 1mm per pixel?) of the bottom layer, display it to the user, generate initial sprue points, and let them add/remove sprue points

        // TODO: generate sprue model with central platform to glue to metal bar, and then sprue points coming off

        // TODO: handle sprue points that are wider than the metal bar
    });
});
