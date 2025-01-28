import DoLog from "./DoLog.js";
import Model3D from "./Model3D.js";
import OBJParser from "./OBJParser.js";

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

    async load3DObject(object_path, gl , program) {
        const response = await fetch(object_path);

        if (!response.ok) {
            this.LOG('Failed to load object file: ' + object_path, 'error');
            throw new Error('Failed to load file ' + object_path + ':' + response.status + ' - ' + response.statusText);
        }

        const text = await response.text();

        const obj_parser = new OBJParser();
        const parsed_obj_data = obj_parser.parseOBJ(text);
        
        console.log(parsed_obj_data);

        const model = new Model3D(parsed_obj_data, gl, program);

        return model;
    }
}