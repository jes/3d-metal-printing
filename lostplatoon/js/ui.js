$('#form').submit(function(e) {
    e.preventDefault();

    let r = new FileReader();
    r.readAsBinaryString($('#stlfile')[0].files[0]);
    $(r).on('load', function(e) {
        console.log(process_model(load_stl(e.target.result), "aluminium"));
    });
});
