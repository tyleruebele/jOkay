/**
 * ok-regex.js
 * A pure JavaScript (no dependencies) solution to make HTML
 *  regex inputs self-validating
 *
 * Copyright (c) 2018 Tyler Uebele
 * Released under the MIT license.  See included LICENSE
 *  or http://opensource.org/licenses/MIT
 *
 * latest version available at https://github.com/tyleruebele/jOkay
 *
 * Attaches itself to elements indicated in `okregex.query`
 * Manually attach to elements by adding `onchange="okregex.blur"`
 * Validate regex string by calling `okregex()`
 * Style errors by styling class in `okregex.errorClass`
 *
 * History:
 * 2018-06-05 : original version
 *
 * @link http://github.com/tyleruebele/jOkay
 */

/**
 * Validate a regex
 *
 * @param regex    The regex to validate
 * @returns bool|string false on failure, formatted number on success
 */
function okregex(regex, delimeters, modifiers) {
    // Set defaults for allowed delimiters and modifiers
    delimeters = 'undefined' !== typeof delimeters ? delimeters : okregex.validDelimeters;
    modifiers = 'undefined' !== typeof modifiers ? modifiers : okregex.validModifiers;


    // Ensure regex ends with only valid modifiers
    RE = new RegExp('[' + delimeters + '][' + modifiers + ']{0,'+modifiers.length+'}$');
    if (false === RE.test(regex)) {
        okregex.errno = 1;
        return false;
    }

    // Ensure regex uses valid delimeters
    var RE = new RegExp('^['+delimeters+'].*['+delimeters+']\\w{0,'+modifiers.length+'}$');
    if (false === RE.test(regex)) {
        okregex.errno = 2;
        return false;
    }

    // Ensure regex has matching delimeters and only valid modifiers
    RE = new RegExp('^([' + delimeters + ']).*\\1[' + modifiers + ']{0,'+modifiers.length+'}$');
    if (false === RE.test(regex)) {
        okregex.errno = 3;
        return false;
    }

    return true;
}

/**
 * Input event handler, adds regex validation to selected inputs
 *
 * @param Input
 */
okregex.blur = function(event, Input) {
    Input.className = Input.className.replace(okregex.errorClass, '');
    Input.title = '';
    // Ignore blank fields
    if ('' == Input.value.replace(/^\s+|\s+$/g, '')) {
        return;
    }

    var regex = okregex(Input.value);

    if (false === regex) {
        Input.title = okregex.errors[okregex.errno];
        Input.className += ' ' + okregex.errorClass;
    }
};

/**
 * Attaches input event handler to selected inputs
 */
okregex.init = function() {
    // Find all specified inputs
    var Inputs = document.querySelectorAll(okregex.query);
    for (var i = Inputs.length - 1; i >= 0; i--) {
        if (window.addEventListener) {
            Inputs[i].addEventListener('blur', function(event) {
                okregex.blur(event, this);
            });
        } else if (window.attachEvent) {
            Inputs[i].attachEvent('onblur', function(event) {
                event = event || window.event;
                okregex.blur(event, event.target || event.srcElement);
            });
        }
    }
};

/**
 * Hold the error number produced by okregex, or 0 for no error
 * @type {number}
 */
okregex.errno = 0;

/**
 * okregex response code messages
 * Customized script by altering this before okregex is called
 * @type {Array}
 */
okregex.errors = [
    'regex Validation Passed', // 0
    'Invalid modifier',        // 1
    'Invalid Delimeter',       // 2
    'regex Validation Failed'  // Unknown Error
];

/**
 * querySelector for which inputs will be validated
 * Customized script by altering this before okregex.init is called
 * @type {string}
 */
okregex.query = 'input[type=regex],'
    + 'input.js-ok-regex'
;

/**
 * CSS class to be applied to inputs with invalid regex values
 * Customized script by altering this before okregex is called
 * Style Invalid inputs by styling this class
 * @type {string}
 */
okregex.errorClass = 'js-ok-regex-error';

/**
 * Restrict which characters can be used as start/end delimeters
 *
 * @type {string}
 */
okregex.validDelimeters = '~/%|#+';

/**
 * Restrict flags/modifiers can be used
 * Javascript supports g,i,m
 * PHP supports i,m,s,x,A,D,S,U,X,J,u
 * By default this library allows g,i,m,s
 * Overwrite this variable to change which modifiers
 * @type {string}
 */
okregex.validModifiers = 'gims';

// Run okregex.init() when the page loads
window.addEventListener
    ? window.addEventListener('load', okregex.init, false)
    : window.attachEvent && window.attachEvent('onload', okregex.init)
;
