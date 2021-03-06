(function(global, $) {
    'use strict'

    function ConcreteExpressEntryList(options) {
        options = options || {}
        options = $.extend({
            bID: 0,
            hideFields: true
        }, options)

        this.options = options
        this.setupAdvancedSearch()
        this.setupItemsPerPage()
    }

    ConcreteExpressEntryList.prototype.setupItemsPerPage = function() {
        var bID = this.options.bID
        var $itemsPerPageSelector = $('select[data-express-entry-list-select-items-per-page=' + bID + ']')
        $itemsPerPageSelector.on('change', function() {
            window.location.href = $itemsPerPageSelector.find('option:selected').attr('data-location')
        })
    }

    ConcreteExpressEntryList.prototype.setupAdvancedSearch = function() {
        var bID = this.options.bID
        var $details = $('div[data-express-entry-list-advanced-search-fields=' + bID + ']')
        $('a[data-express-entry-list-advanced-search]').on('click', function(e) {
            e.preventDefault()
            if ($details.is(':visible')) {
                $(this).removeClass('ccm-block-express-entry-list-advanced-search-open')
                $details.find('input[name=advancedSearchDisplayed]').val('')
                $details.hide()
            } else {
                $(this).addClass('ccm-block-express-entry-list-advanced-search-open')
                $details.find('input[name=advancedSearchDisplayed]').val(1)
                $details.show()
            }
        })
        if (this.options.hideFields) {
            $details.hide()
        } else {
            $details.show()
        }
    }

    // jQuery Plugin
    $.concreteExpressEntryList = function(options) {
        return new ConcreteExpressEntryList(options)
    }
}(this, $))
