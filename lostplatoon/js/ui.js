$('#form').submit(function(e) {
    e.preventDefault();

    let r = new FileReader();
    r.readAsBinaryString($('#stlfile')[0].files[0]);
    $(r).on('load', function(e) {
        let model = load_stl(e.target.result);
        let proc = process_model(model, $('#material').val());
        console.log(proc);

        let flaskdiameter = parseFloat($('#flaskdiameter').val());
        let flaskclearance = parseFloat($('#flaskclearance').val());

        let imsize = 400; // px
        let px_per_mm = imsize / flaskdiameter;

        $('#output')[0].appendChild(draw_bottom_layer(model, 0.2, imsize, imsize, px_per_mm, draw_flask_func(imsize/2, imsize/2, flaskdiameter, flaskclearance)));

        // TODO: generate initial sprue points, and let them add/remove sprue points

        // TODO: generate sprue model with central platform to glue to metal bar, and then sprue points coming off

        // TODO: handle sprue points that are wider than the metal bar
    });
});
