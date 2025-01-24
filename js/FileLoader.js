import DoLog from "./DoLog.js";
import Object3D from './Object3D.js';

export default class FileLoader extends DoLog {
    constructor(log) {
        super(log, 'FileLoader> ');
    }

    async loadShader(shader_path) {
        const response = await fetch(shader_path);

        if (!response.ok) {
            this.LOG('Failed to load shader file: ' + shader_path, 'error');
            throw new Error('Failed to load file ' + shader_path + ':' + response.status + ' - ' + response.statusText);
        }

        const text = await response.text();

        return text;
    }

    async load3DObject(object_path, gl, program) {
        const response = await fetch(object_path);

        if (!response.ok) {
            throw new Error('Failed to load file ' + object_path + ':' + response.status + ' - ' + response.statusText);
        }

        const text = await response.text();

        const vertices_regex = this.#buildVertexRegex();
        const indices_regex = this.#buildIndicesRegex();

        let match = null;

        // Extracting vertices values
        let vertices = [];

        while ((match = vertices_regex.exec(text)) !== null) {
            vertices.push(Number(match.groups['x']));
            vertices.push(Number(match.groups['y']));
            vertices.push(Number(match.groups['z']));
        }

        const vertices_float = new Float32Array(vertices);

        // Extracting index values
        let indices = [];
        match = null;

        while ((match = indices_regex.exec(text)) !== null) {
            indices.push(Number(match.groups['t1']));
            indices.push(Number(match.groups['t2']));
            indices.push(Number(match.groups['t3']));
        }

        // Perform checks on indices
        indices = this.#checkIndexBounds(indices, vertices);
        const indexes_int = new Int16Array(indices);

        // Creating 3D object
        const object = new Object3D(vertices_float, indexes_int, gl, program);

        return object;
    }

    #checkIndexBounds(indices, vertices, log) {
        // Check if indices are 0 based or 1 based and are not out of bounds
        let min_index = Math.min(...indices);
        let max_index = Math.max(...indices);

        // Calculate number of vertices
        const number_of_vertices = vertices.length / 3;
        this.LOG('Number of vertices: ' + number_of_vertices);

        if (min_index === 1) {
            this.LOG('Indices are 1 based. Converting to 0 based.');
            indices = indices.map((index) => index - 1);

            max_index = Math.max(...indices); // Update max index
        } else if (min_index === 0) {
            this.LOG('Indices are 0 based.');
        } else {
            this.LOG('Indices are not 0 or 1 based. Check OBJ file.');
            throw new Error('Indices are not 0 or 1 based');
        }

        // Check if indices are out of bounds
        if (max_index >= number_of_vertices) {
            this.LOG('Index out of bounds:' + max_index + ' >= ' + vertices.length, 'error');
            this.LOG('Indices: ' + indices, 'error');
            this.LOG('Something went wrong loading the object, check OBJ file.', 'error');

            throw new Error('Index out of bounds');
        }

        // Check if all vertices are used
        if (max_index < number_of_vertices - 1) {
            this.LOG('The indices are not using all the vertices, but rendering will be attempted. Check OBJ file. Max index: ' + max_index + ' < ' + number_of_vertices, 'warning');
        }

        // Check if vertices are not out of Uint16 bounds
        if (max_index >= Math.pow(2, 16)) {
            this.LOG('Vertices are out of Uint16 bounds: ' + max_index + ' >= ' + Math.pow(2, 16), 'error');
            this.LOG('Something went wrong loading the object or the object is too big, check OBJ file.', 'error');

            throw new Error('Vertices are out of Uint16 bounds');
        }

        return indices;
    }

    #buildVertexRegex() {
        const create_axis_pattern = (axis) => `(?<${axis}>(-?)\\d+(\\.?\\d+)?)`;

        let regex = 'v\\s+' + create_axis_pattern('x') + '\\s+' + create_axis_pattern('y') + '\\s+' + create_axis_pattern('z');

        return new RegExp(regex, 'g');
    }

    #buildIndicesRegex() {
        const create_index_pattern = (index) => `(?<${index}>\\d+)`;

        let regex = 'f\\s+' + create_index_pattern('t1') + '\\s+' + create_index_pattern('t2') + '\\s+' + create_index_pattern('t3');

        return new RegExp(regex, 'g');
    }
}