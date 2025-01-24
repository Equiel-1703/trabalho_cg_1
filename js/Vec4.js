export default class Vec4 {
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    static createZero() {
        return new Vec4(0, 0, 0, 0);
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

    applyTransformationMatrix(matrix) {
        let result = Vec4.createZero();

        result.x = this.x * matrix[0] + this.y * matrix[4] + this.z * matrix[8] + this.w * matrix[12];
        result.y = this.x * matrix[1] + this.y * matrix[5] + this.z * matrix[9] + this.w * matrix[13];
        result.z = this.x * matrix[2] + this.y * matrix[6] + this.z * matrix[10] + this.w * matrix[14];
        result.w = this.x * matrix[3] + this.y * matrix[7] + this.z * matrix[11] + this.w * matrix[15];

        return result;
    }
}