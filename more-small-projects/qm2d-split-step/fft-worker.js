import { ComplexArray2D, RowArray } from "./array.js";
import { radix2InPlaceFFT } from "./fft.js";
/*
Do the following instead?
// https://stackoverflow.com/a/45578811
*/


onmessage = e => {
    // let ComplexArray = e.data[0];
    // let isInverse = e.data[1];
    // console.log(e);
    let buf = e.data[0];
    let row_count = e.data[1];
    let column_count = e.data[2];
    let isInverse = e.data[3];
    let arr = ComplexArray2D.createFromBuffer(buf, row_count, column_count);
    for (let i = 0; i < arr.height; i++) {
        radix2InPlaceFFT(new RowArray(arr, i), isInverse);
    }
    postMessage([buf], [buf]);
}