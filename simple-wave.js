/*
* Simple numerical simulation of the 1D wave equation.
*
* The the 1D wave equation can be discretized as
*   u(x, t + dt) = (c dt/dx)(u(x + dx, t) - 2u(x, t) + u(x - dx, t)) + u(t, t)
* Where dt and dx are the time and spatial steps, and c is the propagation speed
* of the wave. In the case when c dt/ dx = 1, the above equation reduces to
*  u(x, t + dt) = u(x + dx, t) - u(x, t) + u(x - dx, t),
* which is an exact solution, at least for this particular case 
* (Gould et al. 2007, pg 342).
*
* References:
*  Gould, H., Tobochnik J., Christian W. (2007). Normal Modes and Waves.
*  In An Introduction to Computer Simulation Methods, 
*  chapter 9. Pearson Addison-Wesley.
*
*/


let canvas = document.getElementById("sketchCanvas");
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;
let ctx = canvas.getContext("2d");
let wave = [0, 1, 2, 3].map(elem => new Array(canvas.width).fill(0.0));
// wave[0]: wave amplitudes at last time step
// wave[1]: current time step
// wave[2]: next time step
// wave[3]: Store a new wave shape as dictated by user input


function shapeWave(x, y) {
    for (var i = -Math.floor(canvas.width/8)+1; i < canvas.width/8; i++) {
        wave[3][x+i] = ((x + i) > 0 && (x + i) < canvas.width - 1)? 
        y*Math.exp(-1.0*i*i/(Math.sqrt(2.0)*canvas.width/30.0)**2): wave[3][x+i];
    }
}


function mouseShapeWave(event, onRelease=false) {
    if (event.buttons !== 0 || onRelease) {
        let x = event.clientX - canvas.offsetLeft;
        let y = canvas.height/2 - (event.clientY - canvas.offsetTop);
        shapeWave(x, y);
    }
}


function touchShapeWave(event) {
    var touches = event.changedTouches;
    for (var i = 0; i < touches.length; i++) {
        let x = Math.floor(touches[i].pageX - canvas.offsetLeft);
        let y = Math.floor(canvas.height/2 - (touches[i].pageY - canvas.offsetTop));
        shapeWave(x, y);
    }
}


function releaseWave() {
    for (let i = 0; i < wave[0].length; i++) {
        wave[0][i] += wave[3][i];
        wave[1][i] += wave[3][i];
        wave[3][i] = 0.0;
    }    
}


document.addEventListener("touchstart", touchShapeWave);
document.addEventListener("touchmove", touchShapeWave);
document.addEventListener("mousemove", mouseShapeWave);
document.addEventListener("touchend", event => releaseWave());
document.addEventListener("mouseup", event => {
    mouseShapeWave(event, onRelease=true); 
    releaseWave();
});


function animate() {
    for (let i = 1; i < wave[0].length - 1; i++) {
        wave[2][i] = wave[1][i + 1] + wave[1][i - 1] - wave[0][i];
    }
    ctx.clearRect(0.0, 0.0, canvas.clientWidth, canvas.clientHeight);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 204, 102, 1)'; 
    ctx.moveTo(0, canvas.height/2 - wave[1][0] - wave[3][0]);
    for (let i = 0; i < canvas.width; i++) {
        ctx.lineTo(i, canvas.height/2 - wave[1][i] - wave[3][i]);
        ctx.moveTo(i, canvas.height/2 - wave[1][i] - wave[3][i]);
        wave[3][i] = 0.0;
    }
    ctx.stroke();
    ctx.closePath();
    wave = [wave[1], wave[2], wave[0], wave[3]];
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
