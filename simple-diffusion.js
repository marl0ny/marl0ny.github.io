let canvas = document.getElementById("sketchCanvas");
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;
let ctx = canvas.getContext("2d");
let wave = [0, 1, 2].map(elem => (new Array(canvas.width).fill(0.0)));


function shapeWave(x, y) {
    for (var i = -Math.floor(canvas.width/8)+1; i < canvas.width/8; i++) {
        if ((x + i) > 0 && (x + i) < canvas.width - 1)
        wave[0][x+i] = y*Math.exp(-1.0*i*i/(Math.sqrt(2.0)*canvas.width/30.0)**2);
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
        wave[1][i] += wave[0][i];
        wave[2][i] += wave[0][i];
        wave[0][i] = 0.0;
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
    /*
    if (wave[1][wave[1].length - 2] !== NaN) {
        console.log(wave[1]);
    }*/
    for (let k = 0; k < 200; k++) {
        for (let i = 1; i < wave[0].length - 1; i++) {
            wave[2][i] = (wave[1][i + 1] + wave[1][i - 1] - 2*wave[1][i])/4.0 + wave[1][i];
        }
        wave = [wave[0], wave[2], wave[1]];
    }
    ctx.clearRect(0.0, 0.0, canvas.clientWidth, canvas.clientHeight);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 204, 102, 1)'; 
    ctx.moveTo(0, canvas.height/2 - (wave[1][0] + wave[0][0]));
    for (let i = 0; i < canvas.width; i++) {
        ctx.lineTo(i, canvas.height/2 - (wave[1][i] + wave[0][i]));
        ctx.moveTo(i, canvas.height/2 - (wave[1][i] + wave[0][i]));
        wave[0][i] = 0.0;
    }
    ctx.stroke();
    ctx.closePath();
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
