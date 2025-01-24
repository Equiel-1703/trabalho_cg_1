/**
 * Represents a 3D object.
 * 
 * @class
 * @param {Float32Array} vertices - The vertices of the 3D object.
 * @param {Uint16Array} indexes - The indexes of the 3D object.
 * @param {WebGL2RenderingContext} gl - The WebGL2 context.
 */
export default class Object3D {
    constructor(vertices, indexes, gl, program) {
        // Object VAO
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // Create the buffers for the object data
        this.vertex_buffer = gl.createBuffer();
        this.index_buffer = gl.createBuffer();

        // Copy the vertex data to the buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        // Copy the index data to the buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexes, gl.STATIC_DRAW);

        this.#setupVAO(gl, program);

        // Unbind VAO to avoid accidental changes
        gl.bindVertexArray(null);
        
        // Unbind buffers to avoid accidental changes
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    #setupVAO(gl, program) {
        // Get the position attribute location
        const position_attribute = gl.getAttribLocation(program, 'a_position');

        // Enable the position attribute
        gl.enableVertexAttribArray(position_attribute);

        // Set the position attribute pointer
        gl.vertexAttribPointer(position_attribute, 3, gl.FLOAT, false, 0, 0);
    }
}