"use strict";
var entcore_1 = require('entcore/entcore');
var underscore_1 = require('entcore/libs/underscore/underscore');
entcore_1.Behaviours.register('conversation', {
    rights: {
        workflow: {
            create: 'org.entcore.conversation.controllers.ConversationController|send'
        }
    },
    sniplets: {
        ml: {
            title: 'sniplet.ml.title',
            description: 'sniplet.ml.description',
            controller: {
                init: function () {
                    this.message = {};
                },
                initSource: function () {
                    this.setSnipletSource({});
                },
                send: function () {
                    this.message.to = underscore_1._.map(this.snipletResource.shared, function (shared) { return shared.userId || shared.groupId; });
                    this.message.to.push(this.snipletResource.owner.userId);
                    entcore_1.http().postJson('/conversation/send', this.message).done(function () {
                        entcore_1.notify.info('ml.sent');
                    }).e401(function () { });
                    this.message = {};
                }
            }
        }
    }
});

//# sourceMappingURL=behaviours.js.map
