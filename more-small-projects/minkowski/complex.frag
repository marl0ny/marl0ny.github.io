/* Unused shader file.
*/

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

#define complex vec2
const float PI = 3.141592653589793;
const complex IMAG_UNIT = complex(0.0, 1.0); 

float abs2C(complex z) {
    return z.x*z.x + z.y*z.y;
}

float absC(complex z) {
    return sqrt(abs2C(z));
}

complex conj(complex z) {
    return complex(z[0], -z[1]);
}

complex inv(complex z) {
    return conj(z)/abs2C(z);
}

float arg(complex z) {
    if (z.x == 0.0) {
        return (z.y >= 0.0)? PI/2.0: -PI/2.0;
    } else {
        float val = tan(z.y/z.x);
        if (z.x < 0.0)
            return (z.y >= 0.0)? (PI + val): (-PI + val);
        return val;
    }
}

complex mul(complex z, complex w) {
    return complex(z.x*w.x - z.y*w.y, z.x*w.y + z.y*w.x);
}

complex add(complex z, complex w) {
    return z + w;
}

complex sub(complex z, complex w) {
    return z - w;
}

complex div(complex z, complex w) {
    return mul(z, inv(w));
}

complex expC(complex z) {
    return exp(z.x)*complex(cos(z.y), sin(z.y));

}

complex cosC(complex z) {
    return 0.5*(expC(mul(IMAG_UNIT, z)) + expC(mul(-IMAG_UNIT, z)));
}

complex sinC(complex z) {
    return mul(expC(mul(IMAG_UNIT, z)) - expC(mul(-IMAG_UNIT, z)),
               -0.5*IMAG_UNIT);
}

complex tanC(complex z) {
    return sinC(z)/cosC(z); 
}

complex logC(complex z) {
    return complex(log(absC(z)), arg(z));
}

complex coshC(complex z) {
    return 0.5*(expC(z) + expC(-z));
}

complex sinhC(complex z) {
    return 0.5*(expC(z) - expC(-z));
}

complex tanhC(complex z) {
    return sinhC(z)/coshC(z);
}

complex powC(complex z, complex w) {
    return expC(mul(logC(z), w));
}

uniform complex angle;

vec2 transform(complex angle, vec2 r0) {
    float t = r0[0], x = r0[1];
    return vec2(
        (coshC(angle)*t + sinhC(angle)*x).x,
        (sinhC(angle)*t + coshC(angle)*x).x
    );
}

vec3 argumentToColor(float argVal) {
    float maxCol = 1.0;
    float minCol = 50.0/255.0;
    float colRange = maxCol - minCol;
    if (argVal <= PI/3.0 && argVal >= 0.0) {
        return vec3(maxCol,
                    minCol + colRange*argVal/(PI/3.0), minCol);
    } else if (argVal > PI/3.0 && argVal <= 2.0*PI/3.0){
        return vec3(maxCol - colRange*(argVal - PI/3.0)/(PI/3.0),
                    maxCol, minCol);
    } else if (argVal > 2.0*PI/3.0 && argVal <= PI){
        return vec3(minCol, maxCol,
                    minCol + colRange*(argVal - 2.0*PI/3.0)/(PI/3.0));
    } else if (argVal < 0.0 && argVal > -PI/3.0){
        return vec3(maxCol, minCol,
                    minCol - colRange*argVal/(PI/3.0));
    } else if (argVal <= -PI/3.0 && argVal > -2.0*PI/3.0){
        return vec3(maxCol + (colRange*(argVal + PI/3.0)/(PI/3.0)),
                    minCol, maxCol);
    } else if (argVal <= -2.0*PI/3.0 && argVal >= -PI){
        return vec3(minCol,
                    minCol - (colRange*(argVal + 2.0*PI/3.0)/(PI/3.0)), 
                    maxCol);
    }
    else {
        return vec3(minCol, maxCol, maxCol);
    }
}

complex function(vec2 uv) {
    return uv;
}

void main() {
    complex z = function(transform(-angle, UV));
    vec3 col = absC(z)*argumentToColor(arg(z));
    fragColor = vec4(col.r, col.g, col.b, 1.0);
}
