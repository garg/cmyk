newPalettesHandle = Meteor.subscribeWithPagination('newPalettes', 12);
bestPalettesHandle = Meteor.subscribeWithPagination('bestPalettes', 12);

Meteor.subscribe('notifications');