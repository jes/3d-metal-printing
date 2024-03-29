let workingmodel;
let workingmodelproc;
let spruelegs = [];
let imsize = 400; // px

$('#form').submit(function(e) {
    e.preventDefault();

    let r = new FileReader();
    r.readAsBinaryString($('#stlfile')[0].files[0]);
    // TODO: handle errors
    $(r).on('load', function(e) {
        workingmodel = load_stl(e.target.result);
        workingmodelproc = process_model(workingmodel, $('#material').val());
        console.log(workingmodelproc);

        redraw();

        // TODO: generate initial sprue points, and let them add/remove sprue points

        // TODO: generate sprue model with central platform to glue to metal bar, and then sprue points coming off

        // TODO: handle sprue points that are wider than the metal bar
    });
});

$('#removelast').click(function() {
    spruelegs.pop();
    redraw();
});

$('#clearsprue').click(function() {
    spruelegs = [];
    redraw();
});

function redraw() {
    let flaskdiameter = parseFloat($('#flaskdiameter').val());
    let flaskheight = parseFloat($('#flaskheight').val());
    let flaskclearance = parseFloat($('#flaskclearance').val());

    let spruelegheight = parseFloat($('#spruelegheight').val());
    let spruepuckheight = parseFloat($('#spruepuckheight').val());

    let roddiameter = parseFloat($('#roddiameter').val());

    let px_per_mm = imsize / flaskdiameter;

    $('#output').empty();
    $('#output')[0].appendChild(draw_bottom_layer(workingmodel, spruelegs, 0.1, imsize, imsize, px_per_mm, draw_flask_func(imsize/2, imsize/2, flaskdiameter, flaskclearance)));

    // make sure the rod contains 2x the volume of the model plus sprues
    let spruevolume = sprue_volume(spruelegs, spruelegheight, spruepuckheight, roddiameter);
    let rodvolume = 2 * (workingmodelproc.volume + spruevolume)
    let rodheight = rodvolume / (Math.PI * (roddiameter/2)*(roddiameter/2));
    console.log("Rod height = " + rodheight);

    // calculate rod mass
    let rodmass = mass(rodvolume, $('#material').val());
    console.log("Rod mass = " + rodmass + " g");

    // calculate plaster volume while we're here...
    let flaskvolume = Math.PI * (flaskdiameter/2) * (flaskdiameter/2) * flaskheight;
    let plastervolume = flaskvolume - rodvolume - spruevolume - workingmodelproc.volume; // mm^3
    console.log("Plaster volume required = " + plastervolume/1000 + " ml");

    $('#output')[0].appendChild(draw_side_view(workingmodel, spruelegs, spruelegheight, roddiameter, spruepuckheight, rodheight, imsize, imsize, imsize/flaskheight, draw_flask_side_func(imsize/2, imsize/2, flaskdiameter, flaskheight, flaskclearance)));

    $($('#output')[0].children[0]).click(function(e) {
        let offset = $(this).offset();
        let x = e.pageX - offset.left;
        let y = e.pageY - offset.top;

        let xoff = imsize/2 - (workingmodelproc.bounding_box.size.x/2)*px_per_mm;
        let yoff = imsize/2 - (workingmodelproc.bounding_box.size.y/2)*px_per_mm;
        let x_mm = (x - xoff)/px_per_mm + workingmodelproc.bounding_box.min.x;
        let y_mm = (y - yoff)/px_per_mm + workingmodelproc.bounding_box.min.y;

        let spruelegdiameter = parseFloat($('#spruelegdiameter').val());

        spruelegs.push({
            x: x_mm,
            y: y_mm,
            diameter: spruelegdiameter,
        });

        redraw();
    });
}

function sprue_volume(spruelegs, spruelegheight, puckheight, puckdiameter) {
    if (spruelegs.length == 0)
        return 0;

    let vol = Math.PI * (puckdiameter/2) * (puckdiameter/2) * puckheight;

    for (let i = 0; i < spruelegs.length; i++) {
        let l = spruelegs[i];
        vol += Math.PI * (l.diameter/2) * (l.diameter/2) * spruelegheight;
    }

    return vol;
}
