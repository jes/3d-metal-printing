// read the list of triangles from the input and return a map describing it
function process_model(model, material) {
    let vol = model_volume(model);
    return {
        model_volume: vol,
        model_mass: mass(vol, material),
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
