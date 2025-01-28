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
 * @property {Object3D[]} objects - The objects that make up the model.
 * 
 * @method getTransformationMatrix - Get the transformation matrix of the model.    
 */
export default class Model3D {
    #transformation_matrix = GraphicsMath.createIdentityMatrix();

    constructor(parsed_obj_data, gl, program) {
        // The objects that make up the model
        this.objects = [];

        this.#createObjects(parsed_obj_data, gl, program);
    }

    /**
     * Creates the objects that make up the model.
     * 
     * @param {Object} parsed_obj_data - The parsed object data.
     * @param {WebGL2RenderingContext} gl - The WebGL2 context.
     * @param {WebGLProgram} program - The WebGL program.
     * 
     * @private
     */
    #createObjects(parsed_obj_data, gl, program) {
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
            // I only really care for the data portion, so the rest I'll ignore. I can change this if I need them.

            const data = geometries[g].data;
            const obj = new Object3D(data, gl, program);
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

    getRenderableObjects() {
        return this.objects;
    }
}