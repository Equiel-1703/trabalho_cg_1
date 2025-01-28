import GraphicsMath from './GraphicsMath.js';

export default class Vec4 {
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    static createZero() {
        return new Vec4(0, 0, 0, 1);
    }

    static xAxis() {
        return new Vec4(1, 0, 0, 1);
    }

    static yAxis() {
        return new Vec4(0, 1, 0, 1);
    }

    static zAxis() {
        return new Vec4(0, 0, 1, 1);
    }

    crossProduct(B) {
        let result = Vec4.createZero();

        result.x = this.y * B.z - this.z * B.y;
        result.y = this.z * B.x - this.x * B.z;
        result.z = this.x * B.y - this.y * B.x;
        result.w = this.w;

        return result;
    }

    dotProduct(B) {
        return this.x * B.x + this.y * B.y + this.z * B.z;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalize() {
        let result = Vec4.createZero();

        const length = this.length();

        result.x = this.x / length;
        result.y = this.y / length;
        result.z = this.z / length;
        result.w = this.w;

        return result;
    }

    /**
     * 
     * @param {Float32Array} matrix - 4x4 Matrix in column major order
     * @returns 
     */
    applyTransformationMatrix(matrix) {
        const rm_matrix = GraphicsMath.transposeMatrix(matrix); // row major matrix
        let result = Vec4.createZero();

        let row = 0;
        result.x = this.x * rm_matrix[row] + this.y * rm_matrix[row + 1] + this.z * rm_matrix[row + 2] + this.w * rm_matrix[row + 3];

        row = 4;
        result.y = this.x * rm_matrix[row] + this.y * rm_matrix[row + 1] + this.z * rm_matrix[row + 2] + this.w * rm_matrix[row + 3];

        row = 8;
        result.z = this.x * rm_matrix[row] + this.y * rm_matrix[row + 1] + this.z * rm_matrix[row + 2] + this.w * rm_matrix[row + 3];

        result.w = 1;

        return result;
    }
}