let gCanvas = document.getElementById("sketchCanvas");
{
    let clientW = document.documentElement.clientWidth;
    let clientH = document.documentElement.clientHeight;
    let sideLength = (clientW > clientH)? clientH: clientW;
    gCanvas.width = sideLength;
    gCanvas.height = sideLength;
    // gCanvas.width = clientW;
    // gCanvas.height = clientH;
}

const gl = ((canvas) => {
    let gl = canvas.getContext("webgl2");
    if (gl === null) {
        gl = canvas.getContext("webgl");
        if (gl === null) {
            let msg = "Your browser does not support WebGL.";
            alert(msg);
            throw msg;
        }
        let ext = gl.getExtension('OES_texture_float');
        let ext2 = gl.getExtension('OES_texture_float_linear');
        if (ext === null && ext2 === null) {
            let msg = "Your browser does not support "
                      + "the necessary WebGL extensions.";
            alert(msg);
            throw msg;
        }
    } else {
        let ext = gl.getExtension('EXT_color_buffer_float');
        if (ext === null) {
            let msg = "Your browser does not support "
                       + "the necessary WebGL extensions.";
            alert(msg);
            throw msg;
        }
    }
    return gl;
})(gCanvas);

class AbstractVec {
    ind;
    get x() { return this.ind[0]; }
    get y() { return this.ind[1]; }
    get z() { return this.ind[2]; }
    get w() { return this.ind[3]; }
    get r() { return this.ind[0]; }
    get g() { return this.ind[1]; }
    get b() { return this.ind[2]; }
    get a() { return this.ind[3]; }
    set x(x) { this.ind[0] = x; }
    set y(y) { this.ind[1] = y; }
    set z(z) { this.ind[2] = z; }
    set w(w) { this.ind[3] = w; }
    set r(r) { this.ind[0] = r; }
    set g(g) { this.ind[1] = g; }
    set b(b) { this.ind[2] = b; }
    set a(a) { this.ind[3] = a; }
}

class Vec2 extends AbstractVec {
    constructor(...args) {
        super();
        this.ind = new Float32Array(2);
        if (args.length !== 2)
            throw "Two elements required.";
        for (let i = 0; i < this.ind.length; i++) {
            this.ind[i] = parseFloat(args[i]);
        }
    }
}

class Vec3 extends AbstractVec {
    constructor(...args) {
        super();
        this.ind = new Float32Array(3);
        if (args.length !== 3)
            throw "Three elements required.";
        for (let i = 0; i < this.ind.length; i++) {
            this.ind[i] = parseFloat(args[i]);
        }
    }
}

class Vec4 extends AbstractVec {
    constructor(...args) {
        super();
        this.ind = new Float32Array(4);
        if (args.length !== 4)
            throw "Four elements required.";
        for (let i = 0; i < this.ind.length; i++) {
            this.ind[i] = parseFloat(args[i]);
        }
    }
}


class IVec2 extends AbstractVec {
    constructor(...args) {
        super();
        this.ind = new Int32Array(2);
        if (args.length !== 2)
            throw "Two elements required.";
        for (let i = 0; i < this.ind.length; i++) {
            this.ind[i] = parseInt(args[i]);
        }
    }
}

class IVec3 extends AbstractVec {
    constructor(...args) {
        super();
        this.ind = new Int32Array(3);
        if (args.length !== 3)
            throw "Three elements required.";
        for (let i = 0; i < this.ind.length; i++) {
            this.ind[i] = parseInt(args[i]);
        }
    }
}

class IVec4 extends AbstractVec {
    constructor(...args) {
        super();
        this.ind = new Int32Array(4);
        if (args.length !== 4)
            throw "Four elements required.";
        for (let i = 0; i < this.ind.length; i++) {
            this.ind[i] = parseInt(args[i]);
        }
    }
}

class TextureParams {
    format;
    width;
    height;
    generateMipmap;
    wrapS;
    wrapT;
    minFilter;
    magFilter;
    constructor(
        format, 
        width, height, 
        generateMipmap=true,
        wrapS=gl.REPEAT, wrapT=gl.REPEAT,
        minFilter=gl.NEAREST, magFilter=gl.NEAREST) {
        this.format = format;
        this.width = width;
        this.height = height;
        this.generateMipmap = generateMipmap;
        this.wrapS = wrapS;
        this.wrapT = wrapT;
        this.minFilter = minFilter;
        this.magFilter = magFilter;
    }
}

let gFramesCount = 0;

function acquireNewFrame() {
    let frame_id = gFramesCount;
    gFramesCount++;
    return frame_id;
}

function toBase(sized) {
    switch (sized) {
        case gl.RGBA32F: case gl.RGBA32I: case gl.RGBA32UI: case gl.RGBA16F:
        case gl.RGBA16I: case gl.RGBA16UI: case gl.RGBA8I: case gl.RGBA8UI:
        case gl.RGBA8:
            return gl.RGBA;
        case gl.RGB32F: case gl.RGB32I: case gl.RGB32UI: case gl.RGB16F:
        case gl.RGB16I: case gl.RGB16UI: case gl.RGB8I: case gl.RGB8UI:
        case gl.RGB8:
            return gl.RGB;
        case gl.RG32F: case gl.RG32I: case gl.RG32UI: case gl.RG16F:
        case gl.RG16I: case gl.RG16UI: case gl.RG8I: case gl.RG8UI:
            return gl.RG;
        case gl.R32F: case gl.R32I: case gl.R32UI: case gl.R16F: case gl.R16I:
        case gl.R16UI: case gl.R8: case gl.R8UI:
            return gl.RED;
    }
    return 0;
}

function toType(sized) {
    switch (sized) {
        case gl.RGBA32F: case gl.RGB32F: case gl.RG32F: case gl.R32F:
            return gl.FLOAT;
        case gl.RGBA32I: case gl.RGB32I: case gl.RG32I: case gl.R32I:
            return gl.INT;
        case gl.RGBA32UI: case gl.RGB32UI: case gl.RG32UI: case gl.R32UI:
            return gl.UNSIGNED_INT;
        case gl.RGBA16F: case gl.RGB16F: case gl.RG16F: case gl.R16F:
            return gl.HALF_FLOAT;
        case gl.RGBA16I: case gl.RGB16I: case gl.RG16I: case gl.R16I:
            return gl.SHORT;
        case gl.RGBA16UI: case gl.RGB16UI: case gl.RG16UI: case gl.R16UI:
            return gl.UNSIGNED_SHORT;
        case gl.RGBA8: case gl.RGB8: case gl.RG8: case gl.R8:
            return gl.UNSIGNED_BYTE;
        case gl.RGBA8UI: case gl.RGB8UI: case gl.RG8UI: case gl.R8UI:
            return gl.UNSIGNED_BYTE;
    }
    return 0;
}

function compileShader(ref, source) {
    let source2 = "#version 300 es\n" + source;
    gl.shaderSource(ref, source2);
    gl.compileShader(ref)
    // let status = gl.getShaderiv(ref, gl.COMPILE_STATUS);
    let infoLog = gl.getShaderInfoLog(ref);
    if (infoLog !== null && infoLog !== '')
        console.log(infoLog);
    /* if (status == false) {
        console.err(`Shader compilation failed ${infoLog}`);
    }*/
}

function shaderFromSource(source, type) {
    const reference = gl.createShader(type)
    if (reference === 0) {
        console.error(
            `Unable to create shader (error code ${gl.getError()})`);
        return 0;
    }
    compileShader(reference, source);
    return reference;
}

function unbind() {
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
}

const QUAD_VERTEX_SHADER = `
#if __VERSION__ <= 120
attribute vec3 position;
varying vec2 UV;
#else
in vec3 position;
out highp vec2 UV;
#endif
void main() {
    gl_Position = vec4(position.xyz, 1.0);
    UV = position.xy/2.0 + vec2(0.5, 0.5);
}
`

const getQuadVertices = () => new Float32Array(
    [-1.0, -1.0, 0.0, -1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, -1.0, 0.0]);

const getQuadElements = () => new Int32Array([0, 1, 2, 0, 2, 3]);

let gQuadObjects = {
    isInitialized: false, vao: 0, vbo: 0, ebo: 0
};

gQuadObjects.init = () => {
    if (!gQuadObjects.isInitialized) {
        // TODO: Initialize vertex array object, if possible.
        // Initialize vertex buffer object
        gQuadObjects.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gQuadObjects.vbo);
        let vertices = getQuadVertices();
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        // Initialize element buffer object
        gQuadObjects.ebo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gQuadObjects.ebo);
        let elements = getQuadElements();
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, elements, gl.STATIC_DRAW);
        gQuadObjects.isInitialized = true;
    }
}

class Quad {
    _id;
    _params;
    _texture;
    _fbo;
    constructor(textureParams) {
        this._id = acquireNewFrame();
        this._params = textureParams;
        this._initTexture();
        this._initBuffer();
        unbind();
    }
    get id() {
        return this._id;
    }
    static makeProgramFromPath(fragmentShaderPath) {
        console.log(`Compiling ${fragmentShaderPath}.\n`); // TODO!
    }
    static makeProgramFromSource(fragmentShaderSource) {
        let vsRef = shaderFromSource(QUAD_VERTEX_SHADER, gl.VERTEX_SHADER);
        let fsRef = shaderFromSource(fragmentShaderSource, gl.FRAGMENT_SHADER);
        let program = gl.createProgram();
        if (program === 0) {
            console.err("Unable to create program.");
        }
        gl.attachShader(program, vsRef);
        gl.attachShader(program, fsRef);
        // gl.GetProgramiv(program, gl.LINK_STATUS, &status)
        gl.linkProgram(program);
        let infoLog = gl.getProgramInfoLog(program);
        if (infoLog !== null && infoLog !== '')
            console.log(infoLog);
        gl.useProgram(program);
        return program;

    }
    _initTexture() {
        if (this._id === 0) {
            this._texture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            return;
        }
        console.log(this._id);
        gl.activeTexture(gl.TEXTURE0 + this._id);
        this._texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        let params = this._params;
        console.log(this._texture);
        console.log(params.format, toBase(params.format), toType(params.format));
        console.log(gl.RGBA32F, gl.RGBA, gl.FLOAT);
        gl.texImage2D(gl.TEXTURE_2D, 0, params.format, 
            params.width, params.height, 0,
            toBase(params.format), toType(params.format), null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, params.wrapS);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, params.wrapT);
        gl.texParameteri(gl.TEXTURE_2D, 
            gl.TEXTURE_MIN_FILTER, params.minFilter);
        gl.texParameteri(gl.TEXTURE_2D, 
            gl.TEXTURE_MAG_FILTER, params.magFilter);
        if (params.generateMipmap) {
            gl.generateMipmap(gl.TEXTURE_2D);
        }
    }
    _initBuffer() {
        gQuadObjects.init();
        if (this._id !== 0) {
            this._fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                                    gl.TEXTURE_2D, this._texture, 0);
        } 
    }
    _bind(program) {
        gl.useProgram(program);
        // gl.BindVertexArray(s_quad_objects.vao)
        gl.bindBuffer(gl.ARRAY_BUFFER, gQuadObjects.vbo);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gQuadObjects.ebo);
        if (gQuadObjects.vao === 0) {
            let vertices = getQuadVertices();
            let elements = getQuadElements();
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, elements, gl.STATIC_DRAW);
        }
        if (this._id !== 0) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbo);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
        let attrib = gl.getAttribLocation(program, "position");
        gl.enableVertexAttribArray(attrib);
        gl.vertexAttribPointer(attrib, 3, gl.FLOAT, false, 12, 0);
    }
    draw(program, uniforms) {
        this._bind(program);
        for (let name of Object.keys(uniforms)) {
            let loc = gl.getUniformLocation(program, name);
            let val = uniforms[name];
            if (typeof(val) === 'number') {
                if (Number.isInteger(val)) {
                    gl.uniform1i(loc, val);
                } else {
                    gl.uniform1f(loc, val);
                }
            } else if (typeof(val) === 'boolean') {
                gl.uniform1i(loc, (val === true)? 1: 0);
            } else if (val instanceof Vec4) {
                gl.uniform4f(loc, val.x, val.y, val.z, val.w);
            } else if (val instanceof Vec2) {
                gl.uniform2f(loc, val.x, val.y);
            } else if (val instanceof IVec2) {
                gl.uniform2i(loc, val.x, val.y);
            } else if (val instanceof IVec4) {
                gl.uniform4i(loc, val.x, val.y, val.z, val.w);
            } else if (val instanceof Vec3) {
                console.log(name, loc, val.x, val.y, val.z);
                gl.uniform3f(loc, val.x, val.y, val.z);
            } else if (val instanceof IVec3) {
                gl.uniform3i(loc, val.x, val.y, val.z);
            } else if (val instanceof Quad) {
                gl.uniform1i(loc, val.id);
            }
        }
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, null);
        unbind();
    }
    substituteArray(arr) {
        // TODO
    }
    fillArray(arr) {
        // TODO
    }

}

const WAVE_CREATION_SHADER = `
#if (__VERSION__ >= 330) || (defined(GL_ES) && __VERSION__ >= 300)
#define texture2D texture
#else
#define texture texture2D
#endif

#if (__VERSION__ > 120) || defined(GL_ES)
precision highp float;
#endif
    
#if __VERSION__ <= 120
varying vec2 UV;
#define fragColor gl_FragColor
#else
in vec2 UV;
out vec4 fragColor;
#endif

uniform float x0;
uniform float y0;
uniform float sx;
uniform float sy;
uniform vec4 color;

void main() {
    float xs = UV.x - x0;
    float ys = UV.y - y0;
    float gx = exp(-0.5*xs*xs/(sx*sx));
    float gy = exp(-0.5*ys*ys/(sy*sy));
    fragColor = gx*gy*color;
}

`;

const WAVE_STEP_SHADER = `
#if (__VERSION__ >= 330) || (defined(GL_ES) && __VERSION__ >= 300)
#define texture2D texture
#else
#define texture texture2D
#endif

#if (__VERSION__ > 120) || defined(GL_ES)
precision highp float;
#endif
    
#if __VERSION__ <= 120
varying vec2 UV;
#define fragColor gl_FragColor
#else
in vec2 UV;
out vec4 fragColor;
#endif

uniform int nx;
uniform int ny;
uniform sampler2D tex0;
uniform sampler2D tex1;

void main() {
    vec4 left1 = texture2D(tex1, UV + vec2(-1.0/float(nx), 0.0));
    vec4 right1 = texture2D(tex1, UV + vec2(1.0/float(nx), 0.0));
    vec4 up1 = texture2D(tex1, UV + vec2(0.0, 1.0/float(ny)));
    vec4 down1 = texture2D(tex1, UV + vec2(0.0, -1.0/float(ny)));
    vec4 center0 = texture2D(tex0, UV); 
    fragColor = (up1 + down1 + left1 + right1)/2.0 - center0;
}
`;

const COPY_SHADER = `
#if (__VERSION__ >= 330) || (defined(GL_ES) && __VERSION__ >= 300)
#define texture2D texture
#else
#define texture texture2D
#endif

#if (__VERSION__ > 120) || defined(GL_ES)
precision highp float;
#endif
    
#if __VERSION__ <= 120
varying vec2 UV;
#define fragColor gl_FragColor
#else
in vec2 UV;
out vec4 fragColor;
#endif

uniform sampler2D tex;

void main() {
    fragColor = texture2D(tex, UV);
}
`;

const ADD_RGB_SHADER = `
#if (__VERSION__ >= 330) || (defined(GL_ES) && __VERSION__ >= 300)
#define texture2D texture
#else
#define texture texture2D
#endif

#if (__VERSION__ > 120) || defined(GL_ES)
precision highp float;
#endif
    
#if __VERSION__ <= 120
varying vec2 UV;
#define fragColor gl_FragColor
#else
in vec2 UV;
out vec4 fragColor;
#endif

uniform sampler2D tex1;
uniform sampler2D tex2;

void main() {
    vec4 o = texture2D(tex1, UV) + texture2D(tex2, UV);
    fragColor = vec4(o.rgb, 1.0);
}
`;

// new Promise(() => setTimeout(main, 500));

function withDimensions(width, height, callback, ...args) {
    gl.viewport(0, 0, width, height);
    callback(args);
}

const NX = gCanvas.width;
const NY = gCanvas.height;


function main() {

    let t = new TextureParams(format=gl.RGBA32F, width=NX, height=NY);
    let copyProgram = Quad.makeProgramFromSource(COPY_SHADER);
    let waveCreationProgram = Quad.makeProgramFromSource(WAVE_CREATION_SHADER);
    let waveStepProgram = Quad.makeProgramFromSource(WAVE_STEP_SHADER);
    let addProgram = Quad.makeProgramFromSource(ADD_RGB_SHADER);
    console.log(waveStepProgram);
    let mainQuad = new Quad(t);
    let frames = [1, 2, 3].map(() => new Quad(t));
    let a1 = new Quad(t), a2 = new Quad(t);
    frames.forEach(f => {
        withDimensions(NX, NY, () => {
            f.draw(waveCreationProgram, 
                {x0: 0.5, y0: 0.5, sx: 0.025, sy: 0.025, 
                    color: new Vec4(1.0, 0.0, 0.0, 1.0)});
        });
    });
    document.addEventListener("mousedown", e => {
        let x = ((e.clientX - gCanvas.offsetLeft)/
                 gCanvas.width);
        let y = 1.0 - ((e.clientY - gCanvas.offsetTop)/
                 gCanvas.height);
        a1.draw(waveCreationProgram, 
            {x0: x, y0: y, sx: 0.025, sy: 0.025, 
                color: new Vec4(5.0*Math.random(),
                                5.0*Math.random(),
                                5.0*Math.random(),
                                1.0)});
        frames.forEach(f => {
            withDimensions(NX, NY, () => {
                a2.draw(copyProgram, {tex: f});
                f.draw(addProgram, 
                    {tex1: a1, tex2: a2});
            });
        });
    })
    const animate = () => {
        withDimensions(NX, NY, () => {
            frames[2].draw(waveStepProgram, {
                nx: NX, ny: NY, tex0: frames[0], tex1: frames[1]
            });
        });
        withDimensions(gCanvas.width, gCanvas.height, () => {
            mainQuad.draw(copyProgram, {tex: frames[2]});
        });
        frames.push(frames.shift());
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

main();