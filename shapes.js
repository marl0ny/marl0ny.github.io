/*
* Basic wireframes of 3d shapes, in pure javascript and html.
*
* The primary reference in writing this script is
* Chapter 5 and Chapter 11 of Game Engine Architecture by Jason Gregory,
* where chapter 5 is about 3d math in games and chapter 11 is about
* graphics rendering.
*
*/

canvas = document.getElementById("sketch-canvas");
canvas.width = document.documentElement.clientWidth*0.95;
canvas.height = document.documentElement.clientHeight*0.92;
ctx = canvas.getContext("2d");


let euclideanNorm = (...args) => (
    Math.sqrt(args.reduce(((sum, elem) => 
    (sum + Math.pow(elem, 2))), 0))
);


let crossProduct = function (p1, p2) {
    return {
        x: (p1.y*p2.z - p1.z*p2.y),
        y: (- p1.x*p2.z + p1.z*p2.x),
        z: (p1.x*p2.y - p1.y*p2.x)
    };
};


let add = function (v1, v2)  {
    return {x: v1.x + v2.x, y: v1.x + v2.y, z: v1.z + v2.z};
};


let subtract = function (v1, v2)  {
    return {x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z};
};


let dot = (v1, v2) => (v1.x*v2.x + v1.y*v2.y + v1.z*v2.z);


class VertexArray {

    constructor(x=[], y=[], z=[]) {
        this.length = x.length;
        if (y.length != this.length | z.length != this.length){
            throw "Input arrays must have the same length.";
        }
		this.x = x;
		this.y = y;
		this.z = z;
    }

    checkIndex(index) {
        if (index >= this.length | index < 0){
            throw "Index out of range.";
        }
    }

    getVertex(index) {
        this.checkIndex(index);
        let x = this.x[index];
        let y = this.y[index];
        let z = this.z[index];
        return {x:x, y:y, z:z};
    }

	setVertex(index, x, y, z) {
        this.checkIndex(index);
	    this.x[index] = x;
	    this.y[index] = y;
        this.z[index] = z;
    }

	pushVertex(x, y, z) {
	    this.length += 1;
	    this.x.push(x);
	    this.y.push(y);
	    this.z.push(z);
    }

	popVertex() {
        if (this.length !== 0) {
            this.length -= 1;
            let x = this.x.pop();
            let y = this.y.pop();
            let z = this.z.pop();
            return {x:x, y:y, z:z};
        }
    }

	rotateVertexAtIndex(index, r0, ri, rj, rk) {
        this.checkIndex(index);
        let q0 = 1.0;
        let qi = this.x[index];
        let qj = this.y[index];
        let qk = this.z[index];
        let abs2 = 1;
        let qr0 = q0*r0 - qi*ri - qj*rj - qk*rk;
        let qri = qi*r0 + q0*ri + qj*rk - qk*rj;
        let qrj = qj*r0 + q0*rj + qk*ri - qi*rk;
        let qrk = qk*r0 + q0*rk + qi*rj - qj*ri;
        // abs2 = r0*r0 + ri*ri + rj*rj + rk*rk;
        // Set r to its inverse
        r0 = r0/abs2;
        ri = -ri/abs2;
        rj = -rj/abs2;
        rk = -rk/abs2;
        this.x[index] = ri*qr0 + r0*qri + rj*qrk - rk*qrj;
        this.y[index] = rj*qr0 + r0*qrj + rk*qri - ri*qrk;
        this.z[index] = rk*qr0 + r0*qrk + ri*qrj - rj*qri;
    }
  
	rotateAtAxis(angle, ax, ay, az) {
	    let len = euclideanNorm(ax, ay, az);
        if (len < 1e-30){
            throw "Axis must not be zero!";
        }
	    ax = ax/len;
	    ay = ay/len;
	    az = az/len;
        let c = Math.cos(angle/2);
	    let s = Math.sin(angle/2);
		for (let i = 0; i < this.length; i++){
            this.rotateVertexAtIndex(i, c, s*ax, s*ay, s*az);
		}
    }

	changePosition(x, y, z) {
	    for (let i = 0; i < this.length; i++){
	        this.x[i] = this.x[i] + x;
	        this.y[i] = this.y[i] + y;
	        this.z[i] = this.z[i] + z;
	    }
    }

    changeSize(scaleVal) {
        for (let i = 0; i < this.length; i++) {
            this.x[i] = scaleVal*this.x[i];
            this.y[i] = scaleVal*this.y[i];
            this.z[i] = scaleVal*this.z[i];
        }
    }
}


class TriangleWireFrame extends VertexArray {

    constructor(x=[], y=[], z=[], index0=[], index1=[], index2=[]) {
        super(x, y, z);
        this.cull = false;
        this.nTriangles = index0.length;
        if (index1.length != this.nTriangles | 
            index2.length != this.nTriangles){
            throw "Input arrays must have the same length.";
        }
        this.triVertex0 = index0;
        this.triVertex1 = index1;
        this.triVertex2 = index2;
        this.triNorm = new Array ();
        for (let i = 0; i < this.nTriangles; i++){
            this.triNorm.push(this.getNorm(i));
        }
    }

    pushTriangle(index0, index1, index2) {
        this.nTriangles += 1;
        this.triVertex0.push(index0);
        this.triVertex1.push(index1);
        this.triVertex2.push(index2);
        this.triNorm.push(
            this.getNorm(this.nTriangles - 1)
        );
    }
    getNorm(index, proj=true) {
        let vfI = this.triVertex1[index];
        let viI = this.triVertex0[index];
        let ff = (proj)? 20.0/(this.y[vfI] - 10.0): 1.0;
        let fi = (proj)? 20.0/(this.y[viI] - 10.0): 1.0; 
        let v1 = {
            x: (ff*this.x[vfI] - fi*this.x[viI]),
            y: (this.y[vfI] - this.y[viI]),
            z: (ff*this.z[vfI] - fi*this.z[viI]),
        };
        vfI = this.triVertex2[index];
        viI = this.triVertex1[index];
        ff = (proj)? 20.0/(this.y[vfI] - 10.0): 1.0;
        fi = (proj)? 20.0/(this.y[viI] - 10.0): 1.0; 
        let v2 = {
            x: (ff*this.x[vfI] - fi*this.x[viI]),
            y: (this.y[vfI] - this.y[viI]),
            z: (ff*this.z[vfI] - fi*this.z[viI]),
        };
        let norm = crossProduct(v1, v2);
        return norm;
    }

    updateNorms() {
        for (let i = 0; i < this.nTriangles; i++){
            this.triNorm[i] = this.getNorm(i);
        }
    }

    toggleCull() {
        this.cull =! this.cull;
    }
}


class Shape extends TriangleWireFrame {

    constructor(x=[], y=[], z=[], index0=[], index1=[], index2=[]) {
        super(x, y, z, index0, index1, index2);
        this.fill = true;
    }

    setRotation(angle=0.01, ax=0, ay=0, az=1.0) {
        this.angleOfRotation = angle;
        this.ax = ax;
        this.ay = ay;
        this.az = az;
    }

    rotate() {
        this.rotateAtAxis(this.angleOfRotation, 
                          this.ax, this.ay, this.az);
    }

    toggleFill() {
        this.fill = !this.fill;
    }
}


class Cube extends Shape {
    constructor(sideLength=1.0) {
        let a = sideLength/2.0;
        let vxArr = [ a, a, -a, -a,  a,  a, -a, -a];
        let vyArr = [-a, a,  a, -a, -a,  a,  a, -a];
        let vzArr = [ a, a,  a,  a, -a, -a, -a, -a];
        let indx0 = [0, 1, 0, 0, 3, 3, 2, 6, 5, 0, 1, 6, 7];
        let indx1 = [4, 0, 3, 7, 2, 6, 1, 2, 6, 1, 2, 5, 6];
        let indx2 = [5, 5, 7, 4, 6, 7, 5, 5, 2, 3, 3, 4, 4];
        super(vxArr, vyArr, vzArr, indx0, indx1, indx2);
        this.cull = true;
    }
}


class Cylinder extends Shape {

    constructor(height = 2.0, radius = 0.5, pointsPerEdge = 25) {
        super();
        let cN = pointsPerEdge;
        for (let i = 0; i < cN; i++){
            this.pushVertex(
                radius*Math.cos(2*Math.PI*i/cN),
                radius*Math.sin(2*Math.PI*i/cN),
                -height/2
            );
            this.pushTriangle(i, (i+1) % cN, i+cN);
            this.pushTriangle(i, 2*cN, (i+1) % cN);
        }
        for (let i = 0; i < cN; i++){
            this.pushVertex(
                radius*Math.cos(2*Math.PI*i/cN),
                radius*Math.sin(2*Math.PI*i/cN),
                height/2
            );
            if (i + cN + 1 < 2*cN) {
                this.pushTriangle(i+cN, i+1, i+cN+1);
                this.pushTriangle(cN + i, cN + i + 1, 2*cN + 1);
            }
        }
        this.pushVertex(0.0, 0.0, -height/2.0);
        this.pushVertex(0.0, 0.0, height/2.0);
        this.pushTriangle(2*cN - 1, cN - 1, 0);
        this.pushTriangle(0, cN, 2*cN - 1);
        this.pushTriangle(0, cN-1, 2*cN);
        this.pushTriangle(2*cN + 1, 2*cN - 1, cN);
        this.cull = true;
    }
}


class Cone extends Shape {
    constructor(height=2.0, radius=1.0, pointsPerEdge=100) {
        super();
        let circle_len = pointsPerEdge;
        for (let i = 0; i < circle_len; i++) {
            this.pushVertex(
                radius*Math.cos(2*Math.PI*i/circle_len),
                radius*Math.sin(2*Math.PI*i/circle_len),
                height/2.0
            );
            this.pushTriangle(i, circle_len, (i+1) % circle_len);
            this.pushTriangle(i, (i+1) % circle_len, circle_len+1);
        }
        this.pushVertex(0.0, 0.0, -height/2.0);
        this.pushVertex(0.0, 0.0, height/2.0);
        this.cull = true;
    }
}


class Sphere extends Shape {

    constructor(
        radius=1.0, 
        pointsPerHalfLongitude=15, pointsPerHalfLatitude=15) {
        super();
        let circle_len = pointsPerHalfLatitude;
        let arc_len = pointsPerHalfLongitude;
        let r = radius;
        for (let j = 0; j < arc_len - 1; j++) {
            for (let i = 0; i < circle_len; i++) {
                this.pushVertex(
                    r*(Math.cos(2*Math.PI*i/circle_len)*
                       Math.sin(Math.PI*(j + 1)/arc_len)),
                    r*(Math.sin(2*Math.PI*i/circle_len)*
                       Math.sin(Math.PI*(j + 1)/arc_len)),
                    r*Math.cos(Math.PI*(j + 1)/arc_len)
                );
                if (j + 1 < arc_len - 1) {
                    this.pushTriangle(
                        j*circle_len + i, (j + 1)*circle_len + i, 
                        (j + 1)*circle_len + (i + 1) % circle_len);
                    this.pushTriangle(
                        (j + 1)*circle_len + (i + 1) % circle_len, 
                        j*circle_len + (i + 1) % circle_len, j*circle_len + i);
                }
            }
        }
        this.pushVertex(0.0, 0.0, -r);
        this.pushVertex(0.0, 0.0, r);
        for (let i = 0; i < circle_len; i++) {
            this.pushTriangle(
                (arc_len - 1)*circle_len + 1,
                 i, (i + 1) % circle_len);
            this.pushTriangle(
                (arc_len - 2)*circle_len + i, (arc_len - 1)*circle_len,
                (arc_len - 2)*circle_len + ((i + 1) % circle_len));
        }
        this.cull = true;
    }
}


class SquareBiPyramid extends Shape {

    constructor(height=2.5, base=1.0) {
        let b = base/2;
        let h = height/2.0;
        let vxArr2 = [0, b, -b, -b,  b,  0];
        let vyArr2 = [0, b,  b, -b, -b,  0];
        let vzArr2 = [h, 0,  0,  0, 0, -h];
        let indx02 = [1, 0,  0,  0, 1,  4, 3, 1];
        let indx12 = [0, 3,  2,  1, 4,  3, 2, 5];
        let indx22 = [4, 4,  3,  2, 5,  5, 5, 2];
        super(
            vxArr2, vyArr2, vzArr2,
            indx02, indx12, indx22
        );
        this.cull = true;
    }
}


const shapeTypes = {
    "cube": 0, "biPyramid": 1, "cylinder": 2, "sphere": 3, "cone": 4
};


function makeShape(shapeType) {
    switch(shapeType) {
        case shapeTypes.cube:
            return new Cube();
        case shapeTypes.biPyramid:
            return new SquareBiPyramid();
        case shapeTypes.cylinder:
            return new Cylinder(2.0, 0.5, 50);
        case shapeTypes.sphere:
            return new Sphere(1.0, 25, 25);
        case shapeTypes.cone:
            return new Cone();
        default:
            return null;
    }
}


// shape = new Cube(1.7);
shape = new Cube(1.3);
shape.rotateAtAxis(0.3, 0.0, 0.0, 1.0);


let mousePosition = {
    active: false, x: 0.0, y: 0.0, prevX: 0.0, prevY: 0.0, totalReleases: 0}; 
let mouseHold = false;
document.addEventListener("mousemove", mouseHandler);
document.addEventListener("mouseup", ev => {
    mouseHold = false;
    mousePosition.active = false;
    mousePosition.totalReleases += 1;
});
document.addEventListener("mousedown", ev => mouseHold = true);


function mouseHandler(event) {
    if (mouseHold) {
        if (mousePosition.active) {
            mousePosition.x = event.clientX;
            mousePosition.y = event.clientY;
            let dx = mousePosition.x - mousePosition.prevX;
            let dy = mousePosition.y - mousePosition.prevY;
            let angle = 9.0*Math.sqrt(dx*dx + dy*dy)/canvas.width;
            let axes = crossProduct(
                {x: -dx, y: 0.0, z: dy}, {x: 0.0, y: 1.0, z: 0.0}
                );
            shape.rotateAtAxis(angle, axes.x, axes.y, axes.z);
            mousePosition.prevX = mousePosition.x;
            mousePosition.prevY = mousePosition.y;
        } else {
            mousePosition.prevX = event.clientX;
            mousePosition.prevY = event.clientY;
            mousePosition.active = true;
        }
    }
}


let shapeSelect = document.querySelector(".shape-select");
shapeSelect.addEventListener("change", selectHandler);
function selectHandler(event) {
    let val = Number.parseInt(event.target.value);
    if (val >= 0) {
        cull  = shape.cull;
        shape = makeShape(val);
        shape.cull = cull;
    }
}

let cameraPos = {x: 0.0, y: 20.0, z: 0.0};
document.addEventListener(
    "wheel", ev => (ev.deltaY > 0)? 
    shape.changeSize(0.9): shape.changeSize(1.1)
);

let useProjection = true;

let cullCheck = document.getElementById("cull");
cullCheck.addEventListener("click", ev => shape.toggleCull());
// let perspectiveCheck = document.getElementById("perspective");
// perspectiveCheck.addEventListener(
//     "click", ev => useProjection =! useProjection);
let fillSurface = document.getElementById("fill");
fillSurface.addEventListener("click", ev => shape.toggleFill());


function toViewCoordinates(viewPoint, worldPoint) {
    let f = (useProjection)? 20.0/(worldPoint.y - 10.0): -2.0;
    viewPoint[0] = 100*f*worldPoint.x + canvas.width/2;
    viewPoint[1] = -100*f*worldPoint.z + canvas.height/2;
}


function draw(viewPoint, index) {
    let p1 = shape.getVertex(shape.triVertex0[index]);
    let orig = {x: 0.0, y: 1.0, z: 0.0};
    if ((shape.cull && dot(shape.triNorm[index], orig) > 0.0) || !shape.cull) {
        let p2 = shape.getVertex(shape.triVertex1[index]);
        let p3 = shape.getVertex(shape.triVertex2[index]);
        toViewCoordinates(viewPoint, p1);
        ctx.moveTo(viewPoint[0], viewPoint[1]);
        toViewCoordinates(viewPoint, p2);
        ctx.lineTo(viewPoint[0], viewPoint[1]);
        toViewCoordinates(viewPoint, p3);
        ctx.lineTo(viewPoint[0], viewPoint[1]);
        if (shape.fill) {
            let surfaceVec = shape.getNorm(index, proj=false); 
            let norm = Math.sqrt(
                dot(surfaceVec, surfaceVec));
            let normVec = {
                x: surfaceVec.x/norm, 
                y: surfaceVec.y/norm, 
                z: surfaceVec.z/norm};
            let lighting = (dot(normVec, 
                {x: -1.0/Math.sqrt(11.0), 
                    y:3.0/Math.sqrt(11.0), z: -1.0/Math.sqrt(11.0)}));
            // lighting = (lighting + 1.0)/(2.0);
            ctx.fillStyle = `rgba(25, ${
                25 + Math.floor((255.0 - 25.0)*lighting)}, 25, 1)`;
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
        } else {
            ctx.moveTo(viewPoint[0], viewPoint[1]);
            toViewCoordinates(viewPoint, p1);
            ctx.lineTo(viewPoint[0], viewPoint[1]);
        }
    }

}


function drawMessageIfStart() {
    if (mousePosition.totalReleases === 0) {
        ctx.font = '50px sans-serif';
        ctx.fillText('Simple 3D Shapes', canvas.width/25.0, 
                    canvas.height/7.0);
        ctx.font = '20px sans-serif';
        ctx.fillText("Use mouse to rotate shape around.", canvas.width/20.0, 
                    canvas.height/7.0 + canvas.height/18.0);
    }
}

function animation(){
    let viewPoint = [0.0, 0.0];
    ctx.fillStyle = 'rgba(25, 25, 25, 1)';
    drawMessageIfStart();
    // ctx.strokeStyle = 'rgba(25, 25, 25, 1)';  
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(108, 245, 66, 1)'; // Green
    ctx.fillStyle = 'rgba(108, 245, 66, 1)';
    for (let n = 0; n < shape.nTriangles; n++){
        p1 = shape.getVertex(shape.triVertex0[n]);
        draw(viewPoint, n);
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 1)'; 
    drawMessageIfStart();
    ctx.closePath();
    ctx.stroke();
    shape.updateNorms();
    requestAnimationFrame(animation);
}


animation();
