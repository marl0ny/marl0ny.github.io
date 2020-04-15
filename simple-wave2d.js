/*
* Waves in 2D.
*/

function createGrid(n, m) {
    let grid = [];
    for (let i = 0; i < n; i++) {
        grid.push(new Array(m).fill(0.0));
    }
    return grid;
}


let canvas = document.getElementById("sketchCanvas");
let ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 600;
let grid2Canvas = 5;
let gridLength = Math.round(canvas.width/grid2Canvas);
let amp = 230; // Amplitude of the wave
let wave = [0, 1, 2, 3].map(elem => createGrid(gridLength, gridLength));
// wave[0]: Store a new wave shape as dictated by user input
// wave[1]: wave amplitudes at last time step
// wave[2]: current time step
// wave[3]: next time step


function mouseShapeWave(event) {
    if (event.buttons !== 0) {
        let x = Math.floor((event.clientX - canvas.offsetLeft)/grid2Canvas);
        let y = Math.floor((event.clientY - canvas.offsetTop)/grid2Canvas);
        for (var i = -Math.floor(wave[0].length/8)+1; i < wave[0].length/8; i++) {
            for (var j = -Math.floor(wave[0].length/8)+1; j < wave[0].length/8; j++) {
                if (((x + i) > 0 && (x + i) < wave[0].length - 1) && 
                    ((y + j) > 0 && (y + j) < wave[0][0].length - 1)) {
                    wave[0][x+i][y+j] = (
                        amp*Math.exp(-1.0*(i*i + j*j)/(Math.sqrt(2.0)*wave[0].length/50.0)**2)
                    );
                }
            }
        }
    }
}


function mouseReleaseWave(event) {
    for (var i = 0; i < wave[0].length; i++) {
        for (var j = 0; j < wave[0][0].length; j++) {
            wave[1][i][j] += wave[0][i][j];
            wave[2][i][j] += wave[0][i][j];
            wave[0][i][j] = 0.0;
        }
    }
}


document.addEventListener("touchmove", mouseShapeWave);
document.addEventListener("mousemove", mouseShapeWave);
document.addEventListener("touchend", mouseReleaseWave);   
document.addEventListener("mouseup", mouseReleaseWave);


function animate() {
    let col = 0;
    for (let i = 1; i < wave[0].length - 1; i++) {
        for (let j = 1; j < wave[0][0].length - 1; j++) {
            wave[3][i][j] = 0.5*(wave[2][i+1][j] + wave[2][i-1][j] + 
                                 wave[2][i][j+1] + wave[2][i][j-1]) - wave[1][i][j];
            col = Math.floor(wave[2][i][j] + wave[0][i][j]);
            col += 25;
            ctx.fillStyle = `rgb(${Math.floor(col/4)}, ${Math.floor(col/2)}, ${col})`;
            ctx.fillRect(i*grid2Canvas, j*grid2Canvas, 
                            grid2Canvas, grid2Canvas);
            wave[0][i][j] = 0.0;
        }
    }
    wave = [wave[0], wave[2], wave[3], wave[1]];
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
