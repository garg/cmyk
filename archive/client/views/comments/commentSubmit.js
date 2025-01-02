Template.commentSubmit.events({
    'submit form': function(e, template) {
        e.preventDefault();
        //TODO: If errors collection has length greater than 1
        Errors.clearSeen();
        var $body = $(e.target).find('[name=body]');
        var comment = {
            body: $body.val(),
            paletteId: template.data._id
        };
        //console.log(template.data._id);
        Meteor.call('comment', comment, function(error, commentId) {
            if (error){
                Errors.throw(error.reason);
            } else {
                $body.val('');
            }
        });
    }
});