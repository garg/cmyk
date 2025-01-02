/*Template.stage.regularWheel = function(){
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
        ctx.save();
        ctx.rotate(ang - (90 * (Math.PI/180)));     // TODO: 90 * blabla to move red to 0 degrees to be like HSL
        grad = ctx.createLinearGradient(0, radius - thickness, 0, radius);
        grad.addColorStop(0, 'white');

        h = ang * 180 / Math.PI; //hue is in degrees. each 0.1 degree is a color
        s = '100%';
        l = '50%';
        var hsl = 'hsl('+[h,s,l].join()+')';

        grad.addColorStop(.5, hsl);
        grad.addColorStop(1, 'black');
        ctx.fillStyle = grad;

        ctx.fillRect(0, radius - thickness, (2* Math.PI * radius)/720, radius);
        ctx.restore();
    }

    return can;
}*/

Template.stage.regularWheel = function(){
    var can = document.createElement('canvas');
    can.width = 650;
    can.height = 650;
    var ctx = can.getContext("2d");

    var imageObj = new Image();
    imageObj.onload = function () {
        ctx.drawImage(imageObj, 0, 0, 500, 500);
        console.log(can);
        return can;
    };


    imageObj.src = "/regularWheel.png";
}



Template.stage.rendered = function(){
    stage = new createjs.Stage("myCanvas");

    stage.canvas.width = 500;
    stage.canvas.height = 1000;

    //TODO: MAKE THIS LOAD FASTER DONT RERENDER
    if (typeof can === 'undefined'){
        var can = Template.stage.regularWheel();
    }

    if (!this.colorWheel){
        colorWheel = this.colorWheel = new cymk.HarmonyWheel(can);
    }
    //TODO: add some checks here so this doesn't called called unless i'm loading something
    //    for (var swatch=0; swatch < this.data.swatches.length; swatch++){
     //       cymk.colorWheel.loadCrossHairs(this.data.swatches[swatch].x, this.data.swatches[swatch].y);
    //    }

    stage.update();
}

Template.LocalPalette.helpers({
    swatches: function(){
        return LocalPalette.find();

        //TODO: reverse natural order sort?
        //.sort({$natural: -1});//({}, {sort: {'_id': -1}}); //.fetch();
        /*
        var AnswersArr = new Array();

        var tempCollection = LocalPalette.find({});
        tempCollection.forEach(function(data){
            var obj = {ansNo: data.asnNo, ansBody: data.ansBody};
            AnswersArr.push(abj);
        });

        AnswersArr.sort(function(a, b){return b.ansNo - a.ansNo;});  //sort in reverse order

        return AnswersArr;/*
        */
    }
});

Template.LocalPalette.events({
    'click .del-swatch': function (e) {
        e.preventDefault();
        var currentSwatchId = this._id;
        LocalPalette.remove(currentSwatchId);

    }
});

Template.palette.events({
    'submit form': function(e){
        e.preventDefault();

        if (!Meteor.user()) {
            alert("Please log in to save a palette");
            return;
        }

        var data = LocalPalette.find().fetch();

        if (data.length <= 0) {
            alert('Please add some colors to the palette before submitting');
            return;
        }

        if ($("#paletteFormName").val() === "") {
            alert('Please fill out the palette name');
            return;
        }

        var palette = {
            name: $(e.target).find('[name=name]').val(),
            swatches: data
        }

        //palette._id = Palettes.insert(palette);
        Meteor.call('palette', palette, function(error, id){
            if (error){
                Errors.throw(error.reason);
            }
            console.log(id);
            LocalPalette.remove({});
            Router.go('palettePage',{_id: id});
        });

    }
});

Template.paletteEdit.events({
    'submit form': function(e){
        e.preventDefault();


        if (!Meteor.user()) {
            alert("Please log in to save a palette");
        }

        if ($("#paletteFormName").val() === "") {
            alert('Please fill out the palette name');
            return;
        }

        var currentPaletteId = this._id;
        //var data = colorWheel.getCrossHairs();

        if (data.length <= 0) {
            alert('Please add some colors to the palette before submitting');
            return;
        }

        var paletteProperties = {
            name: $(e.target).find('[name=name]').val(),
            swatches: colorWheel.getCrossHairs()
        }

        Palettes.update(currentPaletteId, {$set: paletteProperties}, function(error){
            if (error) {
                alert(error.reason);
            } else {
                Router.go('palettePage',{_id: currentPaletteId});
            }
        });
    },
    'click .delete': function(e){
        e.preventDefault();

        if (confirm('Delete this post?')) {
            var currentPaletteId = this._id;
            Palettes.remove(currentPaletteId);
            Router.go('paletteList');
        }
    }
});