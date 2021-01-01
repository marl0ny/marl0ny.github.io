let canvas = document.getElementById("sketch-canvas");
let gl = canvas.getContext("webgl");
gl.getExtension('OES_texture_float');
gl.getExtension('OES_texture_float_linear');


const vertexShaderSource = `
attribute vec3 pos;
varying highp vec2 fragTexCoord;


void main() {
    gl_Position = vec4(pos.xyz, 1.0);
    // fragTexCoord = pos.xy/2.0;
    fragTexCoord = vec2(0.5, 0.5) + pos.xy/2.0;
}
`;

// TODO: instead of using conditionals to handle
// the different modes of rendering, just put
// each of these modes into separate shaders,
const fragmentShaderSource = `
precision highp float;
varying highp vec2 fragTexCoord;
uniform float dx;
uniform float dy;
uniform float bx;
uniform float by;
uniform sampler2D tex1;
uniform sampler2D tex2;
uniform int isViewFrame;


void main () {
    if (isViewFrame == 0) {
        if (fragTexCoord.x > dx && fragTexCoord.x < 1.0-dx &&
            fragTexCoord.y > dy && fragTexCoord.y < 1.0-dy) {
            vec4 l = texture2D(tex2, fragTexCoord + vec2(dx, 0.0));
            vec4 r = texture2D(tex2, fragTexCoord + vec2(-dx, 0.0));
            vec4 u = texture2D(tex2, fragTexCoord + vec2(0.0, dy));
            vec4 d = texture2D(tex2, fragTexCoord + vec2(0.0, -dy));
            vec4 c = texture2D(tex1, fragTexCoord);
            gl_FragColor = (u + d + l + r)/2.0 - c;
            // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); 
        } else {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); 
        }
    } else if (isViewFrame == 1) {
        vec4 col = texture2D(tex1, fragTexCoord);
        col.r += 25.0/255.0;
        gl_FragColor = vec4(col.r/4.0, col.r/2.0, col.r, 1.0); 
    } else if (isViewFrame == 2) {
        if (fragTexCoord.x > dx && fragTexCoord.x < 1.0-dx &&
            fragTexCoord.y > dy && fragTexCoord.y < 1.0-dy) {
            float x = fragTexCoord.x;
            float y = fragTexCoord.y;
            float sx = 1.4142135623730951/(1.0/(dx*10.0));
            float sy = 1.4142135623730951/(1.0/(dy*10.0));
            float u = ((x - bx)/sx), v = ((y - by)/sy);
            float val = exp(- u*u - v*v);
            gl_FragColor = vec4(val, 0.0, 0.0, 1.0); 
        gl_FragColor = vec4(val, 0.0, 0.0, 1.0); 
            gl_FragColor = vec4(val, 0.0, 0.0, 1.0); 
        gl_FragColor = vec4(val, 0.0, 0.0, 1.0); 
            gl_FragColor = vec4(val, 0.0, 0.0, 1.0); 
        } else {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); 
        }
    } else {
        vec4 col1 = texture2D(tex1, fragTexCoord);
        vec4 col2 = texture2D(tex2, fragTexCoord);
        gl_FragColor = vec4(col1.r + col2.r, 0.0, 0.0, 1.0); 
    }
}
`;

function makeShader(shaderType, shaderSource) {
    let shaderID = gl.createShader(shaderType);
    if (shaderID === 0) {
        alert("Unable to create shader.");
    }
    gl.shaderSource(shaderID, shaderSource);
    gl.compileShader(shaderID);
    if (!gl.getShaderParameter(shaderID, gl.COMPILE_STATUS)) {
        let msg = gl.getShaderInfoLog(shaderID);
        alert(`Unable to compile shader.\n${msg}`);
        gl.deleteShader(shaderID);
    }
    return shaderID;
}


function makeProgram(...shaderIDs) {
    let shaderProgram = gl.createProgram();
    for (let shaderID of shaderIDs) {
        gl.attachShader(shaderProgram, shaderID);
    }
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
            'Unable to initialize the shader program: '
            + gl.getProgramInfoLog(shaderProgram));
    }
    return shaderProgram;
}


function unbind() {
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
}


function makeTexture(buf, w, h) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, 
        w, h, 0, 
        gl.RGBA, gl.FLOAT, 
        buf
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_2D);
    return texture;
}

// TODO: have uniforms separated into types.
class Frame {

    constructor(shaderProgram, w, h, frameNumber) {
        unbind();
        this.shaderProgram = shaderProgram;
        gl.activeTexture(gl.TEXTURE0 + frameNumber);
        let frameTexture = makeTexture(null, w, h);
        gl.bindTexture(gl.TEXTURE_2D, frameTexture);
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();
        this.frameNumber = frameNumber;
        this.frameTexture = frameTexture;
        this.uniforms = {};
        this.fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, 
                                gl.TEXTURE_2D, frameTexture, 0);
        this.rbo = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.rbo);
        gl.renderbufferStorage(gl.RENDERBUFFER, 
                            gl.DEPTH_COMPONENT16, w, h);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, 
                                gl.RENDERBUFFER, this.rbo);
        this.bind({dx: 0.0, dy: 0.0, tex1: 0, tex2: 0,
            isViewFrame: 1});
        unbind();
    }

    bind(u) {
        let shaderProgram = this.shaderProgram;
        let vertices = new Float32Array([1.0, 1.0, 0.0, 1.0, -1.0, 0.0, 
            -1.0, -1.0, 0.0, -1.0, 1.0, 0.0]);
        let elements = new Uint16Array([0, 2, 3, 0, 1, 2]);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, elements, gl.STATIC_DRAW);
        let pos = gl.getAttribLocation(shaderProgram, 'pos');
        gl.enableVertexAttribArray(pos);
        gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 3*4, 0);
        for (let field of Object.keys(u)) {
            this.uniforms[field] = gl.getUniformLocation(shaderProgram, field);
        }
        gl.uniform1f(this.uniforms.dx, u.dx);
        gl.uniform1f(this.uniforms.dy, u.dy);
        gl.uniform1i(this.uniforms.tex1, u.tex1);
        gl.uniform1i(this.uniforms.tex2, u.tex2);
        gl.uniform1f(this.uniforms.bx, u.bx);
        gl.uniform1f(this.uniforms.by, u.by);
        gl.uniform1i(this.uniforms.isViewFrame, u.isViewFrame);
    }

}


let vShader = makeShader(gl.VERTEX_SHADER, vertexShaderSource);
let fShader = makeShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
let shaderProgram = makeProgram(vShader, fShader);
gl.useProgram(shaderProgram);

let imageTexture = gl.createTexture();
let w = canvas.width, h = canvas.height;
let image = new Image();
image.src = "world_small2.jpg";
gl.bindTexture(gl.TEXTURE_2D, imageTexture);
gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image
);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
new Promise(() => setTimeout(main, 500));


function main() {

    let vertices = new Float32Array([1.0, 1.0, 0.0,  1.0, -1.0, 0.0,
                                    -1.0, -1.0, 0.0, -1.0, 1.0, 0.0]);
    let elements = new Uint16Array([0, 1, 2, 3, 0, 2]);
    let mainVBO = gl.createBuffer();
    let mainEBO = gl.createBuffer();

    function bind(u) {
        // gl.bindTexture(gl.TEXTURE_2D, imageTexture);
        gl.bindBuffer(gl.ARRAY_BUFFER, mainVBO);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mainEBO);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, elements, gl.STATIC_DRAW);
        let pos = gl.getAttribLocation(shaderProgram, 'pos');
        gl.enableVertexAttribArray(pos);
        gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 3*4, 0);
        let uniforms = {};
        for (let field of Object.keys(u)) {
            uniforms[field] = gl.getUniformLocation(shaderProgram, field);
        }
        gl.uniform1f(uniforms.dx, u.dx);
        gl.uniform1f(uniforms.dy, u.dy);
        gl.uniform1f(uniforms.bx, u.bx);
        gl.uniform1f(uniforms.by, u.by);
        gl.uniform1i(uniforms.tex1, u.tex1);
        gl.uniform1i(uniforms.tex2, u.tex2);
        gl.uniform1i(uniforms.isViewFrame, u.isViewFrame);
    }

    let frameBuffers = [1, 2, 3].map(i => new Frame(shaderProgram, w, h, i));
    let storeFrame = new Frame(shaderProgram, w, h, 4);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    let justReleased = false;
    let bx = 0; let by = 0;
    function animate() {
        if (justReleased) {
            gl.activeTexture(gl.TEXTURE0);
            let initialTexture = makeTexture(null, w, h);
            gl.bindTexture(gl.TEXTURE_2D, initialTexture);
            gl.activeTexture(gl.TEXTURE0 + frameBuffers[1].frameNumber);
            gl.bindTexture(gl.TEXTURE_2D, frameBuffers[1].frameTexture);
            gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers[2].fbo);
            gl.bindRenderbuffer(gl.RENDERBUFFER, frameBuffers[2].rbo);
            frameBuffers[2].bind({dx: 1.0/w, dy: 1.0/h,
                                  bx: bx/canvas.width, by: 1.0 - by/canvas.height,
                                  tex1: frameBuffers[1].frameNumber, 
                                  tex2: frameBuffers[1].frameNumber, 
                                  isViewFrame: 2});
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
            unbind();
            gl.bindFramebuffer(gl.FRAMEBUFFER, storeFrame.fbo);
            gl.bindRenderbuffer(gl.RENDERBUFFER, storeFrame.rbo);
            gl.activeTexture(gl.TEXTURE0 + frameBuffers[2].frameNumber);
            gl.bindTexture(gl.TEXTURE_2D, frameBuffers[2].frameTexture);
            storeFrame.bind({dx: 0.0, dy: 0.0, bx: 0, by: 0,
                  tex1: frameBuffers[2].frameNumber, 
                  tex2: 5, 
                  isViewFrame: -1});
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
            unbind();
            for (let k = 0; k < frameBuffers.length - 1; k++) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers[2].fbo);
                gl.bindRenderbuffer(gl.RENDERBUFFER, frameBuffers[2].rbo);
                gl.activeTexture(gl.TEXTURE0 + frameBuffers[k].frameNumber);
                gl.bindTexture(gl.TEXTURE_2D, frameBuffers[k].frameTexture);
                frameBuffers[2].bind({dx: 0.0, dy: 0.0,
                    bx: 0.0, by: 0.0,
                    tex1: frameBuffers[k].frameNumber,
                    tex2: 5,
                    isViewFrame: -1});
                gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
                unbind();
                gl.activeTexture(gl.TEXTURE0 + frameBuffers[2].frameNumber);
                gl.bindTexture(gl.TEXTURE_2D, frameBuffers[2].frameTexture);
               //  gl.activeTexture(gl.TEXTURE0);
                gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers[k].fbo);
                gl.bindRenderbuffer(gl.RENDERBUFFER, frameBuffers[k].rbo);
                frameBuffers[k].bind({dx: 0.0, dy: 0.0,
                                bx: 0.0, by: 0.0,
                                tex1: 4, 
                                tex2: frameBuffers[2].frameNumber,
                                isViewFrame: -1});
                gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
                unbind();
            }
            justReleased = false;
        }
        gl.activeTexture(gl.TEXTURE0 + frameBuffers[0].frameNumber);
        gl.bindTexture(gl.TEXTURE_2D, frameBuffers[0].frameTexture);
        gl.activeTexture(gl.TEXTURE0 + frameBuffers[1].frameNumber);
        gl.bindTexture(gl.TEXTURE_2D, frameBuffers[1].frameTexture);
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers[2].fbo);
        gl.bindRenderbuffer(gl.RENDERBUFFER, frameBuffers[2].rbo);
        frameBuffers[2].bind({dx: 1.0/w, dy: 1.0/h,
                        bx: 0.0, by: 0.0,
                        tex1: frameBuffers[0].frameNumber,
                        tex2: frameBuffers[1].frameNumber, 
                        isViewFrame: 0});
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        unbind();
        bind({dx: 0.0, dy: 0.0, bx: 0.0, by: 0.0, 
              tex1: frameBuffers[2].frameNumber, 
              tex2: frameBuffers[2].frameNumber, 
              isViewFrame: 1});
        gl.activeTexture(gl.TEXTURE0 + frameBuffers[2].frameNumber);
        gl.bindTexture(gl.TEXTURE_2D, frameBuffers[2].frameTexture);
        gl.activeTexture(gl.TEXTURE0);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        unbind();
        frameBuffers = [frameBuffers[1], frameBuffers[2], frameBuffers[0]];
        requestAnimationFrame(animate);
    }
    let releaseWave = function(ev) {
        justReleased = true;
        bx = Math.floor((ev.clientX - canvas.offsetLeft));
        by = Math.floor((ev.clientY - canvas.offsetTop));
    }
    // document.addEventListener("touchend", () => releaseWave());   
    document.addEventListener("mouseup", ev => releaseWave(ev));
    animate();
}
