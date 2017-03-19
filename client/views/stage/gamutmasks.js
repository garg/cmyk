Template.stage.yurmbyWheel = function(){
    var can = document.createElement('canvas');
    can.width = 500;
    can.height = 500;

    var ctx = can.getContext('2d'),
        radius = 250,
        thickness = 250,
        p = {
            x: can.width/2,
            y: can.height/2
        },
        start = 0,
        end = Math.PI * 2,
        step = 0.1 * (Math.PI / 180), //step by 0.1 degree angles (step radians)
        ang = 0,
        newAng = 0,
        grad,
        r = 0,
        g = 0,
        b = 0,
        pct = 0;

    ctx.translate(p.x, p.y);

    for (ang = start; ang <= end; ang += step) {
        // Figure out better way of doing this. Good candidate for loop
        if ((ang >= (15 * (Math.PI/180))) && (ang <= (45 * (Math.PI/180)))) {
            newAng = 30 * (Math.PI/180);
        } else if ((ang >= (45 * (Math.PI/180))) && (ang <= (75 * (Math.PI/180)))) {
            newAng = 60 * (Math.PI/180);
        } else if ((ang >= (75 * (Math.PI/180))) && (ang <= ( 105 * (Math.PI/180)))) {
            newAng = 90 * (Math.PI/180);
        } else if ((ang >= (105* (Math.PI/180))) && (ang <= (135* (Math.PI/180)))){
            newAng = 120 * (Math.PI/180);
        } else if ((ang >= (135 * (Math.PI/180))) && (ang <= (165* (Math.PI/180)))){
            newAng = 150 * (Math.PI/180);
        } else if ((ang >= (165 * (Math.PI/180))) && (ang <= ( 195 * (Math.PI/180)))){
            newAng = 180 * (Math.PI/180);
        } else if ((ang >= (195 * (Math.PI/180))) && (ang <= (225 * (Math.PI/180)))){
            newAng = 210 * (Math.PI/180);
        } else if ((ang >= (225 * (Math.PI/180))) && (ang <= (255 * (Math.PI/180)))){
            newAng = 240 * (Math.PI/180);
        } else if ((ang >= (255 * (Math.PI/180))) && (ang <= (285 * (Math.PI/180)))){
            newAng = 270 * (Math.PI/180);
        } else if ((ang >= (285 * (Math.PI/180))) && (ang <= (315 * (Math.PI/180)))){
            newAng = 300 * (Math.PI/180);
        } else if ((ang >= (315 * (Math.PI/180))) && (ang <= (345 * (Math.PI/180)))){
            newAng = 330 * (Math.PI/180);
        } else {
            newAng = 0 * (Math.PI/180);
        }

        ctx.save();
        ctx.rotate(-(ang+90));
        grad = ctx.createLinearGradient(0, radius - thickness, 0, radius);
        grad.addColorStop(0, 'gray');

        h = newAng * 180 / Math.PI; //hue is in degrees. each 0.1 degree is a color
        s = '100%';
        l = '50%';
        var hsl = 'hsl('+[h,s,l].join()+')';

        grad.addColorStop(1, hsl);
        //grad.addColorStop(1, 'black');
        ctx.fillStyle = grad;

        ctx.fillRect(0, radius - thickness, (2* Math.PI * radius)/720, radius);
        ctx.restore();
    }

    return can;
}

Template.gamutCirc.rendered = function(){
    stage = new createjs.Stage("myCanvas");
    createjs.Touch.enable(stage);
    stage.enableMouseOver(10);
    stage.mouseMoveOutside = true;


    stage.canvas.width = 650;
    stage.canvas.height = 650;

    var can = document.createElement('canvas');
    can.width = 500;
    can.height = 500;
    var ctx = can.getContext("2d");

    var imageObj = new Image();
    imageObj.onload = function () {
        ctx.drawImage(imageObj, 0, 0, 500, 500);
        colorWheel = this.colorWheel = new cymk.GamutWheel(can);
        stage.update();
    };
    imageObj.src = "/yurmbyWheel.png";
}

Template.gamut.events({
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