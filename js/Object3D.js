import VAOFactory from "./VAOFactory.js";
import GraphicsMath from "./GraphicsMath.js";

/**
 * Represents a 3D object.
 * 
 * @class
 * @param {Float32Array} vertices - The vertices of the 3D object.
 * @param {Uint16Array} indexes - The indexes of the 3D object.
 * @param {WebGL2RenderingContext} gl - The WebGL2 context.
 * @param {WebGLProgram} program - The WebGL program.
 * 
 * @property {WebGLVertexArrayObject} vao - The Vertex Array Object for the 3D object.
 * @property {WebGLBuffer} index_buffer - The index buffer for the 3D object.
 * @property {Float32Array} transformation_matrix - The transformation matrix of the 3D object.
 * @property {number} index_count - The number of indexes in the 3D object.
 */
export default class Object3D {
    constructor(vertices, indexes, gl, program) {
        const config = this.#createConfig(vertices, indexes, gl);

        this.vao = VAOFactory.buildVAO(config, gl, program);
        this.transformation_matrix = GraphicsMath.createIdentityMatrix();
        this.index_count = indexes.length;
    }

    /**
     * Creates a configuration object for a 3D object.
     * 
     * @param {Float32Array} vertices - The vertices of the 3D object.
     * @param {Uint16Array} indexes - The index buffer for the 3D object.
     * @returns {Object} The configuration object containing vertex attributes and index buffer.
     * @property {Object} a_position - The position attribute configuration.
     * @property {Float32Array} a_position.data - The vertex data.
     * @property {number} a_position.components_per_attr - The number of components per attribute.
     * @property {number} a_position.data_type - The data type of the vertex data.
     * @property {boolean} a_position.normalize - Whether to normalize the vertex data.
     * @property {number} a_position.stride - The stride of the vertex data.
     * @property {number} a_position.offset - The offset of the vertex data.
     * @property {Uint16Array} index_buffer - The index buffer data.
     * @private
     */
    #createConfig(vertices, indexes, gl) {
        return {
            'a_position': {
                data: vertices,
                components_per_attr: 3,
                data_type: gl.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0
            },
            [VAOFactory.INDEX_BUFFER_KEY]: indexes
        };
    }
}