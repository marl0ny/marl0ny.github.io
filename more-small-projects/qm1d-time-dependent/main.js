/* Wave packet in a time-dependent potential in 1D.
The numerical integration scheme used is the 
split operator method:

https://www.algorithm-archive.org/contents/\
split-operator_method/split-operator_method.html

*/

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
    get abs2() {
        return this.real*this.real + this.imag*this.imag;
    }
    get abs() {
        return Math.sqrt(this.abs2);
    }
}

/* Unfortunately, there is no operator overloading in Javascript,
so we must define named functions for doing mathematical operations
over the complex data type.*/
const add = (z, w) => new Complex(z.real + w.real, z.imag + w.imag);

const sub = (z, w) => new Complex(z.real - w.real, z.imag - w.imag);

const mul = (z, w) => new Complex(z.real*w.real - z.imag*w.imag,
                                  z.real*w.imag + z.imag*w.real);
 
const exp = z => new Complex(Math.exp(z.real)*Math.cos(z.imag),
                             Math.exp(z.real)*Math.sin(z.imag));

const real = r => new Complex(r, 0.0);

const imag = r => new Complex(0.0, r);

class ComplexArray {
    _data;
    constructor(n) {
        this._data = new Float64Array(2*n);
    }
    /* Since there is no straightforward way to overload the index
    operator so that it has the same behaviour as a normal array, define
    this at method instead for accessing the array at index i. */ 
    at(i) {
        return new Complex(this._data[2*i], this._data[2*i + 1]);
    }
    /* Set the value of the element at index i.*/
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
        d = n/2;
        rev = 0;
        while (u < n) {
            rev += d*((i&u)/u);
            u *= 2;
            d /= 2;
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

/* Split operator method algorithm from

James Schloss.
The Split Operator Method - Arcane Algorithm Archive.
https://www.algorithm-archive.org/contents/\
split-operator_method/split-operator_method.html

*/
function splitStep(psi, phi, x, p, t, dt) {
    spatialStep(psi, phi, x, t, mul(real(0.5), dt));
    momentumStep(psi, p, dt);
    spatialStep(psi, phi, x, t, mul(real(0.5), dt));
}

function momentumStep(psi, p, t) {
    radix2InPlaceFFT(psi, false);
    for (var i = 0; i < psi.length; i++) {
        let p2 = p[i]*p[i];
        psi.put(i, mul(psi.at(i), exp(mul(t, imag(-0.5*p2)))));
    }
    radix2InPlaceFFT(psi, true);
}

function spatialStep(psi, phi, x, t, dt) {
    for (var i = 0; i < psi.length; i++)
        psi.put(i, mul(psi.at(i), exp(mul(imag(-phi(x[i], t)), dt))));
}

const computeEnergy = (psi, phi, x, p, t) => {
    let pe = real(0.0);
    let ke = real(0.0);
    let n = psi.length;
    let psi2 = new ComplexArray(n);
    for (let i = 0; i < n; i++) {
        psi2.put(i, psi.at(i));
        pe = add(pe, 
                 mul(psi2.at(i).conj(),
                 mul(real(phi(x[i], t)), psi2.at(i))));
    }
    radix2InPlaceFFT(psi2, false);
    for (let i = 0; i < n; i++) {
        let p2 = p[i]*p[i];
        ke = add(ke, mul(psi2.at(i).conj(), 
                     mul(real(0.5*p2/n), psi2.at(i))));
    }
    return ke.real + pe.real;
}

function normalizeInPlace(psi) {
    let sum = 0.0;
    for (let i = 0; i < psi.length; i++)
        sum += psi.at(i).abs2; 
    let norm_factor = Math.sqrt(sum);
    for (let i = 0; i < psi.length; i++)
        psi.put(i, mul(psi.at(i), real(1.0/norm_factor)));
}

const N = 512;  // Discretization length. Must be a power of two.
const STEPS_PER_FRAME = 50;
const DT = 0.5;  // Time step

function getPosition(n) {
    let x = new Float64Array(n);
    [...x.keys()].forEach(i => x[i] = i);
    return x;
}

const X = ((n) => {
    let x = new Float64Array(n);
    [...x.keys()].forEach(i => x[i] = i);
    return x;
}) (N);

const P = ((n) => {
    let p = new Float64Array(n);
    [...p.keys()].forEach(i => p[i] = 2.0*Math.PI*((i < n/2)? i: -n + i)/n);
    return p;
}) (N);


let gWellWidth = N*0.12;
let gPotentialTimeDependence = t => {
    kt = 0.00001*t;
    return N/2.0 + (N/4.0)*Math.cos(0.001*t+ 400.0*kt*kt);
}

/* The potential takes the form a*(1 - exp(-xs*xs/(2*s*s)))), where s and a
are constants and xs is the shifted position coordinate so that it is zero 
at the potential's minimum. The first term of the Taylor expansion
around xs=0 is a*0.5*xs*xs/(s*s) = 0.5*(sqrt(a)/s)^2*xs^2. This gives a 
value of omega = (sqrt(a)/s), where omega is used in defining the strength
of the harmonic oscillator and its eigenstates. Formula for harmonic
oscillator from
https://en.wikipedia.org/wiki/Quantum_harmonic_oscillator
*/
function makePotentialAndWaveFunctionFunctions(wellWidth, timeDep) {
    let a = 0.2;
    let s = wellWidth;
    let omega = Math.sqrt(a)/s;
    return {
        potential: (x, t) => {
            let xs = x - timeDep(t);
            return a*(1.0 - Math.exp(-0.5*xs*xs/(s*s)));
        },
        waveFunction: (x, t) => {
            let phase = 0.0; // (2.0*Math.PI)*20.0;
            let xs = x - timeDep(t);
            let absPsi = Math.exp(-0.5*omega*xs*xs);
            let rePsi = Math.cos(phase*xs)*absPsi;
            let imPsi = Math.sin(phase*xs)*absPsi;
            return new Complex(rePsi, imPsi);
        },
        maxPotential: a
    }
}

let {potential: gPhi, waveFunction: initWaveFunction,
     maxPotential: gMaxPotential}
    = makePotentialAndWaveFunctionFunctions(
        gWellWidth, gPotentialTimeDependence);
let gTime = 0.0;
let gPsi = new ComplexArray(N);
let gDiffuse = 0.0;
for (let i = 0; i < gPsi.length; i++)
    gPsi.put(i, initWaveFunction(X[i], gTime));
normalizeInPlace(gPsi);

function stopPotentialTimeDependence() {
    let xWhereVMin = X.reduce((xNext, xLast) => 
        (gPhi(xNext, gTime) < gPhi(xLast, gTime))? xNext: xLast, -1);
    gPotentialTimeDependence = () => xWhereVMin;
    let {potential: phi} = makePotentialAndWaveFunctionFunctions(
        gWellWidth, gPotentialTimeDependence
    );
    gPhi = phi;
}

function setPotentialToPositionOverTime(xNew) {
    let xWhereVMin = X.reduce((xNext, xLast) => 
        (gPhi(xNext, gTime) < gPhi(xLast, gTime))? xNext: xLast, -1);
    gTime = 0.0;
    let interval = Math.abs(xNew - xWhereVMin)*10.0;
    gPotentialTimeDependence = t => (t > interval)? 
        xNew: t*(xNew - xWhereVMin)/interval + xWhereVMin;
    let {potential: phi} = makePotentialAndWaveFunctionFunctions(
        gWellWidth, gPotentialTimeDependence
    );
    gPhi = phi;
}

let gCanvas = document.getElementById("sketchCanvas");
gCanvas.width = document.documentElement.clientWidth;
gCanvas.height = 0.9*document.documentElement.clientHeight;
let gContext = gCanvas.getContext("2d");

const mouseSetPotentialPosition = (e, onRelease=false) => {
    if (e.buttons !== 0 || onRelease) {
        if ((e.clientY - gCanvas.offsetTop)/gCanvas.height > 1.0)
            return;
        let xNew = ((e.clientX - gCanvas.offsetLeft)/
                  gCanvas.width)*N;
        if (onRelease)
            stopPotentialTimeDependence();
        else
            setPotentialToPositionOverTime(xNew, setOverTime=!onRelease);
    }
}

const touchSetPotentialPosition = (e, onRelease=false) => {
    let touches = e.changedTouches;
    if (touches.length > 0) {
        let n = touches.length;
        if ((touches[n-1].pageY - gCanvas.offsetTop)/gCanvas.height > 1.0)
            return;
        let xNew = ((touches[n-1].pageX - gCanvas.offsetLeft)/
                     gCanvas.width)*N;
        if (onRelease)
            stopPotentialTimeDependence();
        else
            setPotentialToPositionOverTime(xNew, setOverTime=!onRelease);
    }
}

document.getElementById("diffuse").addEventListener("input",
    e => gDiffuse = 0.25*DT*e.target.value/100.0
);
document.getElementById("well-size").addEventListener("input",
    e => {
        gWellWidth = 0.24*N*e.target.value/100.0;
        let {potential: phi} = makePotentialAndWaveFunctionFunctions(
            gWellWidth, gPotentialTimeDependence
        );
        gPhi = phi;
    }
)
document.addEventListener("touchstart", touchSetPotentialPosition);
document.addEventListener("touchmove", touchSetPotentialPosition);
document.addEventListener("touchend", 
    e => touchSetPotentialPosition(e, true));
document.addEventListener("mousemove", mouseSetPotentialPosition);
document.addEventListener("mousedown", mouseSetPotentialPosition);
document.addEventListener("mouseup",
    e => mouseSetPotentialPosition(e, true));

function drawLegend(colorStyles) {
    gContext.font = '20px sans-serif';
    for (let [i, k] of Object.keys(colorStyles).entries()) {
        let label;
        if (k === 'real') {
            label = '― Re(ψ(x))';
        } else if (k === 'imag') {
            label = '― Im(ψ(x))';
        } else if (k === 'abs') {
            label = '― |ψ(x)|';
        } else if (k === 'potential') {
            label = '― V(x)';
        } else if (k === 'energy') {
            label = '― <ψ|H|ψ>'
        }
        gContext.fillStyle = colorStyles[k];
        let size = 
            (gCanvas.width < gCanvas.height)? gCanvas.width: gCanvas.height;
        gContext.fillText(label, 0.1*size, 0.1*size + i*25);
    }
}

function animate() {
    for (let i = 0; i < STEPS_PER_FRAME; i++) {
        splitStep(gPsi, gPhi, X, P, gTime, new Complex(DT, -gDiffuse));
        if (gDiffuse > 0.0) {
            normalizeInPlace(gPsi);
        }
        gTime += DT;
    }
    let energy = computeEnergy(gPsi, gPhi, X, P, gTime);
    gContext.clearRect(0.0, 0.0, gCanvas.width, gCanvas.height);
    let colorStyles = {
        real: 'rgba(213, 58, 0, 1)', imag: 'rgba(81, 150, 223, 1)', 
        abs: 'rgba(255, 255, 255, 1)', potential: 'rgba(128, 128, 128, 0.5)',
        energy: 'rgba(200, 200, 200, 0.5)'
    }
    drawLegend(colorStyles);
    for (let k of Object.keys(colorStyles)) {
        gContext.beginPath();
        gContext.lineWidth = (k === 'potential')? 3: 1;
        gContext.strokeStyle = colorStyles[k];
        for (let i = 0; i < N; i++) {
            let psi = gPsi.at(i);
            let val;
            if (k === 'real' || k === 'imag')
                val = 2.0*(gCanvas.height)*psi[k];
            else if (k === 'abs')
                val = 2.0*(gCanvas.height)*psi.abs;
            else if (k === 'potential')
                val = (gPhi(X[i], gTime))
                    *gCanvas.height*0.5/gMaxPotential;
            else if (k === 'energy')
                val = energy
                    *gCanvas.height*0.5/gMaxPotential;
            let xCanvas = (i/N)*gCanvas.width;
            if (i === 0)
                gContext.moveTo(0, gCanvas.height/2 - val);
            gContext.lineTo(xCanvas, gCanvas.height/2 - val);
            gContext.moveTo(xCanvas, gCanvas.height/2 - val);
        }
        gContext.stroke();
        gContext.closePath();
    }
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
