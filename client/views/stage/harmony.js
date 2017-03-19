Template.harmonyCirc.rendered = function(){
    stage = new createjs.Stage("myCanvas");
    createjs.Touch.enable(stage);
    stage.enableMouseOver(10);
    stage.mouseMoveOutside = true;

    stage.canvas.width = 650;
    stage.canvas.height = 650;

    //TODO: MAKE THIS LOAD FASTER DONT RERENDER
    //if (typeof can === 'undefined'){
      //
    //    var can = Template.stage.regularWheel();
    //    //var can = Template.harmony.regularWheel();
    //    console.log(can);
    //}

    var can = document.createElement('canvas');
    can.width = 500;
    can.height = 500;
    var ctx = can.getContext("2d");

    var imageObj = new Image();
    imageObj.onload = function () {
        ctx.drawImage(imageObj, 0, 0, 500, 500);
        colorWheel = this.colorWheel = new cymk.HarmonyWheel(can);
        //stage.addChildAt(colorWheel, 0);
        stage.update();
    };


    imageObj.src = "/regularWheel.png";
}

Template.harmony.events({
    'click .btnAddToPalette': function(e){
        var data = cymk.colorWheel.getCrossHairs();
        if (data.length <= 0){
            alert("Please choose some swatches by clicking in the Color Wheel");
        } else {
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
        }
    },

    'selectstart canvas': function(e){
        return false;
    }
});