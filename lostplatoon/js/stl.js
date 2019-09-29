// read an STL file from the input and return a list of triangles of the form
//   [ [{x:..., y:..., z:...}, {x:..., y:..., z:...}, {x:..., y:..., z:...}], ... ]
// this function passes over to load_ascii_stl() if the file doesn't look like a valid binary STL
function load_stl(data) {
    let ptr = 0;

    // parsing functions
    let skip = function(bytes) { ptr += bytes; };
    let readuint32 = function() {
        ptr += 4;
        return data.charCodeAt(ptr-4) + data.charCodeAt(ptr-3)*256 + data.charCodeAt(ptr-2)*65536 + data.charCodeAt(ptr-1)*16777216;
    };
    let buf = new ArrayBuffer(4);
    let view = new DataView(buf);
    let readfloat32 = function() {
        ptr += 4;
        view.setUint8(0, data.charCodeAt(ptr-1));
        view.setUint8(1, data.charCodeAt(ptr-2));
        view.setUint8(2, data.charCodeAt(ptr-3));
        view.setUint8(3, data.charCodeAt(ptr-4));
        return view.getFloat32(0);
    }

    // 80 byte header (ignore)
    skip(80);

    // uint32 number of triangles
    let ntris = readuint32();

    if (data.length != 84 + ntris*(12 + 3*12 + 2)) {
        // if the file length is incorrect, try loading it as an ASCII STL
        return load_ascii_stl(data);
    }

    let model = [];
    for (let i = 0; i < ntris; i++) {
        // float32[3] normal vector (ignore)
        skip(12);

        let triangle = [];

        // 3 vertices
        for (let j = 0; j < 3; j++) {
            //float32[3] for each of x,y,z coordinate
            let vertex = {};
            vertex.x = readfloat32();
            vertex.y = readfloat32();
            vertex.z = readfloat32();
            triangle.push(vertex);
        }

        model.push(triangle);

        // uint16 attribute byte count
        skip(2);
    }

    return model;
}

// read an ASCII STL file from the input and return a list of triangles of the form
//   [ [{x:..., y:..., z:...}, {x:..., y:..., z:...}, {x:..., y:..., z:...}], ... ]
// you should normally call load_stl() instead of load_ascii_stl() -- that function calls
// this function if the data doesn't look like a valid binary STL
function load_ascii_stl(data) {
    parts = data.split(/\s+/);

    let ptr = 0;

    let expect = function(str) {
        if (parts[ptr++] != str)
            throw "Invalid STL file (expected " + str + ")";
    }

    expect('solid');
    ptr++; // skip solid name

    let model = [];

    while (ptr < parts.length - 3) {
        expect('facet'); expect('normal');
        ptr += 3; // skip normal vector
        expect('outer'); expect('loop');

        // 3 vertices
        let triangle = [];
        for (let i = 0; i < 3; i++) {
            let vertex = {};
            expect('vertex');
            vertex.x = parseFloat(parts[ptr++]);
            vertex.y = parseFloat(parts[ptr++]);
            vertex.z = parseFloat(parts[ptr++]);
            triangle.push(vertex);
        }
        model.push(triangle);

        expect('endloop');
        expect('endfacet');
    }

    expect('endsolid');

    return model;
}
