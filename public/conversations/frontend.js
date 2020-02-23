/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 174);
/******/ })
/************************************************************************/
/******/ ({

/***/ 174:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(175);


/***/ }),

/***/ 175:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__frontend_conversations__ = __webpack_require__(176);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__frontend_conversations___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__frontend_conversations__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__frontend_attachments__ = __webpack_require__(177);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__frontend_attachments___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__frontend_attachments__);



/***/ }),

/***/ 176:
/***/ (function(module, exports) {

/* jshint unused:vars, undef:true, browser:true, jquery:true */
/* global ConcreteEvent, CCM_TOOLS_PATH */

/*
 * $.fn.concreteConversation
 * Functions for conversation handling
 *
 * Events:
 *    beforeInitializeConversation         : Before Conversation Initialized
 *    initializeConversation               : Conversation Initialized
 *    conversationLoaded                   : Conversation Loaded
 *    conversationPostError                : Error posting message
 *    conversationBeforeDeleteMessage      : Before deleting message
 *    conversationDeleteMessage            : Deleting message
 *    conversationDeleteMessageError       : Error deleting message
 *    conversationBeforeAddMessageFromJSON : Before adding message from json
 *    conversationAddMessageFromJSON       : After adding message from json
 *    conversationBeforeUpdateCount        : Before updating message count
 *    conversationUpdateCount              : After updating message count
 *    conversationBeforeSubmitForm         : Before submitting form
 *    conversationSubmitForm               : After submitting form
 */
;(function (global, $) {
    'use strict';

    $.extend($.fn, {
        concreteConversation: function concreteConversation(options) {
            return this.each(function () {
                var $obj = $(this);
                var data = $obj.data('concreteConversation');
                if (!data) {
                    $obj.data('concreteConversation', data = new ConcreteConversation($obj, options));
                }
            });
        }
    });

    var i18n = {
        Confirm_remove_message: 'Remove this message? Replies to it will not be removed.',
        Confirm_mark_as_spam: 'Are you sure you want to flag this message as spam?',
        Warn_currently_editing: 'Please complete or cancel the current message editing session before editing this message.',
        Unspecified_error_occurred: 'An unspecified error occurred.',
        Error_deleting_message: 'Something went wrong while deleting this message, please refresh and try again.',
        Error_flagging_message: 'Something went wrong while flagging this message, please refresh and try again.'
        // Please add new translatable strings to the getConversationsJavascript of /concrete/controllers/frontend/assets_localization.php
    };
    $.fn.concreteConversation.localize = function (dictionary) {
        $.extend(true, i18n, dictionary);
    };

    var ConcreteConversation = function ConcreteConversation(element, options) {
        this.publish("beforeInitializeConversation", { element: element, options: options });
        this.init(element, options);
        this.publish("initializeConversation", { element: element, options: options });
    };
    ConcreteConversation.fn = ConcreteConversation.prototype = {
        publish: function publish(t, f) {
            f = f || {};
            f.ConcreteConversation = this;
            window.ConcreteEvent.publish(t, f);
        },
        init: function init(element, options) {
            var obj = this;

            obj.$element = element;
            obj.options = $.extend({
                method: 'ajax',
                paginate: false,
                displayMode: 'threaded',
                itemsPerPage: -1,
                activeUsers: [],
                uninitialized: true,
                deleteMessageToken: null,
                addMessageToken: null,
                editMessageToken: null,
                flagMessageToken: null
            }, options);

            var enablePosting = obj.options.addMessageToken != '' ? 1 : 0;
            var paginate = obj.options.paginate ? 1 : 0;
            var orderBy = obj.options.orderBy;
            var enableOrdering = obj.options.enableOrdering;
            var displayPostingForm = obj.options.displayPostingForm;
            var enableCommentRating = obj.options.enableCommentRating;
            var enableTopCommentReviews = obj.options.enableTopCommentReviews;
            var displaySocialLinks = obj.options.displaySocialLinks;
            var addMessageLabel = obj.options.addMessageLabel ? obj.options.addMessageLabel : '';
            var dateFormat = obj.options.dateFormat;
            var customDateFormat = obj.options.customDateFormat;
            var blockAreaHandle = obj.options.blockAreaHandle;
            // var maxFiles = (obj.options.maxFiles); unused
            // var maxFileSize = (obj.options.maxFileSize); unused
            // var fileExtensions = (obj.options.fileExtensions); unused
            var attachmentsEnabled = obj.options.attachmentsEnabled;
            var attachmentOverridesEnabled = obj.options.attachmentOverridesEnabled;

            if (obj.options.method == 'ajax') {
                $.post(CCM_TOOLS_PATH + '/conversations/view_ajax', {
                    'cnvID': obj.options.cnvID,
                    'cID': obj.options.cID,
                    'blockID': obj.options.blockID,
                    'enablePosting': enablePosting,
                    'itemsPerPage': obj.options.itemsPerPage,
                    'addMessageLabel': addMessageLabel,
                    'paginate': paginate,
                    'displayMode': obj.options.displayMode,
                    'orderBy': orderBy,
                    'enableOrdering': enableOrdering,
                    'displayPostingForm': displayPostingForm,
                    'enableCommentRating': enableCommentRating,
                    'enableTopCommentReviews': enableTopCommentReviews,
                    'displaySocialLinks': displaySocialLinks,
                    'dateFormat': dateFormat,
                    'customDateFormat': customDateFormat,
                    'blockAreaHandle': blockAreaHandle,
                    'attachmentsEnabled': attachmentsEnabled,
                    'attachmentOverridesEnabled': attachmentOverridesEnabled

                }, function (r) {
                    var oldobj = window.obj;
                    window.obj = obj;
                    obj.$element.empty().append(r);
                    var hash = window.location.hash.match(/^#cnv([0-9]+)Message[0-9]+$/);
                    if (hash !== null && hash[1] == obj.options.cnvID) {
                        var target = $('a' + window.location.hash).offset();
                        $('html, body').animate({ scrollTop: target.top }, 800, 'linear');
                    }
                    window.obj = oldobj;
                    obj.attachBindings();
                    obj.publish('conversationLoaded');
                });
            } else {
                obj.attachBindings();
                obj.finishSetup();
                obj.publish('conversationLoaded');
            }
        },
        mentionList: function mentionList(items, coordinates, bindTo) {
            var obj = this;
            if (!coordinates) return;
            obj.dropdown.parent.css({ top: coordinates.y, left: coordinates.x });
            if (items.length == 0) {
                obj.dropdown.handle.dropdown('toggle');
                obj.dropdown.parent.remove();
                obj.dropdown.active = false;
                obj.dropdown.activeItem = -1;
                return;
            }

            obj.dropdown.list.empty();
            items.slice(0, 20).map(function (item) {
                var listitem = $('<li/>');
                var anchor = $('<a/>').appendTo(listitem).text(item.getName());
                anchor.click(function () {
                    ConcreteEvent.fire('ConversationMentionSelect', { obj: obj, item: item }, bindTo);
                });
                listitem.appendTo(obj.dropdown.list);
            });
            if (!obj.dropdown.active) {
                obj.dropdown.active = true;
                obj.dropdown.activeItem = -1;
                obj.dropdown.parent.appendTo(obj.$element);
                obj.dropdown.handle.dropdown('toggle');
            }
            if (obj.dropdown.activeItem >= 0) obj.dropdown.list.children().eq(obj.dropdown.activeItem).addClass('active');
        },
        attachSubscriptionBindings: function attachSubscriptionBindings() {
            $('a[data-conversation-subscribe]').magnificPopup({
                type: 'ajax',
                callbacks: {
                    updateStatus: function updateStatus(data) {
                        if (data.status == 'ready') {
                            var $form = $('form[data-conversation-form=subscribe]');
                            $('button').on('click', $form, function (e) {
                                e.preventDefault();
                                e.stopPropagation();
                                $.ajax({
                                    url: $form.attr('action'),
                                    dataType: 'json',
                                    success: function success(r) {
                                        if (r.subscribed) {
                                            $('[data-conversation-subscribe=subscribe]').hide();
                                            $('[data-conversation-subscribe=unsubscribe]').show();
                                        } else {
                                            $('[data-conversation-subscribe=unsubscribe]').hide();
                                            $('[data-conversation-subscribe=subscribe]').show();
                                        }
                                        $.magnificPopup.close();
                                    }
                                });
                            });
                        }
                    },

                    beforeOpen: function beforeOpen() {
                        // just a hack that adds mfp-anim class to markup
                        this.st.mainClass = 'mfp-zoom-in';
                    }
                },
                closeOnContentClick: true,
                midClick: true // allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source.
            });
        },

        attachBindings: function attachBindings() {
            var obj = this;
            obj.$element.unbind('.cnv');
            if (obj.options.uninitialized) {
                obj.options.uninitialized = false;
                ConcreteEvent.bind('ConversationMention', function (e, data) {
                    obj.mentionList(data.items, data.coordinates || false, data.bindTo || obj.$element.get(0));
                }, obj.$element.get(0) // Bind to this conversation only.
                );
                obj.dropdown = {};
                obj.dropdown.parent = $('<div/>').css({
                    position: 'absolute',
                    height: 0,
                    width: 0
                });
                obj.dropdown.active = false;
                obj.dropdown.handle = $('<a/>').appendTo(obj.dropdown.parent);
                obj.dropdown.list = $('<ul/>').addClass('dropdown-menu').appendTo(obj.dropdown.parent);
                obj.dropdown.handle.dropdown();
                ConcreteEvent.bind('ConversationTextareaKeydownUp', function (e) {
                    if (obj.dropdown.activeItem == -1) obj.dropdown.activeItem = obj.dropdown.list.children().length;
                    obj.dropdown.activeItem -= 1;
                    obj.dropdown.activeItem += obj.dropdown.list.children().length;
                    obj.dropdown.activeItem %= obj.dropdown.list.children().length;
                    obj.dropdown.list.children().filter('.active').removeClass('active').end().eq(obj.dropdown.activeItem).addClass('active');
                }, obj.$element.get(0));
                ConcreteEvent.bind('ConversationTextareaKeydownDown', function (e) {
                    obj.dropdown.activeItem += 1;
                    obj.dropdown.activeItem += obj.dropdown.list.children().length;
                    obj.dropdown.activeItem %= obj.dropdown.list.children().length;
                    obj.dropdown.list.children().filter('.active').removeClass('active').end().eq(obj.dropdown.activeItem).addClass('active');
                }, obj.$element.get(0));
                ConcreteEvent.bind('ConversationTextareaKeydownEnter', function (e) {
                    obj.dropdown.list.children().filter('.active').children('a').click();
                }, obj.$element.get(0));
                ConcreteEvent.bind('ConversationPostError', function (e, data) {
                    var $form = data.form,
                        messages = data.messages;
                    var s = '';
                    $.each(messages, function (i, m) {
                        s += m + '<br>';
                    });
                    $form.find('div.ccm-conversation-errors').html(s).show();
                });
                ConcreteEvent.bind('ConversationSubmitForm', function (e, data) {
                    data.form.find('div.ccm-conversation-errors').hide();
                });
            }
            var paginate = obj.options.paginate ? 1 : 0;
            var enablePosting = obj.options.addMessageToken != '' ? 1 : 0;
            var addMessageLabel = obj.options.addMessageLabel ? obj.options.addMessageLabel : '';

            obj.$replyholder = obj.$element.find('div.ccm-conversation-add-reply');
            obj.$newmessageform = obj.$element.find('div.ccm-conversation-add-new-message form');
            obj.$deleteholder = obj.$element.find('div.ccm-conversation-delete-message');
            obj.$attachmentdeleteholder = obj.$element.find('div.ccm-conversation-delete-attachment');
            obj.$permalinkholder = obj.$element.find('div.ccm-conversation-message-permalink');
            obj.$messagelist = obj.$element.find('div.ccm-conversation-message-list');
            obj.$messagecnt = obj.$element.find('.ccm-conversation-message-count');
            obj.$postbuttons = obj.$element.find('[data-submit=conversation-message]');
            obj.$sortselect = obj.$element.find('select[data-sort=conversation-message-list]');
            obj.$loadmore = obj.$element.find('[data-load-page=conversation-message-list]');
            obj.$messages = obj.$element.find('.ccm-conversation-messages');
            obj.$messagerating = obj.$element.find('span.ccm-conversation-message-rating');

            obj.$element.on('click.cnv', '[data-submit=conversation-message]', function (e) {
                e.preventDefault();
                obj.submitForm($(this));
            });
            obj.$element.on('click.cnv', '[data-submit=update-conversation-message]', function () {
                obj.submitUpdateForm($(this));
                return false;
            });
            this.attachSubscriptionBindings();
            var replyIterator = 1;
            obj.$element.on('click.cnv', 'a[data-toggle=conversation-reply]', function (event) {
                event.preventDefault();
                $('.ccm-conversation-attachment-container').each(function () {
                    if ($(this).is(':visible')) {
                        $(this).toggle();
                    }
                });
                var $replyform = obj.$replyholder.appendTo($(this).closest('[data-conversation-message-id]'));
                $replyform.attr('data-form', 'conversation-reply').show();
                $replyform.find('[data-submit=conversation-message]').attr('data-post-parent-id', $(this).attr('data-post-parent-id'));

                $replyform.attr('rel', 'new-reply' + replyIterator);
                replyIterator++; // this may not be necessary, but might come in handy if we need to know how many times a new reply box has been triggered.
                return false;
            });

            $('.ccm-conversation-attachment-container').hide();
            $('.ccm-conversation-add-new-message .ccm-conversation-attachment-toggle').off('click.cnv').on('click.cnv', function (event) {
                event.preventDefault();
                if ($('.ccm-conversation-add-reply .ccm-conversation-attachment-container').is(':visible')) {
                    $('.ccm-conversation-add-reply .ccm-conversation-attachment-container').toggle();
                }
                $('.ccm-conversation-add-new-message .ccm-conversation-attachment-container').toggle();
            });
            $('.ccm-conversation-add-reply .ccm-conversation-attachment-toggle').off('click.cnv').on('click.cnv', function (event) {
                event.preventDefault();
                if ($('.ccm-conversation-add-new-message .ccm-conversation-attachment-container').is(':visible')) {
                    $('.ccm-conversation-add-new-message .ccm-conversation-attachment-container').toggle();
                }
                $('.ccm-conversation-add-reply .ccm-conversation-attachment-container').toggle();
            });

            obj.$element.on('click.cnv', 'a[data-submit=delete-conversation-message]', function () {
                var $link = $(this);
                obj.$deletedialog = obj.$deleteholder.clone();
                if (obj.$deletedialog.dialog) {
                    obj.$deletedialog.dialog({
                        modal: true,
                        dialogClass: 'ccm-conversation-dialog',
                        title: obj.$deleteholder.attr('data-dialog-title'),
                        buttons: [{
                            'text': obj.$deleteholder.attr('data-cancel-button-title'),
                            'class': 'btn pull-left',
                            'click': function click() {
                                obj.$deletedialog.dialog('close');
                            }
                        }, {
                            'text': obj.$deleteholder.attr('data-confirm-button-title'),
                            'class': 'btn pull-right btn-danger',
                            'click': function click() {
                                obj.deleteMessage($link.attr('data-conversation-message-id'));
                            }
                        }]
                    });
                } else {
                    if (window.confirm(i18n.Confirm_remove_message)) {
                        obj.deleteMessage($link.attr('data-conversation-message-id'));
                    }
                }
                return false;
            });
            obj.$element.on('click.cnv', 'a[data-submit=flag-conversation-message]', function () {
                var $link = $(this);
                if (window.confirm(i18n.Confirm_mark_as_spam)) {
                    obj.flagMessage($link.attr('data-conversation-message-id'));
                }
                return false;
            });
            obj.$element.on('click.cnv', 'a[data-load=edit-conversation-message]', function () {
                if ($('.ccm-conversation-edit-message').is(':visible')) {
                    window.alert(i18n.Warn_currently_editing);
                    return false;
                }
                var $link = $(this);
                obj.editMessage($link.attr('data-conversation-message-id'));
            });
            obj.$element.on('change.cnv', 'select[data-sort=conversation-message-list]', function () {
                obj.$messagelist.load(CCM_TOOLS_PATH + '/conversations/view_ajax', {
                    'cnvID': obj.options.cnvID,
                    'task': 'get_messages',
                    'cID': obj.options.cID,
                    'blockID': obj.options.blockID,
                    'enablePosting': enablePosting,
                    'displayMode': obj.options.displayMode,
                    'itemsPerPage': obj.options.itemsPerPage,
                    'paginate': paginate,
                    'addMessageLabel': addMessageLabel,
                    'orderBy': $(this).val(),
                    'enableOrdering': obj.options.enableOrdering,
                    'displayPostingForm': obj.options.displayPostingForm,
                    'enableCommentRating': obj.options.enableCommentRating,
                    'enableTopCommentReviews': obj.options.enableTopCommentReviews,
                    'displaySocialLinks': obj.options.displaySocialLinks,
                    'dateFormat': obj.options.dateFormat,
                    'customDateFormat': obj.options.customDateFormat,
                    'blockAreaHandle': obj.options.blockAreaHandle,
                    'attachmentsEnabled': obj.options.attachmentsEnabled,
                    'attachmentOverridesEnabled': obj.options.attachmentOverridesEnabled

                }, function (r) {
                    obj.$replyholder.appendTo(obj.$element);
                    $('.ccm-conversation-messages .dropdown-toggle').dropdown();
                    obj.attachBindings();
                });
            });

            obj.$element.on('click.cnv', '.image-popover-hover', function () {
                $.magnificPopup.open({
                    items: {
                        src: $(this).attr('data-full-image'), // can be a HTML string, jQuery object, or CSS selector
                        type: 'image',
                        verticalFit: true
                    }
                });
            });

            obj.$element.on('click.cnv', '[data-load-page=conversation-message-list]', function () {
                var nextPage = parseInt(obj.$loadmore.attr('data-next-page'));
                var totalPages = parseInt(obj.$loadmore.attr('data-total-pages'));
                var orderBy = obj.$sortselect.length ? obj.$sortselect.val() : obj.options.orderBy;
                var data = {
                    'cnvID': obj.options.cnvID,
                    'cID': obj.options.cID,
                    'blockID': obj.options.blockID,
                    'itemsPerPage': obj.options.itemsPerPage,
                    'displayMode': obj.options.displayMode,
                    'blockAreaHandle': obj.options.blockAreaHandle,
                    'enablePosting': enablePosting,
                    'addMessageLabel': addMessageLabel,
                    'page': nextPage,
                    'orderBy': orderBy,
                    'enableCommentRating': obj.options.enableCommentRating,
                    'enableTopCommentReviews': obj.options.enableTopCommentReviews,
                    'displaySocialLinks': obj.options.displaySocialLinks,
                    'dateFormat': obj.options.dateFormat,
                    'customDateFormat': obj.options.customDateFormat,
                    'attachmentsEnabled': obj.options.attachmentsEnabled,
                    'attachmentOverridesEnabled': obj.options.attachmentOverridesEnabled
                };

                $.ajax({
                    type: 'post',
                    data: data,
                    url: CCM_TOOLS_PATH + '/conversations/message_page',
                    success: function success(html) {
                        obj.$messages.append(html);
                        $('.ccm-conversation-messages .dropdown-toggle').dropdown();
                        if (nextPage + 1 > totalPages) {
                            obj.$loadmore.hide();
                        } else {
                            obj.$loadmore.attr('data-next-page', nextPage + 1);
                        }
                    }
                });
            });

            obj.$element.on('click.cnv', '.conversation-rate-message', function () {
                var cnvMessageID = $(this).closest('[data-conversation-message-id]').attr('data-conversation-message-id');
                var cnvRatingTypeHandle = $(this).attr('data-conversation-rating-type');
                obj.$messagerating.load(CCM_TOOLS_PATH + '/conversations/rate');
                var data = {
                    'cnvID': obj.options.cnvID,
                    'cID': obj.options.cID,
                    'blockID': obj.options.blockID,
                    'cnvMessageID': cnvMessageID,
                    'cnvRatingTypeHandle': cnvRatingTypeHandle
                };
                $.ajax({
                    type: 'post',
                    data: data,
                    url: CCM_TOOLS_PATH + '/conversations/rate',
                    success: function success(html) {
                        $('span[data-message-rating="' + cnvMessageID + '"]').load(CCM_TOOLS_PATH + '/conversations/get_rating', {
                            'cnvMessageID': cnvMessageID
                        });
                    }
                });
            });
            obj.$element.on('click.cnv', 'a.share-popup', function () {
                var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
                var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
                var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
                var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
                var left = width / 2 - 300 + dualScreenLeft;
                var top = height / 2 - 125 + dualScreenTop;
                window.open($(this).attr('href'), 'cnvSocialShare', 'left:' + left + ',top:' + top + ',height=250,width=600,toolbar=no,status=no');

                return false;
            });
            obj.$element.on('click.cnv', 'a.share-permalink', function () {
                var $link = $(this);
                var permalink = $link.attr('rel');
                obj.$permalinkdialog = obj.$permalinkholder.clone();
                var $textarea = $('<textarea readonly>').text(decodeURIComponent(permalink));
                obj.$permalinkdialog.append($textarea);
                $textarea.click(function () {
                    var $this = $(this);
                    $this.select();
                    window.setTimeout(function () {
                        $this.select();
                    }, 1);
                    $this.mouseup(function () {
                        $this.unbind("mouseup");
                        return false;
                    });
                });
                if (obj.$permalinkdialog.dialog) {
                    obj.$permalinkdialog.dialog({
                        modal: true,
                        dialogClass: 'ccm-conversation-dialog',
                        title: obj.$permalinkholder.attr('data-dialog-title'),
                        buttons: [{
                            'text': obj.$permalinkholder.attr('data-cancel-button-title'),
                            'class': 'btn pull-left',
                            'click': function click() {
                                obj.$permalinkdialog.dialog('close');
                            }
                        }]
                    });
                }
                return false;
            });
            if (obj.options.attachmentsEnabled > 0) {
                obj.$element.concreteConversationAttachments(obj);
            }
            $('.dropdown-toggle').dropdown();
        },
        handlePostError: function handlePostError($form, messages) {
            if (!messages) {
                messages = [i18n.Unspecified_error_occurred];
            }
            this.publish('conversationPostError', { form: $form, messages: messages });
        },
        deleteMessage: function deleteMessage(msgID) {

            var obj = this;
            obj.publish('conversationBeforeDeleteMessage', { msgID: msgID });
            var formArray = [{
                'name': 'cnvMessageID',
                'value': msgID
            }, {
                'name': 'token',
                'value': obj.options.deleteMessageToken
            }];

            $.ajax({
                type: 'post',
                data: formArray,
                dataType: 'json',
                url: CCM_TOOLS_PATH + '/conversations/delete_message',
                success: function success(r) {
                    if (!r.error) {
                        var $parent = $('[data-conversation-message-id=' + msgID + ']');

                        if ($parent.length) {
                            $parent.remove();
                        }
                        obj.updateCount();
                        if (obj.$deletedialog.dialog) obj.$deletedialog.dialog('close');
                        obj.publish('conversationDeleteMessage', { msgID: msgID });
                    } else {
                        window.alert(i18n.Error_deleting_message + "\n\n" + r.errors.join("\n"));
                    }
                },
                error: function error(e) {
                    obj.publish('conversationDeleteMessageError', { msgID: msgID, error: arguments });
                    window.alert(i18n.Error_deleting_message);
                }
            });
        },
        editMessage: function editMessage(msgID) {
            var obj = this;
            var formArray = [{
                'name': 'cnvMessageID',
                'value': msgID
            }, {
                'name': 'cID',
                'value': this.options.cID
            }, {
                'name': 'blockAreaHandle',
                'value': this.options.blockAreaHandle
            }, {
                'name': 'bID',
                'value': this.options.blockID
            }];
            $.ajax({
                type: 'post',
                data: formArray,
                url: CCM_TOOLS_PATH + '/conversations/edit_message',
                success: function success(html) {
                    var $parent = $('.ccm-conversation-message[data-conversation-message-id=' + msgID + ']');
                    var $previousContents = $parent;
                    $parent.after(html).remove();
                    $('.ccm-conversation-attachment-container').hide();
                    $('.ccm-conversation-edit-message .ccm-conversation-attachment-toggle').off('click.cnv').on('click.cnv', function (event) {
                        event.preventDefault();
                        $('.ccm-conversation-edit-message .ccm-conversation-attachment-container').toggle();
                    });
                    obj.$editMessageHolder = obj.$element.find('div.ccm-conversation-edit-message');
                    obj.$element.concreteConversationAttachments(obj);
                    $('button.cancel-update').on('click.cnv', function () {
                        $('.ccm-conversation-edit-message').replaceWith($previousContents);
                    });
                },
                error: function error(e) {
                    obj.publish('conversationEditMessageError', { msgID: msgID, error: arguments });
                }
            });
        },
        flagMessage: function flagMessage(msgID) {

            var obj = this;
            obj.publish('conversationBeforeFlagMessage', { msgID: msgID });
            var formArray = [{
                'name': 'token',
                'value': obj.options.flagMessageToken
            }, {
                'name': 'cnvMessageID',
                'value': msgID
            }];

            $.ajax({
                type: 'post',
                data: formArray,
                url: CCM_TOOLS_PATH + '/conversations/flag_message',
                success: function success(html) {
                    var $parent = $('.ccm-conversation-message[data-conversation-message-id=' + msgID + ']');

                    if ($parent.length) {
                        $parent.after(html).remove();
                    }
                    obj.updateCount();
                    obj.publish('conversationFlagMessage', { msgID: msgID });
                },
                error: function error(e) {
                    obj.publish('conversationFlagMessageError', { msgID: msgID, error: arguments });
                    window.alert(i18n.Error_flagging_message);
                }
            });
        },
        addMessageFromJSON: function addMessageFromJSON($form, json) {
            var obj = this;
            obj.publish('conversationBeforeAddMessageFromJSON', { json: json, form: $form });
            var enablePosting = obj.options.addMessageToken != '' ? 1 : 0;
            var formArray = [{
                'name': 'cnvMessageID',
                'value': json.cnvMessageID
            }, {
                'name': 'enablePosting',
                'value': enablePosting
            }, {
                'name': 'displayMode',
                'value': obj.options.displayMode
            }, {
                'name': 'enableCommentRating',
                'value': obj.options.enableCommentRating
            }, {
                'name': 'displaySocialLinks',
                'value': obj.options.displaySocialLinks
            }];

            $.ajax({
                type: 'post',
                data: formArray,
                url: CCM_TOOLS_PATH + '/conversations/message_detail',
                success: function success(html) {
                    var $parent = $('.ccm-conversation-message[data-conversation-message-id=' + json.cnvMessageParentID + ']');

                    if ($parent.length) {
                        $parent.after(html);
                        obj.$replyholder.appendTo(obj.$element);
                        obj.$replyholder.hide();
                        obj.$replyholder.find(".conversation-editor").val('');
                        try {
                            obj.$replyholder.find(".redactor_conversation_editor_" + obj.options.cnvID).redactor('set', '');
                        } catch (e) {}
                    } else {
                        if (obj.options.orderBy == 'date_desc') {
                            obj.$messages.prepend(html);
                        } else {
                            obj.$messages.append(html);
                        }
                        obj.$element.find('.ccm-conversation-no-messages').hide();
                        obj.$newmessageform.find(".conversation-editor").val('');
                        try {
                            obj.$newmessageform.find(".redactor_conversation_editor_" + obj.options.cnvID).redactor('set', '');
                        } catch (e) {}
                    }
                    obj.publish('conversationAddMessageFromJSON', { json: json, form: $form });
                    obj.updateCount();
                    var target = $('a#cnv' + obj.options.cnvID + 'Message' + json.cnvMessageID).offset();
                    $('.dropdown-toggle').dropdown();
                    $('html, body').animate({ scrollTop: target.top }, 800, 'linear');
                }
            });
        },
        updateMessageFromJSON: function updateMessageFromJSON($form, json) {
            var obj = this;
            var enablePosting = obj.options.addMessageToken != '' ? 1 : 0;
            var formArray = [{
                'name': 'cnvMessageID',
                'value': json.cnvMessageID
            }, {
                'name': 'enablePosting',
                'value': enablePosting
            }, {
                'name': 'displayMode',
                'value': obj.options.displayMode
            }, {
                'name': 'enableCommentRating',
                'value': obj.options.enableCommentRating
            }, {
                'name': 'displaySocialLinks',
                'value': obj.options.displaySocialLinks
            }];

            $.ajax({
                type: 'post',
                data: formArray,
                url: CCM_TOOLS_PATH + '/conversations/message_detail',
                success: function success(html) {
                    var $parent = $('[data-conversation-message-id=' + json.cnvMessageID + ']');
                    $parent.after(html).remove();
                    $('.dropdown-toggle').dropdown();
                }
            });
        },
        updateCount: function updateCount() {
            var obj = this;
            obj.publish('conversationBeforeUpdateCount');
            obj.$messagecnt.load(CCM_TOOLS_PATH + '/conversations/count_header', {
                'cnvID': obj.options.cnvID
            }, function () {
                obj.publish('conversationUpdateCount');
            });
        },
        submitForm: function submitForm($btn) {
            var obj = this;
            obj.publish('conversationBeforeSubmitForm');
            var $form = $btn.closest('form');

            $btn.prop('disabled', true);
            $form.parent().addClass('ccm-conversation-form-submitted');
            var formArray = $form.serializeArray();
            var parentID = $btn.attr('data-post-parent-id');

            formArray.push({
                'name': 'token',
                'value': obj.options.addMessageToken
            }, {
                'name': 'cnvID',
                'value': obj.options.cnvID
            }, {
                'name': 'cnvMessageParentID',
                'value': parentID
            }, {
                'name': 'enableRating',
                'value': parentID
            });
            $.ajax({
                dataType: 'json',
                type: 'post',
                data: formArray,
                url: CCM_TOOLS_PATH + '/conversations/add_message',
                success: function success(r) {
                    if (!r) {
                        obj.handlePostError($form);
                        return false;
                    }
                    if (r.error) {
                        obj.handlePostError($form, r.errors);
                        return false;
                    }
                    $('.preview.processing').each(function () {
                        $('input[rel="' + $(this).attr('rel') + '"]').remove();
                    });
                    $('form.dropzone').each(function () {
                        var d = $(this).data('dropzone');
                        $.each(d.files, function (k, v) {
                            d.removeFile(v);
                        });
                    });
                    obj.addMessageFromJSON($form, r);
                    obj.publish('conversationSubmitForm', { form: $form, response: r });
                },
                error: function error(r) {
                    obj.handlePostError($form);
                    return false;
                },
                complete: function complete(r) {
                    $btn.prop('disabled', false);
                    $form.parent().closest('.ccm-conversation-form-submitted').removeClass('ccm-conversation-form-submitted');
                }
            });
        },
        submitUpdateForm: function submitUpdateForm($btn) {
            var obj = this;
            obj.publish('conversationBeforeSubmitForm');
            var $form = $btn.closest('form');

            $btn.prop('disabled', true);
            $form.parent().addClass('ccm-conversation-form-submitted');
            var formArray = $form.serializeArray();
            var cnvMessageID = $btn.attr('data-post-message-id');

            formArray.push({
                'name': 'token',
                'value': obj.options.editMessageToken
            }, {
                'name': 'cnvMessageID',
                'value': cnvMessageID
            });
            $.ajax({
                dataType: 'json',
                type: 'post',
                data: formArray,
                url: CCM_TOOLS_PATH + '/conversations/update_message',
                success: function success(r) {
                    if (!r) {
                        obj.handlePostError($form);
                        return false;
                    }
                    if (r.error) {
                        obj.handlePostError($form, r.errors);
                        return false;
                    }
                    $('.preview.processing').each(function () {
                        $('input[rel="' + $(this).attr('rel') + '"]').remove();
                    });
                    /*
                     $('form.dropzone').each(function(){
                     var d = $(this).data('dropzone');
                     $.each(d.files,function(k,v){
                     d.removeFile(v);
                     });
                     });
                     */
                    obj.updateMessageFromJSON($form, r);
                    obj.publish('conversationSubmitForm', { form: $form, response: r });
                },
                error: function error(r) {
                    obj.handlePostError($form);
                    return false;
                },
                complete: function complete(r) {
                    $btn.prop('disabled', false);
                    $form.parent().closest('.ccm-conversation-form-submitted').removeClass('ccm-conversation-form-submitted');
                }
            });
        },
        tool: {
            setCaretPosition: function setCaretPosition(elem, caretPos) {
                // http://stackoverflow.com/a/512542/950669
                if (elem != null) {
                    if (elem.createTextRange) {
                        var range = elem.createTextRange();
                        range.move('character', caretPos);
                        range.select();
                    } else {
                        if (elem.selectionStart) {
                            elem.focus();
                            elem.setSelectionRange(caretPos, caretPos);
                        } else elem.focus();
                    }
                }
            },
            getCaretPosition: function getCaretPosition(elem) {
                // http://stackoverflow.com/a/263796/950669
                if (elem.selectionStart) {
                    return elem.selectionStart;
                } else if (document.selection) {
                    elem.focus();

                    var r = document.selection.createRange();
                    if (r == null) {
                        return 0;
                    }

                    var re = elem.createTextRange(),
                        rc = re.duplicate();
                    re.moveToBookmark(r.getBookmark());
                    rc.setEndPoint('EndToStart', re);

                    return rc.text.length;
                }
                return 0;
            },
            testMentionString: function testMentionString(s) {
                return (/^@[a-z0-9]+$/.test(s)
                );
            },
            getMentionMatches: function getMentionMatches(s, u) {
                return u.filter(function (d) {
                    return d.indexOf(s) >= 0;
                });
            },
            isSameConversation: function isSameConversation(o, n) {
                return o.options.blockID === n.options.blockID && o.options.cnvID === n.options.cnvID;
            },

            // MentionUser class, use this to pass around data with your @mention names.
            MentionUser: function MentionUser(name) {
                this.getName = function () {
                    return name;
                };
            }
        }
    };
})(window, jQuery);

/***/ }),

/***/ 177:
/***/ (function(module, exports) {

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* jshint unused:vars, undef:true, browser:true, jquery:true */
/* global CCM_TOOLS_PATH */

;(function (global, $) {
  'use strict';

  var i18n = {
    Too_many_files: 'Too many files',
    Invalid_file_extension: 'Invalid file extension',
    Max_file_size_exceeded: 'Max file size exceeded',
    Error_deleting_attachment: 'Something went wrong while deleting this attachment, please refresh and try again.',
    Confirm_remove_attachment: 'Remove this attachment?'
    // Please add new translatable strings to the getConversationsJavascript of /concrete/controllers/frontend/assets_localization.php
  };

  var methods = {

    init: function init(options) {
      var obj = options;
      obj.$element.on('click.cnv', 'a[data-toggle=conversation-reply]', function () {
        $('.ccm-conversation-wrapper').concreteConversationAttachments('clearDropzoneQueues');
      });
      obj.$element.on('click.cnv', 'a.attachment-delete', function (event) {
        event.preventDefault();
        $(this).concreteConversationAttachments('attachmentDeleteTrigger', obj);
      });
      if (obj.$editMessageHolder && !obj.$editMessageHolder.find('.dropzone').attr('data-dropzone-applied')) {
        obj.$editMessageHolder.find('.dropzone').not('[data-drozpone-applied="true"]').dropzone({ // dropzone reply form
          'url': CCM_TOOLS_PATH + '/conversations/add_file',
          'success': function success(file, raw) {
            var self = this;
            $(file.previewTemplate).click(function () {
              self.removeFile(file);
              $('input[rel="' + $(this).attr('rel') + '"]').remove();
            });
            var response = JSON.parse(raw);
            if (!response.error) {
              $(this.element).closest('div.ccm-conversation-edit-message').find('form.aux-reply-form').append('<input rel="' + response.timestamp + '" type="hidden" name="attachments[]" value="' + response.id + '" />');
            } else {
              var $form = $('.preview.processing[rel="' + response.timestamp + '"]').closest('form');
              obj.handlePostError($form, [response.error]);
              $('.preview.processing[rel="' + response.timestamp + '"]').remove();
              $form.children('.ccm-conversation-errors').delay(3000).fadeOut('slow', function () {
                $(this).html('');
              });
            }
          },
          accept: function accept(file, done) {
            var errors = [];
            var attachmentCount = this.files.length;
            if (obj.options.maxFiles > 0 && attachmentCount > obj.options.maxFiles) {
              errors.push(i18n.Too_many_files);
            }
            var requiredExtensions = obj.options.fileExtensions.split(',');
            if (file.name.split('.').pop().toLowerCase() && requiredExtensions.indexOf(file.name.split('.').pop().toLowerCase()) == -1 && requiredExtensions != '') {
              errors.push(i18n.Invalid_file_extension);
            }
            if (obj.options.maxFileSize > 0 && file.size > obj.options.maxFileSize * 1000000) {
              errors.push(i18n.Max_file_size_exceeded);
            }

            if (errors.length > 0) {
              var self = this;
              $('input[rel="' + $(file.previewTemplate).attr('rel') + '"]').remove();
              var $form = $(file.previewTemplate).parent('.dropzone');
              self.removeFile(file);
              obj.handlePostError($form, errors);
              $form.children('.ccm-conversation-errors').delay(3000).fadeOut('slow', function () {
                $(this).html('');
              });
              attachmentCount = -1;
              done('error'); // not displayed, just needs to have argument to trigger.
            } else {
              done();
            }
          },
          'sending': function sending(file, xhr, formData) {
            $(file.previewTemplate).attr('rel', new Date().getTime());
            formData.append("timestamp", $(file.previewTemplate).attr('rel'));
            formData.append("tag", $(obj.$editMessageHOlder).parent('div').attr('rel'));
            formData.append("fileCount", $(obj.$editMessageHolder).find('[name="attachments[]"]').length);
          },
          'init': function init() {
            $(this.element).data('dropzone', this);
          }
        });
      }
      if (obj.$newmessageform.dropzone && !$(obj.$newmessageform).attr('data-dropzone-applied')) {
        // dropzone new message form
        obj.$newmessageform.dropzone({
          accept: function accept(file, done) {
            var errors = [];
            var attachmentCount = this.files.length;
            if (obj.options.maxFiles > 0 && attachmentCount > obj.options.maxFiles) {
              errors.push(i18n.Too_many_files);
            }
            var requiredExtensions = obj.options.fileExtensions.split(',');
            if (file.name.split('.').pop().toLowerCase() && requiredExtensions.indexOf(file.name.split('.').pop().toLowerCase()) == -1 && requiredExtensions != '') {
              errors.push(i18n.Invalid_file_extension);
            }
            if (obj.options.maxFileSize > 0 && file.size > obj.options.maxFileSize * 1000000) {
              errors.push(i18n.Max_file_size_exceeded);
            }

            if (errors.length > 0) {
              var self = this;
              $('input[rel="' + $(file.previewTemplate).attr('rel') + '"]').remove();
              var $form = $(file.previewTemplate).parent('.dropzone');
              self.removeFile(file);
              obj.handlePostError($form, errors);
              $form.children('.ccm-conversation-errors').delay(3000).fadeOut('slow', function () {
                $(this).html('');
              });
              attachmentCount = -1;
              done('error'); // not displayed, just needs to have argument to trigger.
            } else {
              done();
            }
          },
          'url': CCM_TOOLS_PATH + '/conversations/add_file',
          'success': function success(file, raw) {
            var self = this;
            $(file.previewTemplate).click(function () {
              $('input[rel="' + $(this).attr('rel') + '"]').remove();
              self.removeFile(file);
            });
            var response = JSON.parse(raw);
            if (!response.error) {
              $('div[rel="' + response.tag + '"] form.main-reply-form').append('<input rel="' + response.timestamp + '" type="hidden" name="attachments[]" value="' + response.id + '" />');
            } else {
              var $form = $('.preview.processing[rel="' + response.timestamp + '"]').closest('form');
              obj.handlePostError($form, [response.error]);
              $('.preview.processing[rel="' + response.timestamp + '"]').remove();
              $form.children('.ccm-conversation-errors').delay(3000).fadeOut('slow', function () {
                $(this).html('');
              });
            }
          },
          'sending': function sending(file, xhr, formData) {

            $(file.previewTemplate).attr('rel', new Date().getTime());
            formData.append("timestamp", $(file.previewTemplate).attr('rel'));
            formData.append("tag", $(obj.$newmessageform).parent('div').attr('rel'));
            formData.append("fileCount", this.files.length);
          },
          'init': function init() {
            $(this.element).data('dropzone', this);
          }
        });
        $(obj.$newmessageform).attr('data-dropzone-applied', 'true');
      }

      if (!$(obj.$replyholder.find('.dropzone')).attr('data-dropzone-applied')) {
        obj.$replyholder.find('.dropzone').not('[data-drozpone-applied="true"]').dropzone({ // dropzone reply form
          'url': CCM_TOOLS_PATH + '/conversations/add_file',
          'success': function success(file, raw) {
            var self = this;
            $(file.previewTemplate).click(function () {
              self.removeFile(file);
              $('input[rel="' + $(this).attr('rel') + '"]').remove();
            });
            var response = JSON.parse(raw);
            if (!response.error) {
              $(this.element).closest('div.ccm-conversation-add-reply').find('form.aux-reply-form').append('<input rel="' + response.timestamp + '" type="hidden" name="attachments[]" value="' + response.id + '" />');
            } else {
              var $form = $('.preview.processing[rel="' + response.timestamp + '"]').closest('form');
              obj.handlePostError($form, [response.error]);
              $('.preview.processing[rel="' + response.timestamp + '"]').remove();
              $form.children('.ccm-conversation-errors').delay(3000).fadeOut('slow', function () {
                $(this).html('');
              });
            }
          },
          accept: function accept(file, done) {
            var errors = [];
            var attachmentCount = this.files.length;
            if (obj.options.maxFiles > 0 && attachmentCount > obj.options.maxFiles) {
              errors.push(i18n.Too_many_files);
            }
            var requiredExtensions = obj.options.fileExtensions.split(',');
            if (file.name.split('.').pop().toLowerCase() && requiredExtensions.indexOf(file.name.split('.').pop().toLowerCase()) == -1 && requiredExtensions != '') {
              errors.push(i18n.Invalid_file_extension);
            }
            if (obj.options.maxFileSize > 0 && file.size > obj.options.maxFileSize * 1000000) {
              errors.push(i18n.Max_file_size_exceeded);
            }

            if (errors.length > 0) {
              var self = this;
              $('input[rel="' + $(file.previewTemplate).attr('rel') + '"]').remove();
              var $form = $(file.previewTemplate).parent('.dropzone');
              self.removeFile(file);
              obj.handlePostError($form, errors);
              $form.children('.ccm-conversation-errors').delay(3000).fadeOut('slow', function () {
                $(this).html('');
              });
              attachmentCount = -1;
              done('error'); // not displayed, just needs to have argument to trigger.
            } else {
              done();
            }
          },
          'sending': function sending(file, xhr, formData) {
            $(file.previewTemplate).attr('rel', new Date().getTime());
            formData.append("timestamp", $(file.previewTemplate).attr('rel'));
            formData.append("tag", $(obj.$newmessageform).parent('div').attr('rel'));
            formData.append("fileCount", $(obj.$replyHolder).find('[name="attachments[]"]').length);
          },
          'init': function init() {
            $(this.element).data('dropzone', this);
          }
        });
      }
      $(obj.$replyholder.find('.dropzone')).attr('data-dropzone-applied', 'true');
      return $.each($(this), function (i, obj) {
        $(this).find('.ccm-conversation-attachment-container').each(function () {
          if ($(this).is(':visible')) {
            $(this).toggle();
          }
        });
      });
    },

    attachmentDeleteTrigger: function attachmentDeleteTrigger(options) {
      var obj = options;
      var link = $(this);
      obj.$attachmentdeletetdialog = obj.$attachmentdeleteholder.clone();
      if (obj.$attachmentdeletetdialog.dialog) {
        obj.$attachmentdeletetdialog.dialog({
          modal: true,
          dialogClass: 'ccm-conversation-dialog',
          title: obj.$attachmentdeletetdialog.attr('data-dialog-title'),
          buttons: [{
            'text': obj.$attachmentdeleteholder.attr('data-cancel-button-title'),
            'class': 'btn pull-left',
            'click': function click() {
              obj.$attachmentdeletetdialog.dialog('close');
            }
          }, {
            'text': obj.$attachmentdeleteholder.attr('data-confirm-button-title'),
            'class': 'btn pull-right btn-danger',
            'click': function click() {
              $(this).concreteConversationAttachments('deleteAttachment', { 'cnvMessageAttachmentID': link.attr('rel'), 'cnvObj': obj, 'dialogObj': obj.$attachmentdeletetdialog });
            }
          }]
        });
      } else {
        if (window.confirm(i18n.Confirm_remove_attachment)) {
          $(this).concreteConversationAttachments('deleteAttachment', { 'cnvMessageAttachmentID': link.attr('rel'), 'cnvObj': obj, 'dialogObj': obj.$attachmentdeletetdialog });
        }
      }
      return false;
    },

    clearDropzoneQueues: function clearDropzoneQueues() {
      $('.preview.processing').each(function () {
        // first remove any previous attachments and hide dropzone if it was open.
        $('input[rel="' + $(this).attr('rel') + '"]').remove();
      });
      $('form.dropzone').each(function () {
        var d = $(this).data('dropzone');
        $.each(d.files, function (k, v) {
          d.removeFile(v);
        });
      });
    },

    deleteAttachment: function deleteAttachment(options) {
      var cnvMessageAttachmentID = options.cnvMessageAttachmentID;
      var obj = options.cnvObj;
      var attachmentsDialog = options.dialogObj;
      /* var obj = this;
      obj.publish('conversationBeforeDeleteAttachment',{cnvMessageAttachmentID:cnvMessageAttachmentID}); */
      var formArray = [{
        'name': 'cnvMessageAttachmentID',
        'value': cnvMessageAttachmentID
      }];

      $.ajax({
        type: 'post',
        data: formArray,
        url: CCM_TOOLS_PATH + '/conversations/delete_file',
        success: function success(response) {
          var parsedData = JSON.parse(response);
          $('p[rel="' + parsedData.attachmentID + '"]').parent('.attachment-container').fadeOut(300, function () {
            $(this).remove();
          });
          if (attachmentsDialog.dialog) {
            attachmentsDialog.dialog('close');
            obj.publish('conversationDeleteAttachment', { cnvMessageAttachmentID: cnvMessageAttachmentID });
          }
        },
        error: function error(e) {
          obj.publish('conversationDeleteAttachmentError', { cnvMessageAttachmentID: cnvMessageAttachmentID, error: arguments });
          window.alert(i18n.Error_deleting_attachment);
        }
      });
    }
  };

  $.fn.concreteConversationAttachments = function (method) {

    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if ((typeof method === 'undefined' ? 'undefined' : _typeof(method)) === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on concreteConversationAttachments');
    }
  };

  $.fn.concreteConversationAttachments.localize = function (dictionary) {
    $.extend(true, i18n, dictionary);
  };
})(window, jQuery);

/***/ })

/******/ });