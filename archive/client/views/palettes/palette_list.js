Template.newPalettes.helpers({
    options: function () {
        return {
            sort: {submitted: -1},
            handle: newPalettesHandle
        }
    }
});

Template.bestPalettes.helpers({
    options: function () {
        return {
            sort: {votes: -1, submitted: -1},
            handle: bestPalettesHandle
        }
    }
});

Template.paletteList.helpers({
    palettes: function () {
        return Palettes.find({}, {sort: this.sort, limit: this.handle.limit()});
    },
    palettesReady: function() {
        return ! this.handle.loading();
    },
    allPalettesLoaded: function() {
        return ! this.handle.loading() && Palettes.find().count() < this.handle.loaded();
    }
});

Template.paletteList.events({
    'click .load-more': function(e) {
        e.preventDefault();
        this.handle.loadNextPage();
    }
});

Template.paletteItem.helpers({
    ownPost: function(){
        return this.userId == Meteor.userId();
    },
    upvotedClass: function () {
        var userId = Meteor.userId();
        if (userId && !_.include(this.upvoters, userId)) {
            return 'btn-primary upvotable';
        } else {
            return 'disabled';
        }
    }
});

Template.paletteItem.events({
    'click .upvotable': function(e){
        e.preventDefault();
        Meteor.call('upvote', this._id);
    }
});

