import { mul, imag, exp } from "./complex.js";
import { } from "./array.js";
import { radix2InPlaceFFT2D } from "./fft.js";


/* Split operator method algorithm from

James Schloss.
The Split Operator Method - Arcane Algorithm Archive.
https://www.algorithm-archive.org/contents/\
split-operator_method/split-operator_method.html

*/
export default function splitStep(psi, px, py, phi, dt) {
    spatialStep(psi, phi, 0.5*dt);
    momentumStep(psi, px, py, dt);
    spatialStep(psi, phi, 0.5*dt);
}


function momentumStep(psi, px, py, t) {
    let height = psi.height;
    let width = psi.width;
    radix2InPlaceFFT2D(psi, false, 0);
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            let p2 = px.at(i, j)*px.at(i, j) + py.at(i, j)*py.at(i, j);
            psi.put(i, j, mul(psi.at(i, j), exp(imag(-0.5*p2*t))));
        }
    }
    radix2InPlaceFFT2D(psi, true, 0);
}

function spatialStep(psi, phi, t) {
    let height = psi.height;
    let width = psi.width;
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            psi.put(i, j, mul(psi.at(i, j), exp(imag(-phi.at(i, j)*t))));
        }
    }
}
