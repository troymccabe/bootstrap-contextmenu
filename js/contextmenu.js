(function ($) {
    "use strict";

    /**
     * The contextmenu constructor
     *
     * @class
     * @constructor
     * @param {HTMLElement} element
     * @param {object} options
     */
    var ContextMenu = function (element, options) {
        /**
         * The element that the contextmenu is bound to
         *
         * @member {*|HTMLElement}
         */
        this.$element = $(element);

        /**
         * The options from defaults and user-provided
         *
         * @type {object}
         */
        this.options = $.extend(true, {}, $.fn.contextmenu.defaults, options);

        /**
         * The menu that is shown on right click
         *
         * @type {*|HTMLElement}
         */
        this.$menu = $(this.options.target);

        this._attachListeners();
    };

    /**
     * The contextmenu prototype
     *
     * @type {object}
     */
    ContextMenu.prototype = {
        /**
         * The constructor for the contextmenu
         */
        constructor: ContextMenu,

        /**
         * Removes the contextmenu from the element
         */
        destroy: function() {
            this.hide().$element.off('.contextmenu').removeData('tm.contextmenu');
        },

        /**
         * Attaches the listeners to the buttons within the contextmenu
         *
         * @private
         */
        _attachListeners: function() {
            var me = this;

            this.$element.on('contextmenu', function(e) {
                // go away, browser context menu
                e.stopPropagation();
                e.preventDefault();

                // trigger the event
                var beforeShowEvent = $.Event('show.tm.contextmenu');
                beforeShowEvent.relatedTarget = me.$menu;
                me.$element.trigger(beforeShowEvent);

                // return if the triggered event is prevented
                if (beforeShowEvent.isDefaultPrevented()) {
                    return;
                }

                // come play, custom context menu
                var $window = $(window);
                var x = e.pageX;
                var y = e.pageY;
                // make sure that the menu is visible
                // don't overflow to the right or left
                if (e.pageX + me.$menu.outerWidth() > $window.width() && e.pageX - me.$menu.outerWidth() > 0) {
                    x -= me.$menu.outerWidth();
                }
                // don't overflow bottom
                if (e.pageY + me.$menu.outerHeight() > $window.height()) {
                    y -= me.$menu.outerHeight();
                }
                me.$menu
                    .css('left', x)
                    .css('top', y)
                    .css('position', 'absolute')
                    .show();

                // get out of here on next click / scroll
                $(document).one('click scroll', function(e) {
                    // allow short-circuiting of hiding the menu
                    var beforeHideEvent = $.Event('hide.tm.contextmenu');
                    beforeHideEvent.relatedTarget = me.$menu;
                    me.$element.trigger(beforeHideEvent);

                    if (beforeHideEvent.isDefaultPrevented()) {
                        return;
                    }

                    // actually hide the menu
                    me.$menu.hide();

                    // allow cleanup after it's hidden
                    var afterHideEvent = $.Event('hidden.tm.contextmenu');
                    afterHideEvent.relatedTarget = me.$menu;
                    me.$element.trigger(afterHideEvent);
                });

                // allow work after it's shown
                var afterShowEvent = $.Event('shown.tm.contextmenu');
                afterShowEvent.relatedTarget = me.$menu;
                me.$element.trigger(afterShowEvent);
            });
        }
    };

    var old = $.fn.contextmenu;
    $.fn.contextmenu = function(option, args) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('tm.contextmenu');
            var options = typeof option === 'object' && option;

            if (!data) {
                $this.data('tm.contextmenu', (data = new ContextMenu(this, options)));
            }

            if (typeof option === 'string' && typeof data[option] === 'function') {
                data[option](args);
            }
        });
    };

    $.fn.contextmenu.constructor = ContextMenu;

    $.fn.contextmenu.noConflict = function () {
        $.fn.contextmenu = old;
        return this;
    }

    $.fn.contextmenu.defaults = {
        target: null
    };
}(window.jQuery));