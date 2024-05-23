import Complex from "./complex.js";
import { RealArray2D, ComplexArray2D } from "./array.js";
import splitStep from "./split-step2d.js";
import argToColor from "./domain-color.js";

/* Wave packet simulation in 2D, implemented in vanilla JavaScript/HTML5
and using the split operator method for the numerical integration:

https://www.algorithm-archive.org/contents/\
split-operator_method/split-operator_method.html

Inspired by Daniel Schroeder's Scattering app, as well
as Paul Falstad's qm2dosc program:

https://physics.weber.edu/schroeder/software/\
QuantumScattering2D.html

https://www.falstad.com/qm2dosc/

*/

const N = 256;


function getMomentum(height, width) {
    let px = new RealArray2D(height, width);
    let py = new RealArray2D(height, width);
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            let iShift = (i < height/2)? i: -height + i;
            let jShift = (j < width/2)? j: -width + j;
            px.put(i, j, 2.0*Math.PI*jShift/width);
            py.put(i, j, 2.0*Math.PI*iShift/height);
        }
    }
    return {px: px, py: py};
}

function newWaveFunction(width, height, amp, xOffset, yOffset, nx0, ny0) {
    let psi = new ComplexArray2D(N, N);
    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            let x = j/N - xOffset;
            let y = i/N - yOffset;
            let px0 = (2.0*Math.PI)*nx0;
            let py0 = (2.0*Math.PI)*ny0;
            let sx = 0.05;
            let sy = 0.05;
            let absPsi = amp*Math.exp(-0.5*x*x/(sx*sx) - 0.5*y*y/(sy*sy));
            let rePsi = Math.cos(px0*x + py0*y)*absPsi;
            let imPsi = Math.sin(px0*x + py0*y)*absPsi;
            psi.put(i, j, new Complex(rePsi, imPsi));
        }
    }
    return psi;
}

function reshapePotential(potential, x0, y0) {
    for (var i = 0; i < potential.height; i++) {
        for (var j = 0; j < potential.width; j++) {
            let x = j/N - x0;
            let y = i/N - y0;
            let r2 = x*x + y*y;
            let s = 0.02;
            let potentialVal = potential.at(i, j);
            if (potentialVal < 10.0) 
                potential.put(i, j, potentialVal
                                + 2.5*Math.exp(-0.5*r2/(s*s)));
        }
    }
}

function newHarmonicOscillator(width, height) {
    let potential = new RealArray2D(height, width);
    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            let x = j/N - 0.5;
            let y = i/N - 0.5;
            potential.put(i, j, 10.0*(x*x + y*y));
        }
    }
    return potential;
}

function initPotentialHills(width, height) {
    let potential = new RealArray2D(height, width);
    reshapePotential(potential, 0.5, 0.5);
    reshapePotential(potential, 0.5, 0.5);
    reshapePotential(potential, 0.25, 0.75);
    reshapePotential(potential, 0.70, 0.75);
    reshapePotential(potential, 0.65, 0.35);
    reshapePotential(potential, 0.35, 0.35);
    reshapePotential(potential, 0.5, 0.2);
    return potential;
}



let gPsi = newWaveFunction(N, N, 2.0, 0.5, 0.75, 0.0, -20.0);
let gPotential = initPotentialHills(N, N);
let {px: gPx, py: gPy} = getMomentum(N, N);

let gCanvas = document.getElementById("sketchCanvas");
let gClientWidth = document.documentElement.clientWidth;
let gClientHeight = document.documentElement.clientHeight;
gCanvas.height = 0.95*((gClientHeight > gClientWidth)? 
    gClientWidth: gClientHeight);
gCanvas.width = gCanvas.height;
let gContext = gCanvas.getContext("2d");

let gMousePositions = [];

function mouseNewWaveFunction(event) {
    if (event.buttons !== 0) {
        // console.log(event);
        let x = ((event.clientX - gCanvas.offsetLeft)/
            gCanvas.width);
        let y = ((event.clientY - gCanvas.offsetTop)/
            gCanvas.height);
        if (x > 0.0 && x < 1.0 && y > 0.0 && y < 1.0) {
            if (gMousePositions.length === 0) {
                gMousePositions.push({x: x, y: y});
                gMousePositions.push({x: x, y: y});
            } else {
                gMousePositions[1] = {x: x, y: y};
            }
            let nx = N*(gMousePositions[1].x - gMousePositions[0].x);
            nx = Math.max(Math.min(nx, N/4.0), -N/4.0);
            let ny = N*(gMousePositions[1].y - gMousePositions[0].y);
            ny = Math.max(Math.min(ny, N/4.0), -N/4.0);
            gPsi = newWaveFunction(N, N, 2.0, 
                gMousePositions[0].x, gMousePositions[0].y, nx, ny);
            // console.log(x, y);
        }
    }
}

function mouseDrawPotential(event) {
    if (event.buttons !== 0) {
        let x = ((event.clientX - gCanvas.offsetLeft)/
                gCanvas.width);
        let y = ((event.clientY - gCanvas.offsetTop)/
            gCanvas.height);
        if (x > 0.0 && x < 1.0 && y > 0.0 && y < 1.0)
            reshapePotential(gPotential, x, y);
    }
}

let gDrawSelectType = 1;
const DRAW_NEW_WAVE_FUNCTION = 1;
const DRAW_POTENTIAL = 0;
let gSelector = null;
function initSelector(selector) {
    if (selector === null) {
        selector = document.getElementById("draw-select");
        if (selector !== null) {
            selector.addEventListener(
                "change", e => 
                    gDrawSelectType = Number.parseInt(e.target.value)
            );
            // console.log(selector);
        }
    }
}
initSelector(gSelector);

document.addEventListener("mousemove", e => {
    switch(gDrawSelectType) {
        case DRAW_POTENTIAL:
            mouseDrawPotential(e);
            break;
        default:
            mouseNewWaveFunction(e);
    }
}
);
document.addEventListener("mousedown", e => {
    switch(gDrawSelectType) {
        case DRAW_POTENTIAL:
            mouseDrawPotential(e);
            break;
        default:
            mouseNewWaveFunction(e);
    }
}
);
document.addEventListener("mouseup", e => {
    switch(gDrawSelectType) {
        case DRAW_POTENTIAL:
            mouseDrawPotential(e);
            break;
        default:
            mouseNewWaveFunction(e);
            gMousePositions = [];
    }
});
document.getElementById("zero").addEventListener(
    "click", () => gPotential = new RealArray2D(N, N)
);
document.getElementById("sho").addEventListener(
    "click", () => gPotential = newHarmonicOscillator(N, N)
);

function animate() {
    for (let i = 0; i < 2; i++)
        splitStep(gPsi, gPx, gPy, gPotential, 0.5);
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            let psi = gPsi.at(i, j);
            let phi = gPotential.at(i, j);
            // gContext.fillStyle 
            //     = `rgb(${Math.floor(255.0*psi.abs)}, `
            //     + `${Math.floor(255.0*psi.abs)}, `
            //     + `${Math.floor(255.0*psi.abs)})`;
            let col = argToColor(psi.arg);
            gContext.fillStyle 
                = `rgb(${Math.floor(255.0*(0.1*phi + psi.abs*col.red))}, `
                + `${Math.floor(255.0*(0.1*phi + psi.abs*col.green))}, `
                + `${Math.floor(255.0*(0.1*phi + psi.abs*col.blue))})`;
            gContext.fillRect(gCanvas.width*j/N, gCanvas.height*i/N,
                              gCanvas.width/N, gCanvas.height/N);
        }
    }
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

