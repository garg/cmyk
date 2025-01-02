import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Stage, Layer, Circle, Line, Group, Label, Tag, Text, Image } from 'react-konva';
import { hslToRgb, snapToYurmby, createYurmbyGradient, calculateHarmonyAngles } from '../utils/colorUtils';
import tinycolor from 'tinycolor2';
import './ColorWheel.css';

const HARMONY_MODES = {
  'Neutral': [0, 15, 30, 45, 60, 75],
  'Analogous': [0, 30, 60, 90, 120, 150],
  'Clash': [0, 90, 270],
  'Complementary': [0, 180],
  'Split-Complementary': [0, 150, 210],
  'Triadic': [0, 120, 240],
  'Tetradic': [0, 90, 180, 270],
  'Four-Tone': [0, 60, 180, 240],
  'Five-Tone': [0, 115, 155, 205, 245],
  'Six-Tone': [0, 30, 120, 150, 240, 270]
};

const HarmonyWheel = ({ 
  diameter = 500, 
  onColorSelect,
  onAddToPalette,
  wheelMode = 'regular' // 'regular' or 'yurmby'
}) => {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const harmonyGroupRef = useRef(null);
  
  const [lines, setLines] = useState([]);
  const [centerCircle, setCenterCircle] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [harmonyMode, setHarmonyMode] = useState('Analogous');
  const [harmonyPoints, setHarmonyPoints] = useState([]);
  const [tooltip, setTooltip] = useState(null);
  const [wheelImage, setWheelImage] = useState(null);
  const [actualDiameter, setActualDiameter] = useState(diameter);

  // Derived values
  const derivedValues = useMemo(() => {
    const steps = 360;
    const angleStep = (2 * Math.PI) / steps;
    const radius = actualDiameter / 2;
    return { steps, angleStep, radius };
  }, [actualDiameter]);

  const { steps, angleStep, radius } = derivedValues;

  // Update diameter based on window size
  useEffect(() => {
    const updateDiameter = () => {
      const width = window.innerWidth;
      if (width <= 600) {
        setActualDiameter(Math.min(width - 40, diameter)); // 20px padding on each side
      } else {
        setActualDiameter(diameter);
      }
    };

    window.addEventListener('resize', updateDiameter);
    updateDiameter(); // Initial call

    return () => window.removeEventListener('resize', updateDiameter);
  }, [diameter]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setRotation(prev => (prev - 5) % 360);
      } else if (e.key === 'ArrowRight') {
        setRotation(prev => (prev + 5) % 360);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // Create an offscreen canvas for the color wheel
    const canvas = document.createElement('canvas');
    canvas.width = actualDiameter;
    canvas.height = actualDiameter;
    const ctx = canvas.getContext('2d');
    canvasRef.current = canvas;

    if (wheelMode === 'yurmby') {
      // Draw YURMBY wheel
      const gradient = createYurmbyGradient(ctx, radius, radius, radius);
      ctx.beginPath();
      ctx.arc(radius, radius, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Add sector lines
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      for (let angle = 0; angle < 360; angle += 30) {
        const rad = (angle * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.lineTo(
          radius + Math.cos(rad) * radius,
          radius + Math.sin(rad) * radius
        );
        ctx.stroke();
      }

      // Create an image object from the canvas
      const image = new window.Image();
      image.src = canvas.toDataURL();
      image.onload = () => {
        setWheelImage(image);
      };
    } else {
      // Draw regular HSL wheel
      const newLines = [];
      for (let i = 0; i < steps; i++) {
        const angle = i * angleStep;
        const x1 = radius + Math.cos(angle) * radius;
        const y1 = radius + Math.sin(angle) * radius;
        const x2 = radius + Math.cos(angle + angleStep) * radius;
        const y2 = radius + Math.sin(angle + angleStep) * radius;

        const hue = (i / steps) * 360;
        const color = `hsl(${hue}, 100%, 50%)`;

        newLines.push({
          key: `line-${i}`,
          points: [radius, radius, x1, y1, x2, y2],
          fill: color,
          closed: true,
          stroke: 'black',
          strokeWidth: 1
        });
      }
      setLines(newLines);
    }

    setCenterCircle({
      x: radius,
      y: radius,
      radius: radius * 0.1,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 1
    });
  }, [radius, angleStep, steps, wheelMode, actualDiameter]);

  useEffect(() => {
    if (harmonyMode && HARMONY_MODES[harmonyMode]) {
      const points = HARMONY_MODES[harmonyMode].map(angle => {
        const rad = (angle + rotation) * (Math.PI / 180);
        return {
          x: Math.cos(rad) * (radius * 0.8),
          y: Math.sin(rad) * (radius * 0.8)
        };
      });
      setHarmonyPoints(points);
    }
  }, [harmonyMode, rotation, radius]);

  const getColorAtPoint = useCallback((x, y) => {
    const dx = x - radius;
    const dy = y - radius;
    const angle = Math.atan2(dy, dx);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    let hue = ((angle + Math.PI) / (2 * Math.PI)) * 360;
    if (wheelMode === 'yurmby') {
      hue = snapToYurmby(hue);
    }
    
    const saturation = (distance / radius) * 100;
    const lightness = 50;

    const rgb = hslToRgb(hue, saturation, lightness);
    const color = tinycolor({ r: rgb.r, g: rgb.g, b: rgb.b });

    return {
      rgb: rgb,
      rgbString: color.toRgbString(),
      hex: color.toHex(),
      hexString: color.toHexString(),
      hsv: color.toHsv(),
      hsvString: color.toHsvString(),
      hsl: color.toHsl(),
      hslString: color.toHslString()
    };
  }, [radius, wheelMode]);

  const handleClick = useCallback((e) => {
    const stage = stageRef.current;
    const pointerPos = stage.getPointerPosition();
    const dx = pointerPos.x - radius;
    const dy = pointerPos.y - radius;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= radius) {
      const colorData = getColorAtPoint(pointerPos.x, pointerPos.y);
      onColorSelect && onColorSelect(colorData);
    }
  }, [radius, getColorAtPoint, onColorSelect]);

  const handleAddToPalette = useCallback(() => {
    if (onAddToPalette && harmonyPoints.length > 0) {
      const colors = harmonyPoints.map(point => {
        const x = point.x + radius;
        const y = point.y + radius;
        return getColorAtPoint(x, y);
      });
      onAddToPalette(colors);
    }
  }, [harmonyPoints, getColorAtPoint, onAddToPalette, radius]);

  const handleHarmonyChange = useCallback((mode) => {
    setHarmonyMode(mode);
  }, []);

  const handleHarmonyPointHover = useCallback((point, index) => {
    const color = getColorAtPoint(point.x + radius, point.y + radius);
    setTooltip({
      x: point.x + radius,
      y: point.y + radius - 20,
      text: `${color.hexString} (${index + 1}/${harmonyPoints.length})`
    });
  }, [getColorAtPoint, harmonyPoints.length, radius]);

  const handleHarmonyDragMove = useCallback((e) => {
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    
    // Calculate angle between center and current mouse position
    const dx = pointer.x - radius;
    const dy = pointer.y - radius;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Normalize angle to 0-360 range
    const normalizedAngle = (angle + 360) % 360;
    
    setRotation(normalizedAngle);

    // Reset position to center to prevent actual movement
    if (harmonyGroupRef.current) {
      harmonyGroupRef.current.position({ x: radius, y: radius });
    }
  }, [radius]);

  return (
    <div className="color-wheel-container">
      <div className="controls-wrapper">
        <div className="harmony-controls">
          <select 
            className="harmony-select"
            value={harmonyMode}
            onChange={(e) => handleHarmonyChange(e.target.value)}
          >
            {Object.keys(HARMONY_MODES).map(mode => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
          <button 
            className="add-harmony-button"
            onClick={handleAddToPalette}
            disabled={!harmonyPoints.length}
          >
            <span>Add Harmony to Palette</span>
            <span>({harmonyPoints.length} colors)</span>
          </button>
        </div>
      </div>

      <div className="wheel-wrapper">
        <div className="rotation-hint">
          Use arrow keys or click and drag to rotate harmony points
        </div>
        
        <Stage
          width={actualDiameter}
          height={actualDiameter}
          ref={stageRef}
          onClick={handleClick}
          onTouchStart={handleClick}
          style={{ display: 'block', margin: '0 auto' }}
        >
          <Layer>
            {wheelMode === 'regular' ? (
              lines.map((line) => (
                <Line
                  key={line.key}
                  points={line.points}
                  fill={line.fill}
                  closed={line.closed}
                  stroke={line.stroke}
                  strokeWidth={line.strokeWidth}
                />
              ))
            ) : wheelImage && (
              <Image
                image={wheelImage}
                width={actualDiameter}
                height={actualDiameter}
              />
            )}
            {centerCircle && (
              <Circle
                x={centerCircle.x}
                y={centerCircle.y}
                radius={centerCircle.radius}
                fill={centerCircle.fill}
                stroke={centerCircle.stroke}
                strokeWidth={centerCircle.strokeWidth}
              />
            )}
            <Group
              ref={harmonyGroupRef}
              x={radius}
              y={radius}
              draggable
              onDragMove={handleHarmonyDragMove}
            >
              {harmonyPoints.map((point, i) => (
                <Group key={`harmony-${i}`} className="harmony-point">
                  <Circle
                    x={point.x}
                    y={point.y}
                    radius={5}
                    fill="white"
                    stroke="black"
                    strokeWidth={1}
                    onMouseEnter={(e) => {
                      const container = e.target.getStage().container();
                      container.style.cursor = 'pointer';
                      handleHarmonyPointHover(point, i);
                    }}
                    onMouseLeave={(e) => {
                      const container = e.target.getStage().container();
                      container.style.cursor = 'default';
                      setTooltip(null);
                    }}
                  />
                  <Line
                    points={[0, 0, point.x, point.y]}
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth={1}
                  />
                </Group>
              ))}
            </Group>
            {tooltip && (
              <Group>
                <Label
                  x={tooltip.x}
                  y={tooltip.y}
                  offsetY={30}
                >
                  <Tag
                    fill="rgba(0,0,0,0.8)"
                    cornerRadius={3}
                    pointerDirection="down"
                    pointerWidth={10}
                    pointerHeight={5}
                    lineJoin="round"
                  />
                  <Text
                    text={tooltip.text}
                    padding={6}
                    fill="white"
                    fontSize={11}
                    fontFamily="monospace"
                  />
                </Label>
              </Group>
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default HarmonyWheel;
