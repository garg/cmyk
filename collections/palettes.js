Palettes = new Meteor.Collection('palettes');

Palettes.allow({
    update: ownsDocument,
    remove: ownsDocument
});

Palettes.deny({
    update: function(userId, palette, fieldNames){
        //may only edit the following two fields:
        return (_.without(fieldNames, 'name', 'swatches').length > 0);
    }
});

Meteor.methods({
    palette: function (paletteAttributes) {
        var user = Meteor.user();

        if (!user) {
            throw new Meteor.Error(401, "You need to login to post new palettes");
        }

        if (!paletteAttributes.name) {
            throw new Meteor.Error(422, "Please fill in a name");
        }

        if (paletteAttributes.swatches.length === 0){
            throw new Meteor.Error(422, "Please add some colors to the palette. Hint: Click on the 'Add Swatches to Palette' button");
        }

        var palette = _.extend(_.pick(paletteAttributes, 'name', 'swatches'), {
            userId: user._id,
            creator: user.username,
            submitted: new Date().getTime(),
            commentsCount: 0,
            upvoters: [],
            votes: 0
        });

        var paletteId = Palettes.insert(palette);

        return paletteId;
    },
    upvote: function(paletteId) {
        var user = Meteor.user();
        // ensure logged in
        if (!user){
            throw new Meteor.Error(401, "You need to be logged in to vote");
        }

        Palettes.update({
            _id : paletteId,
            upvoters: {$ne: user._id}
        }, {
            $addToSet: {upvoters: user._id},
            $inc: {votes: 1}
        });

    }
});