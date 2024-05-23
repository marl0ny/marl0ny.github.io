/* Define a complex object */
export default class Complex {
    real;
    imag;
    constructor(real, imag) {
        this.real = real;
        this.imag = imag;
    }
    conj() {
        return new Complex(this.real, -this.imag);
    }
    get abs2() {
        return this.real*this.real + this.imag*this.imag;
    }
    get abs() {
        return Math.sqrt(this.abs2);
    }
    get arg() {
        if (this.real == 0.0) {
            if (this.imag >= 0.0) {
                return Math.PI/2.0;
            } else {
                return -Math.PI/2.0;
            }
        } else {
            let val  = Math.atan(this.imag/this.real);
            if (this.real < 0.0) {
                if (this.imag >= 0.0) {
                    return Math.PI + val;
                } else {
                    return -Math.PI + val;
                }
            }
            return val;
        }
    }
}

/* Unfortunately, there is no operator overloading in Javascript,
so we must define named functions for doing mathematical operations
over the complex data type.*/
export const add = (z, w) => new Complex(z.real + w.real, z.imag + w.imag);

export const sub = (z, w) => new Complex(z.real - w.real, z.imag - w.imag);

export const mul = (z, w) => new Complex(z.real*w.real - z.imag*w.imag,
                                         z.real*w.imag + z.imag*w.real);
 
export const exp = z => new Complex(Math.exp(z.real)*Math.cos(z.imag),
                                    Math.exp(z.real)*Math.sin(z.imag));
 
export const real = r => new Complex(r, 0.0);

export const imag = r => new Complex(0.0, r);

