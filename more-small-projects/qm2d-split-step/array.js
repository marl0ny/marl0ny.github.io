import Complex from "./complex.js";

/* Class for managing a single row of the Array2D class,
which will be defined later. */
export class RowArray {
    _array2D; // Reference to the original 2D array
    _index;  // Index of the row with respect to the original array
    constructor(array2D, i) {
        this._array2D = array2D;
        this._index = i;
    }
    /* Since there is no straightforward way to overload the index
    operator so that it has the same behaviour as a normal array, define
    this at method instead for accessing the array at index i. */ 
    at(i) {
        return this._array2D.at(this._index, i);
    }
    /* Set the value of the element at index i.*/
    put(i, val) {
        this._array2D.put(this._index, i, val);
    }
    get length() {
        return this._array2D.width;
    }
}

/* Abstract class for managing 2D arrays of data */
class AbstractArray2D {
    _data; // The actual data
    width;
    height;
    constructor(n, m) {
        this.width = m;
        this.height = n;
    }
    /* Since there is no straightforward way to overload the index
    operator so that it has the same behaviour as a normal array, define
    this at method instead for accessing the array at index i. */ 
    at(i, j) {
        let index = i*this.width + j;
        return this._data[index];
    }
    /* Set the value of the element at index i.*/
    put(i, j, val) {
        let index = i*this.width + j;
        this._data[index] = val;
    }
    getRow(i) {
        return new RowArray(this, i);
    }
}

export class RealArray2D extends AbstractArray2D {
    constructor(n, m) {
        super(n, m);
        this._data = new Float32Array(n*m);
    }
}

export class ComplexArray2D extends AbstractArray2D {
    constructor(n, m) {
        super(n, m);
        this._data = new Float32Array(2*n*m);
    }
    at(i, j) {
        let index = 2*(i*this.width + j);
        return new Complex(this._data[index], this._data[index + 1]);
    }
    put(i, j, val) {
        let index = 2*(i*this.width + j);
        this._data[index] = val.real;
        this._data[index + 1] = val.imag;
    }
    static createFromBuffer(buffer, n, m) {
        let arr = new ComplexArray2D();
        arr._data = new Float32Array(buffer, 0, 2*n*m);
        arr.height = n;
        arr.width = m;
        return arr;
    }
    getRawBuffer() {
        return this._data.buffer;
    }
    subSlice(rowStart, rowStop, columnStart, columnStop) {
        let m = columnStop - columnStart;
        let n = rowStop - rowStart;
        let arr = new ComplexArray2D(n, m);
        for (let i = rowStart; i < rowStop; i++) {
            for (let j = columnStart; j < columnStop; j++) {
                arr.put(i - rowStart, j - columnStart, this.at(i, j));
            }
        }
        return arr;
    }
    transposeInPlace() {
        if (this.width === this.height) {
            let size = this.width;
            for (let i = 0; i < size; i++) {
                for (let j = i+1; j < size; j++) {
                    let tmp = this.at(j, i);
                    this.put(j, i, this.at(i, j));
                    this.put(i, j, tmp);
                }
            }
        } else { // Brute force: create a new temporary array,
                 // copy everything to temporary, swap dimensions
                 // on original, then copy from temporary back
                 // to original with swapped indices.
            let width = this.width, height = this.height;
            let tmp = new ComplexArray2D(height, width);
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    tmp.put(i, j, this.at(i, j));
                }
            }
            this.width = height;
            this.height = width;
            for (let i = 0; i < this.height; i++) {
                for (let j = 0; j < this.width; j++) {
                    this.put(i, j, tmp.at(j, i));
                }
            }
        }
    }
}


