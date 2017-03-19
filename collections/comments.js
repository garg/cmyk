Comments = new Meteor.Collection('comments');

Meteor.methods({
    comment: function(commentAttributes) {
        var user = Meteor.user();
        var palette = Palettes.findOne(commentAttributes.paletteId);

        // ensure the user is logged in
        if (!user)
            throw new Meteor.Error(401, "You need to login to make comments");

        if (!commentAttributes.body)
            throw new Meteor.Error(422, 'Please write some content');
        if (!commentAttributes.paletteId)
            throw new Meteor.Error(422, 'You must comment on a palette');

        comment = _.extend(_.pick(commentAttributes, 'paletteId', 'body'), {
            userId: user._id,
            author: user.username,
            submitted: new Date().getTime()
        });

        Palettes.update(comment.paletteId, {$inc: {commentsCount: 1}});
        comment._id = Comments.insert(comment);
        createCommentNotification(comment);
        return comment._id;
    }
});