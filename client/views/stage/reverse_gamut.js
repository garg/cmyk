Template.reverseGamutCircle.rendered = function(){



    stage2 = new createjs.Stage("reverseGamutCircle");

    stage2.canvas.width = 500;
    stage2.canvas.height = 500;

    var can = document.createElement('canvas');
    can.width = 500;
    can.height = 500;
    var ctx = can.getContext("2d");

    var imageObj = new Image();
    imageObj.onload = function () {
        ctx.drawImage(imageObj, 0, 0, 500, 500);
        //colorWheel = this.colorWheel = new cymk.GamutWheel(can);
        var gamutWheel = new createjs.Bitmap(can);
        stage2.addChild(gamutWheel);
        stage2.update();
    };
    imageObj.src = "/hslwheel.png";

};

Template.reverseGamut.events({
    'click .btnAddToPalette': function(e){
        var degToRad = function (degrees) {
            //TODO: Move me to a different object?
            return degrees * (Math.PI / 180);
        };

        var radToDeg = function (radians) {
            //TODO: Move me to a different object?
            return radians * (180 / Math.PI);
        };

        var xyToDeg = function (coords) {
            return this.radToDeg(Math.atan2(coords.x, coords.y / Math.PI * 2));
        };

        var distanceFromOrigin = function (coords) {
            return Math.sqrt(coords.x * coords.x + coords.y * coords.y);
        };

        var lightnessToRadius = function (radius, lightness) {
            return radius * (lightness / 100);
        }

        var saturationToRadius = function (radius, saturation) {
            return radius * (saturation / 100);
        }

        var xFromDegrees = function (center, deg, r) {
            return center + r * Math.cos(deg);
        }

        var yFromDegrees = function (center, deg, r) {
            return center + r * Math.sin(deg);
        }


        var data = cymk.colorWheel.colorsPicked;
        var shapeHeightCenter = 500;
        var shapeWidthCenter = 500;

        _.each(data, function(swatch){
            //console.log(swatch);
            var blob = new createjs.Shape();
            blob.graphics.beginFill(swatch.color).setStrokeStyle(10).drawEllipse(-11, -14, 24, 18);
            //blob.x = swatch.h;
            //blob.y = (swatch.s) * 100;

            var radius = saturationToRadius(250, (swatch.hsl.s * 100));
            //console.log("radius: " + radius);


            var xCoord = xFromDegrees(shapeWidthCenter/2, degToRad(swatch.hsl.h), radius);    //fine!
            var yCoord = yFromDegrees(shapeHeightCenter/2, degToRad(swatch.hsl.h), radius);

            //console.log("hue: " + swatch.hsl.h);
            //console.log({x: xCoord, y: yCoord});


            blob.x = xCoord;
            blob.y = yCoord;

            stage2.addChild(blob);
            stage2.update();

        });

    },

    'selectstart canvas': function(e){
        return false;
    }
})

Template.reverseGamut.rendered = function(){
    stage = new createjs.Stage("dropZone");
    createjs.Touch.enable(stage);
    stage.enableMouseOver(10);
    stage.mouseMoveOutside = true;

    var FileReaderOpts = {
        dragClass: 'active',
        on: {
            load: function(e, file) {
                stage.clear();
                stage.removeAllChildren();
                stage2.clear();
                stage2.removeAllChildren();
                Template.reverseGamutCircle.rendered();
                stage2.update();
                stage.canvas.width = 650;
                stage.canvas.height = 650;

                var img = new Image();
                img.onload = function(){
                    var temp_can = document.createElement('canvas');
                    var temp_ctx = temp_can.getContext('2d');

                    var scale = 0;

                    if (img.height < 450 && img.width < 450){
                        scale = 1;
                    } else if (img.height < img.width){
                        scale = 450 / img.width;
                    } else {
                        scale = 450 / img.height;
                    }
                    temp_can.width = img.width * scale;
                    temp_can.height = img.height * scale;
                    temp_ctx.scale(scale, scale);
                    temp_ctx.drawImage(img, 0, 0);

                    var smallerImage = temp_can.toDataURL();

                    var reverse = new cymk.Reverse(smallerImage);
                    cymk.colorWheel.updateCache();

                    stage.update();
                    $('#btnImageAddSwatches').removeAttr('disabled');


                };
                img.src = e.target.result;

                //console.log(e.target.result);
            }
        }
    };

    $("#file-input, #dropZone").fileReaderJS(FileReaderOpts);
    $("body").fileClipboard(FileReaderOpts);

    stage.update();
}