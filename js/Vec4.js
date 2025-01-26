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

        result.x = this.x * rm_matrix[0] + this.y * rm_matrix[4] + this.z * rm_matrix[8] + this.w * rm_matrix[12];
        result.y = this.x * rm_matrix[1] + this.y * rm_matrix[5] + this.z * rm_matrix[9] + this.w * rm_matrix[13];
        result.z = this.x * rm_matrix[2] + this.y * rm_matrix[6] + this.z * rm_matrix[10] + this.w * rm_matrix[14];
        result.w = this.x * rm_matrix[3] + this.y * rm_matrix[7] + this.z * rm_matrix[11] + this.w * rm_matrix[15];

        return result;
    }
}