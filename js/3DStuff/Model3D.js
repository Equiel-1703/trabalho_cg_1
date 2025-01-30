import Object3D from './Object3D.js';
import GraphicsMath from './GraphicsMath.js';

/**
 * This class represents a Model3D.
 * A model can be made out of multiple Object3D.
 * 
 * This class is responsible for creating the objects that make up a model.
 * 
 * @class
 * 
 * @property {string} name - The name of the model. Must be unique.
 * @property {Object3D[]} objects - The objects that make up the model.
 * 
 * @method getTransformationMatrix - Get the transformation matrix of the model.    
 * @method setTransformationMatrix - Set the transformation matrix of the model.
 * @method getRenderableObjects - Get the renderable objects of the model.
 * @method deleteModel - This method iterates over all objects in the model and call deleteObject on each one.
 * @method renameModel - Renames the model.
 */
export default class Model3D {
    #name = '';
    #transformation_matrix = GraphicsMath.createIdentityMatrix();

    constructor(name, parsed_obj_data, parsed_materials, gl, program) {
        // Set the name of the model
        this.#name = name;

        // The objects that make up the model
        this.objects = [];

        this.#createObjects(parsed_obj_data, parsed_materials, gl, program);
    }

    /**
     * Creates the objects that make up the model.
     * 
     * @param {Object} parsed_obj_data - The parsed object data.
     * @param {Object} parsed_materials - The parsed materials.
     * @param {WebGL2RenderingContext} gl - The WebGL2 context.
     * @param {WebGLProgram} program - The WebGL program.
     * 
     * @private
     */
    #createObjects(parsed_obj_data, parsed_materials, gl, program) {
        const geometries = parsed_obj_data.geometries;

        for (let g in geometries) {
            // 'geometries' is an array of 'geometry'. This is a geometry object:
            // geometry = {
            //     object,
            //     groups,
            //     material,
            //     data: {
            //       position,
            //       texcoord,
            //       normal,
            //       color,
            //     },

            const data = geometries[g].data;
            const material = parsed_materials[geometries[g].material];
            const obj = new Object3D(data, material, gl, program);
            this.objects.push(obj);
        }
    }

    /**
     * Get the transformation matrix of the model.
     * 
     * @returns {Float32Array} The transformation matrix in column major order.
     */
    getTransformationMatrix() {
        return this.#transformation_matrix;
    }

    /**
     *  Sets the transformation matrix of the model.
     * 
     * @param {Float32Array} matrix - The transformation matrix in column major order.
     */
    setTransformationMatrix(matrix) {
        this.#transformation_matrix = matrix;
    }

    /**
     * Get the renderable objects of the model.
     * 
     * @returns {Object3D[]} The renderable objects of the model.
     */
    getRenderableObjects() {
        return this.objects;
    }

    getModelName() {
        return this.#name;
    }

    renameModel(new_name) {
        this.#name = new_name;
    }

    /**
     * This method iterates over all objects in the model and call deleteObject on each one.
     * This should trigger the garbage collector to free up GPU memory. The internal objects array is also emptied.
     * 
     * @param {WebGL2RenderingContext} gl - The WebGL2 context.
     */
    deleteModel(gl) {
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].deleteObject(gl);
        }

        this.objects = [];
    }
}