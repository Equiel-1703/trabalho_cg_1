import Object3D from './Object3D.js';

export default class FileLoader {
    static async loadShader(shader_path) {
        const response = await fetch(shader_path);

        if (!response.ok) {
            throw new Error('Failed to load file ' + shader_path + ':' + response.status + ' - ' + response.statusText);
        }

        const text = await response.text();

        return text;
    }

    static async load3DObject(object_path, log, gl, program) {
        const response = await fetch(object_path);

        if (!response.ok) {
            throw new Error('Failed to load file ' + object_path + ':' + response.status + ' - ' + response.statusText);
        }

        const text = await response.text();

        console.log(text);

        const vertices_regex = this.#buildVertexRegex();
        const indices_regex = this.#buildIndicesRegex();

        // Printing vertices
        console.log("Vertices found: \n");
        let match = null;
        
        while ((match = vertices_regex.exec(text)) !== null) {
            console.log(match[0]);
            console.log(match.groups);
        }

        // Printing faces (indices)
        console.log("Indices found: \n");
        match = null;

        while ((match = indices_regex.exec(text)) !== null) {
            console.log(match[0]);
        }
        
        // Extracting vertices values
        let vertices = [];
        match = null;
        
        while ((match = vertices_regex.exec(text)) !== null) {
            vertices.push(Number(match.groups['x']));
            vertices.push(Number(match.groups['y']));
            vertices.push(Number(match.groups['z']));
        }

        const vertices_float = new Float32Array(vertices);
        console.log('Vertices Float32Array: ' + vertices_float);

        // Extracting index values
        let indices = [];
        match = null;

        while ((match = indices_regex.exec(text)) !== null) {
            indices.push(Number(match.groups['t1']));
            indices.push(Number(match.groups['t2']));
            indices.push(Number(match.groups['t3']));
        }

        console.log('Indices: ' + indices);

        // Perform checks on indices
        indices = this.#checkIndexBounds(indices, vertices, log);
        
        const indexes_int = new Int16Array(indices);
        console.log('Indices Int16Array: ' + indexes_int);

        // Creating 3D object
        const object = new Object3D(vertices_float, indexes_int, gl, program);

        return object;
    }

    static #checkIndexBounds(indices, vertices, log) {
        // Check if indices are 0 based or 1 based and are not out of bounds
        let min_index = Math.min(...indices);
        let max_index = Math.max(...indices);

        if (min_index === 1) {
            console.log('Indices are 1 based. Converting to 0 based.');
            indices = indices.map((index) => index - 1);

            max_index = Math.max(...indices); // Update max index
        } else if (min_index === 0) {
            console.log('Indices are 0 based.');
        } else {
            log.error_log('Indices are not 0 or 1 based. Check OBJ file.');
            throw new Error('Indices are not 0 or 1 based');
        }
            
        // Check if indices are out of bounds
        if (max_index >= vertices.length) {
            log.error_log('Index out of bounds:' + max_index + ' >= ' + vertices.length);
            log.error_log('Indices: ' + indices);
            log.error_log('Something went wrong loading the object, check OBJ file.');

            throw new Error('Index out of bounds');
        }

        // Check if all vertices are used
        if (max_index < vertices.length - 1) {
            log.warning_log('The indices are not using all the vertices, but rendering will be attempted. Check OBJ file.');
        }

        // Check if vertices are not out of Uint16 bounds
        if (max_index >= Math.pow(2, 16)) {
            log.error_log('Vertices are out of Uint16 bounds: ' + max_index + ' >= ' + Math.pow(2, 16));
            log.error_log('Something went wrong loading the object or the object is too big, check OBJ file.');

            throw new Error('Vertices are out of Uint16 bounds');
        }

        return indices;
    }

    static #buildVertexRegex() {
        const create_axis_pattern = (axis) => `(?<${axis}>(-?)\\d+(\\.?\\d+)?)`;

        let regex = 'v\\s+' + create_axis_pattern('x') + '\\s+' + create_axis_pattern('y') + '\\s+' + create_axis_pattern('z');

        return new RegExp(regex, 'g');
    }

    static #buildIndicesRegex() {
        const create_index_pattern = (index) => `(?<${index}>\\d+)`;

        let regex = 'f\\s+' + create_index_pattern('t1') + '\\s+' + create_index_pattern('t2') + '\\s+' + create_index_pattern('t3');

        return new RegExp(regex, 'g');
    }
}