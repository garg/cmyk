"use strict";

var cymk = cymk || { version: "0.0.4"};

function CircleMath() {
    //Circle related Math goes here.
}

cymk.CircleMath = CircleMath;

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function str2ab8(str) {
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i); //.toString(10);
    }
    return buf;
}

function str2ab16(str) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i); //.toString(10);
    }
    return buf;
}

function str2ab32(str) {
    var buf = new ArrayBuffer(str.length); // 2 bytes for each char
    var bufView = new Uint32Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i); //.toString(10);
    }
    return buf;
}

function asciiToHex(tx) {
    var hex = []
    for (var a = 0; a < tx.length; a = a + 1) {
        hex.push(tx.charCodeAt(a).toString(16));
    }
    return hex;
}

function asciiToDec(tx) {
    var hex = []
    for (var a = 0; a < tx.length; a = a + 1) {
        hex.push(tx.charCodeAt(a).toString(10));
    }
    return hex;
}

function makeASE(colors) {
    var colorArrayBuffers = []
    var totalColors = Object.keys(colors.colors).length; //25; //colors.colors.length;
    var numPalettes = 1; //todo: Support multiple palettes

    //File Signature
    colorArrayBuffers.push(str2ab8('ASEF'));

    //Version
    var versionBuf = new ArrayBuffer(4);
    var dvVersion  = new DataView(versionBuf);
    dvVersion.setUint16(0, '01');
    colorArrayBuffers.push(versionBuf);

    //total number of blocks:
    var numBlocks = new ArrayBuffer(4)
    var dvNumBlocks = new DataView(numBlocks);
    dvNumBlocks.setUint32(0, totalColors + (numPalettes * 2));
    colorArrayBuffers.push(numBlocks);

    //Group Start
    var groupAStart = new ArrayBuffer(2)
    var dvGroupAStart = new DataView(groupAStart);
    dvGroupAStart.setUint16(0, '0xC001' );
    colorArrayBuffers.push(groupAStart);

    var title = colors.title;

    var titleLengthBuf = new ArrayBuffer(2);
    var dvTitleLengthBuf = new DataView(titleLengthBuf);
    dvTitleLengthBuf.setUint16(0, title.length + 1);


    var blockLengthB = new ArrayBuffer(4);
    var dvblockLengthB = new DataView(blockLengthB);
    dvblockLengthB.setUint32(0, ((title.length * 2) + 4)); //this needs fixing?
    colorArrayBuffers.push(blockLengthB);

    colorArrayBuffers.push(titleLengthBuf);

    var blank = new ArrayBuffer(1);
    var dvBlank = new DataView(blank);
    dvBlank.setUint8(0, '0');
    colorArrayBuffers.push(blank);
    colorArrayBuffers.push(str2ab16(title));
    colorArrayBuffers.push(blank);

    colors.colors.forEach(function (color) {
        var colorEntry = new ArrayBuffer(2);
        var dvColorEntry = new DataView(colorEntry);
        dvColorEntry.setUint16(0, '1');
        colorArrayBuffers.push(colorEntry);

        var colorTitle = color[1];

        var colorTitleLengthBuf = new ArrayBuffer(2);
        var dvColorTitleLengthBuf = new DataView(colorTitleLengthBuf);
        dvColorTitleLengthBuf.setUint16(0, colorTitle.length + 1);

        var colorBlockLengthBitch = new ArrayBuffer(4);
        var dvColorBlockLengthBitch = new DataView(colorBlockLengthBitch);
        dvColorBlockLengthBitch.setUint32(0, ((colorTitle.length * 2) + 4 + 18)); //this needs fixing?
        colorArrayBuffers.push(colorBlockLengthBitch);

        colorArrayBuffers.push(colorTitleLengthBuf);
        colorArrayBuffers.push(blank);
        colorArrayBuffers.push(str2ab16(colorTitle));
        colorArrayBuffers.push(blank);

        var rgb = 'RGB ';

        var redBuf = new ArrayBuffer(4);
        var dvred = new DataView(redBuf);
        dvred.setFloat32(0, color[2] / 255, false);

        var red = redBuf;

        var greenBuf = new ArrayBuffer(4);
        var dvgreen = new DataView(greenBuf);
        dvgreen.setFloat32(0, color[3] / 255, false);

        var green = greenBuf;

        var blueBuf = new ArrayBuffer(4);
        var dvblue = new DataView(blueBuf);
        dvblue.setFloat32(0, color[4] / 255, false);
        var blue = blueBuf;

        //color type 0x00 global - end
        var colorTypeGlobal = new ArrayBuffer(2);
        var dvColorTypeGlobal = new DataView(colorTypeGlobal);
        dvColorTypeGlobal.setUint16(0, '0');

        colorArrayBuffers.push(rgb);
        colorArrayBuffers.push(red);
        colorArrayBuffers.push(green);
        colorArrayBuffers.push(blue);
        colorArrayBuffers.push(colorTypeGlobal);
    });

    //Group Start
    var groupAEnd = new ArrayBuffer(2)
    var dvGroupAEnd = new DataView(groupAEnd);
    dvGroupAEnd.setUint16(0, '0xC002' );
    colorArrayBuffers.push(groupAEnd);

    var groupEndBlockLength = new ArrayBuffer(4);
    var dvGroupEndBlockLength = new DataView(groupEndBlockLength);
    dvGroupEndBlockLength.setUint32(0, '0');
    colorArrayBuffers.push(groupEndBlockLength);

    var bb = new Blob(colorArrayBuffers, {
        type: 'example/binary'
    });

    var reader = new FileReader();
    reader.addEventListener("loadend", function () {
        var result = ab2str(reader.result);
        //console.log(result);
        //console.log(asciiToHex(result));

    });
    reader.readAsArrayBuffer(bb);
    //return bb;
    saveAs(bb, colors.title + ".ase");
}

cymk.makeASE = makeASE;

/*

colors = {
    'title': "Fade to Purple",
    'colors': [
        ["450040", "Siberian Tiger", "69", "0", "64"],
        ["610037", "in her arms", "97", "0", "55"],
        ["4D0032", "mistic wine", "77", "0", "50"],
        ["450043", "Goulish", "69", "0", "67"],
        ["2B001E", "to nowhere", "255", "0", "30"],
        ["610037", "in her arms", "255", "0", "55"],
        ["4D0032", "mistic wine", "255", "0", "50"],
        ["450043", "Goulish", "255", "0", "67"]
    ]
};

*/

//var aseFile = makeASE(colors);
//saveAs(aseFile, colors.title + ".ase");




//////////////////////////////////////////////////////

function Exhibit(bmp){
    createjs.Bitmap.call(this, bmp);
    this.crossHairs = new cymk.CrossHairCollection();
    this.swatches   = new cymk.SwatchCollection();
    //cymk.allSwatches = this.swatches;
    //this.on("click", this.setCrossHairs);
}

Exhibit.prototype = Object.create(createjs.Bitmap.prototype);

Exhibit.prototype.setCrossHairs = function (evt) {
    var rgbValue = this._getRGBValue(evt.stageX, evt.stageY);
    var crosshair = this.crossHairs.setCrossHairs(evt.stageX, evt.stageY, rgbValue);
    //console.log(evt.target.crossHairPositions);
};

Exhibit.prototype.getCrossHairs = function () {
    var data = [];
    for (var crossHairChildIndex = 0; crossHairChildIndex < this.crossHairs.children.length; crossHairChildIndex++) {
        var rgbValue = this._getRGBValue(this.crossHairs.children[crossHairChildIndex].x, this.crossHairs.children[crossHairChildIndex].y);
        //console.log(this.crossHairs.children[crossHairChildIndex]);
        data.push({
            x: this.crossHairs.children[crossHairChildIndex].x,
            y: this.crossHairs.children[crossHairChildIndex].y,
            rgbValue: rgbValue,
            rgbString: this.crossHairs.children[crossHairChildIndex].myswatch.rgbString,
            hexValue: this.crossHairs.children[crossHairChildIndex].myswatch.hexValue,
            hexString: this.crossHairs.children[crossHairChildIndex].myswatch.hexString,
            hsvValue: this.crossHairs.children[crossHairChildIndex].myswatch.hsvValue,
            hsvString: this.crossHairs.children[crossHairChildIndex].myswatch.hsvString,
            hslValue: this.crossHairs.children[crossHairChildIndex].myswatch.hslValue,
            hslString: this.crossHairs.children[crossHairChildIndex].myswatch.hslString,
            simpleName: this.crossHairs.children[crossHairChildIndex].myswatch.swatchColorName[3],
            longName: this.crossHairs.children[crossHairChildIndex].myswatch.swatchColorName[1]
        });
    }
    return data;
};

Exhibit.prototype._getRGBValue = function(x, y){
    //TODO: this throws an exception the first time the wheel is loaded. probably cache not loaded

    var rgbValue = this.cacheCanvas.getContext('2d').getImageData(x, y, 1, 1).data;
    return rgbValue;
};

Exhibit.prototype.loadCrossHairs = function(x, y) {
    //var rgbValue = this._getRGBValue(x, y);
    var crosshair = this.crossHairs.setCrossHairs(x, y);
    //stage.update();
};

//////////////////////////////////////////////////////

function HarmonyWheel(bmp){
    Exhibit.call(this, bmp);

    this.currentHarmony = 'Neutral';
    this.hsl = {
        "H": 60,
        "S": 100,
        "L": 50
    };

    this.centerOnStage = this.localToGlobal(0, 0);

    this.height = this.image.height;
    this.width  = this.image.width;

    this.halfWidth = (this.width / 2);
    this.halfHeight = (this.height / 2);
    this.regX = this.halfWidth
    this.regY = this.halfHeight;
    this.set({y: stage.canvas.height/2});
    this.set({x: stage.canvas.width/2});
    //this.set({rotation: -90});
    this.cache(0, 0, stage.canvas.width, stage.canvas.height);
    //this.cache.rotation = -90;
   // this.on('mousedown', function(evt){
   //     this.offset = {x:this.x-evt.stageX, y:this.y-evt.stageY};
   // });
    this.on('click', this.drawHarmony);
    this.on('pressmove', this.drawHarmony);
    this.updateCache();




//    var radius = this.lightnessToRadius(this.halfWidth, this.hsl["L"]);
    //TODO: Better way of getting Center in this coordinate system? This assumes wheel will always be center stage
//    var xCoord = this.xFromDegrees(stage.canvas.width/2, this.degToRad(this.hsl["H"]), radius);    //fine!
//    var yCoord = this.yFromDegrees(stage.canvas.height/2, this.degToRad(this.hsl["H"]), radius);


    stage.addChildAt(this, 2);

    this.harmonies = {
        'Neutral':[0,15,30,45,60,75],
        'Analogous':[0,30,60,90,120,150],
        'Clash':[0,90,270],
        'Complementary':[0,180],
        'Split-Complementary':[0,150,210],
        'Triadic':[0,120,240],
        'Tetradic':[0,90,180,270],
        'Four-Tone':[0,60,180,240],
        'Five-Tone':[0,115,155,205,245],
        'Six-Tone':[0,30,120,150,240,270]
        //TODO: Custom dots
    };


    //TODO: Load saved harmony instead of this each time a wheel shows up.
    this.currentHarmony = this.harmonies['Analogous'];
    cymk.colorWheel = this;

    for (var i = 0; i < this.currentHarmony.length; i = i + 1) {
        //TODO: Better way of getting Center in this coordinate system? This assumes wheel will always be center stage
        var radius = this.lightnessToRadius(this.halfWidth, this.hsl["L"]);
        var xCoord = this.xFromDegrees(stage.canvas.width/2, this.degToRad(this.currentHarmony[i]), radius);    //fine!
        var yCoord = this.yFromDegrees(stage.canvas.height/2, this.degToRad(this.currentHarmony[i]), radius);
        this.loadCrossHairs(xCoord, yCoord);
    };
}

HarmonyWheel.prototype = Object.create(Exhibit.prototype);
cymk.HarmonyWheel = HarmonyWheel;

HarmonyWheel.prototype.setHarmony = function (harmony) {
    this.currentHarmony = this.harmonies[harmony];
    this.drawHarmony();
    //stage.update();
};

HarmonyWheel.prototype.degToRad = function (degrees) {
    //TODO: Move me to a different object?
    return degrees * (Math.PI / 180);
};

HarmonyWheel.prototype.radToDeg = function (radians) {
    //TODO: Move me to a different object?
    return radians * (180 / Math.PI);
};

HarmonyWheel.prototype.xyToDeg = function (coords) {
    return this.radToDeg(Math.atan2(coords.x, coords.y / Math.PI * 2));
};

HarmonyWheel.prototype.distanceFromOrigin = function (coords) {
    return Math.sqrt(coords.x * coords.x + coords.y * coords.y);
};

HarmonyWheel.prototype.lightnessToRadius = function (radius, lightness) {
    return radius * (lightness / 100);
}

HarmonyWheel.prototype.xFromDegrees = function (center, deg, r) {
    return center + r * Math.cos(deg);
}

HarmonyWheel.prototype.yFromDegrees = function (center, deg, r) {
    return center + r * Math.sin(deg);
}

HarmonyWheel.prototype.drawHarmony = function (evt) {
    if (typeof evt === 'undefined'){
        //this is added because this.setharmony doesn't return pass an evt. candidate for improvement
        mousex = 400;
        mousey = 400;
    } else {
        var mousex = evt.stageX;
        var mousey = evt.stageY;
    }

    var localCoordinates = cymk.colorWheel.globalToLocal(mousex, mousey);

    var wheelX = localCoordinates.x - this.halfWidth;
    var wheelY = localCoordinates.y - this.halfHeight; // this is the offset to move center to center
    var radius = this.distanceFromOrigin({x: wheelX, y: wheelY});

    var hit = this.hitTest(localCoordinates.x, localCoordinates.y);
    if (hit === false){
        return;
    }
    var startingDeg = this.xyToDeg({x: wheelX, y: -(wheelY)}) -90;

    this.crossHairs.removeAllChildren();
    this.crossHairs.swatches.removeAllChildren();
    //this.swatches.removeAllChildren();
    //cymk.Swatch.swatchList = [];
    for (var i = 0; i < this.currentHarmony.length; i = i + 1) {
        //var radius = this.lightnessToRadius(this.halfWidth, this.hsl["L"]);
        var xCoord = this.xFromDegrees(stage.canvas.width/2, this.degToRad(startingDeg + this.currentHarmony[i]), radius);    //fine!
        var yCoord = this.yFromDegrees(stage.canvas.height/2, this.degToRad(startingDeg + this.currentHarmony[i]), radius);
        this.crossHairs.setCrossHairs(xCoord, yCoord);
        //this.loadCrossHairs(xCoord, yCoord);
    }
    //stage.update();
}


///////////////////////////////////////////////////////

function GamutWheel(bmp){
    Exhibit.call(this, bmp);
    this.height = this.image.height;
    this.width  = this.image.width;
    this.currentgamutShape = 'fiveSidedPolygon';
    //this.swatches = new cymk.SwatchCollection();
    var that = this;

    var bitmap = this.bitmap = new createjs.Bitmap(bmp);
    var bg = this.bg =  new createjs.Bitmap(bmp);


    //bitmap.set({y: stage.canvas.height/2});
    //bitmap.set({x: stage.canvas.width/2});

    bg.filters = [new createjs.ColorMatrixFilter(new createjs.ColorMatrix(0, 0, -100, 0))];
    bg.regX = this.image.width / 2;
    bg.regY = this.image.height / 2;
    bg.set({y: stage.canvas.height/2});
    bg.set({x: stage.canvas.width/2});
    bg.cache(0, 0, this.height, this.width);
    stage.addChildAt(bg, 1);

    var gamutshape = this.currentShape = new cymk.GamutShape();

    var colorThief = this.colorThief = new ColorThief();
    this.setGamutShape(this.currentgamutShape);
    bitmap.mask = gamutshape.getShape();

    bitmap.regX = this.image.width / 2;
    bitmap.regY = this.image.height / 2;
    bitmap.set({y: stage.canvas.height/2});
    bitmap.set({x: stage.canvas.width/2});
    stage.addChildAt(bitmap, 2);
    //gamutshape.setXY(this.width / 2, this.height/2);
    gamutshape.setXY(stage.canvas.width/2, stage.canvas.height/2);



    //gamutshape.on("pressmove", function(evt){
    //    this.x = evt.stageX;
    //    this.y = evt.stageY;
    //    that.computeColors();
    //});

    bitmap.on("mousedown", function(evt){
        this.offset = {
            x: that.currentShape.getX() - evt.stageX,
            y: that.currentShape.getY() - evt.stageY
        }
    });

    //bitmap.hitArea = this.currentShape.getShape();

    bitmap.on("pressmove", function (ev) {
            //var xy = this.globalToLocal(ev.stageX, ev.stageY);
        that.currentShape.setXY(ev.stageX + this.offset.x, ev.stageY + this.offset.y);
            //that.currentShape.setXY(xy.x + this.offset.x, xy.y + this.offset.y);
            //that.currentShape.setXY(ev.stageX, ev.stageY);
        //console.log(ev.stageX, ev.stageY);
        //console.log(that.currentShape.getX(), that.currentShape.getY());

            stage.update();
            that.computeColors();
    });

    var can = document.createElement('tempCanvas');
    var tempStage = new createjs.Stage('tempCanvas');
    tempStage.width = tempStage.height = 500;

    stage.addChild(gamutshape);

    createjs.Ticker.addEventListener("tick", function(event){
        stage.update(event);
    });

    stage.update();

    //this.cache(0, -75, this.width, this.height + 75);
    cymk.colorWheel = this;

}

GamutWheel.prototype = Object.create(Exhibit.prototype);
cymk.GamutWheel = GamutWheel;

GamutWheel.prototype.getColors = function() {
    var data = [];
    for (var swatchChildIndex = 0; swatchChildIndex < this.swatches.children.length; swatchChildIndex++) {
        data.push({
            x: 0,
            y: 0,
            rgbValue: this.swatches.children[swatchChildIndex].rgbValue,
            rgbString: this.swatches.children[swatchChildIndex].rgbString,
            hexValue: this.swatches.children[swatchChildIndex].hexValue,
            hexString: this.swatches.children[swatchChildIndex].hexString,
            hsvValue: this.swatches.children[swatchChildIndex].hsvValue,
            hsvString: this.swatches.children[swatchChildIndex].hsvString,
            hslValue: this.swatches.children[swatchChildIndex].hslValue,
            hslString: this.swatches.children[swatchChildIndex].hslString,
            simpleName: this.swatches.children[swatchChildIndex].swatchColorName[3],
            longName: this.swatches.children[swatchChildIndex].swatchColorName[1]
        });
    }
    return data;
}

GamutWheel.prototype.computeColors = function() {
    var can = document.createElement('tempCanvas');
    var tempStage = new createjs.Stage('tempCanvas');
    tempStage.width = tempStage.height = 500;
    tempStage.addChild(this.bitmap);
    tempStage.update();
    tempStage.cache(0, 0, 500, 500);
    this.swatches.removeAllChildren();
    this.bitmap.mask = this.currentgamutShape;
    stage.addChildAt(this.bg, 1);

    this.bitmap.mask = this.currentShape.getShape();
    stage.addChildAt(this.bitmap, 2);
    stage.addChild(this.currentShape);

    var colors = this.colorThief.getPalette(tempStage.cacheCanvas, 12); //TODO: color thief call back should be last parameter? or something
    for (var i = 0; i < colors.length; i++) {
        this.swatches.addSwatch(colors[i][0], colors[i][1], colors[i][2]);
    }
    //stage.update();
}

GamutWheel.prototype.setGamutShape = function(shape) {
    this.currentgamutShape = shape;
    this.drawMaskShape();
    this.computeColors();
}

GamutWheel.prototype.drawMaskShape = function() {
    this.currentShape.clearShape();
    this.swatches.removeAllChildren();
    //swatchCase?
    if (this.currentgamutShape === 'fiveSidedPolygon') {
        this.currentShape.fiveSidedPolygon();
        stage.update();
    } else if (this.currentgamutShape === 'thinTriangle'){
        this.currentShape.thinTriangle();
        stage.update();
    }  else if (this.currentgamutShape === 'secondTriangle') {
        this.currentShape.secondTriangle();
        stage.update();
    }  else if (this.currentgamutShape === 'thirdTriangle') {
        this.currentShape.thirdTriangle();
        stage.update();
    }  else if (this.currentgamutShape === 'complementaryDiamond') {
        this.currentShape.complementaryDiamond();
        stage.update();
    }  else if (this.currentgamutShape === 'firstTwoBlobs') {
        this.currentShape.firstTwoBlobs();
        stage.update();
    }  else if (this.currentgamutShape === 'secondTwoBlobs') {
        this.currentShape.secondTwoBlobs();
        stage.update();
    }  else if (this.currentgamutShape === 'otherDiamond') {
        this.currentShape.otherDiamond();
        stage.update();
    }  else if (this.currentgamutShape === 'halfCircleBlob') {
        this.currentShape.halfCircleBlob();
        stage.update();
    }  else if (this.currentgamutShape === 'bunnyBlob') {
        this.currentShape.bunnyBlob();
        stage.update();
    }  else if (this.currentgamutShape === 'rightAngleTriangle') {
        this.currentShape.rightAngleTriangle();
        stage.update();
    }  else if (this.currentgamutShape === 'smallEquiTriangle') {
        this.currentShape.smallEquiTriangle();
        stage.update();
    }

}

//////////////////////////////////////////////////////////

function GamutShape() {
    createjs.Container.call(this);


    this.s = new createjs.Shape();
    this.s.x = 200; //what am I for?
    this.s.y = 200; //what am I for?

    //this.blob = new createjs.Shape();
    //this.blob.graphics.beginFill("#000").setStrokeStyle(10).drawEllipse(-11, -14, 24, 18);
    //this.blob.x = this.getX();
    //this.blob.y = this.getY();

    this.rotateIcon = new createjs.Bitmap('/transform-rotate-icon.png');
    //it's a 32x32 pixel icon. bitmap doesn't calculate width and height yet.
    this.rotateIcon.regX = 16;
    this.rotateIcon.regY = 16;
    //this.rotateIcon.x = 0; //this.getX();
    //this.rotateIcon.y = 0; //this.getY();

    //this.on("mousedown", function(evt){
    //    console.log("honk");
    //});

    this.addChild(this.s);
    this.addChild(this.rotateIcon);
    stage.addChild(this);
    this.hitArea = this.rotateIcon;

    this.on("pressmove", function(evt){
        //console.log(evt);
        //console.log(this);
        var angle = Math.atan2(evt.stageX - evt.target.rotateIcon.x, -(evt.stageY - evt.target.rotateIcon.y)) * (180 / Math.PI);
        evt.target.rotateIcon.rotation = angle;
        this.s.rotation = angle;
        cymk.colorWheel.computeColors();
        stage.update();
    });

}

GamutShape.prototype = Object.create(createjs.Container.prototype);
cymk.GamutShape = GamutShape;

GamutShape.prototype.getShape = function(){
    return this.s;
}

GamutShape.prototype.getX = function(){
    return this.s.x;
}

GamutShape.prototype.getY = function(){
    return this.s.y;
}

GamutShape.prototype.setXY = function(x, y){
    //var coords = this.globalToLocal(x, y);
    this.s.x = this.rotateIcon.x = x;
    this.s.y = this.rotateIcon.y = y;
    stage.update();

}

GamutShape.prototype.clearShape = function(){
    this.s.graphics.clear();
}

GamutShape.prototype.fiveSidedPolygon = function() {
    this.s.regX = 0;
    this.s.regY = 0;
    //5 polygon
    this.s.graphics.f().s("#000000").ss(1,1,1).p("AO5lBIkKR/IyZBmInOw/IN9sIg");
    stage.update();

}

GamutShape.prototype.thinTriangle = function() {
    this.s.regX = 0;
    this.s.regY = 0;

    //triangle thin
    this.s.graphics.f().s("#000000").ss(1,1,1).p("AMoYOI5PAeMAMdgxXg");
}

GamutShape.prototype.secondTriangle = function() {
    this.s.regX = 0;
    this.s.regY = 0;

    //triangle 2
    this.s.graphics.f().s("#000000").ss(1,1,1).p("AV0MDMgrnADqIXC/Zg");



}

GamutShape.prototype.thirdTriangle = function() {
    this.s.regX = 0;
    this.s.regY = 0;

    //triangle3
    this.s.graphics.f().s("#000000").ss(1,1,1).p("ATNPoMgmZABWMASDgh7g");



}

GamutShape.prototype.complementaryDiamond = function() {
    this.s.regX = 0;
    this.s.regY = 0;

    //complementary
    this.s.graphics.f().s("#000000").ss(1,1,1).p("AH3gFMgIRAmhMgHcgmPIgCgMAn2ANMAHygmoMAH9AmU");



}

GamutShape.prototype.firstTwoBlobs = function() {
    this.s.regX = 0;
    this.s.regY = 0;

    //two blobs 1
    this.s.graphics.f().s("#000000").ss(1,1,1).p("EACzgipQBeBeAACEQAACEheBeQheBeiCAAQiFAAheheQhdhdAAiFQAAiFBdhdQBeheCFAAQCCAABeBegAIYAmQDfGHAAInQAAIojfGGQjeGGk6AAQk4AAjfmGQjfmHAAonQAAomDfmIQDfmDE4AAQE6AADeGDg");



}

GamutShape.prototype.secondTwoBlobs = function() {
    this.s.regX = 0;
    this.s.regY = 0;

    //two blobs 2
    this.s.graphics.f().s("#000000").ss(1,1,1).p("APPwQQmtA4pJAcQpCAbmNhTQmLhUAAlFQAAlFGejmQGdjmJGAAQJIAAGdDmQGdDmAAFFQAAFFmzA4gAG4dVQAACJhpBgQhqBhiVAAQiTAAhphhQhqhgAAiJQAAiIBqhhQBphhCTAAQCVAABqBhQBpBhAACIg");



}

GamutShape.prototype.otherDiamond = function() {
    this.s.regX = 0;
    this.s.regY = 0;

    //diamond 2
    this.s.graphics.f().s("#000000").ss(1,1,1).p("AMOAUMgEkAhyIz2+FMAJsgmGg");



}

GamutShape.prototype.halfCircleBlob = function() {
    this.s.regX = 0;
    this.s.regY = 0;

    //halfcircle blob
    this.s.graphics.f().s("#000000").ss(1,1,1).p("AVFM/QpnA9tIAZQtKAZpQh0QpPh0BjmbQBjmaFmnYQFmnYN4C8QN4C8MKG1QMLGyhMEhQhMEhpnA9g");



}

GamutShape.prototype.bunnyBlob = function() {
    this.s.regX = 0;
    this.s.regY = 0;

    //bunny
    this.s.graphics.f().s("#000000").ss(1,1,1).p("EgAEAjPIgUACQgtAEgrgHQjYgshijIQhOiegqivQhCkTgckfQgYjzgFj3QgEjWAJjGQAOkiBAkgQAvjhkdkIQhVhLhGhWQiQixhvjMQhLiLg2iXQgsh5ADiDQAFjACghmQAagRAggDQCFgIByBLQB6BQBgBuQBXBhBFBtQA/BjA5BsQA3BpAmBuIAmBsQAxB4A1A9QAdAhAbANIARASIAlAJQAtAKArACQBcAFA1gdIAQgTIAVgMQAPgLAUgXQA2g+Awh3IAmhtQAnhtA2hpQA5htA/hjQBGhsBWhhQBhhuB6hQQBxhLCGAHQAfADAbASQCgBlAEDAQADCDgsB6Qg2CWhLCMQhvDMiQCwQhGBXhVBLQkcEHAvDiQA/EfAOEjQAJDGgEDWQgED2gYD0QgcEehCETQgqCvhOCeQhjDJjYArQgrAIgsgEACIv5QAXgOAOgR");



}

GamutShape.prototype.rightAngleTriangle = function() {
    this.s.regX = 0;
    this.s.regY = 0;

    //right angle triangle
    this.s.graphics.f().s("#000000").ss(1,1,1).p("A3rwiMAwCAhFMgwtgATg");


}

GamutShape.prototype.smallEquiTriangle = function() {
    this.s.regX = 0;
    this.s.regY = 0;

    //small equi
    this.s.graphics.f().s("#000000").ss(1,1,1).p("AQOQUMggagJGIYD3hg");

}


/*


GamutShape.prototype.atmosphericTriad = function() {
    //this.s.regX = 150;
    //this.s.regY = 150;
    //this.s.graphics.beginStroke("#FF0")
    //    .setStrokeStyle(10)
    //    .lineTo(0, 250)
    //    .lineTo(250,250)
    //    .lineTo(0,0)
     //   .closePath();


    this.s.regX = 150;
    this.s.regY = 150;
    //small equi
    this.s.graphics.f().s("#000000").ss(1,1,1).p("AQOQUMggagJGIYD3hg");



    stage.update();
}

GamutShape.prototype.shiftedTriad = function() {
    this.s.regX = 0;
    this.s.regY = 250;
    this.s.graphics.beginStroke("#FF0")
        .setStrokeStyle(10)
        .lineTo(-50, 250)
        .lineTo(+50,250)
        .lineTo(0,0)
        .closePath();
    stage.update();
}

GamutShape.prototype.complementary = function() {
    this.s.regX = 0;
    this.s.regY = 250;
    this.s.graphics.beginStroke("#FF0")
        .moveTo(-50)
        .setStrokeStyle(10)
        .lineTo(250, 0)
        .lineTo(+50,250)
        .lineTo(0,0)
        .closePath();
    stage.update();
}

*/

function Picture(bmp){
    //createjs.Container.call(this);
    Exhibit.call(this, bmp);
    stage.removeAllChildren();
    var that = this;
    this.crossHairs = new cymk.CrossHairCollection();
    this.swatches = this.crossHairs.swatches;
    this.height = this.image.height;
    this.width  = this.image.width;

    this.regX = this.width/2;
    this.regY = this.height/2

    //stage.update();
    //when caching is added, image doesn't get drawn on firefox...

    this.set({
        x: stage.canvas.width/2,
        y: stage.canvas.height/2
    });


    stage.addChildAt(this, 1);

    stage.update();
    this.cache(0, 0, 650, 650);

    this.on('click', this.addCrossHair);
    stage.update();

    cymk.colorWheel = this;
    this.updateCache();

    this.loadColorsDefault();


    stage.update();

    if (this.height === 0){
        // add a ticker for slow browsers that don't get image height/width in time
        createjs.Ticker.addEventListener("tick", function(event){
            cymk.colorWheel.updateCache();
            that.height = that.image.height;
            that.width  = that.image.width;
            that.regX = that.width/2;
            that.regY = that.height/2;
            that.x = stage.canvas.width/2;
            that.y = stage.canvas.height/2;
            stage.update(event);
        }).setInterval(2000);
    }
}

Picture.prototype = Object.create(Exhibit.prototype);
cymk.Picture = Picture;

Picture.prototype.addCrossHair = function(e) {
    this.updateCache();
    this.crossHairs.setCrossHairs(e.stageX, e.stageY);
}

Picture.prototype.loadColorsDefault = function(){
    this.updateCache();
    //TODO: If no pic loaded this fail in a decent way
    this.crossHairs.removeAllChildren();
    this.swatches.removeAllChildren();
    var that = this;
    var colorThief = new ColorThief();

    colorThief.getPalette(this.image, 14, function(colors){
        for (var i = 0; i < colors.length; i++) {
            that.swatches.addSwatch(colors[i][0], colors[i][1], colors[i][2]);
        }

    });
    stage.update();
}

Picture.prototype.getColors = function() {
    var data = [];
    var that = this;
    for (var swatchChildIndex = 0; swatchChildIndex < this.swatches.children.length; swatchChildIndex++) {
        data.push({
            x: 0,
            y: 0,
            rgbValue: this.swatches.children[swatchChildIndex].rgbValue,
            rgbString: this.swatches.children[swatchChildIndex].rgbString,
            hexValue: this.swatches.children[swatchChildIndex].hexValue,
            hexString: this.swatches.children[swatchChildIndex].hexString,
            hsvValue: this.swatches.children[swatchChildIndex].hsvValue,
            hsvString: this.swatches.children[swatchChildIndex].hsvString,
            hslValue: this.swatches.children[swatchChildIndex].hslValue,
            hslString: this.swatches.children[swatchChildIndex].hslString,
            simpleName: this.swatches.children[swatchChildIndex].swatchColorName[3],
            longName: this.swatches.children[swatchChildIndex].swatchColorName[1]
        });
    }
    return data;
}

Picture.prototype.setWidth = function(width){
    if (this.image.width === 0) return;

    var scale = this.scaleX = width / this.image.width;
    this.scaleY = scale;
    stage.update();
    this.cache(0, 0, stage.canvas.width, stage.canvas.height, scale);


}

Picture.prototype.setHeight = function(height){
    if (this.image.height === 0) return;

    var scale = this.scaleY = height / this.image.height;
    this.scaleX = scale;
    stage.update();
    this.cache(0, 0, stage.canvas.width, stage.canvas.height, scale);

}


/////////////////////////////////////////////////////////

function Reverse(bmp){
    //createjs.Container.call(this);
    Exhibit.call(this, bmp);
    stage.removeAllChildren();
    var that = this;
    this.crossHairs = new cymk.CrossHairCollection();
    this.swatches = this.crossHairs.swatches;
    this.height = this.image.height;
    this.width  = this.image.width;

    this.regX = this.width/2;
    this.regY = this.height/2

    //stage.update();
    //when caching is added, image doesn't get drawn on firefox...

    this.set({
        x: stage.canvas.width/2,
        y: stage.canvas.height/2
    });


    stage.addChildAt(this, 1);

    stage.update();
    this.cache(0, 0, 650, 650);

    //this.on('click', this.addCrossHair);
    stage.update();

    cymk.colorWheel = this;
    this.updateCache();

    this.loadColorsDefault();


    stage.update();

    if (this.height === 0){
        // add a ticker for slow browsers that don't get image height/width in time
        createjs.Ticker.addEventListener("tick", function(event){
            cymk.colorWheel.updateCache();
            that.height = that.image.height;
            that.width  = that.image.width;
            that.regX = that.width/2;
            that.regY = that.height/2;
            that.x = stage.canvas.width/2;
            that.y = stage.canvas.height/2;
            stage.update(event);
        }).setInterval(2000);
    }
}

Reverse.prototype = Object.create(Exhibit.prototype);
cymk.Reverse = Reverse;

Reverse.prototype.loadColorsDefault = function(){
    this.updateCache();
    //TODO: If no pic loaded this fail in a decent way
    var that = this;
    var colorThief = new ColorThief();

   this.colorsPicked = []

    colorThief.getPalette(this.image, 250, function(colors){
        for (var i = 0; i < colors.length; i++) {
            //that.swatches.addSwatch(colors[i][0], colors[i][1], colors[i][2]);

            var swatchColor = tinycolor({r: colors[i][0], g: colors[i][1], b: colors[i][2]});
            var hslValue = swatchColor.toHsv();
            var rgbValue = swatchColor.toRgb();
            //console.log(hslValue);
            //console.log(rgbValue);
            var color = createjs.Graphics.getRGB(rgbValue.r,rgbValue.g,rgbValue.b, 255);
            that.colorsPicked.push({hsl: hslValue, color: color});
        }

    });
    stage.update();
}

Reverse.prototype.getColors = function() {
    var data = [];
    var that = this;
    for (var swatchChildIndex = 0; swatchChildIndex < this.swatches.children.length; swatchChildIndex++) {
        data.push({
            x: 0,
            y: 0,
            rgbValue: this.swatches.children[swatchChildIndex].rgbValue,
            rgbString: this.swatches.children[swatchChildIndex].rgbString,
            hexValue: this.swatches.children[swatchChildIndex].hexValue,
            hexString: this.swatches.children[swatchChildIndex].hexString,
            hsvValue: this.swatches.children[swatchChildIndex].hsvValue,
            hsvString: this.swatches.children[swatchChildIndex].hsvString,
            hslValue: this.swatches.children[swatchChildIndex].hslValue,
            hslString: this.swatches.children[swatchChildIndex].hslString,
            simpleName: this.swatches.children[swatchChildIndex].swatchColorName[3],
            longName: this.swatches.children[swatchChildIndex].swatchColorName[1]
        });
    }
    return data;
}

Reverse.prototype.setWidth = function(width){
    if (this.image.width === 0) return;

    var scale = this.scaleX = width / this.image.width;
    this.scaleY = scale;
    stage.update();
    this.cache(0, 0, stage.canvas.width, stage.canvas.height, scale);


}

Reverse.prototype.setHeight = function(height){
    if (this.image.height === 0) return;

    var scale = this.scaleY = height / this.image.height;
    this.scaleX = scale;
    stage.update();
    this.cache(0, 0, stage.canvas.width, stage.canvas.height, scale);

}

/////////////////////////////////////////////////////////

function SwatchCollection() {
    createjs.Container.call(this);
    //this.set({y: 0, x:0});
    stage.addChildAt(this, 0);
    stage.update();
}

SwatchCollection.prototype = Object.create(createjs.Container.prototype);
cymk.SwatchCollection = SwatchCollection;

SwatchCollection.prototype.addSwatch = function (r, g, b, crossHair) {

    if (this.children.length <= 17) {
        var swatch = new cymk.Swatch;
        swatch.crossHair = crossHair;
        var colorBox = swatch.addSwatch(r, g ,b);
        colorBox.regY = 325;
        colorBox.regX = 30;
        colorBox.y = 325;
        colorBox.x = 325;
        colorBox.rotation = this.children.length * 20;
        //this.children.length * 60;

        this.addChild(colorBox);
        stage.update();
        return swatch;
    } else {
        alert('You have reached the maximum number of swatches, delete some to add more');
        return false;
    }
}

SwatchCollection.prototype.deleteSwatch = function(child){
    if (typeof child.crossHair !== "undefined") {
        //this.crossHair.deleteMe();
//        console.log(this.crossHair);

        //TODO: make a crossHair class to make this better
        child.crossHair.parent.removeChild(child.crossHair);
    }



    var index = this.getChildIndex(child);
    var len = this.children.length;
    for (var i = index; i < len; i++){
        var thisSwatch = this.children[i];
        thisSwatch.rotation = thisSwatch.rotation - 20;
    }
    this.removeChild(child);
    stage.update();
}

////////////////////////////////////////////////

//CrossHairCollection
function CrossHairCollection() {
    createjs.Container.call(this);
    this.swatches = new cymk.SwatchCollection();

    stage.addChild(this);
    stage.update();
}

CrossHairCollection.prototype = Object.create(createjs.Container.prototype);

CrossHairCollection.prototype.setCrossHairs = function (x, y) {
    //TODO: Add ID
    //var myNodule = new createjs.Shape();

    var myNodule = new createjs.Container();

    // crossHair Design
    this.shape = new createjs.Shape();
    this.shape.graphics.f().s("#000000").ss(0.1,1,1).p("AAAg/IAAAxAAAARIAAAv");
    //this.shape.setTransform(389.1,318.9);

    this.shape_1 = new createjs.Shape();
    this.shape_1.graphics.f().s("#FF0000").ss(0.1,1,1).p("ABogQIAJAAAAAhZIAAA6ABPgQIAZAAAAMgQIBDAAAhogQIAZAAIBEAAAhwgQIAIAAAAABXIAAADAAAA/IAAAYAAAAAIAAA/");
    //this.shape_1.setTransform(389,320.6);

    this.shape_2 = new createjs.Shape();
    this.shape_2.graphics.f().s("#FF0000").ss(3.2,1,1).p("AAAibIAAA2IAAAaQAhAAAXAXQAXAXABAfQAAAAAAABQAAAhgYAXQgXAYghAAIAAAYAhPACQABgfAXgXQAXgXAgAAAAABTQgggBgXgXQgYgXAAghQAAgBAAAAAAABtIAAgCAAABTQAAAAAAAAAAABtIAAAw");
    //this.shape_2.setTransform(389,318.7);

    this.shape_3 = new createjs.Shape();
    this.shape_3.graphics.f().s("#000000").ss(3.2,1,1).p("AAAhoQArAAAfAfQAfAfAAAqAAABpQArAAAfggQAfgeAAgrAhoAAQAAgqAfgfQAfgfAqAAAAABpQAAAAAAAAQgqgBgfgfQgfgeAAgr");
    //this.shape_3.setTransform(389,318.9);
    var hit = new createjs.Shape();
    hit.graphics.beginFill("#000").drawCircle(0,0,12);

    myNodule.addChild(this.shape);
    myNodule.addChild(this.shape_1);
    myNodule.addChild(this.shape_2);
    myNodule.addChild(this.shape_3);

    myNodule.hitArea = hit;


    var localCoordinates = cymk.colorWheel.globalToLocal(x, y);


    var rgb = cymk.colorWheel.cacheCanvas.getContext('2d').getImageData(localCoordinates.x, localCoordinates.y, 1, 1).data;


    myNodule.myswatch = this.swatches.addSwatch(rgb[0], rgb[1], rgb[2], myNodule);
    if (myNodule.myswatch === false) {
        return;
    }


    var self = this;
    var that = this;

    myNodule.x = x;
    myNodule.y = y;
    //myNodule.graphics.setStrokeStyle(2).beginStroke('red').beginFill('black').drawCircle(0,0,8);
    this.addChild(myNodule);

    //TODO: this.regX, and this.regY = 4?
    myNodule.rgbValue = rgb;



    myNodule.on('rollover', function(evt){
        evt.target.myswatch.addBorder();
    });

    myNodule.on('rollout', function(evt){
        evt.target.myswatch.removeBorder();
    });


    myNodule.on('mousedown', function(evt){
        this.offset = {x:this.x-evt.stageX, y:this.y-evt.stageY};
    });

    myNodule.on('pressmove', function(evt){
        this.x = evt.stageX + this.offset.x;
        this.y = evt.stageY + this.offset.y;

        var localCoordinates = cymk.colorWheel.globalToLocal(this.x, this.y);

        var hit = cymk.colorWheel.hitTest(localCoordinates.x, localCoordinates.y);

        if (hit === true) {
            var rgbValue = myNodule.myswatch.rgbValue = this.rgbValue = cymk.colorWheel.cacheCanvas.getContext('2d').getImageData(localCoordinates.x, localCoordinates.y, 1, 1).data;
            var color = createjs.Graphics.getRGB(rgbValue[0],rgbValue[1],rgbValue[2], 255);
            evt.target.myswatch.removeAllChildren();
            evt.target.myswatch.addSwatch(rgbValue[0],rgbValue[1],rgbValue[2]); ///.graphics.clear().beginFill(color).dr(0, 0, 60, 60);
            stage.update();
        } else {
            return;
        }
    });

    myNodule.on('dblclick', function(evt){
        //Removes crosshair and corresponding swatch
        that.swatches.deleteSwatch(evt.target.myswatch);
        that.removeChild(evt.target);
        stage.update();
    });

    stage.update();
    return myNodule;
};

CrossHairCollection.prototype.moveCrossHairs = function (x, y, rgb){

}

cymk.CrossHairCollection = CrossHairCollection;

/////////////////////////////////////////////////

function Swatch() {
    createjs.Container.call(this);
    this.swatchShape = new createjs.Shape();

    //TODO: CrossHair class
    this.on('rollover', function(evt){
        if (typeof this.crossHair !== 'undefined') {
            this.crossHair.children[0].graphics.clear();
            this.crossHair.children[0].graphics.setStrokeStyle(10).beginStroke('red').beginFill('black').drawCircle(0,0,8);
            stage.update();
        }

    });

    this.on('rollout', function(evt){
        if (typeof this.crossHair !== 'undefined') {
            this.crossHair.children[0].graphics.clear();
            this.crossHair.children[0].graphics.f().s("#000000").ss(0.1,1,1).p("AAAg/IAAAxAAAARIAAAv");
            stage.update();
        }

    });

}

Swatch.prototype = Object.create(createjs.Container.prototype);

Swatch.prototype.addBorder = function(){
    this.swatchShape.graphics.clear();
    this.swatchShape.graphics.setStrokeStyle(2).beginStroke(2).f(this.color).dr(0, 0, 120, 120);
    stage.update();

}


Swatch.prototype.removeBorder = function(){
    this.swatchShape.graphics.clear();
    this.swatchShape.graphics.f(this.color).dr(0, 0, 120, 120);
    stage.update();
}

Swatch.prototype.addSwatch = function(r, g, b){
    var swatch = this.swatchShape; //new createjs.Shape();

    var swatchDeleteButton = new createjs.Bitmap('/swatch-delete-icon.png');
    swatchDeleteButton.regX = 8;
    swatchDeleteButton.regY = 8;
    swatchDeleteButton.x = 10;
    swatchDeleteButton.y = 60;
    var swatchAddButton = new createjs.Bitmap('/swatch-add-icon.png');
    swatchAddButton.regX = 8;
    swatchAddButton.regY = 8;
    swatchAddButton.x = 50;
    swatchAddButton.y = 60;
    var that = this;

    swatchDeleteButton.on("click", function(evt){
        that.parent.deleteSwatch(evt.target.parent);
    });

    swatchAddButton.on("click", function(evt){
        LocalPalette.insert({
            x: evt.target.parent.x,
            y: evt.target.parent.y,
            rgbValue: evt.target.parent.rgbValue,
            rgbString: evt.target.parent.rgbString,
            hexValue: evt.target.parent.hexValue,
            hexString: evt.target.parent.hexString,
            hsvValue: evt.target.parent.hsvValue,
            hsvString: evt.target.parent.hsvString,
            hslValue: evt.target.parent.hslValue,
            hslString: evt.target.parent.hslString,
            simpleName: evt.target.parent.simpleName,
            longName: evt.target.parent.longName
        });
    });

    var width = 120,
        height = 120,
        color = createjs.Graphics.getRGB(r, g, b),
        gr = swatch.graphics;

    this.color = color;
    gr.f(color).dr(0, 0, width, height);
    this.rgbValue = {0: r, 1: g, 2: b, 3: 255};
    var swatchColor = tinycolor({r: r, g: g, b: b});
    this.rgbString = swatchColor.toRgbString();
    this.hexValue = swatchColor.toHex();
    this.hexString = swatchColor.toHexString();
    this.hsvValue = swatchColor.toHsv();
    this.hsvString = swatchColor.toHsvString();
    this.hslValue = swatchColor.toHsl();
    this.hslString = swatchColor.toHslString();
    this.swatchColorName = ntc.name(this.hexValue);
    this.simpleName = this.swatchColorName[3];
    this.longName = this.swatchColorName[1];

    var hexStringText = new createjs.Text(this.hexString, "10px Arial", "#000000");
    hexStringText.x = 4; hexStringText.y = 10; hexStringText.textBaseline = "alphabetic";

    var hsvStringText = new createjs.Text(this.hsvString, "10px Arial", "#000000");
    hsvStringText.x = 4; hsvStringText.y = 20; hsvStringText.textBaseline = "alphabetic";

    var hslStringText = new createjs.Text(this.hslString, "10px Arial", "#000000");
    hslStringText.x = 4; hslStringText.y = 30; hslStringText.textBaseline = "alphabetic";

    var simpleNameStringText = new createjs.Text(this.simpleName, "10px Arial", "#000000");
    simpleNameStringText.x = 4; simpleNameStringText.y = 40; simpleNameStringText.textBaseline = "alphabetic";

    var longNameStringText = new createjs.Text(this.longName, "10px Arial", "#000000");
    longNameStringText.x = 4; longNameStringText.y = 50; longNameStringText.textBaseline = "alphabetic";


    this.addChildAt(swatch, 0);
    this.addChild(swatchDeleteButton);
    this.addChild(swatchAddButton);
    this.addChild(hexStringText);
    this.addChild(hsvStringText);
    this.addChild(hslStringText);
    this.addChild(simpleNameStringText);
    this.addChild(longNameStringText);

    return this;
};

cymk.Swatch = Swatch;
