import DoLog from "../Logging/DoLog.js";
import Model3D from "../3DStuff/Model3D.js";
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

    /**
     * Loads a 3D object from a .obj file.
     * 
     * @param {string} object_path - Path to the .obj file.
     * @param {WebGL2RenderingContext} gl - The WebGL2RenderingContext object.
     * @param {WebGLProgram} program - The WebGLProgram object.
     * @returns {Model3D} - The 3D model.
     */
    async load3DObject(object_path, gl, program) {
        const response = await fetch(object_path);

        if (!response.ok) {
            this.LOG('Failed to load object file: ' + object_path, 'error');
            throw new Error('Failed to load file ' + object_path + ':' + response.status + ' - ' + response.statusText);
        }

        const text = await response.text();

        const obj_parser = new OBJParser();
        const parsed_obj_data = obj_parser.parseOBJ(text);

        console.log(parsed_obj_data);
        console.log(object_path);

        const path_prefix = './objs/kit/';
        const obj_materials_src = [];
        for (let i = 0; i < parsed_obj_data.materialLibs.length; i++) {
            const material_path = path_prefix + parsed_obj_data.materialLibs[i];

            const response = await fetch(material_path);

            if (!response.ok) {
                this.LOG('Failed to load material file: ' + material_path, 'error');
                throw new Error('Failed to load file ' + material_path + ':' + response.status + ' - ' + response.statusText);
            }

            const text = await response.text();
            obj_materials_src.push(text);
        }

        const parsed_materials = obj_parser.parseMTL(obj_materials_src.join('\n'));

        const model_name = this.#getFileNameFromPath(object_path);

        const model = new Model3D(model_name, object_path, parsed_obj_data, parsed_materials, gl, program);

        return model;
    }

    #getFileNameFromPath(path) {
        return path.split('\\').pop().split('/').pop().split('.')[0];
    }
}