import { mul, add, sub, real, imag, exp } from "./complex.js";
import { ComplexArray2D } from "./array.js";


/* Reverse bit sort an array, whose length must be a power of two.*/
function reverseBitSort2(arr) {
    let n = arr.length;
    let u, d, rev;
    for (let i = 0; i < n; i++) {
        u = 1;
        d = n >> 1;
        rev = 0;
        while (u < n) {
            rev += d*((i&u)/u);
            u <<= 1;
            d >>= 1;
        }
        if (rev <= i) {
            let tmp = arr.at(i);
            arr.put(i, arr.at(rev));
            arr.put(rev, tmp);

        }
    }
}
 
/* Cooley-Tukey iterative radix-2 FFT algorithm. Note that
arr.length must be a power of two, or else this will not work properly.

References:

Wikipedia - Cooley–Tukey FFT algorithm
https://en.wikipedia.org/wiki/Cooley%E2%80%93Tukey_FFT_algorithm

MathWorld Wolfram - Fast Fourier Transform:
http://mathworld.wolfram.com/FastFourierTransform.html

William Press et al.
12.2 Fast Fourier Transform (FFT) - in Numerical Recipes
https://websites.pmc.ucsc.edu/~fnimmo/eart290c_17/NumericalRecipesinF77.pdf

*/
export function radix2InPlaceFFT(arr, isInverse = false) {
    reverseBitSort2(arr);
    for (let blockSize = 2; blockSize <= arr.length; blockSize *= 2) {
        for (let j = 0; j < arr.length; j += blockSize) {
            for (let i = 0; i < blockSize/2; i++) {
                let sgn = (isInverse)? 1.0: -1.0;
                let e = exp(imag(sgn*2.0*Math.PI*i/blockSize)); 
                let even = arr.at(j + i);
                let odd = arr.at(j + i + blockSize/2);
                let s = real((isInverse && blockSize == arr.length)?
                             1.0/arr.length: 1.0);
                arr.put(i + j,
                        mul(s, add(even, mul(odd, e))));
                arr.put(i + j + blockSize/2,
                        mul(s, sub(even, mul(odd, e))));
            }
        }
    }
}

let gComplete = false;
function radix2InPlaceFFT2DWorkersHelper(
    arr, isInverse = false, numberOfWorkers = 4) {
    const workersCount = numberOfWorkers;
    let workers = [];
    let processedSlices = [];
    let numberOfRows = arr.height/workersCount;
    let copySlicesBackToArr = () => {
        console.log(processedSlices[0]);
        for (let i = 0; i < workersCount; i++) {
            for (let j = 0; j < processedSlices[i].height; j++) {
                for (let k = 0; k < processedSlices[i].width; k++) {
                    let j2 = j + i*numberOfRows; 
                    arr.put(j2, k, processedSlices[i].at(j, k));
                }
            }
        }
        gComplete = true;
    };
    for (let i = 0; i < workersCount; i++) {
        workers.push(new Worker("./fft-worker.js", {type: "module"}));
        let subSliceHeight = numberOfRows;
        let subSlice = arr.subSlice(
            i*numberOfRows, (i+1)*numberOfRows, 0, arr.width);
        workers[i].postMessage(
            [subSlice.getRawBuffer(), 
                subSlice.height, subSlice.width, isInverse], 
            [subSlice.getRawBuffer()]
        );
        workers[i].onmessage = e => {
            let data = e.data;
            let buf = data[0];
            processedSlices.push(
                ComplexArray2D.createFromBuffer(
                    buf, subSliceHeight, arr.width));
            if (processedSlices.length === workersCount)
                copySlicesBackToArr();
        };
    }
    while (!gComplete) {}
    gComplete = false;
    // await Promise.all(workers).then(() => {while(!complete) {}});
}

export function radix2InPlaceFFT2D(
    arr, isInverse = false, numberOfWorkers = 0) {
    for (let iter=0; iter < 2; iter++) {
        if (numberOfWorkers > 0) {
            radix2InPlaceFFT2DWorkersHelper(arr, false, numberOfWorkers);
        } else {
            for (let i = 0; i < arr.height; i++) {
                radix2InPlaceFFT(arr.getRow(i), isInverse);
            }
        }
        arr.transposeInPlace();
    }
}
