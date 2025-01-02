import React, { useState, useCallback } from 'react';
import { Stage, Layer, Circle, Group, Label, Tag, Text, Ellipse } from 'react-konva';
import ColorThief from 'colorthief';
import tinycolor from 'tinycolor2';
import './ReverseGamut.css';

const ReverseGamut = ({ onAddToPalette, wheelMode = 'regular' }) => {
  const [image, setImage] = useState(null);
  const [extractedColors, setExtractedColors] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const diameter = 500;
  const radius = diameter / 2;

  const handleImageLoad = useCallback((imageElement) => {
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

    // Extract colors and convert to HSL for plotting
    const colors = colorThief.getPalette(imageElement, 12);
    const colorData = colors.map(([r, g, b]) => {
      const color = tinycolor({ r, g, b });
      const hsl = color.toHsl();
      
      // Calculate position on wheel based on hue and saturation
      const angle = (hsl.h * Math.PI) / 180;
      const distance = (hsl.s * radius);
      
      return {
        x: radius + Math.cos(angle) * distance,
        y: radius + Math.sin(angle) * distance,
        rgb: { r, g, b },
        rgbString: color.toRgbString(),
        hex: color.toHex(),
        hexString: color.toHexString(),
        hsv: color.toHsv(),
        hsvString: color.toHsvString(),
        hsl: hsl,
        hslString: color.toHslString()
      };
    });

    setExtractedColors(colorData);
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
      img.crossOrigin = 'Anonymous';
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
            {/* Draw saturation gradient overlay */}
            <Circle
              x={radius}
              y={radius}
              radius={radius}
              fillRadialGradientStartPoint={{ x: radius, y: radius }}
              fillRadialGradientStartRadius={0}
              fillRadialGradientEndPoint={{ x: radius, y: radius }}
              fillRadialGradientEndRadius={radius}
              fillRadialGradientColorStops={[
                0, 'rgba(255,255,255,1)',
                1, 'rgba(255,255,255,0)'
              ]}
            />
            
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
                    text: `${color.hexString}\n${color.rgbString}`
                  });
                }}
                onMouseLeave={(e) => {
                  const container = e.target.getStage().container();
                  container.style.cursor = 'default';
                  setTooltip(null);
                }}
              >
                <Ellipse
                  x={color.x}
                  y={color.y}
                  radiusX={12}
                  radiusY={9}
                  fill={color.hexString}
                  stroke="white"
                  strokeWidth={2}
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
                  text={tooltip.text}
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
          </>
        ) : (
          <div className="image-preview">
            <img 
              src={image.src} 
              alt="Uploaded" 
              style={{ maxWidth: '100%', maxHeight: '300px' }}
            />
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
