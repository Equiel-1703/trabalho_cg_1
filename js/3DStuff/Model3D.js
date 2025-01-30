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
 * @property {string} model_path - The path to the model file.
 * @property {Object3D[]} objects - The objects that make up the model.
 * 
 * @method getTransformationMatrix - Get the transformation matrix of the model.    
 * @method setTransformationMatrix - Set the transformation matrix of the model.
 * @method getRenderableObjects - Get the renderable objects of the model.
 * @method getModelName - Get the name of the model.
 * @method renameModel - Rename the model.
 * @method getModelPath - Get the path to the model file.
 * @method deleteModel - This method iterates over all objects in the model and call deleteObject on each one.
 * @method renameModel - Renames the model.
 * @method duplicateModel - This method creates a new model with the same objects and transformation matrix as the current model.
 */
export default class Model3D {
    #name = '';
    #model_path = '';
    #transformation_matrix = GraphicsMath.createIdentityMatrix();

    constructor(name, model_path, parsed_obj_data, parsed_materials, gl, program) {
        // Set the name of the model
        this.#name = name;
        // Set the path to the model file
        this.#model_path = model_path;

        // The objects that make up the model
        this.objects = [];

        if (parsed_obj_data && parsed_materials) {
            this.#createObjects(parsed_obj_data, parsed_materials, gl, program);
        }
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

    getModelPath() {
        return this.#model_path;
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

    /**
     * This method creates a new model with the same objects and transformation matrix as the current model.
     * The transformation matrix of the new model is a copy of the current model's transformation matrix, not a reference.
     * The objects, although, are references to the same objects as the current model. This was done to save memory.
     * 
     * @returns {Model3D} The new model.
     */
    duplicateModel() {
        const new_model = new Model3D(this.#name, this.#model_path, null, null, null, null);

        // Copy the transformation matrix
        new_model.setTransformationMatrix(new Float32Array(this.#transformation_matrix));
        // Set new model's objects to the same objects as the current model
        new_model.objects = this.getRenderableObjects();

        return new_model;
    }
}