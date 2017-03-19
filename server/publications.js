Meteor.publish('newPalettes', function (limit) {
    return Palettes.find({}, {sort: {submitted: -1}, limit: limit});
});

Meteor.publish('bestPalettes', function l(limit) {
    return Palettes.find({}, {sort: {votes: -1, submitted: -1}, limit: limit});
});

Meteor.publish('singlePalette', function(id) {
    return id && Palettes.find(id);
});

Meteor.publish('comments', function(paletteId){
    return Comments.find({paletteId: paletteId});
});

Meteor.publish('notifications', function () {
    return Notifications.find({userId: this.userId});
});