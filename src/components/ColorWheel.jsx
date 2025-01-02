import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Stage, Layer, Circle, Line, Group, Transformer, Label, Tag, Text, Image } from 'react-konva';
import { hslToRgb, snapToYurmby, createYurmbyGradient } from '../utils/colorUtils';
import tinycolor from 'tinycolor2';
import './ColorWheel.css';

const GAMUT_SHAPES = {
  fiveSidedPolygon: [
    { angle: 0, distance: 1 },
    { angle: 72, distance: 1 },
    { angle: 144, distance: 1 },
    { angle: 216, distance: 1 },
    { angle: 288, distance: 1 }
  ],
  thinTriangle: [
    { angle: 0, distance: 1 },
    { angle: 120, distance: 1 },
    { angle: 240, distance: 0.5 }
  ],
  secondTriangle: [
    { angle: 0, distance: 1 },
    { angle: 120, distance: 0.8 },
    { angle: 240, distance: 0.8 }
  ],
  thirdTriangle: [
    { angle: 0, distance: 1 },
    { angle: 120, distance: 0.7 },
    { angle: 240, distance: 0.7 }
  ],
  complementaryDiamond: [
    { angle: 0, distance: 1 },
    { angle: 90, distance: 0.5 },
    { angle: 180, distance: 1 },
    { angle: 270, distance: 0.5 }
  ],
  rightAngleTriangle: [
    { angle: 0, distance: 1 },
    { angle: 90, distance: 1 },
    { angle: 180, distance: 0.5 }
  ],
  smallEquiTriangle: [
    { angle: 0, distance: 0.6 },
    { angle: 120, distance: 0.6 },
    { angle: 240, distance: 0.6 }
  ],
  firstTwoBlobs: [
    { angle: 0, distance: 1 },
    { angle: 180, distance: 1 },
    { angle: 90, distance: 0.3 },
    { angle: 270, distance: 0.3 }
  ],
  secondTwoBlobs: [
    { angle: 0, distance: 1 },
    { angle: 180, distance: 1 },
    { angle: 90, distance: 0.4 },
    { angle: 270, distance: 0.4 }
  ],
  otherDiamond: [
    { angle: 45, distance: 1 },
    { angle: 135, distance: 1 },
    { angle: 225, distance: 1 },
    { angle: 315, distance: 1 }
  ]
};

const ColorWheel = ({ 
  diameter = 500, 
  onColorSelect,
  gamutShape = null,
  onAddToPalette,
  wheelMode = 'regular' // 'regular' or 'yurmby'
}) => {
  const [extractedColors, setExtractedColors] = useState([]);
  const stageRef = useRef(null);
  const gamutGroupRef = useRef(null);
  const transformerRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [lines, setLines] = useState([]);
  const [centerCircle, setCenterCircle] = useState(null);
  const [gamutMask, setGamutMask] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [tooltip, setTooltip] = useState(null);
  const [selectedGamutShape, setSelectedGamutShape] = useState(null);
  const [wheelImage, setWheelImage] = useState(null);
  const [actualDiameter, setActualDiameter] = useState(diameter);
  const [isSelected, setIsSelected] = useState(false);

  // Derived values
  const derivedValues = useMemo(() => {
    const steps = 360;
    const angleStep = (2 * Math.PI) / steps;
    const radius = actualDiameter / 2;
    return { steps, angleStep, radius };
  }, [actualDiameter]);

  const { steps, angleStep, radius } = derivedValues;

  // Update selectedGamutShape when gamutShape prop changes
  useEffect(() => {
    setSelectedGamutShape(gamutShape);
  }, [gamutShape]);

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
    if (selectedGamutShape && GAMUT_SHAPES[selectedGamutShape]) {
      const points = GAMUT_SHAPES[selectedGamutShape].map(point => {
        const angle = (point.angle * Math.PI) / 180;
        return {
          x: radius + Math.cos(angle) * radius * point.distance,
          y: radius + Math.sin(angle) * radius * point.distance
        };
      });
      setGamutMask(points);
    }
  }, [selectedGamutShape, radius]);

  useEffect(() => {
    if (gamutGroupRef.current && transformerRef.current) {
      transformerRef.current.nodes([gamutGroupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [gamutMask]);

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

  const checkDeselect = useCallback((e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setIsSelected(false);
    }
  }, []);

  const isGamutMaskElement = useCallback((target) => {
    return target === gamutGroupRef.current || 
      (target.parent && target.parent === gamutGroupRef.current) ||
      target.attrs.hitStrokeWidth || // Check if it's a gamut mask line
      (target.className === 'Line' && target.parent === gamutGroupRef.current); // Check for Line elements in gamut mask
  }, []);

  const handleGamutClick = useCallback((e) => {
    e.cancelBubble = true;
    setIsSelected(true);
  }, []);

  const handleColorSelection = useCallback((e) => {
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

  const handleStageClick = useCallback((e) => {
    const target = e.target;
    if (!gamutShape && !isGamutMaskElement(target)) {
      handleColorSelection(e);
    }
  }, [isGamutMaskElement, handleColorSelection, gamutShape]);

  const handleGamutDragEnd = useCallback((e) => {
    setRotation(e.target.rotation());
  }, []);

  const extractColorsFromGamutArea = useCallback(() => {
    if (!gamutMask || !stageRef.current) return;

    const stage = stageRef.current;
    const canvas = stage.toCanvas();
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const colors = new Set();

    // Get gamut mask points in stage coordinates
    const gamutGroup = gamutGroupRef.current;
    const gamutPoints = gamutMask.map(point => {
      const transformed = gamutGroup.getAbsoluteTransform().point({
        x: point.x - radius,
        y: point.y - radius
      });
      return transformed;
    });

    // Function to check if a point is inside the gamut polygon
    const isPointInPolygon = (x, y, vertices) => {
      let inside = false;
      for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        const xi = vertices[i].x, yi = vertices[i].y;
        const xj = vertices[j].x, yj = vertices[j].y;
        
        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    };

    // Sample colors from points inside the gamut mask
    const sampleStep = 5; // Sample every 5 pixels for performance
    for (let y = 0; y < canvas.height; y += sampleStep) {
      for (let x = 0; x < canvas.width; x += sampleStep) {
        if (isPointInPolygon(x, y, gamutPoints)) {
          const i = (y * canvas.width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const color = tinycolor({ r, g, b });
          colors.add(color.toHexString());
        }
      }
    }

    // Convert colors to the standard format
    const colorData = Array.from(colors).map(hexString => {
      const color = tinycolor(hexString);
      return {
        rgb: color.toRgb(),
        rgbString: color.toRgbString(),
        hex: color.toHex(),
        hexString: color.toHexString(),
        hsv: color.toHsv(),
        hsvString: color.toHsvString(),
        hsl: color.toHsl(),
        hslString: color.toHslString()
      };
    });

    // Sort colors by hue
    colorData.sort((a, b) => a.hsl.h - b.hsl.h);
    
    // Limit to 12 colors
    const filteredColors = colorData.filter((_, index) => index % Math.ceil(colorData.length / 12) === 0).slice(0, 12);
    setExtractedColors(filteredColors);
  }, [gamutMask, radius]);

  const handleAddToPalette = useCallback(() => {
    if (extractedColors.length > 0 && onAddToPalette) {
      onAddToPalette(extractedColors);
    }
  }, [extractedColors, onAddToPalette]);

  return (
    <div className="color-wheel-container">
      <div className="controls-wrapper">
        {selectedGamutShape && (
          <div className="gamut-controls">
            <select 
              className="gamut-select"
              value={selectedGamutShape}
              onChange={(e) => setSelectedGamutShape(e.target.value)}
            >
              {Object.keys(GAMUT_SHAPES).map(shape => (
                <option key={shape} value={shape}>
                  {shape.split(/(?=[A-Z])/).join(' ')}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="wheel-wrapper">
        {gamutMask && (
          <button 
            className="extract-colors-button"
            onClick={extractColorsFromGamutArea}
          >
            Extract Colors from Gamut Area
          </button>
        )}
        
        <Stage
          width={actualDiameter}
          height={actualDiameter}
          ref={stageRef}
          onClick={handleStageClick}
          onMouseDown={checkDeselect}
          onTouchStart={(e) => {
            checkDeselect(e);
            handleStageClick(e);
          }}
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
            {gamutMask && (
              <Group
                ref={gamutGroupRef}
                x={radius}
                y={radius}
                draggable
                onClick={handleGamutClick}
                onTap={handleGamutClick}
                onDragEnd={handleGamutDragEnd}
                onTransformEnd={(e) => {
                  const node = gamutGroupRef.current;
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();
                  
                  // Reset scale and update points
                  node.scaleX(1);
                  node.scaleY(1);
                  
                  // Update gamut mask points with new scale
                  const newPoints = gamutMask.map(point => ({
                    x: radius + (point.x - radius) * scaleX,
                    y: radius + (point.y - radius) * scaleY
                  }));
                  setGamutMask(newPoints);
                  
                  // Update rotation state
                  setRotation(node.rotation());
                }}
              >
                {gamutMask.map((point, i) => (
                  <Line
                    key={`gamut-${i}`}
                    points={[
                      0, 0,
                      point.x - radius, point.y - radius,
                      gamutMask[(i + 1) % gamutMask.length].x - radius,
                      gamutMask[(i + 1) % gamutMask.length].y - radius
                    ]}
                    fill="rgba(255,255,255,0.3)"
                    closed={true}
                    stroke="black"
                    strokeWidth={3}
                    hitStrokeWidth={10}
                    onClick={handleGamutClick}
                    onTap={handleGamutClick}
                  />
                ))}
              </Group>
            )}
            {gamutMask && isSelected && (
              <Transformer
                ref={transformerRef}
                rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
                resizeEnabled={true}
                enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                borderEnabled={false}
                anchorSize={20}
                anchorCornerRadius={10}
                anchorStroke="#4CAF50"
                anchorFill="white"
                anchorStrokeWidth={2}
                padding={5}
                boundBoxFunc={(oldBox, newBox) => {
                  // Maintain aspect ratio
                  const oldWidth = oldBox.width;
                  const oldHeight = oldBox.height;
                  const newWidth = newBox.width;
                  const newHeight = newBox.height;
                  
                  const scale = Math.min(
                    Math.abs(newWidth / oldWidth),
                    Math.abs(newHeight / oldHeight)
                  );
                  
                  return {
                    x: newBox.x,
                    y: newBox.y,
                    width: oldWidth * scale,
                    height: oldHeight * scale,
                    rotation: newBox.rotation
                  };
                }}
              />
            )}
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

      {extractedColors.length > 0 && (
        <div className="extracted-colors">
          <div className="color-swatches">
            {extractedColors.map((color, index) => (
              <div
                key={index}
                className="color-swatch"
                style={{ backgroundColor: color.hexString }}
                title={`${color.hexString}\n${color.rgbString}`}
              />
            ))}
          </div>
          <button 
            className="add-colors-button"
            onClick={handleAddToPalette}
          >
            Add Colors to Palette
          </button>
        </div>
      )}
    </div>
  );
};

export default ColorWheel;
