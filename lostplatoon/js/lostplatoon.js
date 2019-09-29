// read the list of triangles from the input and return a map describing it
function process_model(model, material) {
    let vol = model_volume(model);
    return {
        volume: vol,
        mass: mass(vol, material),
        model: model,
        num_triangles: model.length,
        bounding_box: bounding_box(model),
    };
}

// return the volume of the part, measured in mm^3
// https://stackoverflow.com/a/6553755
function model_volume(model) {
    let volume = 0;

    for (let i = 0; i < model.length; i++) {
        let t = model[i];
        volume += (-t[2].x*t[1].y*t[0].z + t[1].x*t[2].y*t[0].z + t[2].x*t[0].y*t[1].z - t[0].x*t[2].y*t[1].z - t[1].x*t[0].y*t[2].z + t[0].x*t[1].y*t[2].z)/6.;
    }

    return volume;
}

// return the density of the given material in g/mm^3
function density(material) {
    let map = {
        "aluminium": .0027,
        "brass": .0085,
        "bronze": .0080,
        "copper": .0090,
        "pewter": .0072,
        "pla": .0012,
        "zinc": .0071,
    };
    return map[material];
}

// return the mass for the given volume of the given material
function mass(volume, material) {
    return volume * density(material);
}

function bounding_box(model) {
    let minx = 100000, miny = 100000, minz = 100000;
    let maxx = 0, maxy = 0, maxz = 0;

    for (let i = 0; i < model.length; i++) {
        let t = model[i];

        for (let j = 0; j < 3; j++) {
            if (t[j].x < minx)
                minx = t[j].x;
            if (t[j].x > maxx)
                maxx = t[j].x;
            if (t[j].y < miny)
                miny = t[j].y;
            if (t[j].y > maxy)
                maxy = t[j].y;
            if (t[j].z < minz)
                minz = t[j].z;
            if (t[j].z > maxz)
                maxz = t[j].z;
        }
    }

    return {
        min: {
            x: minx,
            y: miny,
            z: minz,
        },
        max: {
            x: maxx,
            y: maxy,
            z: maxz,
        },
        size: {
            x: maxx-minx,
            y: maxy-miny,
            z: maxz-minz,
        },
    };
}

// return an image that describes the bottom layer of the given model, viewed from above
// basically draws a pixel where there is a triangle in the model with all vertices with z coordinate
// no more than "layerheight" above the bottom of the model
// also draws all the other triangles from the model, in a lighter colour
// you can get pixel data out with "img.getImageData(0, 0, img.width, img.height)"
function draw_bottom_layer(model, layerheight, w, h, px_per_mm, draw_bg_cb) {
    let bbox = bounding_box(model);
    let zlimit = bbox.min.z + layerheight;

    let img = document.createElement('canvas');
    img.width = w;
    img.height = h;
    let ctx = img.getContext('2d');

    // centre the model in the canvas
    let xoff = w/2 - (bbox.size.x/2)*px_per_mm;
    let yoff = h/2 - (bbox.size.y/2)*px_per_mm;

    // fill the canvas with white
    ctx.beginPath();
    ctx.rect(0, 0, img.width, img.height);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // let the user supply a background-drawing function
    // (this is used to draw a diagram of the flask)
    if (draw_bg_cb)
        draw_bg_cb(ctx, px_per_mm);

    let draw_triangle = function(t) {
        ctx.beginPath();
        ctx.moveTo(xoff + (t[0].x-bbox.min.x)*px_per_mm, yoff + (t[0].y-bbox.min.y)*px_per_mm);
        ctx.lineTo(xoff + (t[1].x-bbox.min.x)*px_per_mm, yoff + (t[1].y-bbox.min.y)*px_per_mm);
        ctx.lineTo(xoff + (t[2].x-bbox.min.x)*px_per_mm, yoff + (t[2].y-bbox.min.y)*px_per_mm);
        ctx.closePath();
        ctx.fill();
    };

    // draw all triangles from model, in a light colour
    ctx.fillStyle = '#ddd';
    for (let i = 0; i < model.length; i++) {
        draw_triangle(model[i]);
    }

    // now draw the bottom layer only
    ctx.fillStyle = '#000';
    for (let i = 0; i < model.length; i++) {
        let t = model[i];

        // skip triangles that have any z-coordinate above the top of the layer
        if (t[0].z > zlimit || t[1].z > zlimit || t[2].z > zlimit)
            continue;

        // draw triangle onto canvas
        draw_triangle(t);
    }

    return img;
}

function draw_flask_func(cx, cy, diameter, clearance) {
    return function(ctx, px_per_mm) {
        // red circle for danger zone
        ctx.beginPath();
        ctx.arc(cx, cy, px_per_mm*diameter/2, 0, 2*Math.PI);
        ctx.fillStyle = '#f88';
        ctx.strokeStyle = '#000';
        ctx.fill();
        ctx.stroke();

        // white circle for background
        ctx.beginPath();
        ctx.arc(cx, cy, px_per_mm*(diameter/2-clearance), 0, 2*Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();
    };
}
