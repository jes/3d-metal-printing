// read an STL file from the input and return a list of triangles of the form
//   [ [{x:..., y:..., z:...}, {x:..., y:..., z:...}, {x:..., y:..., z:...}], ... ]
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

    // check the file length is correct
    if (data.length != 84 + ntris*(12 + 3*12 + 2))
        throw "Invalid stl file (incorrect length)";

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
