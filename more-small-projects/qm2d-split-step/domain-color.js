/* Complex-valued functions visualized using domain coloring:

Wikipedia - Domain coloring
https://en.wikipedia.org/wiki/Domain_coloring

Wikipedia - Hue
https://en.wikipedia.org/wiki/Hue

https://en.wikipedia.org/wiki/Hue#/media/File:HSV-RGB-comparison.svg

*/
export default function argToColor(arg) {
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