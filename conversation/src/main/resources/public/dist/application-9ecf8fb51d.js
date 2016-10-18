/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var entcore_1 = __webpack_require__(1);
	var controller_1 = __webpack_require__(2);
	entcore_1.routes.define(function ($routeProvider) {
	    $routeProvider
	        .when("/read-mail/:mailId", {
	        action: "readMail"
	    })
	        .when("/write-mail/:userId", {
	        action: "writeMail"
	    })
	        .when('/inbox', {
	        action: 'inbox'
	    })
	        .otherwise({
	        redirectTo: "/inbox"
	    });
	});
	entcore_1.ng.controllers.push(controller_1.conversationController);
	


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = entcore;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var entcore_1 = __webpack_require__(1);
	var conversation_1 = __webpack_require__(3);
	var jquery_1 = __webpack_require__(1);
	var underscore_1 = __webpack_require__(5);
	exports.conversationController = entcore_1.ng.controller('ConversationController', [
	    '$scope', '$timeout', 'model', 'route', function ($scope, $timeout, model, route) {
	        $scope.viewsContainers = {};
	        $scope.selection = {
	            selectAll: false
	        };
	        $scope.conversation = conversation_1.conversation;
	        $scope.openView = function (view, name) {
	            $scope.users.found = [];
	            $scope.users.search = '';
	            $scope.newItem = new conversation_1.Mail();
	            $scope.selection.selectAll = false;
	            var viewsPath = '/conversation/public/template/';
	            $scope.viewsContainers[name] = viewsPath + view + '.html';
	        };
	        route({
	            readMail: function (params) {
	                conversation_1.conversation.folders.openFolder('inbox');
	                entcore_1.template.open('page', 'folders');
	                $scope.readMail(new conversation_1.Mail({ id: params.mailId }));
	            },
	            writeMail: function (params) {
	                conversation_1.conversation.folders.openFolder('inbox');
	                conversation_1.conversation.users.on('sync', function () {
	                    if (this.findWhere({ id: params.userId })) {
	                        entcore_1.template.open('page', 'folders');
	                        new conversation_1.User({ id: params.userId }).findData(function () {
	                            $scope.openView('write-mail', 'main');
	                            $scope.addUser(this);
	                        });
	                    }
	                    else {
	                        entcore_1.template.open('page', 'e401');
	                    }
	                });
	            },
	            inbox: function () {
	                conversation_1.conversation.folders.openFolder('inbox');
	                entcore_1.template.open('page', 'folders');
	            }
	        });
	        $scope.lang = entcore_1.idiom;
	        $scope.notify = entcore_1.notify;
	        $scope.folders = conversation_1.conversation.folders;
	        $scope.userFolders = conversation_1.conversation.userFolders;
	        $scope.users = { list: conversation_1.conversation.users, search: '', found: [], foundCC: [] };
	        $scope.maxDepth = conversation_1.conversation.maxFolderDepth;
	        $scope.newItem = new conversation_1.Mail();
	        $scope.openView('inbox', 'main');
	        $scope.formatFileType = entcore_1.workspace.Document.role;
	        $scope.clearSearch = function () {
	            $scope.users.found = [];
	            $scope.users.search = '';
	        };
	        $scope.clearCCSearch = function () {
	            $scope.users.foundCC = [];
	            $scope.users.searchCC = '';
	        };
	        $scope.resetScope = function () {
	            $scope.openInbox();
	        };
	        $scope.containsView = function (name, view) {
	            var viewsPath = '/conversation/public/template/';
	            return $scope.viewsContainers[name] === viewsPath + view + '.html';
	        };
	        $scope.openFolder = function (folderName) {
	            if (!folderName) {
	                if (conversation_1.conversation.currentFolder instanceof conversation_1.UserFolder) {
	                    $scope.openUserFolder(conversation_1.conversation.currentFolder, {});
	                    return;
	                }
	                folderName = conversation_1.conversation.currentFolder.folderName;
	            }
	            $scope.mail = undefined;
	            conversation_1.conversation.folders.openFolder(folderName);
	            $scope.openView(folderName, 'main');
	        };
	        $scope.openUserFolder = function (folder, obj) {
	            $scope.mail = undefined;
	            conversation_1.conversation.currentFolder = folder;
	            folder.mails.full = false;
	            folder.pageNumber = 0;
	            obj.template = '';
	            folder.userFolders.sync(function () {
	                $timeout(function () {
	                    obj.template = 'folder-content';
	                }, 10);
	            });
	            folder.mails.sync();
	            $scope.openView('folder', 'main');
	            $timeout(function () {
	                jquery_1.$('body').trigger('whereami.update');
	            }, 100);
	        };
	        $scope.isParentOf = function (folder, targetFolder) {
	            if (!targetFolder || !targetFolder.parentFolder)
	                return false;
	            var ancestor = targetFolder.parentFolder;
	            while (ancestor) {
	                if (folder.id === ancestor.id)
	                    return true;
	                ancestor = ancestor.parentFolder;
	            }
	            return false;
	        };
	        $scope.getSystemFolder = function (mail) {
	            if (mail.from !== model.me.userId && mail.state === "SENT")
	                return 'INBOX';
	            if (mail.from === model.me.userId && mail.state === "SENT")
	                return 'OUTBOX';
	            if (mail.from === model.me.userId && mail.state === "DRAFT")
	                return 'DRAFT';
	            return '';
	        };
	        $scope.matchSystemIcon = function (mail) {
	            var systemFolder = $scope.getSystemFolder(mail);
	            if (systemFolder === "INBOX")
	                return 'mail-in';
	            if (systemFolder === "OUTBOX")
	                return 'mail-out';
	            if (systemFolder === "DRAFT")
	                return 'mail-new';
	            return '';
	        };
	        $scope.variableMailAction = function (mail) {
	            var systemFolder = $scope.getSystemFolder(mail);
	            if (systemFolder === "DRAFT")
	                return $scope.editDraft(mail);
	            else if (systemFolder === "OUTBOX")
	                return $scope.viewMail(mail);
	            else
	                return $scope.readMail(mail);
	        };
	        $scope.removeFromUserFolder = function (event, mail) {
	            conversation_1.conversation.currentFolder.mails.selection().forEach(function (mail) {
	                mail.removeFromFolder();
	            });
	            conversation_1.conversation.currentFolder.mails.removeSelection();
	        };
	        $scope.nextPage = function () {
	            conversation_1.conversation.currentFolder.nextPage();
	        };
	        $scope.switchSelectAll = function () {
	            if ($scope.selection.selectAll) {
	                conversation_1.conversation.currentFolder.mails.selectAll();
	                if (conversation_1.conversation.currentFolder.userFolders)
	                    conversation_1.conversation.currentFolder.userFolders.selectAll();
	            }
	            else {
	                conversation_1.conversation.currentFolder.mails.deselectAll();
	                if (conversation_1.conversation.currentFolder.userFolders)
	                    conversation_1.conversation.currentFolder.userFolders.deselectAll();
	            }
	        };
	        function setCurrentMail(mail, doNotSelect) {
	            conversation_1.conversation.currentFolder.mails.current = mail;
	            conversation_1.conversation.currentFolder.mails.deselectAll();
	            if (!doNotSelect)
	                conversation_1.conversation.currentFolder.mails.current.selected = true;
	            $scope.mail = mail;
	        }
	        $scope.viewMail = function (mail) {
	            $scope.openView('view-mail', 'main');
	            setCurrentMail(mail);
	            mail.open();
	        };
	        $scope.refresh = function () {
	            entcore_1.notify.info('updating');
	            conversation_1.conversation.currentFolder.mails.refresh();
	            conversation_1.conversation.folders.inbox.countUnread();
	        };
	        $scope.readMail = function (mail) {
	            $scope.openView('read-mail', 'main');
	            setCurrentMail(mail, true);
	            mail.open(function () {
	                if (!mail.state) {
	                    entcore_1.template.open('page', 'e404');
	                }
	                $scope.$root.$emit('refreshMails');
	            });
	        };
	        $scope.transfer = function () {
	            $scope.openView('write-mail', 'main');
	            $scope.newItem.parentConversation = $scope.mail;
	            $scope.newItem.setMailContent($scope.mail, 'transfer');
	            conversation_1.conversation.folders.draft.transfer($scope.newItem);
	        };
	        $scope.reply = function () {
	            $scope.openView('write-mail', 'main');
	            $scope.newItem.parentConversation = $scope.mail;
	            $scope.newItem.setMailContent($scope.mail, 'reply');
	            $scope.addUser($scope.mail.sender());
	        };
	        $scope.replyAll = function () {
	            $scope.openView('write-mail', 'main');
	            $scope.newItem.parentConversation = $scope.mail;
	            $scope.newItem.setMailContent($scope.mail, 'reply', true);
	            $scope.newItem.to = underscore_1._.filter($scope.newItem.to, function (user) { return user.id !== model.me.userId; });
	            $scope.newItem.cc = underscore_1._.filter($scope.newItem.cc, function (user) {
	                return user.id !== model.me.userId && !underscore_1._.findWhere($scope.newItem.to, { id: user.id });
	            });
	            if (!underscore_1._.findWhere($scope.newItem.to, { id: $scope.mail.sender().id }))
	                $scope.addUser($scope.mail.sender());
	        };
	        $scope.editDraft = function (draft) {
	            $scope.openView('write-mail', 'main');
	            draft.open();
	            $scope.newItem = draft;
	        };
	        $scope.saveDraft = function () {
	            entcore_1.notify.info('draft.saved');
	            conversation_1.conversation.folders.draft.saveDraft($scope.newItem);
	            $scope.openFolder(conversation_1.conversation.folders.draft.folderName);
	        };
	        $scope.sendMail = function () {
	            $scope.newItem.send();
	            $scope.openFolder(conversation_1.conversation.folders.outbox.folderName);
	        };
	        $scope.restore = function () {
	            if (conversation_1.conversation.folders.trash.mails.selection().length > 0)
	                conversation_1.conversation.folders.trash.restoreMails();
	            if (conversation_1.conversation.folders.trash.userFolders) {
	                var launcher = new conversation_1.Launcher(conversation_1.conversation.folders.trash.userFolders.selection().length, function () {
	                    conversation_1.conversation.folders.trash.userFolders.sync();
	                    $scope.refreshFolders();
	                });
	                underscore_1._.forEach(conversation_1.conversation.folders.trash.userFolders.selection(), function (userFolder) {
	                    userFolder.restore().done(function () {
	                        launcher.launch();
	                    });
	                });
	            }
	        };
	        $scope.removeSelection = function () {
	            if (conversation_1.conversation.currentFolder.mails.selection().length > 0) {
	                conversation_1.conversation.currentFolder.mails.removeMails();
	            }
	            if (conversation_1.conversation.currentFolder.userFolders) {
	                var launcher = new conversation_1.Launcher(conversation_1.conversation.currentFolder.userFolders.selection().length, function () {
	                    conversation_1.conversation.currentFolder.sync();
	                    $scope.refreshFolders();
	                    $scope.getQuota();
	                });
	                underscore_1._.forEach(conversation_1.conversation.currentFolder.userFolders.selection(), function (userFolder) {
	                    userFolder.delete().done(function () {
	                        launcher.launch();
	                    });
	                });
	            }
	        };
	        $scope.allReceivers = function (mail) {
	            var receivers = mail.to.slice(0);
	            mail.toName && mail.toName.forEach(function (deletedReceiver) {
	                receivers.push({
	                    deleted: true,
	                    displayName: deletedReceiver
	                });
	            });
	            return receivers;
	        };
	        $scope.filterUsers = function (mail) {
	            return function (user) {
	                if (user.deleted) {
	                    return true;
	                }
	                var mapped = mail.map(user);
	                return typeof mapped !== 'undefined' && typeof mapped.displayName !== 'undefined' && mapped.displayName.length > 0;
	            };
	        };
	        $scope.updateFoundCCUsers = function () {
	            var include = [];
	            var exclude = $scope.newItem.cc || [];
	            if ($scope.mail) {
	                include = underscore_1._.map($scope.mail.displayNames, function (item) {
	                    return new conversation_1.User({ id: item[0], displayName: item[1] });
	                });
	            }
	            $scope.users.foundCC = conversation_1.conversation.users.findUser($scope.users.searchCC, include, exclude);
	        };
	        $scope.updateFoundUsers = function () {
	            var include = [];
	            var exclude = $scope.newItem.to || [];
	            if ($scope.mail) {
	                include = underscore_1._.map($scope.mail.displayNames, function (item) {
	                    return new conversation_1.User({ id: item[0], displayName: item[1] });
	                });
	            }
	            $scope.users.found = conversation_1.conversation.users.findUser($scope.users.search, include, exclude);
	        };
	        $scope.addUser = function (user) {
	            if (!$scope.newItem.to) {
	                $scope.newItem.to = [];
	            }
	            if (user) {
	                $scope.newItem.currentReceiver = user;
	            }
	            $scope.newItem.to.push($scope.newItem.currentReceiver);
	        };
	        $scope.removeUser = function (user) {
	            $scope.newItem.to = underscore_1._.reject($scope.newItem.to, function (item) { return item === user; });
	        };
	        $scope.addCCUser = function (user) {
	            if (!$scope.newItem.cc) {
	                $scope.newItem.cc = [];
	            }
	            if (user) {
	                $scope.newItem.currentCCReceiver = user;
	            }
	            $scope.newItem.cc.push($scope.newItem.currentCCReceiver);
	        };
	        $scope.removeCCUser = function (user) {
	            $scope.newItem.cc = underscore_1._.reject($scope.newItem.cc, function (item) { return item === user; });
	        };
	        $scope.template = entcore_1.template;
	        $scope.lightbox = {};
	        $scope.rootFolderTemplate = { template: 'folder-root-template' };
	        $scope.refreshFolders = function () {
	            $scope.userFolders.sync(function () {
	                $scope.rootFolderTemplate.template = "";
	                $timeout(function () {
	                    $scope.$apply();
	                    $scope.rootFolderTemplate.template = 'folder-root-template';
	                }, 100);
	            });
	        };
	        $scope.currentFolderDepth = function () {
	            if (!($scope.currentFolder instanceof conversation_1.UserFolder))
	                return 0;
	            return $scope.currentFolder.depth();
	        };
	        $scope.moveSelection = function () {
	            $scope.destination = {};
	            $scope.lightbox.show = true;
	            entcore_1.template.open('lightbox', 'move-mail');
	        };
	        $scope.moveToFolderClick = function (folder, obj) {
	            obj.template = '';
	            if (folder.userFolders.length() > 0) {
	                $timeout(function () {
	                    obj.template = 'move-folders-content';
	                }, 10);
	                return;
	            }
	            folder.userFolders.sync(function () {
	                $timeout(function () {
	                    obj.template = 'move-folders-content';
	                }, 10);
	            });
	        };
	        $scope.moveMessages = function (folderTarget) {
	            $scope.lightbox.show = false;
	            entcore_1.template.close('lightbox');
	            conversation_1.conversation.currentFolder.mails.moveSelection(folderTarget);
	        };
	        $scope.openNewFolderView = function () {
	            $scope.newFolder = new conversation_1.UserFolder();
	            if (conversation_1.conversation.currentFolder instanceof conversation_1.UserFolder) {
	                $scope.newFolder.parentFolderId = conversation_1.conversation.currentFolder.id;
	            }
	            $scope.lightbox.show = true;
	            entcore_1.template.open('lightbox', 'create-folder');
	        };
	        $scope.createFolder = function () {
	            $scope.newFolder.create().done(function () {
	                $scope.refreshFolders();
	            });
	            $scope.lightbox.show = false;
	            entcore_1.template.close('lightbox');
	        };
	        $scope.openRenameFolderView = function (folder) {
	            $scope.targetFolder = new conversation_1.UserFolder();
	            $scope.targetFolder.name = folder.name;
	            $scope.targetFolder.id = folder.id;
	            $scope.lightbox.show = true;
	            entcore_1.template.open('lightbox', 'update-folder');
	        };
	        $scope.updateFolder = function () {
	            var current = $scope.currentFolder;
	            $scope.targetFolder.update().done(function () {
	                current.name = $scope.targetFolder.name;
	                $scope.$apply();
	            });
	            $scope.lightbox.show = false;
	            entcore_1.template.close('lightbox');
	        };
	        $scope.trashFolder = function (folder) {
	            folder.trash().done(function () {
	                $scope.refreshFolders();
	                $scope.openFolder('trash');
	            });
	        };
	        $scope.restoreFolder = function (folder) {
	            folder.restore().done(function () {
	                $scope.refreshFolders();
	            });
	        };
	        $scope.deleteFolder = function (folder) {
	            folder.delete().done(function () {
	                $scope.refreshFolders();
	            });
	        };
	        var letterIcon = document.createElement("img");
	        letterIcon.src = entcore_1.skin.theme + ".." + "/img/icons/message-icon.png";
	        $scope.drag = function (item, $originalEvent) {
	            $originalEvent.dataTransfer.setDragImage(letterIcon, 0, 0);
	            try {
	                $originalEvent.dataTransfer.setData('application/json', JSON.stringify(item));
	            }
	            catch (e) {
	                $originalEvent.dataTransfer.setData('Text', JSON.stringify(item));
	            }
	        };
	        $scope.dropCondition = function (targetItem) {
	            return function (event) {
	                var dataField = event.dataTransfer.types.indexOf && event.dataTransfer.types.indexOf("application/json") > -1 ? "application/json" :
	                    event.dataTransfer.types.contains && event.dataTransfer.types.contains("application/json") ? "application/json" :
	                        event.dataTransfer.types.contains && event.dataTransfer.types.contains("Text") ? "Text" :
	                            undefined;
	                if (targetItem.foldersName && targetItem.foldersName !== 'trash')
	                    return undefined;
	                return dataField;
	            };
	        };
	        $scope.dropTo = function (targetItem, $originalEvent) {
	            var dataField = $scope.dropCondition(targetItem)($originalEvent);
	            var originalItem = JSON.parse($originalEvent.dataTransfer.getData(dataField));
	            if (targetItem.folderName === 'trash')
	                $scope.dropTrash(originalItem);
	            else
	                $scope.dropMove(originalItem, targetItem);
	        };
	        $scope.dropMove = function (mail, folder) {
	            var mailObj = new conversation_1.Mail();
	            mailObj.id = mail.id;
	            mailObj.move(folder);
	        };
	        $scope.dropTrash = function (mail) {
	            var mailObj = new conversation_1.Mail();
	            mailObj.id = mail.id;
	            mailObj.trash();
	        };
	        //Given a data size in bytes, returns a more "user friendly" representation.
	        $scope.getAppropriateDataUnit = conversation_1.quota.appropriateDataUnit;
	        $scope.formatSize = function (size) {
	            var formattedData = $scope.getAppropriateDataUnit(size);
	            return (Math.round(formattedData.nb * 10) / 10) + " " + formattedData.order;
	        };
	        $scope.postAttachments = function () {
	            if (!$scope.newItem.id) {
	                conversation_1.conversation.folders.draft.saveDraft($scope.newItem)
	                    .then(function () { return $scope.newItem.postAttachments(); });
	            }
	            else {
	                $scope.newItem.postAttachments();
	            }
	        };
	        $scope.deleteAttachment = function (event, attachment, mail) {
	            mail.deleteAttachment(attachment);
	        };
	        $scope.quota = conversation_1.quota;
	        $scope.sortBy = {
	            name: function (mail) {
	                var systemFolder = $scope.getSystemFolder(mail);
	                if (systemFolder === 'INBOX') {
	                    if (mail.fromName)
	                        return mail.fromName;
	                    else
	                        return mail.sender().displayName;
	                }
	                return underscore_1._.chain(mail.displayNames)
	                    .filter(function (u) { return mail.to.indexOf(u[0]) >= 0; })
	                    .map(function (u) { return u[1]; }).value().sort();
	            },
	            subject: function (mail) {
	                return mail.subject;
	            },
	            date: function (mail) {
	                return mail.date;
	            },
	            systemFolder: function (mail) {
	                var systemFolder = $scope.getSystemFolder(mail);
	                if (systemFolder === "INBOX")
	                    return 1;
	                if (systemFolder === "OUTBOX")
	                    return 2;
	                if (systemFolder === "DRAFT")
	                    return 3;
	                return 0;
	            }
	        };
	        $scope.setSort = function (box, sortFun) {
	            if (box.sort === sortFun) {
	                box.reverse = !box.reverse;
	            }
	            else {
	                box.sort = sortFun;
	                box.reverse = false;
	            }
	        };
	    }]);
	


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright © WebServices pour l'Éducation, 2014
	//
	// This file is part of ENT Core. ENT Core is a versatile ENT engine based on the JVM.
	//
	// This program is free software; you can redistribute it and/or modify
	// it under the terms of the GNU Affero General Public License as
	// published by the Free Software Foundation (version 3 of the License).
	//
	// For the sake of explanation, any module that communicate over native
	// Web protocols, such as HTTP, with ENT Core is outside the scope of this
	// license and could be license under its own terms. This is merely considered
	// normal use of ENT Core, and does not fall under the heading of "covered work".
	//
	// This program is distributed in the hope that it will be useful,
	// but WITHOUT ANY WARRANTY; without even the implied warranty of
	// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	var entcore_1 = __webpack_require__(1);
	var folder_1 = __webpack_require__(4);
	var user_1 = __webpack_require__(7);
	var quota_1 = __webpack_require__(8);
	var Launcher = (function () {
	    function Launcher(countdown, action) {
	        this.count = countdown;
	        this.action = action;
	    }
	    Launcher.prototype.launch = function () {
	        if (!--this.count) {
	            this.action();
	        }
	    };
	    return Launcher;
	}());
	exports.Launcher = Launcher;
	var Conversation = (function (_super) {
	    __extends(Conversation, _super);
	    function Conversation() {
	        var _this = this;
	        _super.call(this);
	        this.collection(user_1.User, new user_1.Users);
	        this.collection(folder_1.Folder, new folder_1.SystemFolders());
	        this.folders.inbox.countUnread();
	        this.collection(folder_1.UserFolder, {
	            sync: function (hook) {
	                var _this = this;
	                entcore_1.http().get('folders/list').done(function (data) {
	                    _this.load(data);
	                    _this.forEach(function (item) {
	                        item.userFolders.sync();
	                    });
	                    if (typeof hook === 'function') {
	                        hook();
	                    }
	                });
	            }
	        });
	        entcore_1.http().get('max-depth').done(function (result) {
	            _this.maxFolderDepth = parseInt(result['max-depth']);
	            _this.trigger('change');
	        });
	    }
	    Conversation.prototype.sync = function () {
	        this.userFolders.sync();
	        this.users.sync();
	        quota_1.quota.refresh();
	    };
	    return Conversation;
	}(entcore_1.Model));
	exports.conversation = new Conversation();
	entcore_1.model.build = function () {
	    exports.conversation.sync();
	};
	__export(__webpack_require__(4));
	__export(__webpack_require__(6));
	__export(__webpack_require__(7));
	__export(__webpack_require__(8));
	


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var entcore_1 = __webpack_require__(1);
	var underscore_1 = __webpack_require__(5);
	var conversation_1 = __webpack_require__(3);
	var mail_1 = __webpack_require__(6);
	var quota_1 = __webpack_require__(8);
	var Folder = (function (_super) {
	    __extends(Folder, _super);
	    function Folder() {
	        _super.apply(this, arguments);
	    }
	    Folder.prototype.nextPage = function () {
	        if (!this.mails.full) {
	            this.pageNumber++;
	            this.mails.sync({ pageNumber: this.pageNumber, emptyList: false });
	        }
	    };
	    return Folder;
	}(entcore_1.Model));
	exports.Folder = Folder;
	var SystemFolder = (function (_super) {
	    __extends(SystemFolder, _super);
	    function SystemFolder(api) {
	        _super.call(this, api);
	        var thatFolder = this;
	        this.pageNumber = 0;
	        this.collection(mail_1.Mail, new mail_1.Mails(api));
	    }
	    return SystemFolder;
	}(Folder));
	exports.SystemFolder = SystemFolder;
	var Trash = (function (_super) {
	    __extends(Trash, _super);
	    function Trash() {
	        _super.call(this, {
	            get: '/conversation/list/trash'
	        });
	        this.folderName = 'trash';
	        this.collection(UserFolder, {
	            sync: function () {
	                var that = this;
	                entcore_1.http().get('folders/list?trash=').done(function (data) {
	                    that.load(data);
	                });
	            }
	        });
	    }
	    Trash.prototype.restoreMails = function () {
	        entcore_1.http().put('/conversation/restore?' + entcore_1.http().serialize({
	            id: underscore_1._.pluck(this.mails.selection(), 'id')
	        }));
	        this.mails.removeSelection();
	        conversation_1.conversation.folders.inbox.mails.refresh();
	        conversation_1.conversation.folders.inbox.mails.refresh();
	        conversation_1.conversation.folders.inbox.mails.refresh();
	    };
	    Trash.prototype.removeMails = function () {
	        var request = entcore_1.http().delete('/conversation/delete?' + entcore_1.http().serialize({
	            id: underscore_1._.pluck(this.mails.selection(), 'id')
	        }));
	        this.mails.removeSelection();
	        return request;
	    };
	    return Trash;
	}(SystemFolder));
	exports.Trash = Trash;
	var Inbox = (function (_super) {
	    __extends(Inbox, _super);
	    function Inbox() {
	        _super.call(this, {
	            get: '/conversation/list/inbox'
	        });
	        this.folderName = 'inbox';
	    }
	    Inbox.prototype.countUnread = function () {
	        var _this = this;
	        entcore_1.http().get('/conversation/count/INBOX', { unread: true }).done(function (data) {
	            _this.nbUnread = parseInt(data.count);
	        });
	    };
	    return Inbox;
	}(SystemFolder));
	exports.Inbox = Inbox;
	var Draft = (function (_super) {
	    __extends(Draft, _super);
	    function Draft() {
	        _super.call(this, {
	            get: '/conversation/list/draft'
	        });
	        this.folderName = 'draft';
	    }
	    Draft.prototype.saveDraft = function (draft) {
	        var _this = this;
	        return new Promise(function (resolve, reject) {
	            draft.saveAsDraft().then(function () {
	                _this.mails.push(draft);
	                resolve();
	            });
	        });
	    };
	    Draft.prototype.transfer = function (mail) {
	        this.saveDraft(mail).then(function (id) {
	            entcore_1.http().put("message/" + mail.id + "/forward/" + mail.id).done(function () {
	                for (var i = 0; i < mail.attachments.length; i++) {
	                    mail.attachments.push(JSON.parse(JSON.stringify(mail.attachments[i])));
	                }
	                quota_1.quota.refresh();
	            }).error(function (data) {
	                entcore_1.notify.error(data.error);
	            });
	        });
	    };
	    return Draft;
	}(SystemFolder));
	exports.Draft = Draft;
	var Outbox = (function (_super) {
	    __extends(Outbox, _super);
	    function Outbox() {
	        _super.call(this, {
	            get: '/conversation/list/outbox'
	        });
	        this.folderName = 'outbox';
	    }
	    return Outbox;
	}(SystemFolder));
	exports.Outbox = Outbox;
	var UserFolder = (function (_super) {
	    __extends(UserFolder, _super);
	    function UserFolder(data) {
	        _super.call(this, data);
	        var thatFolder = this;
	        this.pageNumber = 0;
	        this.collection(UserFolder, {
	            sync: function (hook) {
	                var that = this;
	                entcore_1.http().get('folders/list?parentId=' + thatFolder.id).done(function (data) {
	                    underscore_1._.forEach(data, function (item) {
	                        item.parentFolder = thatFolder;
	                    });
	                    that.load(data);
	                    that.forEach(function (item) {
	                        item.userFolders.sync();
	                    });
	                    if (typeof hook === 'function') {
	                        hook();
	                    }
	                });
	            }
	        });
	        this.collection(mail_1.Mail, {
	            refresh: function () {
	                this.pageNumber = 0;
	                this.sync();
	            },
	            sync: function (pageNumber, emptyList) {
	                if (!pageNumber) {
	                    pageNumber = 0;
	                }
	                var that = this;
	                entcore_1.http().get('/conversation/list/' + thatFolder.id + '?restrain=&page=' + pageNumber).done(function (data) {
	                    data.sort(function (a, b) { return b.date - a.date; });
	                    if (emptyList === false) {
	                        that.addRange(data);
	                        if (data.length === 0) {
	                            that.full = true;
	                        }
	                    }
	                    else {
	                        that.load(data);
	                    }
	                });
	            },
	            removeMails: function () {
	                entcore_1.http().put('/conversation/trash?' + entcore_1.http().serialize({ id: underscore_1._.pluck(this.selection(), 'id') })).done(function () {
	                    conversation_1.conversation.folders.trash.mails.refresh();
	                });
	                this.removeSelection();
	            },
	            moveSelection: function (destinationFolder) {
	                entcore_1.http().put('move/userfolder/' + destinationFolder.id + '?' + entcore_1.http().serialize({ id: underscore_1._.pluck(this.selection(), 'id') })).done(function () {
	                    conversation_1.conversation.currentFolder.mails.refresh();
	                });
	            },
	            removeFromFolder: function () {
	                return entcore_1.http().put('move/root?' + entcore_1.http().serialize({ id: underscore_1._.pluck(this.selection(), 'id') }));
	            }
	        });
	    }
	    UserFolder.prototype.depth = function () {
	        var depth = 1;
	        var ancestor = this.parentFolder;
	        while (ancestor) {
	            ancestor = ancestor.parentFolder;
	            depth = depth + 1;
	        }
	        return depth;
	    };
	    UserFolder.prototype.create = function () {
	        var json = !this.parentFolderId ? {
	            name: this.name
	        } : {
	            name: this.name,
	            parentId: this.parentFolderId
	        };
	        return entcore_1.http().postJson('folder', json);
	    };
	    UserFolder.prototype.update = function () {
	        var json = {
	            name: this.name
	        };
	        return entcore_1.http().putJson('folder/' + this.id, json);
	    };
	    UserFolder.prototype.trash = function () {
	        return entcore_1.http().put('folder/trash/' + this.id);
	    };
	    UserFolder.prototype.restore = function () {
	        return entcore_1.http().put('folder/restore/' + this.id);
	    };
	    UserFolder.prototype.delete = function () {
	        return entcore_1.http().delete('folder/' + this.id);
	    };
	    return UserFolder;
	}(Folder));
	exports.UserFolder = UserFolder;
	var SystemFolders = (function () {
	    function SystemFolders() {
	        var _this = this;
	        this.sync = function () {
	            if (conversation_1.conversation.currentFolder === null) {
	                conversation_1.conversation.currentFolder = _this.inbox;
	            }
	            conversation_1.conversation.currentFolder.mails.sync({ pageNumber: _this.pageNumber });
	        };
	        this.inbox = new Inbox();
	        this.trash = new Trash();
	        this.draft = new Draft();
	        this.outbox = new Outbox();
	    }
	    SystemFolders.prototype.openFolder = function (folderName) {
	        conversation_1.conversation.currentFolder = this[folderName];
	        conversation_1.conversation.currentFolder.mails.sync();
	        conversation_1.conversation.currentFolder.pageNumber = 0;
	        conversation_1.conversation.currentFolder.mails.full = false;
	        if (conversation_1.conversation.currentFolder instanceof Trash) {
	            conversation_1.conversation.currentFolder.userFolders.sync();
	        }
	        conversation_1.conversation.currentFolder.trigger('change');
	    };
	    return SystemFolders;
	}());
	exports.SystemFolders = SystemFolders;
	


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = _;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var entcore_1 = __webpack_require__(1);
	var moment_1 = __webpack_require__(1);
	var underscore_1 = __webpack_require__(5);
	var user_1 = __webpack_require__(7);
	var conversation_1 = __webpack_require__(3);
	var quota_1 = __webpack_require__(8);
	var Attachment = (function () {
	    function Attachment(file) {
	        this.file = file;
	        this.progress = {
	            total: 100,
	            completion: 0
	        };
	    }
	    return Attachment;
	}());
	exports.Attachment = Attachment;
	var Mail = (function (_super) {
	    __extends(Mail, _super);
	    function Mail(data) {
	        _super.call(this, data);
	        this.loadingAttachments = [];
	        this.attachments = [];
	    }
	    Mail.prototype.setMailContent = function (origin, mailType, copyReceivers) {
	        if (origin.subject.indexOf(exports.format[mailType].prefix) === -1) {
	            this.subject = entcore_1.idiom.translate(exports.format[mailType].prefix) + origin.subject;
	        }
	        else {
	            this.subject = origin.subject;
	        }
	        if (copyReceivers) {
	            this.cc = origin.cc;
	            this.to = origin.to;
	        }
	        this.body = exports.format[mailType].content + '<blockquote>' + origin.body + '</blockquote>';
	    };
	    Mail.prototype.sentDate = function () {
	        return moment_1.moment(parseInt(this.date)).calendar();
	    };
	    ;
	    Mail.prototype.longDate = function () {
	        return moment_1.moment(parseInt(this.date)).format('dddd DD MMMM YYYY');
	    };
	    ;
	    Mail.prototype.sender = function () {
	        var that = this;
	        return user_1.User.prototype.mapUser(this.displayNames, this.from);
	    };
	    ;
	    Mail.prototype.map = function (id) {
	        if (id instanceof user_1.User) {
	            return id;
	        }
	        return user_1.User.prototype.mapUser(this.displayNames, id);
	    };
	    ;
	    Mail.prototype.saveAsDraft = function () {
	        var _this = this;
	        return new Promise(function (resolve, reject) {
	            var that = _this;
	            var data = { subject: _this.subject, body: _this.body };
	            data.to = underscore_1._.pluck(_this.to, 'id');
	            data.cc = underscore_1._.pluck(_this.cc, 'id');
	            if (!data.subject) {
	                data.subject = entcore_1.idiom.translate('nosubject');
	            }
	            var path = '/conversation/draft';
	            if (_this.id) {
	                entcore_1.http().putJson(path + '/' + _this.id, data).done(function (newData) {
	                    that.updateData(newData);
	                    conversation_1.conversation.folders.draft.mails.refresh();
	                    resolve();
	                });
	            }
	            else {
	                if (_this.parentConversation) {
	                    path += '?In-Reply-To=' + _this.parentConversation.id;
	                }
	                entcore_1.http().postJson(path, data).done(function (newData) {
	                    that.updateData(newData);
	                    conversation_1.conversation.folders.draft.mails.refresh();
	                    resolve();
	                });
	            }
	        });
	    };
	    ;
	    Mail.prototype.send = function () {
	        var data = { subject: this.subject, body: this.body };
	        data.to = underscore_1._.pluck(this.to, 'id');
	        data.cc = underscore_1._.pluck(this.cc, 'id');
	        if (data.to.indexOf(entcore_1.model.me.userId) !== -1) {
	            conversation_1.conversation.folders['inbox'].nbUnread++;
	        }
	        if (data.cc.indexOf(entcore_1.model.me.userId) !== -1) {
	            conversation_1.conversation.folders['inbox'].nbUnread++;
	        }
	        var path = '/conversation/send?';
	        if (!data.subject) {
	            data.subject = entcore_1.idiom.translate('nosubject');
	        }
	        if (this.id) {
	            path += 'id=' + this.id + '&';
	        }
	        if (this.parentConversation) {
	            path += 'In-Reply-To=' + this.parentConversation.id;
	        }
	        entcore_1.http().postJson(path, data).done(function (result) {
	            conversation_1.conversation.folders['outbox'].mails.refresh();
	            conversation_1.conversation.folders['draft'].mails.refresh();
	            if (parseInt(result.sent) > 0) {
	                entcore_1.notify.info('mail.sent');
	            }
	            var inactives = '';
	            result.inactive.forEach(function (name) {
	                inactives += name + entcore_1.idiom.translate('invalid') + '<br />';
	            });
	            if (result.inactive.length > 0) {
	                entcore_1.notify.info(inactives);
	            }
	            var undelivered = result.undelivered.join(', ');
	            if (result.undelivered.length > 0) {
	                entcore_1.notify.error(undelivered + entcore_1.idiom.translate('undelivered'));
	            }
	        }).e400(function (e) {
	            var error = JSON.parse(e.responseText);
	            entcore_1.notify.error(error.error);
	        });
	    };
	    ;
	    Mail.prototype.open = function (cb) {
	        var that = this;
	        this.unread = false;
	        entcore_1.http().getJson('/conversation/message/' + this.id).done(function (data) {
	            that.updateData(data);
	            that.to = underscore_1._.map(that.to, function (user) {
	                var n = '';
	                var foundUser = underscore_1._.find(that.displayNames, function (name) {
	                    return name[0] === user;
	                });
	                if (foundUser) {
	                    n = foundUser[1];
	                }
	                return new user_1.User({
	                    id: user,
	                    displayName: n
	                });
	            });
	            that.cc = underscore_1._.map(that.cc, function (user) {
	                return new user_1.User({
	                    id: user,
	                    displayName: underscore_1._.find(that.displayNames, function (name) {
	                        return name[0] === user;
	                    })[1]
	                });
	            });
	            conversation_1.conversation.folders['inbox'].countUnread();
	            conversation_1.conversation.currentFolder.mails.refresh();
	            if (typeof cb === 'function') {
	                cb();
	            }
	        });
	    };
	    ;
	    Mail.prototype.remove = function () {
	        if (conversation_1.conversation.currentFolder.folderName !== 'trash') {
	            entcore_1.http().put('/conversation/trash?id=' + this.id).done(function () {
	                conversation_1.conversation.currentFolder.mails.refresh();
	                conversation_1.conversation.folders['trash'].mails.refresh();
	            });
	        }
	        else {
	            entcore_1.http().delete('/conversation/delete?id=' + this.id).done(function () {
	                conversation_1.conversation.folders['trash'].mails.refresh();
	            });
	        }
	    };
	    ;
	    Mail.prototype.removeFromFolder = function () {
	        return entcore_1.http().put('move/root?id=' + this.id);
	    };
	    Mail.prototype.move = function (destinationFolder) {
	        entcore_1.http().put('move/userfolder/' + destinationFolder.id + '?id=' + this.id).done(function () {
	            conversation_1.conversation.currentFolder.mails.refresh();
	        });
	    };
	    Mail.prototype.trash = function () {
	        entcore_1.http().put('/conversation/trash?id=' + this.id).done(function () {
	            conversation_1.conversation.currentFolder.mails.refresh();
	        });
	    };
	    Mail.prototype.postAttachment = function (attachment, options) {
	        return entcore_1.http().postFile("message/" + this.id + "/attachment", attachment, options);
	    };
	    Mail.prototype.postAttachments = function () {
	        var _this = this;
	        underscore_1._.forEach(this.newAttachments, function (targetAttachment) {
	            var attachmentObj = new Attachment(targetAttachment);
	            _this.loadingAttachments.push(attachmentObj);
	            var formData = new FormData();
	            formData.append('file', attachmentObj.file);
	            _this.postAttachment(formData, {
	                xhr: function () {
	                    var xhr = new XMLHttpRequest();
	                    xhr.upload.addEventListener("progress", function (e) {
	                        if (e.lengthComputable) {
	                            var percentage = Math.round((e.loaded * 100) / e.total);
	                            attachmentObj.progress.completion = percentage;
	                            _this.trigger('change');
	                        }
	                    }, false);
	                    return xhr;
	                },
	                complete: function () {
	                    _this.loadingAttachments.splice(_this.loadingAttachments.indexOf(attachmentObj), 1);
	                    _this.trigger('change');
	                }
	            }).done(function (result) {
	                attachmentObj.id = result.id;
	                attachmentObj.filename = attachmentObj.file.name;
	                attachmentObj.size = attachmentObj.file.size;
	                attachmentObj.contentType = attachmentObj.file.type;
	                _this.attachments.push(attachmentObj);
	                quota_1.quota.refresh();
	            }).e400(function (e) {
	                var error = JSON.parse(e.responseText);
	                entcore_1.notify.error(error.error);
	            });
	        });
	    };
	    Mail.prototype.deleteAttachment = function (attachment) {
	        this.attachments.splice(this.attachments.indexOf(attachment), 1);
	        entcore_1.http().delete("message/" + this.id + "/attachment/" + attachment.id)
	            .done(function () {
	            quota_1.quota.refresh();
	        });
	    };
	    return Mail;
	}(entcore_1.Model));
	exports.Mail = Mail;
	var Mails = (function () {
	    function Mails(api) {
	        this.api = api;
	        this.sync = function (data) {
	            var _this = this;
	            if (!data) {
	                data = {};
	            }
	            if (!data.pageNumber) {
	                data.pageNumber = 0;
	            }
	            return entcore_1.http().get(this.api.get + '?page=' + data.pageNumber).done(function (mails) {
	                mails.sort(function (a, b) { return b.date - a.date; });
	                if (data.emptyList === false) {
	                    _this.addRange(mails);
	                    if (mails.length === 0) {
	                        _this.full = true;
	                    }
	                }
	                else {
	                    _this.load(mails);
	                }
	            });
	        };
	    }
	    Mails.prototype.refresh = function () {
	        this.pageNumber = 0;
	        return this.sync();
	    };
	    Mails.prototype.removeMails = function () {
	        entcore_1.http().put('/conversation/trash?' + entcore_1.http().serialize({ id: underscore_1._.pluck(this.selection(), 'id') })).done(function () {
	            conversation_1.conversation.folders.trash.mails.refresh();
	            quota_1.quota.refresh();
	        });
	        this.removeSelection();
	    };
	    Mails.prototype.moveSelection = function (destinationFolder) {
	        entcore_1.http().put('move/userfolder/' + destinationFolder.id + '?' + entcore_1.http().serialize({ id: underscore_1._.pluck(this.selection(), 'id') })).done(function () {
	            conversation_1.conversation.currentFolder.mails.refresh();
	        });
	    };
	    return Mails;
	}());
	exports.Mails = Mails;
	var mailFormat = {
	    reply: {
	        prefix: 'reply.re',
	        content: ''
	    },
	    transfer: {
	        prefix: 'reply.fw',
	        content: ''
	    }
	};
	entcore_1.http().get('/conversation/public/template/mail-content/transfer.html').done(function (content) {
	    exports.format.transfer.content = content;
	});
	entcore_1.http().get('/conversation/public/template/mail-content/reply.html').done(function (content) {
	    exports.format.reply.content = content;
	});
	exports.format = mailFormat;
	


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var entcore_1 = __webpack_require__(1);
	var underscore_1 = __webpack_require__(5);
	var User = (function (_super) {
	    __extends(User, _super);
	    function User(data) {
	        _super.call(this, data);
	    }
	    User.prototype.toString = function () {
	        return (this.displayName || '') + (this.name || '') + (this.profile ? ' (' + entcore_1.idiom.translate(this.profile) + ')' : '');
	    };
	    User.prototype.findData = function (cb) {
	        var that = this;
	        entcore_1.http().get('/userbook/api/person?id=' + this.id).done(function (userData) {
	            that.updateData({ id: that.id, displayName: userData.result[0].displayName });
	            if (typeof cb === "function") {
	                cb.call(that, userData.result[0]);
	            }
	        });
	    };
	    User.prototype.mapUser = function (displayNames, id) {
	        return underscore_1._.map(underscore_1._.filter(displayNames, function (user) {
	            return user[0] === id;
	        }), function (user) {
	            return new User({ id: user[0], displayName: user[1] });
	        })[0];
	    };
	    return User;
	}(entcore_1.Model));
	exports.User = User;
	var Users = (function () {
	    function Users() {
	        this.sync = function () {
	            var _this = this;
	            entcore_1.http().get('/conversation/visible').done(function (data) {
	                underscore_1._.forEach(data.groups, function (group) { group.isGroup = true; });
	                _this.addRange(data.groups);
	                _this.addRange(data.users);
	                _this.trigger('sync');
	            });
	        };
	    }
	    Users.prototype.findUser = function (search, include, exclude) {
	        var searchTerm = entcore_1.idiom.removeAccents(search).toLowerCase();
	        if (!searchTerm) {
	            return [];
	        }
	        var found = underscore_1._.filter(this.filter(function (user) {
	            return underscore_1._.findWhere(include, { id: user.id }) === undefined;
	        })
	            .concat(include), function (user) {
	            var testDisplayName = '', testNameReversed = '';
	            if (user.displayName) {
	                testDisplayName = entcore_1.idiom.removeAccents(user.displayName).toLowerCase();
	                testNameReversed = entcore_1.idiom.removeAccents(user.displayName.split(' ')[1] + ' '
	                    + user.displayName.split(' ')[0]).toLowerCase();
	            }
	            var testName = '';
	            if (user.name) {
	                testName = entcore_1.idiom.removeAccents(user.name).toLowerCase();
	            }
	            return testDisplayName.indexOf(searchTerm) !== -1 ||
	                testNameReversed.indexOf(searchTerm) !== -1 ||
	                testName.indexOf(searchTerm) !== -1;
	        });
	        return underscore_1._.reject(found, function (element) {
	            return underscore_1._.findWhere(exclude, { id: element.id });
	        });
	    };
	    Users.prototype.isGroup = function (id) {
	        return this.findWhere({ isGroup: true, id: id });
	    };
	    return Users;
	}());
	exports.Users = Users;
	


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var entcore_1 = __webpack_require__(1);
	var Quota = (function (_super) {
	    __extends(Quota, _super);
	    function Quota() {
	        _super.call(this);
	        this.max = 1;
	        this.used = 0;
	        this.unit = 'Mo';
	    }
	    Quota.prototype.appropriateDataUnit = function (bytes) {
	        var order = 0;
	        var orders = {
	            0: entcore_1.idiom.translate("byte"),
	            1: "Ko",
	            2: "Mo",
	            3: "Go",
	            4: "To"
	        };
	        var finalNb = bytes;
	        while (finalNb >= 1024 && order < 4) {
	            finalNb = finalNb / 1024;
	            order++;
	        }
	        return {
	            nb: finalNb,
	            order: orders[order]
	        };
	    };
	    Quota.prototype.refresh = function () {
	        var _this = this;
	        entcore_1.http().get('/workspace/quota/user/' + entcore_1.model.me.userId).done(function (data) {
	            //to mo
	            data.quota = data.quota / (1024 * 1024);
	            data.storage = data.storage / (1024 * 1024);
	            if (data.quota > 2000) {
	                data.quota = Math.round((data.quota / 1024) * 10) / 10;
	                data.storage = Math.round((data.storage / 1024) * 10) / 10;
	                _this.unit = 'Go';
	            }
	            else {
	                data.quota = Math.round(data.quota);
	                data.storage = Math.round(data.storage);
	            }
	            _this.max = data.quota;
	            _this.used = data.storage;
	            _this.trigger('change');
	        });
	    };
	    return Quota;
	}(entcore_1.Model));
	;
	exports.quota = new Quota();
	


/***/ }
/******/ ]);
//# sourceMappingURL=application.js.map