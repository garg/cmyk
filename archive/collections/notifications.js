Notifications = new Meteor.Collection('notifications');

Notifications.allow({
    update: ownsDocument
});

createCommentNotification = function(comment){
    var palette = Palettes.findOne(comment.paletteId);
    if (comment.userId !== palette.userId) {
        Notifications.insert({
            userId: palette.userId,
            paletteId: palette._id,
            commentId: comment._id,
            commenterName: comment.author,
            read: false
        });
    }
};