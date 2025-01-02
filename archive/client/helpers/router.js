Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound',
    after: function() {
        Errors.clearSeen();
    }

});

Router.map(function() {
    this.route('home', {
        template: 'harmony',
        path: '/'
    });

    this.route('bestPalettes', {
        path: '/best'
    });

    this.route('newPalettes', {
        path: '/new'
    });

    this.route('harmony', {
        path: '/stage/harmony'
    });

    this.route('gamut', {
        path: '/stage/gamut'
    });

    this.route('image', {
        path: '/stage/image'
    });

    this.route('reverseGamut', {
        path: '/stage/reverse'
    });

    this.route('palettePage', {
        path: '/palette/:_id',
        waitOn: function() {
            return [Meteor.subscribe('singlePalette', this.params._id), Meteor.subscribe('comments', this.params._id)];
        },
        data: function () {
            return Palettes.findOne(this.params._id);
        }
    });

    this.route('paletteEdit', {
        path: '/palette/:_id/edit',
        waitOn: function() {
            return Meteor.subscribe('singlePalette', this.params._id);
        },
        data: function () {

            return Palettes.findOne(this.params._id);
        }
    });
});

var requireLogin = function(){
    if (! Meteor.user()) {
        this.render('accessDenied');
        this.stop();
    }
}

Router.before(requireLogin, {only: 'postSubmit'});