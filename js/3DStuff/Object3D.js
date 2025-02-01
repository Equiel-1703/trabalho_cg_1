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
 * @property {WebGLVertexArrayObject} vao - The Vertex Array Object for this object.
 * @property {Object} geometry_data - Processed geometry data containing position, texcoord, normal, and color. This is mostly used for debugging purposes.
 * @property {number} vertex_count - The number of vertices in this object.
 */
export default class Object3D {
    #material = null;
    #vao = null;
    #geometry_data = null;
    #vertex_count = 0;

    /**
     * Creates a new Object3D.
     * 
     * @param {Object} geometry_data - The geometry data containing position, texcoord, normal, and color attributes like this:
     * @param {number[]} geometry_data.position - The position of the vertices.
     * @param {number[]} geometry_data.texcoord - The texture coordinates of the vertices.
     * @param {number[]} geometry_data.normal - The normals of the vertices.
     * @param {number[]} geometry_data.color - The colors of the vertices.
     * @param {Object} material - The material of the object.
     * @param {number} material.shininess - The shininess of the material.
     * @param {number[]} material.ambient - The ambient color of the material.
     * @param {number[]} material.diffuse - The diffuse color of the material.
     * @param {number[]} material.specular - The specular color of the material.
     * @param {number[]} material.emissive - The emissive color of the material.
     * @param {number} material.opticalDensity - The optical density of the material.
     * @param {number} material.opacity - The opacity of the material.
     * @param {number} material.illum - The illumination model of the material.
     * @param {WebGLRenderingContext} gl - The WebGL rendering context.
     * @param {WebGLProgram} program - The WebGL program.
     * 
     * @constructor
     */
    constructor(geometry_data, material, gl, program) {
        this.#geometry_data = this.#processGeometryData(geometry_data);
        this.#material = material;

        const config = this.#createVAOConfig(this.#geometry_data, gl);

        this.#vao = VAOFactory.buildVAO(config, gl, program);
        this.#vertex_count = this.#countVertices(geometry_data);
    }

    getMaterial() {
        return this.#material;
    }

    getVAO() {
        return this.#vao;
    }

    getVertexCount() {
        return this.#vertex_count;
    }

    /**
     * This is mostly used for debugging purposes.
     * 
     * @returns {Object} The geometry data containing position, texcoord, normal, and color attributes.
     */
    getGeometryData() {
        return this.#geometry_data;
    }

    /**
     * Deletes the VAO object from the GPU. This should trigger the garbage collector to free the memory.
     * 
     * @param {WebGLRenderingContext} gl - The WebGL rendering context.
     */
    deleteObject(gl) {
        gl.deleteVertexArray(this.#vao);
    }

    /**
     * Returns the number of vertices in the geometry data.
     * 
     * @param {Object} geometry_data - The geometry data containing position, texcoord, normal, and color attributes.
     * @returns {number} The number of vertices in the geometry data.
     * 
     * @private
     */
    #countVertices(geometry_data) {
        return geometry_data.position.length / 3;
    }

    /**
     * Creates a VAO (Vertex Array Object) configuration object for the given geometry data. An VAO configuration object is an object in
     * which each key is the name of an attribute in the shader program and the value is an object containing the configuration for
     * that attribute.
     *
     * @param {Object} geometry_data - The geometry data containing position, texcoord, normal, and color attributes.
     * @param {WebGLRenderingContext} gl - The WebGL rendering context.
     * @returns {Object} An object containing the configuration for each attribute (position, texcoord, normal, color).
     * 
     * @private
     */
    #createVAOConfig(geometry_data, gl) {
        const config = {
            'a_position': {
                data: geometry_data.position,
                components_per_attr: 3,
                data_type: gl.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0
            },
            'a_uv': {
                data: geometry_data.texcoord,
                components_per_attr: 2,
                data_type: gl.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0
            },
            'a_normal': {
                data: geometry_data.normal,
                components_per_attr: 3,
                data_type: gl.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0
            },
            'a_color': {
                data: geometry_data.color,
                components_per_attr: 4,
                data_type: gl.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0
            }
        }

        return config;
    }

    /**
     * Processes the geometry data preparing the proper arrays formats for each attribute and filling missing attributes with default values.
     * 
     * @param {Object} geometry_data - The geometry data containing position, texcoord, normal, and color attributes.
     * @returns {Object} The geometry data with the proper arrays for each attribute.
     */
    #processGeometryData(geometry_data) {
        const processed_data = {};

        // Prepare the correct array for position
        const position = new Float32Array(geometry_data.position);

        // Check if texcoord and normal are present
        if (!('texcoord' in geometry_data)) {
            const texcoord_length = position.length / 3 * 2; // Calculate the length of the texcoord array
            geometry_data.texcoord = new Array(texcoord_length).fill(0); // If not, create an array filled with zeros
        }

        if (!('normal' in geometry_data)) {
            const normal_length = position.length; // Calculate the length of the normal array
            geometry_data.normal = new Array(normal_length).fill(0); // If not, create an array filled with zeros
        }

        // Create the expected arrays format
        const texcoord = new Float32Array(geometry_data.texcoord);
        const normal = new Float32Array(geometry_data.normal);

        // Check if color is present
        let color;
        const color_expected_length = position.length / 3 * 4; // Calculate the expected length of the color array

        if (!('color' in geometry_data) || geometry_data.color.length === 0) {
            // If not, create an array filled with random colors (just to have some color)
            color = new Float32Array(color_expected_length);

            for (let i = 0; i < color_expected_length / 4; i++) {
                color[i * 4] = Math.random();
                color[i * 4 + 1] = Math.random();
                color[i * 4 + 2] = Math.random();
                color[i * 4 + 3] = 1.0;
            }
        } else if (geometry_data.color.length < color_expected_length) {
            // This means that the color array is missing the alpha channel, let's add it with a value of 1.0
            color = new Float32Array(color_expected_length);

            for (let i = 0; i < color_expected_length / 4; i++) {
                color[i * 4] = geometry_data.color[i * 3];
                color[i * 4 + 1] = geometry_data.color[i * 3 + 1];
                color[i * 4 + 2] = geometry_data.color[i * 3 + 2];
                color[i * 4 + 3] = 1.0;
            }
        } else {
            // The color array has the correct length, so we can just create the Float32Array
            color = new Float32Array(geometry_data.color);
        }

        processed_data.position = position;
        processed_data.texcoord = texcoord;
        processed_data.normal = normal;
        processed_data.color = color;

        return processed_data;
    }

}