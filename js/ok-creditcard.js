/**
 * ok-creditcard.js
 * A pure JavaScript (no dependencies) solution to make HTML
 *  Credit Card inputs self-validating
 *
 * Copyright (c) 2013 Tyler Uebele
 * Released under the MIT license.  See included LICENSE
 *  or http://opensource.org/licenses/MIT
 *
 * latest version available at https://github.com/tyleruebele/jOkay
 *
 * Attaches itself to elements indicated in `okCreditCard.query`
 * Manually attach to elements by adding `onblur="okCreditCard.blur"`
 * Validate Credit Card string by calling `okCreditCard()`
 * Style errors by styling class in `okCreditCard.errorClass`
 *
 * History
 * 2013-08-16 : original version
 *
 * @link http://github.com/tyleruebele/jOkay
 */

/**
 * Validate a Credit Card
 *
 * @param cardNum The Credit Card number to validate
 * @param type    The Credit Card type to validate against
 * @returns bool|string false on failure, card number on success
 */
function okCreditCard(cardNum, type) {
    // strip only spaces and dashes
    cardNum = cardNum.replace(/[\s\-]/g, '');

    type = 'undefined' !== typeof type ? type : okCreditCard.infer(cardNum);

    // verify number is actually numeric
    if (!/^\d*$/.exec(cardNum)) {
        okCreditCard.errno = 1;
        return false;
    }

    // verify specified type is known
    if (!okCreditCard.Types[type]) {
        alert(type);
        okCreditCard.errno = 2;
        return false;
    }

    // verify specified number matches card type prefix
    if (!new RegExp('^' + okCreditCard.Types[type].prefixes).test(cardNum)) {
        okCreditCard.errno = 3;
        return false;
    }

    // verify specified number is of valid length for type
    if (!new RegExp('^' + okCreditCard.Types[type].len).test(cardNum.length)) {
        okCreditCard.errno = 4;
        return false;
    }

    if (!okCreditCard.checkDigit(cardNum, type)) {
        okCreditCard.errno = 5;
        return false;
    }

    okCreditCard.errno = 0;
    return cardNum;
}

/**
 * Input event handler, adds Credit Card validation to selected inputs
 *
 * @param event    JS Event object
 * @param Input    DOM object for triggering input
 */
okCreditCard.blur = function(event, Input) {
    Input.className = Input.className.replace(okCreditCard.errorClass, '');
    Input.title = '';
    if ('' == Input.value.replace(/^\s+|\s+$/g, '')) {
        return;
    }

    var cardNum = okCreditCard(Input.value);

    if (false === cardNum) {
        Input.title = okCreditCard.errors[okCreditCard.errno];
        Input.className += ' ' + okCreditCard.errorClass;
    } else {
        Input.title = '';
        Input.value = cardNum;
    }
};

/**
 * Attaches input event handler to selected inputs
 */
okCreditCard.init = function() {
    // Find all specified inputs
    var Inputs = document.querySelectorAll(okCreditCard.query);
    for (var i = Inputs.length - 1; i >= 0; i--) {
        // If the browser supports Credit Card inputs, don't interfere
        if ('text' == Inputs[i].type) {
            if (window.addEventListener) {
                Inputs[i].addEventListener('blur', function(event) {
                    okCreditCard.blur(event, this);
                });
            } else if (window.attachEvent) {
                Inputs[i].attachEvent('onblur', function(event) {
                    event = event || window.event;
                    okCreditCard.blur(event, event.target || event.srcElement);
                });
            }
        }
    }
};

/**
 * Hold the error number produced by okCreditCard, or 0 for no error
 * @type {number}
 */
okCreditCard.errno = 0;

/**
 * okCreditCard response code messages
 * Customized script by altering this before okCreditCard is called
 * @type {Array}
 */
okCreditCard.errors = [
    'Credit Card Validation Passed',  // 0
    'Invalid Credit Card #',          // 1
    'Unsupported Card Type',          // 2
    'Credit Card # does not match specified type', // 3
    'Invalid Number Length',          // 4
    'Invalid Credit Card Checksum',   // 5
    'Credit Card Validation Failed'   // Unknown Error
];

/**
 * querySelector for which inputs will be validated
 * Customized script by altering this before okCreditCard.init is called
 * @type {string}
 */
okCreditCard.query = 'input[type=creditcard],'
    + 'input.js-ok-creditcard'
;

/**
 * CSS class to be applied to inputs with invalid Credit Card values
 * Customized script by altering this before okCreditCard is called
 * Style Invalid inputs by styling this class
 * @type {string}
 */
okCreditCard.errorClass = 'js-ok-creditcard-error';

/**
 * Verify a credit card number's check-digit
 * @param cardNum The number to verify
 * @param type    The type/brand of the card
 * @returns {boolean}
 */
okCreditCard.checkDigit = function(cardNum, type) {
    // verify check-digit, if card type specifies
    if (okCreditCard.Types[type].hasCheckDigit) {
        var sum = 0;
        var i, j, k, l;
        for (i = cardNum.length - 1, j = true; i >= 0; i--, j = !j) {
            l = 0;
            if (j) {
                sum += parseInt(cardNum.charAt(i));
            } else { // add the sum of the digits
                if ((k = parseInt(cardNum.charAt(i))) > 4) {
                    sum += 2 * k - 9;
                } else {
                    sum += 2 * k;
                }
            }
        }
        if (sum % 10 != 0) {
            return false;
        }
    }
    return true;
};

/**
 * Define known valid card types
 * @type {*}
 */
okCreditCard.Types = {
    // Common types used online
    'Visa'         : {hasCheckDigit: true, len: '13|16'   , prefixes: '4'},
    'MasterCard'   : {hasCheckDigit: true, len: '16'      , prefixes: '51|52|53|54|55'},
    'AmEx'         : {hasCheckDigit: true, len: '15'      , prefixes: '34|37'},
    'Discover'     : {hasCheckDigit: true, len: '16'      , prefixes: '6011|650'},
    // Other types known
    'DinersClub'   : {hasCheckDigit: true, len: '14|16'   , prefixes: '300|301|302|303|304|305|36|38|55'},
    'CarteBlanche' : {hasCheckDigit: true, len: '14'      , prefixes: '300|301|302|303|304|305|36|38'},
    'JCB'          : {hasCheckDigit: true, len: '15|16'   , prefixes: '3|1800|2131'},
    'enRoute'      : {hasCheckDigit: true, len: '15'      , prefixes: '2014|2149'},
    'Solo'         : {hasCheckDigit: true, len: '16|18|19', prefixes: '6334|6767'},
    'Switch'       : {hasCheckDigit: true, len: '16|18|19', prefixes: '4903|4905|4911|4936|564182|633110|6333|6759'},
    'Maestro'      : {hasCheckDigit: true, len: '16'      , prefixes: '5020|6'},
    'VisaElectron' : {hasCheckDigit: true, len: '16'      , prefixes: '417500|4917|4913'}
};

/**
 * Infer a card's type by its number
 * @param cardNum The credit card number to check
 * @returns string|bool Type name|false
 */
okCreditCard.infer = function(cardNum) {
    cardNum = cardNum.replace(/[\s\-]/g, '');

    // verify number is actually numeric
    if (!/^\d*$/.exec(cardNum)) {
        okCreditCard.errno = 1;
        return false;
    }

    var types = {};
    var type;

    // Find which cards' prefixes match supplied card
    for (var type in okCreditCard.Types) {
        if (new RegExp('^(' + okCreditCard.Types[type].prefixes + ')').test(cardNum)) {
            types[type] = true;
        }
    }

    if (types.length == 0) {
        return false;
    }

    // Find which cards' lengths match remaining candidates
    for (type in types) {
        if (!new RegExp('^(' + okCreditCard.Types[type].len + ')$').test(cardNum.length)) {
            delete types.type;
        }
    }

    if (types.length == 0) {
        return false;
    }

    // Return name of first remaining type
    for (type in types) {
        return type;
    }
};

// Run okCreditCard.init() when the page loads
window.addEventListener
    ? window.addEventListener('load', okCreditCard.init, false)
    : window.attachEvent && window.attachEvent('onload', okCreditCard.init)
;
