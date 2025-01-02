import React, { useRef, useState, useCallback } from 'react';
import ColorThief from 'colorthief';
import tinycolor from 'tinycolor2';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import './ImageColorPicker.css';

const ImageColorPicker = ({ onAddToPalette }) => {
  const [image, setImage] = useState(null);
  const [extractedColors, setExtractedColors] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef(null);
  const dropZoneRef = useRef(null);
  const fileInputRef = useRef(null);

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

    // Extract colors
    const colors = colorThief.getPalette(imageElement, 12);
    const colorData = colors.map(([r, g, b]) => {
      const color = tinycolor({ r, g, b });
      return {
        rgb: { r, g, b },
        rgbString: color.toRgbString(),
        hex: color.toHex(),
        hexString: color.toHexString(),
        hsv: color.toHsv(),
        hsvString: color.toHsvString(),
        hsl: color.toHsl(),
        hslString: color.toHslString()
      };
    });

    setExtractedColors(colorData);
    setImage(imageElement);
  }, []);

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
    <div className="image-color-picker">
      <div 
        ref={dropZoneRef}
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
                onClick={() => fileInputRef.current?.click()}
                className="file-select-button"
              >
                Select Image
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </>
        ) : (
          <Stage
            width={450}
            height={450}
          >
            <Layer>
              <KonvaImage
                ref={imageRef}
                image={image}
                width={image.width}
                height={image.height}
              />
            </Layer>
          </Stage>
        )}
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

export default ImageColorPicker;
