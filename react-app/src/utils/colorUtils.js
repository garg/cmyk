export const hslToRgb = (h, s, l) => {
  h = h % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    toString() {
      return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }
  };
};

export const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    toString() {
      return `hsl(${this.h}, ${this.s}%, ${this.l}%)`;
    }
  };
};

export const snapToYurmby = (angle) => {
  // YURMBY wheel snaps colors to the nearest 30° increment
  const sectors = [
    { start: 15, end: 45, snap: 30 },    // Yellow
    { start: 45, end: 75, snap: 60 },    // Yellow-Red
    { start: 75, end: 105, snap: 90 },   // Red
    { start: 105, end: 135, snap: 120 }, // Red-Magenta
    { start: 135, end: 165, snap: 150 }, // Magenta
    { start: 165, end: 195, snap: 180 }, // Magenta-Blue
    { start: 195, end: 225, snap: 210 }, // Blue
    { start: 225, end: 255, snap: 240 }, // Blue-Yellow
    { start: 255, end: 285, snap: 270 }, // Yellow
    { start: 285, end: 315, snap: 300 }, // Yellow-Green
    { start: 315, end: 345, snap: 330 }, // Green
    { start: 345, end: 15, snap: 0 }     // Green-Yellow
  ];

  // Normalize angle to 0-360
  angle = ((angle % 360) + 360) % 360;

  // Find the sector that contains this angle
  const sector = sectors.find(s => {
    if (s.start < s.end) {
      return angle >= s.start && angle < s.end;
    } else {
      // Handle sector that crosses 0°
      return angle >= s.start || angle < s.end;
    }
  });

  return sector ? sector.snap : angle;
};

export const calculateHarmonyAngles = (baseAngle, harmonyType) => {
  const angles = [];
  switch (harmonyType) {
    case 'Analogous':
      angles.push(
        baseAngle,
        (baseAngle + 30) % 360,
        (baseAngle + 60) % 360,
        (baseAngle + 90) % 360,
        (baseAngle + 120) % 360,
        (baseAngle + 150) % 360
      );
      break;
    case 'Complementary':
      angles.push(
        baseAngle,
        (baseAngle + 180) % 360
      );
      break;
    case 'Split-Complementary':
      angles.push(
        baseAngle,
        (baseAngle + 150) % 360,
        (baseAngle + 210) % 360
      );
      break;
    case 'Triadic':
      angles.push(
        baseAngle,
        (baseAngle + 120) % 360,
        (baseAngle + 240) % 360
      );
      break;
    case 'Tetradic':
      angles.push(
        baseAngle,
        (baseAngle + 90) % 360,
        (baseAngle + 180) % 360,
        (baseAngle + 270) % 360
      );
      break;
    case 'Four-Tone':
      angles.push(
        baseAngle,
        (baseAngle + 60) % 360,
        (baseAngle + 180) % 360,
        (baseAngle + 240) % 360
      );
      break;
    case 'Five-Tone':
      angles.push(
        baseAngle,
        (baseAngle + 115) % 360,
        (baseAngle + 155) % 360,
        (baseAngle + 205) % 360,
        (baseAngle + 245) % 360
      );
      break;
    case 'Six-Tone':
      angles.push(
        baseAngle,
        (baseAngle + 30) % 360,
        (baseAngle + 120) % 360,
        (baseAngle + 150) % 360,
        (baseAngle + 240) % 360,
        (baseAngle + 270) % 360
      );
      break;
    case 'Neutral':
    default:
      angles.push(
        baseAngle,
        (baseAngle + 15) % 360,
        (baseAngle + 30) % 360,
        (baseAngle + 45) % 360,
        (baseAngle + 60) % 360,
        (baseAngle + 75) % 360
      );
  }
  return angles;
};

export const isPointInPolygon = (point, polygon) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    
    const intersect = ((yi > point.y) !== (yj > point.y))
        && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

export const rotatePoint = (point, center, angle) => {
  const radians = (angle * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  
  return {
    x: center.x + (dx * cos - dy * sin),
    y: center.y + (dx * sin + dy * cos)
  };
};

export const calculateGamutMaskPoints = (shape, center, radius, rotation = 0) => {
  const points = shape.map(point => ({
    x: center.x + Math.cos(point.angle * Math.PI / 180) * radius * point.distance,
    y: center.y + Math.sin(point.angle * Math.PI / 180) * radius * point.distance
  }));

  if (rotation !== 0) {
    return points.map(point => rotatePoint(point, center, rotation));
  }

  return points;
};

export const getColorName = (hex) => {
  // This is a simplified version. In a real app, you might want to use a color naming library
  // or create a more comprehensive color dictionary
  const colors = {
    '#FF0000': 'Red',
    '#00FF00': 'Green',
    '#0000FF': 'Blue',
    '#FFFF00': 'Yellow',
    '#FF00FF': 'Magenta',
    '#00FFFF': 'Cyan',
    '#000000': 'Black',
    '#FFFFFF': 'White',
  };
  
  return colors[hex.toUpperCase()] || hex;
};

export const createYurmbyGradient = (ctx, x, y, radius) => {
  // Create a gradient that transitions through YURMBY colors
  const gradient = ctx.createConicGradient(0, x, y);
  
  // Add color stops for YURMBY wheel
  gradient.addColorStop(0, 'hsl(60, 100%, 50%)');    // Yellow
  gradient.addColorStop(0.166, 'hsl(0, 100%, 50%)');  // Red
  gradient.addColorStop(0.333, 'hsl(300, 100%, 50%)'); // Magenta
  gradient.addColorStop(0.5, 'hsl(240, 100%, 50%)');  // Blue
  gradient.addColorStop(0.666, 'hsl(60, 100%, 50%)'); // Yellow
  gradient.addColorStop(0.833, 'hsl(120, 100%, 50%)'); // Green
  gradient.addColorStop(1, 'hsl(60, 100%, 50%)');    // Back to Yellow
  
  return gradient;
};
