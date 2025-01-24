import VAOFactory from "./VAOFactory.js";

/**
 * Represents a 3D object.
 * 
 * @class
 * @param {Float32Array} vertices - The vertices of the 3D object.
 * @param {Uint16Array} indexes - The indexes of the 3D object.
 * @param {WebGL2RenderingContext} gl - The WebGL2 context.
 */
export default class Object3D {
    constructor(vertices, indexes, tranform, gl, program) {
        const config = {
            'a_position': {
                data: vertices,
                components_per_attr: 3,
                data_type: gl.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0
            },
            'index_buffer': indexes
        };

        this.vao = VAOFactory.buildVAO(config, gl, program);
        this.transformation_matrix = tranform;
        this.index_count = indexes.length;
    }
}