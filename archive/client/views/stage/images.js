Template.imageCirc.rendered = function(){
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
                    //console.log('temp_ctx start')
                    //console.log(temp_ctx.getImageData(0, 0, 450, 450).data);
                    //console.log('temp_ctx end')
                    var smallerImage = temp_can.toDataURL();
                    var picture = new cymk.Picture(smallerImage);
                    cymk.colorWheel.updateCache();
                    $('#btnImageAddSwatches').removeAttr('disabled');
                    stage.update();

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

Template.image.events({
    'click .btnAddToPalette': function(e){
        var data = cymk.colorWheel.getColors();

        _.each(data, function(swatch){
            LocalPalette.insert({
                x: swatch.x,
                y: swatch.y,
                rgbValue: swatch.rgbValue,
                rgbString: swatch.rgbString,
                hexValue: swatch.hexValue,
                hexString: swatch.hexString,
                hsvValue: swatch.hsvValue,
                hsvString: swatch.hsvString,
                hslValue: swatch.hslValue,
                hslString: swatch.hslString,
                simpleName: swatch.simpleName,
                longName: swatch.longName
            });
        });

    },

    'selectstart canvas': function(e){
        return false;
    }
});