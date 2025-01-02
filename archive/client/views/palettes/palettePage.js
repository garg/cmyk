Template.palettePage.helpers({
    comments: function() {
        return Comments.find({paletteId: this._id});
    },

    aseObject: function () {
        return ;
    }


});


Template.palettePage.events({
    'click #exportASE': function (e) {
        e.preventDefault();
        console.log(this.name);
        console.log(this.swatches);

        var colorObject = {};
        colorObject.title = this.name;

        colorObject.colors = [];
        this.swatches.forEach(function (swatch) {
            //console.log(swatch);
            colorObject.colors.push([swatch.hexValue, swatch.longName, swatch.rgbValue[0], swatch.rgbValue[1], swatch.rgbValue[2]]);
        });

        console.log(colorObject);
/*
        colorObject = {"title": "Fade to Purple","colors": [
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
        cymk.makeASE(colorObject);
    }
})
