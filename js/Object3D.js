import VAOFactory from "./VAOFactory.js";

/**
 * Represents a 3D object.
 * 
 * This object does not use indexed rendering, so the vertices are repeated for each face. This is because OBJs files are not properly indexed.
 * A single normal, color or texture coordinate can be shared between multiple vertices, turning impossible to use a single index buffer for all attributes of every vertex.
 * Therefore, it's easier to just repeat the attributes and use array rendering.
 * 
 * @class
 * 
 * @property {VAO} vao - The Vertex Array Object for this object.
 * @property {number} vertex_count - The number of vertices in this object.
 */
export default class Object3D {
    /**
     * Creates a new Object3D.
     * 
     * @param {Object} geometry_data - The geometry data containing position, texcoord, normal, and color attributes like this:
     * @param {number[]} geometry_data.position - The position of the vertices.
     * @param {number[]} geometry_data.texcoord - The texture coordinates of the vertices.
     * @param {number[]} geometry_data.normal - The normals of the vertices.
     * @param {number[]} geometry_data.color - The colors of the vertices.
     * @param {WebGLRenderingContext} gl - The WebGL rendering context.
     * @param {WebGLProgram} program - The WebGL program.
     * 
     * @constructor
     */
    constructor(geometry_data, gl, program) {
        const config = this.#createVAOConfig(geometry_data, gl);

        this.vao = VAOFactory.buildVAO(config, gl, program);
        this.vertex_count = this.#getVerticesCount(geometry_data);
    }

    /**
     * Returns the number of vertices in the geometry data.
     * 
     * @param {Object} geometry_data - The geometry data containing position, texcoord, normal, and color attributes.
     * @returns {number} The number of vertices in the geometry data.
     * 
     * @private
     */
    #getVerticesCount(geometry_data) {
        return geometry_data.position.length / 3;
    }

    /**
     * Creates a VAO (Vertex Array Object) configuration for the given geometry data.
     *
     * @param {Object} geometry_data - The geometry data containing position, texcoord, normal, and color attributes.
     * @param {WebGLRenderingContext} gl - The WebGL rendering context.
     * @returns {Object} An object containing the configuration for each attribute (position, texcoord, normal, color).
     * 
     * @private
     */
    #createVAOConfig(geometry_data, gl) {
        // Prepare the proper array for each attribute.
        const position = new Float32Array(geometry_data.position);

        // Check if texcoord and normal are present
        if (geometry_data['texcoord'] === undefined) {
            // If not, create an array of 0s with the same length as the position array
            geometry_data['texcoord'] = new Array(position.length).fill(0);
        }
        if (geometry_data['normal'] === undefined) {
            geometry_data['normal'] = new Array(position.length).fill(0);
        }
        if (geometry_data['color'] === undefined) {
            // If color is not present, create an empty array (will be filled with white color later)
            geometry_data['color'] = [];
        }

        const texcoord = new Float32Array(geometry_data.texcoord);
        const normal = new Float32Array(geometry_data.normal);

        // Check if color is present
        let color;
        if (geometry_data.color.length === 0) {
            // If not, create a white color array
            color = new Float32Array(position.length / 3 * 4).fill(1);
        } else {
            // Check if color has 3 or 4 components
            if (geometry_data.color.length % 3 === 0) {
                // If it has 3 components, add the alpha channel
                color = new Float32Array(geometry_data.color.length / 3 * 4);
                for (let i = 0; i < geometry_data.color.length / 3; i++) {
                    color[i * 4] = geometry_data.color[i * 3];
                    color[i * 4 + 1] = geometry_data.color[i * 3 + 1];
                    color[i * 4 + 2] = geometry_data.color[i * 3 + 2];
                    color[i * 4 + 3] = 1; // Alpha channel set to 1
                }
            } else {
                // If it has 4 components, just copy the array
                color = new Float32Array(geometry_data.color);
            }
        }

        return {
            'a_position': {
                data: position,
                components_per_attr: 3,
                data_type: gl.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0
            },
            'a_uv': {
                data: texcoord,
                components_per_attr: 2,
                data_type: gl.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0
            },
            'a_normal': {
                data: normal,
                components_per_attr: 3,
                data_type: gl.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0
            },
            'a_color': {
                data: color,
                components_per_attr: 4,
                data_type: gl.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0
            }
        };
    }
}