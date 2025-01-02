import React, { useState, useCallback } from 'react';
import { Stage, Layer, Circle, Group, Label, Tag, Text, Line } from 'react-konva';
import ColorThief from 'colorthief';
import tinycolor from 'tinycolor2';
import './ReverseGamut.css';

// Import sample images
import bunnyblob from '../images/bunnyblob.png';
import firsttwoblobs from '../images/firsttwoblobs.png';
import secondtwoblobs from '../images/secondtwoblobs.png';
import halfcircleblob from '../images/halfcircleblob.png';
import polygon from '../images/polygon.png';
import rightangle from '../images/rightangle.png';

const SAMPLE_IMAGES = [
  { src: bunnyblob, name: 'Bunny' },
  { src: firsttwoblobs, name: 'Blobs 1' },
  { src: secondtwoblobs, name: 'Blobs 2' },
  { src: halfcircleblob, name: 'Half Circle' },
  { src: polygon, name: 'Polygon' },
  { src: rightangle, name: 'Right Angle' }
];

const ReverseGamut = ({ onAddToPalette, wheelMode = 'regular' }) => {
  const [image, setImage] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);
  const [extractedColors, setExtractedColors] = useState([]);
  const [boundaryPoints, setBoundaryPoints] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const [diameter, setDiameter] = useState(500);
  const [loadedImages, setLoadedImages] = useState({});
  const radius = diameter / 2;

  // Preload sample images
  React.useEffect(() => {
    SAMPLE_IMAGES.forEach(({ src, name }) => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => ({
          ...prev,
          [name]: img
        }));
      };
      img.src = src;
    });
  }, []);

  // Update diameter based on window size
  React.useEffect(() => {
    const updateDiameter = () => {
      const width = window.innerWidth;
      if (width <= 600) {
        setDiameter(Math.min(width - 40, 400)); // 20px padding on each side
      } else {
        setDiameter(500);
      }
    };

    window.addEventListener('resize', updateDiameter);
    updateDiameter(); // Initial call

    return () => window.removeEventListener('resize', updateDiameter);
  }, []);

  const handleImageLoad = useCallback((imageElement, isPreset = false) => {
    const colorThief = new ColorThief();
    
    // Scale image if needed
    let scale = 1;
    if (imageElement.height < 450 && imageElement.width < 450) {
      scale = 1;
    } else if (imageElement.height < imageElement.width) {
      scale = 450 / imageElement.width;
    } else {
      scale = 450 / imageElement.height;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imageElement.width * scale;
    canvas.height = imageElement.height * scale;
    ctx.scale(scale, scale);
    ctx.drawImage(imageElement, 0, 0);

    // Extract an even larger palette for better color representation
    const colors = colorThief.getPalette(imageElement, 48);
    
    // Count color occurrences by grouping similar colors
    const colorGroups = {};
    colors.forEach(([r, g, b]) => {
      const color = tinycolor({ r, g, b });
      const hsl = color.toHsl();
      // Round hue to nearest 5 degrees for grouping
      const groupHue = Math.round(hsl.h / 5) * 5;
      const groupKey = `${groupHue}-${Math.round(hsl.s * 10)}-${Math.round(hsl.l * 10)}`;
      
      if (!colorGroups[groupKey]) {
        colorGroups[groupKey] = {
          count: 0,
          color: color,
          hsl: hsl
        };
      }
      colorGroups[groupKey].count++;
    });

    // Convert groups to color data points and calculate distances
    const colorData = Object.values(colorGroups).map(({ color, count, hsl }) => {
      // Calculate angle and distance for positioning
      // Convert HSL hue to match CSS conic-gradient coordinate system
      const angle = (hsl.h - 90) % 360; // Subtract 90° to align with CSS conic-gradient
      const angleInRadians = (angle * Math.PI) / 180;
      const distance = (hsl.s * radius);
      const x = radius + Math.cos(angleInRadians) * distance;
      const y = radius + Math.sin(angleInRadians) * distance;
      
      // Calculate point size based on color frequency and luminance
      const baseSize = Math.max(8, Math.min(20, count * 2));
      const luminanceAdjust = 1 - Math.abs(hsl.l - 50) / 50; // Peaks at 50% luminance
      
      return {
        angle: hsl.h,
        distance,
        x,
        y,
        rgb: color.toRgb(),
        rgbString: color.toRgbString(),
        hex: color.toHex(),
        hexString: color.toHexString(),
        hsv: color.toHsv(),
        hsvString: color.toHsvString(),
        hsl: hsl,
        hslString: color.toHslString(),
        size: baseSize * luminanceAdjust,
        count: count
      };
    }).sort((a, b) => b.distance - a.distance); // Sort by distance from center

    // Find boundary points by selecting colors with highest saturation in each hue segment
    const boundaryPoints = [];
    const hueSegments = 36; // Every 10 degrees
    for (let i = 0; i < hueSegments; i++) {
      const startAngle = i * (360 / hueSegments);
      const endAngle = (i + 1) * (360 / hueSegments);
      
      // Find the color with highest saturation in this hue segment
      const segmentColors = colorData.filter(color => 
        color.angle >= startAngle && color.angle < endAngle
      );
      
      if (segmentColors.length > 0) {
        // Get the color with maximum distance (saturation) in this segment
        const maxDistanceColor = segmentColors.reduce((max, current) => 
          current.distance > max.distance ? current : max
        );
        boundaryPoints.push(maxDistanceColor);
      }
    }

    // Sort boundary points by angle for proper line connection
    boundaryPoints.sort((a, b) => a.angle - b.angle);

    setExtractedColors(colorData);
    setBoundaryPoints(boundaryPoints);
    setImage(imageElement);
  }, [radius]);

  const loadImage = useCallback((file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => handleImageLoad(img);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, [handleImageLoad]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      loadImage(file);
    }
  }, [loadImage]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      loadImage(file);
    }
  }, [loadImage]);

  const handleAddToPalette = useCallback(() => {
    if (extractedColors.length > 0 && onAddToPalette) {
      onAddToPalette(extractedColors);
    }
  }, [extractedColors, onAddToPalette]);

  return (
    <div className="reverse-gamut">
      <div className="color-wheel-container" style={{ width: diameter, height: diameter, position: 'relative' }}>
        <div className="color-wheel-background" />
        <Stage width={diameter} height={diameter} style={{ position: 'absolute', top: 0, left: 0 }}>
          <Layer>
            {/* Draw gamut boundary shape */}
            {boundaryPoints.length > 0 && (
              <Line
                points={[
                  ...boundaryPoints.map(point => [point.x, point.y]).flat(),
                  boundaryPoints[0].x, boundaryPoints[0].y // Close the shape
                ]}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth={1}
                closed={true}
                fill="rgba(255,255,255,0.1)"
              />
            )}
            
            {/* Draw extracted color points */}
            {extractedColors.map((color, i) => (
              <Group 
                key={`color-${i}`}
                onClick={() => onAddToPalette([color])}
                onMouseEnter={(e) => {
                  const container = e.target.getStage().container();
                  container.style.cursor = 'pointer';
                  setTooltip({
                    x: color.x,
                    y: color.y - 20,
                    text: `${color.hexString}\n${color.rgbString}`,
                    color: color
                  });
                }}
                onMouseLeave={(e) => {
                  const container = e.target.getStage().container();
                  container.style.cursor = 'default';
                  setTooltip(null);
                }}
              >
                {/* Color point with size based on frequency and luminance */}
                <Circle
                  x={color.x}
                  y={color.y}
                  radius={color.size}
                  fill={color.hexString}
                  stroke="white"
                  strokeWidth={2}
                  opacity={0.8 + (color.count / 48) * 0.2} // More frequent colors are more opaque
                />
                {/* Luminance indicator ring */}
                <Circle
                  x={color.x}
                  y={color.y}
                  radius={color.size + 2}
                  stroke={`hsl(0, 0%, ${color.hsl.l}%)`}
                  strokeWidth={1}
                  opacity={0.5}
                />
              </Group>
            ))}
            {tooltip && (
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
                  text={`${tooltip.text}\nL: ${Math.round(tooltip.color.hsl.l)}%\nFreq: ${Math.round((tooltip.color.count / 48) * 100)}%`}
                  padding={6}
                  fill="white"
                  fontSize={11}
                  fontFamily="monospace"
                  align="center"
                />
              </Label>
            )}
          </Layer>
        </Stage>
      </div>

      <div 
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${image ? 'has-image' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {!image ? (
          <>
            <div className="image-section">
              <div className="sample-images">
                {SAMPLE_IMAGES.map((sampleImage, index) => (
                  <img
                    key={index}
                    src={sampleImage.src}
                    alt={sampleImage.name}
                    className={`sample-image ${selectedSample === index ? 'selected' : ''}`}
                    onClick={() => {
                      if (loadedImages[sampleImage.name]) {
                        setSelectedSample(index);
                        handleImageLoad(loadedImages[sampleImage.name], true);
                      }
                    }}
                  />
                ))}
              </div>
              
              <div className="drop-zone-content">
                <p>Drag and drop an image here</p>
                <p>or</p>
                <button 
                  onClick={() => document.getElementById('file-input').click()}
                  className="file-select-button"
                >
                  Select Image
                </button>
              </div>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          </>
        ) : (
          <div className="image-preview">
            <div className="image-preview-container">
              <img 
                src={image.src} 
                alt="Selected" 
              />
            </div>
            <div className="image-actions">
              <button 
                className="image-action-button"
                onClick={() => {
                  setImage(null);
                  setSelectedSample(null);
                  setExtractedColors([]);
                  setBoundaryPoints([]);
                }}
              >
                Change Image
              </button>
            </div>
          </div>
        )}
      </div>

      {extractedColors.length > 0 && (
        <button 
          className="add-colors-button"
          onClick={handleAddToPalette}
        >
          Add Colors to Palette
        </button>
      )}
    </div>
  );
};

export default ReverseGamut;
