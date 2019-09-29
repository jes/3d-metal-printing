$('#form').submit(function(e) {
    e.preventDefault();

    let r = new FileReader();
    r.readAsBinaryString($('#stlfile')[0].files[0]);
    $(r).on('load', function(e) {
        let model = load_stl(e.target.result);
        let proc = process_model(model, $('#material').val());
        console.log(proc);

        let maxdim = 400; // px
        let px_per_mm_x = maxdim / proc.bounding_box.size.x;
        let px_per_mm_y = maxdim / proc.bounding_box.size.y;

        $('#output')[0].appendChild(draw_bottom_layer(model, 0.2, px_per_mm_x < px_per_mm_y ? px_per_mm_x : px_per_mm_y));

        // TODO: generate a crude bitmap (maybe 1mm per pixel?) of the bottom layer, display it to the user, generate initial sprue points, and let them add/remove sprue points

        // TODO: generate sprue model with central platform to glue to metal bar, and then sprue points coming off

        // TODO: handle sprue points that are wider than the metal bar
    });
});
