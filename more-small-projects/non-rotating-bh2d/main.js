/* Space ship orbiting a Schwarzschild black hole. The equations of motion
for a massive particle in the Schwarzschild metric is from pg. 760 of [1].

Reference:

[1] Gould H., Tobochnik J., and Christian W.
    Chapter 18. Seeing in Special and General Relativity.
    In An Introduction to Computer Simulation Methods 3rd Edition.
    https://www.compadre.org/osp/document/\
    ServeFile.cfm?ID=7375&DocID=527&Attachment=1

*/

let gBlackHoleMass = 10.0;
let gTimeStep = 0.1;
let gTime = 0.0;
let gCycle = 3600;


class Coords {
    constructor(o) {
        for (let k of Object.keys(o))
            this[k] = o[k];
    }
    scale(val) {
        let a = new Coords(this);
        Object.keys(this).map(k => a[k] *= val);
        return a;
    }
}

function add(a, b, ...args) {
    let sum = new a.constructor(a);
    for (let k of Object.keys(a)) {
        sum[k] += b[k];
        args.forEach(e => sum[k] += e[k]);
    }
    return sum;
}

/* Compute the time derivatives of each coordinate for a massive particle
in the Schwarzschild metric. This uses equations 18.27 and 18.28 on
pg 760 of [1].

[1] Gould H., Tobochnik J., and Christian W.
    Chapter 18. Seeing in Special and General Relativity.
    In An Introduction to Computer Simulation Methods 3rd Edition.
    https://www.compadre.org/osp/document/\
    ServeFile.cfm?ID=7375&DocID=527&Attachment=1
*/
function massiveParticleEOM(_t, q) {
    let m = gBlackHoleMass;
    let r = q.r;
    let rDot = q.rDot;
    let phiDot = q.phiDot;
    let rDDot = (4.0*m*m*m - 4.0*m*m*r - 4.0*m*m*r*r*r*phiDot*phiDot
                  + 4.0*m*r*r*r*r*phiDot*phiDot - r*r*r*r*r*phiDot*phiDot
                  + r*r*(m - 3.0*m*rDot*rDot))/((2.0*m - r)*r*r*r);
    let phiDDot = 2.0*(-3.0*m + r)*rDot*phiDot/((2.0*m - r)*r);
    let tauDot = Math.sqrt(
        (1.0 - 2.0*m/r) - rDot*rDot/(1.0 - 2.0*m/r) - r*r*phiDot*phiDot);
    return new Coords ({
        r: rDot, rDot: rDDot, 
        phi: phiDot, phiDot: phiDDot, 
        tau: tauDot});
}

/* Runge-Kutta 4th order method.

Reference:

Wikipedia - Runge–Kutta methods
https://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods

*/
function rk4(ddt, t, x, dt) {
    let x1Dot = ddt(t, x);
    let x2Dot = ddt(t + 0.5*dt, add(x, x1Dot.scale(0.5*dt)));
    let x3Dot = ddt(t + 0.5*dt, add(x, x2Dot.scale(0.5*dt)));
    let x4Dot = ddt(t + dt, add(x, x3Dot.scale(dt)));
    return add(x, add(x1Dot, 
                      x2Dot.scale(2.0), x3Dot.scale(2.0),
                      x4Dot).scale(dt/6.0));
}


/* Convert an angle on the colour wheel to its corresponding colour value.

References:

Wikipedia - Hue
https://en.wikipedia.org/wiki/Hue

https://en.wikipedia.org/wiki/Hue#/media/File:HSV-RGB-comparison.svg

*/
function angleToColor(arg) {
    const pi = Math.PI;
    let maxCol = 1.0;
    let minCol = 50.0/255.0;
    let colRange = maxCol - minCol;
    if (arg <= pi/3.0 && arg >= 0.0) {
        return {red: maxCol,
                green: minCol + colRange*arg/(pi/3.0),
                blue: minCol};
    } else if (arg > pi/3.0 && arg <= 2.0*pi/3.0) {
        return {red: maxCol - colRange*(arg - pi/3.0)/(pi/3.0),
                green: maxCol, 
                blue: minCol};
    } else if (arg > 2.0*pi/3.0 && arg <= pi) {
        return {red: minCol,
                green: maxCol,
                blue: minCol + colRange*(arg - 2.0*pi/3.0)/(pi/3.0)};
    } else if (arg < 0.0 && arg > -pi/3.0) {
        return {red: maxCol, 
                green: minCol,
                blue: minCol - colRange*arg/(pi/3.0)};
    } else if (arg <= -pi/3.0 && arg > -2.0*pi/3.0) {
        return {red: maxCol + (colRange*(arg + pi/3.0)/(pi/3.0)),
                green: minCol, 
                blue: maxCol};
    } else if (arg <= -2.0*pi/3.0 && arg >= -pi) {
        return {red: minCol,
                green: minCol - (colRange*(arg + 2.0*pi/3.0)/(pi/3.0)), 
                blue: maxCol};
    }
    else {
        return {red: minCol, green: maxCol, blue: maxCol};
    }
}

// let gTimeAtInf
//      = new Coords({r: 100000.0, phi: 0.0, rDot: 0.0, phiDot: 0.0, tau: 0.0});
let gX = (() => {
    r = 100.0;
    return new Coords({r: r, phi: Math.PI/2.0, rDot: 0.0,
                phiDot: 0.27/r, tau: gTime});
})();
// let gPath = [];


let gCanvas = document.getElementById("sketchCanvas");
gCanvas.width = document.documentElement.clientWidth;
gCanvas.height = document.documentElement.clientHeight;
let gContext = gCanvas.getContext("2d");

let gMousePositions = [];

function setParticleAt(x, y, vx = 0.0, vy = 0.0) {
    let r  = Math.sqrt(x*x + y*y);
    let phi;
    if (r === 0.0) {
        phi = 0.0;
    } else if (y > 0.0) {
        phi = Math.acos(x/r);
    } else {
        phi = -Math.acos(x/r);
    }
    gTime = 0.0;
    gX = new Coords({r: r, phi: phi, rDot: 0.0,
                     phiDot: 0.4/r, tau: gTime});
}

function mouseNewParticle(event) {
    if (event.buttons !== 0) {
        gContext.clearRect(0, 0, gCanvas.width, gCanvas.height);
        // console.log(event);
        let x = (event.clientX - gCanvas.offsetLeft) - gCanvas.width/2.0;
        let y = gCanvas.height/2.0 - (event.clientY - gCanvas.offsetTop);
        if (gMousePositions.length === 0) {
            gMousePositions.push({x: x, y: y});
            gMousePositions.push({x: x, y: y});
        } else {
            gMousePositions[1] = {x: x, y: y};
        }
        setParticleAt(x, y);
    }
}

document.addEventListener("mousemove", e => {
    mouseNewParticle(e);
});

document.addEventListener("mousedown", e => {
    mouseNewParticle(e);
});

/*document.addEventListener("mouseup", e => {
    
});

document.addEventListener("touchstart", e => {

});

document.addEventListener("touchmove", e => {

});

document.addEventListener("touchend", e => {

});*/


function drawClock(time, x0, y0, r, label='') {
    let labelLength = label.length;
    let length = (gCanvas.width < gCanvas.height)? 
        gCanvas.width: gCanvas.height;
    let x = gCanvas.width*x0;
    let y = gCanvas.height*(1.0 - y0);
    let radius = length*r*0.9;
    let radius2 = length*r;
    let fontSize = parseInt(radius2/3.0);
    let wordSpace = 2.0;
    let angle = (time/gCycle) % (2.0*Math.PI);
    angle = (angle >= Math.PI)? (-2.0*Math.PI + angle): angle;
    let color = angleToColor(angle);
    let colorString 
        = `rgba(${parseInt(255.0*color.red)}, `
        + `${parseInt(255.0*color.green)}, ${parseInt(255.0*color.blue)}, 1.0)`;
    let x1 = x + radius*Math.cos(-angle + Math.PI/2.0);
    let y1 = y - radius*Math.sin(-angle + Math.PI/2.0);
    gContext.clearRect(x - radius2, y - radius2, 
                       2.0*radius2, 2.0*radius2 + fontSize + wordSpace);
    // gContext.beginPath();
    // gContext.moveTo(x - radius2, y - radius2);
    // gContext.lineTo(x + radius2, y + radius2);
    // gContext.stroke();
    // gContext.closePath();
    gContext.lineWidth = 3.0;
    // gContext.drawRect(x - radius, y - radius, x + radius, y + radius);
    gContext.beginPath();
    gContext.strokeStyle = colorString;
    gContext.moveTo(x, y);
    gContext.lineTo(x1, y1);
    gContext.moveTo(x1, y1);
    gContext.stroke();
    gContext.closePath();
    gContext.beginPath();
    gContext.strokeStyle = `rgba(255, 255, 255, 1)`;
    gContext.arc(x, y, radius2, 0.0, 2.0*Math.PI);
    gContext.stroke();
    gContext.closePath();
    gContext.font = `${fontSize}px sans-serif`;
    gContext.fillStyle = `rgba(255, 255, 255, 1)`;
    gContext.fillText(label, x - parseInt(labelLength*fontSize/4.0),
                      y + radius2 + fontSize + wordSpace);
}

function animate() {
    let linesPerFrame = 10;
    let stepsPerLineDrawn = 100;
    for (let j = 0; j < linesPerFrame; j++) {
        let q;
        for (let i = 0; i < stepsPerLineDrawn; i++) {
            if (i == 0)
                q = rk4(massiveParticleEOM, 0.0, gX, gTimeStep);
            else
                q = rk4(massiveParticleEOM, 0.0, q, gTimeStep);
            gTime += gTimeStep;
        }
        let angle = (q.tau/gCycle) % (2.0*Math.PI);
        angle = (angle >= Math.PI)? (-2.0*Math.PI + angle): angle;
        // console.log(angle/Math.PI);
        let color = angleToColor(angle);
        let colorString 
            = `rgba(${parseInt(255.0*color.red)}, `
            + `${parseInt(255.0*color.green)}, ${parseInt(255.0*color.blue)}, 1.0)`;
        gContext.beginPath();
        gContext.lineWidth = 1.0;
        gContext.strokeStyle = colorString;
        let xi = gX.r*Math.cos(gX.phi) + gCanvas.width/2.0;
        let yi = gX.r*Math.sin(gX.phi) + gCanvas.height/2.0;
        let xf = q.r*Math.cos(q.phi) + gCanvas.width/2.0;
        let yf = q.r*Math.sin(q.phi) + gCanvas.height/2.0;
        gContext.moveTo(xi, gCanvas.height - yi);
        gContext.lineTo(xf, gCanvas.height - yf);
        gContext.stroke();
        gContext.closePath();
        gX = q;
    }
    // let shortestSideLength = 
    //     (gCanvas.width < gCanvas.height)? gCanvas.width: gCanvas.height;
    drawClock(gX.tau, 0.15, 0.9, 0.1, label='Ship clock');
    drawClock(gTime, 0.15, 0.6, 0.1, label='Rest clock (r = ∞)');
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
