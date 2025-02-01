import Object3D from './Object3D.js';
import GraphicsMath from './GraphicsMath.js';
import { Color } from './WebGLUtils.js';

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
 * @property {Image} model_texture_image - The texture image of the model.
 * @property {Color} global_color - The global color of the model.
 * @property {WebGL2Texture} model_texture - The WebGL2 texture of the model.
 * @property {Object} transformation_dict - A transformation dictionary with the properties: translation, rotation, and scale.
 * @property {Object3D[]} objects - The objects that make up the model.
 * 
 * @method getTransformationDict - Get the transformation dictionary of the model.
 * @method getTransformationMatrix - Get the transformation matrix of the model.    
 * @method setTransformation - Set the transformation matrix of the model.
 * @method getTextureProperties - Get the texture settings of the model.
 * @method getRenderableObjects - Get the renderable objects of the model.
 * @method getModelName - Get the name of the model.
 * @method getModelPath - Get the path to the model file.
 * @method setTexture - Set the texture image of the model.
 * @method clearTexture - Clear the texture of the model.
 * @method getTextureImage - Get the texture image of the model.
 * @method hasTexture - Check if the model has a texture.
 * @method setGlobalColor - Set the global color of the model.
 * @method getGlobalColor - Get the global color of the model.
 * @method renameModel - Rename the model.
 * @method deleteModel - This method iterates over all objects in the model and call deleteObject on each one.
 * @method duplicateModel - This method creates a new model with the same objects and transformation matrix as the current model.
 * @method getDuplicatesMapping - Get the duplicates mapping.
 */
export default class Model3D {
    #name = '';
    #model_path = '';
    /** @type {Image} */
    #model_texture_image = null;
    /** @type {Color} */
    #global_color = new Color(0, 0, 0, 0); // Default color is transparent black
    /** @type {WebGL2Texture} */
    #model_texture = null;

    /**  @type {Object} */
    #transformation_dict = {
        translation: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
    };
    #transformation_matrix = GraphicsMath.createIdentityMatrix();

    static #models_duplicates_mapping = {};

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

    getTransformationDict() {
        return this.#transformation_dict;
    }

    /**
     * Receives a dictionary to set the transformation matrix of the model.
     * 
     * @param {Object} dictionary - The dictionary with the transformation matrix properties: translation, rotation, and scale.
     */
    setTransformation(dictionary) {
        const t = dictionary.translation;
        const r = dictionary.rotation;
        const s = dictionary.scale;

        const t_m = GraphicsMath.createTranslationMatrix(t.x, t.y, t.z);

        const r_x_m = GraphicsMath.createRotationMatrix(r.x, 'x');
        const r_y_m = GraphicsMath.createRotationMatrix(r.y, 'y');
        const r_z_m = GraphicsMath.createRotationMatrix(r.z, 'z');
        const r_xy_m = GraphicsMath.multiplyMatrices(r_x_m, r_y_m);
        const r_xyz_m = GraphicsMath.multiplyMatrices(r_xy_m, r_z_m);

        const s_m = GraphicsMath.createScaleMatrix(s.x, s.y, s.z);

        const s_r = GraphicsMath.multiplyMatrices(r_xyz_m, s_m);
        const s_r_p = GraphicsMath.multiplyMatrices(t_m, s_r);

        this.#transformation_matrix = s_r_p;
        this.#transformation_dict = dictionary;
    }

    /**
     * Get the texture settings of the model.
     * 
     * @returns {Object} The texture settings of the model.
     */
    getTextureProperties() {
        return { image: this.#model_texture_image, color: this.#global_color };
    }

    /**
     * Set the texture image of the model.
     * 
     * @param {HTMLImageElement} texture_img - The texture image.
     * @param {WebGL2RenderingContext} gl - The WebGL2 context.
     */
    setTexture(texture_img, gl) {
        // Revoke the object URL of the previous texture if it had one
        if (this.#model_texture_image !== null) {
            URL.revokeObjectURL(this.#model_texture_image.src);

            gl.deleteTexture(this.#model_texture);
        }

        this.#model_texture_image = texture_img;

        // Create a new texture
        this.#model_texture = gl.createTexture();

        // Bind the texture to the active texture unit at bind point TEXTURE_2D
        gl.bindTexture(gl.TEXTURE_2D, this.#model_texture);

        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // Upload the image into the texture only after it has loaded
        this.#model_texture_image.onload = () => {
            // Upload the image into the texture.
            var mipLevel = 0;               // the largest mip
            var internalFormat = gl.RGBA;   // format we want in the texture
            var srcFormat = gl.RGBA;        // format of data we are supplying
            var srcType = gl.UNSIGNED_BYTE  // type of data we are supplying
            gl.texImage2D(gl.TEXTURE_2D,
                mipLevel,
                internalFormat,
                srcFormat,
                srcType,
                this.#model_texture_image);
        };
    }

    /**
     * Clear the texture of the model.
     * 
     * @param {WebGL2RenderingContext} gl - The WebGL2 context.
     */
    clearTexture(gl) {
        // Revoke the object URL of the previous texture if it had one
        if (this.#model_texture_image !== null) {
            URL.revokeObjectURL(this.#model_texture_image.src);

            gl.deleteTexture(this.#model_texture);
        }

        this.#model_texture_image = null;
        this.#model_texture = null;
    }

    /**
     * Get the texture image of the model.
     * 
     * @returns {HTMLImageElement} The texture image.
     */
    getTextureImage() {
        return this.#model_texture_image
    }

    /**
     * Check if the model has a texture.
     * 
     * @returns {boolean} True if the model has a texture, false otherwise.
     */
    hasTexture() {
        return this.#model_texture !== null;
    }

    /**
     * Set the global color of the model.
     * 
     * @param {Color} color - The color.
     */
    setGlobalColor(color) {
        this.#global_color = color;
    }

    /**
     * Get the global color of the model.
     * 
     * @returns {Color} The color.
     */
    getGlobalColor() {
        return this.#global_color;
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
        // Update the static mapping (if the model is or have duplicates)
        if (this.#model_path in Model3D.#models_duplicates_mapping) {
            // Find the model in the duplicates mapping and update it
            const index = Model3D.#models_duplicates_mapping[this.#model_path].indexOf(this.#name);
            Model3D.#models_duplicates_mapping[this.#model_path][index] = new_name;
        }

        // Now we can update the model name
        this.#name = new_name;
    }

    /**
     * This method iterates over all objects in the model and call deleteObject on each one, if the object doesn't have any duplicate in use.
     * This should trigger the garbage collector to free up GPU memory. The internal objects array is also emptied.
     * 
     * @param {WebGL2RenderingContext} gl - The WebGL2 context.
     */
    deleteModel(gl) {
        // Check if the model has duplicates
        if (this.#model_path in Model3D.#models_duplicates_mapping) {
            const duplicates = Model3D.#models_duplicates_mapping[this.#model_path];

            // If so, remove the current model from the mapping
            const index = duplicates.indexOf(this.#name);
            duplicates.splice(index, 1);

            // Check if after removing the current model from the mapping, we still have duplicates
            if (duplicates.length > 0) {
                // If so, return
                return;
            } else {
                // If not, delete the key from the mapping
                delete Model3D.#models_duplicates_mapping[this.#model_path];
            }
        }

        // If the model doesn't have duplicates or we deleted all duplicates, delete the model
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
     * Each time a Model3D is duplicated, the name of the current model and of the new model is stored in a static mapping.
     * This is done to prevent deleting the model while there are still references using it's Objects.
     * 
     * @returns {Model3D} The new model.
     */
    duplicateModel() {
        const new_model = new Model3D(this.#name, this.#model_path, null, null, null, null);

        // Set new model's objects to the same objects as the current model
        new_model.objects = this.getRenderableObjects();

        // Add entries to the static mapping
        if (!(this.#model_path in Model3D.#models_duplicates_mapping)) {
            Model3D.#models_duplicates_mapping[this.#model_path] = [];
        }

        if (!(Model3D.#models_duplicates_mapping[this.#model_path].includes(this.#name))) {
            Model3D.#models_duplicates_mapping[new_model.#model_path].push(this.#name);
        }

        Model3D.#models_duplicates_mapping[this.#model_path].push(new_model.#name);

        return new_model;
    }

    static getDuplicatesMapping() {
        return Model3D.#models_duplicates_mapping;
    }
}