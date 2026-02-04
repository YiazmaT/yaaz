export function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : {
        r: 0,
        g: 0,
        b: 0,
      };
}

export function blackOrWhite(color: string, black?: string, white?: string) {
  const rgb = hexToRgb(color);
  if (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114 > 150) {
    return black ?? "#000000";
  } else return white ?? "#FFFFFF";
}

export function hexToRgbSingleString(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "0, 0, 0";
}
