function mapIntegerToRainbowColor(x, max) {
    x = Math.max(0, Math.min(x, max));

    const hue = (x / max) * 360;

    const saturation = 100;
    const lightness = 50;

    const rgbColor = hslToRgb(hue, saturation, lightness);
    const intColor = rgbToInt(rgbColor[0], rgbColor[1], rgbColor[2]);

    return intColor;
}

function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToInt(r, g, b) {
    return (r << 16) | (g << 8) | b;
}