/* Visualization of a wave packet in one dimension.
The numerical integration scheme used is the 
split operator method:

https://www.algorithm-archive.org/contents/\
split-operator_method/split-operator_method.html

Inspired by Daniel Schroeder's Harmonic Oscillator
animation:

https://physics.weber.edu/schroeder/\
software/HarmonicOscillator.html

https://codepen.io/dvschroeder/pen/RwVMqN

*/

const N = 512;

/* Define a complex object */
class Complex {
    real;
    imag;
    constructor(real, imag) {
        this.real = real;
        this.imag = imag;
    }
    conj() {
        return new Complex(this.real, -this.imag);
    }
    get abs() {
        return Math.sqrt(this.real*this.real + this.imag*this.imag);
    }
}

/* Unfortunately, there is no operator overloading in Javascript
so these are just normal functions */
let add = (z, w) => new Complex(z.real + w.real, z.imag + w.imag);

let sub = (z, w) => new Complex(z.real - w.real, z.imag - w.imag);

let mul = (z, w) => new Complex(z.real*w.real - z.imag*w.imag,
                                z.real*w.imag + z.imag*w.real);

let exp = z => new Complex(Math.exp(z.real)*Math.cos(z.imag),
                           Math.exp(z.real)*Math.sin(z.imag));

let real = r => new Complex(r, 0.0);

let imag = r => new Complex(0.0, r);

class ComplexArray {
    _data;
    constructor(n) {
        this._data = new Float32Array(2*n);
    }
    at(i) {
        return new Complex(this._data[2*i], this._data[2*i + 1]);
    }
    put(i, val) {
        this._data[2*i] = val.real;
        this._data[2*i + 1] = val.imag;
    }
    get length() {
        return this._data.length/2;
    }
}

/* Reverse bit sort an array, whose length must be a power of two.*/
function reverseBitSort2(arr) {
    let n = arr.length;
    let u, d, rev;
    for (var i = 0; i < n; i++) {
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
function radix2InPlaceFFT(arr, isInverse) {
    reverseBitSort2(arr);
    for (var blockSize = 2; blockSize <= arr.length; blockSize *= 2) {
        for (var j = 0; j < arr.length; j += blockSize) {
            for (var i = 0; i < blockSize/2; i++) {
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

function getMomentum(n) {
    let p = [];
    for (let i = 0; i < n; i++) {
        let iShift = (i < n/2)? i: -n + i;
        p.push(2.0*Math.PI*iShift/n);
    }
    return p;
}

/* Split operator method algorithm from

James Schloss.
The Split Operator Method - Arcane Algorithm Archive.
https://www.algorithm-archive.org/contents/\
split-operator_method/split-operator_method.html

*/
function splitStep(psi, p, phi, dt) {
    spatialStep(psi, phi, 0.5*dt);
    momentumStep(psi, p, dt);
    spatialStep(psi, phi, 0.5*dt);
}

function momentumStep(psi, p, t) {
    radix2InPlaceFFT(psi, false);
    for (var i = 0; i < N; i++) {
        let p2 = p[i]*p[i];
        psi.put(i, mul(psi.at(i), exp(imag(-0.5*p2*t))));
    }
    radix2InPlaceFFT(psi, true);
}

function spatialStep(psi, phi, t) {
    for (var i = 0; i < N; i++) {
        psi.put(i, mul(psi.at(i), exp(imag(-phi[i]*t))));
    }
}

let gCanvas = document.getElementById("sketchCanvas");
gCanvas.width = document.documentElement.clientWidth;
gCanvas.height = document.documentElement.clientHeight;
let gContext = gCanvas.getContext("2d");

let gPsi = new ComplexArray(N);
let gPotential = [];
let gMomentum = getMomentum(N);
for (var i = 0; i < N; i++) {
    let x = i/N - 0.5;
    gPotential.push(x*x);
    let phase = (2.0*Math.PI)*20.0;
    let s = 0.05;
    let rePsi = 150*Math.cos(phase*x)*Math.exp(-0.5*x*x/(s*s));
    let imPsi = 150*Math.sin(phase*x)*Math.exp(-0.5*x*x/(s*s));
    gPsi.put(i, new Complex(rePsi, imPsi));
}

function animate() {
    for (let i = 0; i < 10; i++)
        splitStep(gPsi, gMomentum, gPotential, 0.5);
    gContext.clearRect(0.0, 0.0, gCanvas.clientWidth, gCanvas.clientHeight);
    let colorStyles = {
        real: 'rgba(213, 58, 0, 1)', imag: 'rgba(81, 150, 223, 1)', 
        abs: 'rgba(255, 255, 255, 1)'
    }
    for (let k of Object.keys(colorStyles)) {
        gContext.beginPath();
        gContext.strokeStyle = colorStyles[k];
        gContext.moveTo(0, gCanvas.height/2);
        for (let i = 0; i < N; i++) {
            let psi = gPsi.at(i);
            let val = (k === 'real' || k === 'imag')? psi[k]: psi.abs;
            let x = (i/N)*gCanvas.width;
            gContext.lineTo(x, gCanvas.height/2 - val);
            gContext.moveTo(x, gCanvas.height/2 - val);
        }
        gContext.stroke();
        gContext.closePath();
    }
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
