/**
 * ok-ipv4.js
 * A pure JavaScript (no dependencies) solution to make HTML
 *  IPv4 inputs self-validating
 *
 * Copyright (c) 2013 Tyler Uebele
 * Released under the MIT license.  See included LICENSE
 *  or http://opensource.org/licenses/MIT
 *
 * latest version available at https://github.com/tyleruebele/jOkay
 *
 * Attaches itself to elements indicated in `okIPv4.query`
 * Manually attach to elements by adding `onblur="okIPv4.blur"`
 * Validate ipv4 string by calling `okIPv4()`
 * Style errors by styling class in `okIPv4.errorClass`
 *
 * History
 * 2013-08-16 : original version
 *
 * @link http://github.com/tyleruebele/jOkay
 */

/**
 * Validate an IPv4
 *
 * @param ipv4     The ipv4 address to validate
 * @param beStrict Enforce internet routable addresses
 * @returns bool|string false on failure, ipv4 address on success
 */
function okIPv4(ipv4, beStrict) {
    // Trim the ipv4 of whitespace
    ipv4 = ipv4.replace(/^\s+|\s+$/g, '');

    beStrict = 'undefined' !== typeof beStrict ? beStrict : false;

    // Grab the four Octets of a dotted-decimal address
    var parts = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ipv4);
    if (parts == null) {
        okIPv4.errno = 1;
        return false;
    }
    if (4 != parts.length) {
        okIPv4.errno = okIPv4.errors.length - 1; // This should never happen
    }

    if (parts[1] > 255 || parts[2] > 255 || parts[3] > 255 || parts[4] > 255) {
        okIPv4.errno = 2;
        return false;
    }

    if (beStrict
        && (127 == parts[1] // Loopback
            || 0 == parts[1] || 0 == parts[4]
            || 255 == parts[1] || 255 == parts[2]
            || 255 == parts[3] || 255 == parts[4] // Broadcast
            || 10 == parts[1] // Class A private
            || (172 == parts[1] && 16 <= parts[2] && 31 >= parts[2]) // Class B private
            || (192 == parts[1] && 168 == parts[2]) // Class C private
            || (169 == parts[1] && 254 == parts[2]) // Link-local
        )
    ) {
        okIPv4.errno = 3;
        return false;
    }

    okIPv4.errno = 0;
    return ipv4;
}

/**
 * Input event handler, adds ipv4 validation to selected inputs
 *
 * @param event    JS Event object
 * @param Input    DOM object for triggering input
 * @param beStrict Whether to require public address
 */
okIPv4.blur = function(event, Input, beStrict) {
    // If beStrict was not passed, seek counter-indicative className
    if ('undefined' === typeof beStrict) {
        beStrict = !!Input.className.match(/js-ok-ipv4-strict/);
    }

    Input.className = Input.className.replace(okIPv4.errorClass, '');
    Input.title = '';
    if ('' == Input.value.replace(/^\s+|\s+$/g, '')) {
        return;
    }

    var ipv4 = okIPv4(Input.value, beStrict);

    if (false === ipv4) {
        Input.title = okIPv4.errors[okIPv4.errno];
        Input.className += ' ' + okIPv4.errorClass;
    } else {
        Input.title = '';
        Input.value = ipv4;
    }
};

/**
 * Attaches input event handler to selected inputs
 */
okIPv4.init = function() {
    // Find all specified inputs
    var Inputs = document.querySelectorAll(okIPv4.query);
    for (var i = Inputs.length - 1; i >= 0; i--) {
        // If the browser supports ipv4 inputs, don't interfere
        if ('text' == Inputs[i].type) {
            if (window.addEventListener) {
                Inputs[i].addEventListener('blur', function(event) {
                    okIPv4.blur(event, this);
                });
            } else if (window.attachEvent) {
                Inputs[i].attachEvent('onblur', function(event) {
                    event = event || window.event;
                    okIPv4.blur(event, event.target || event.srcElement);
                });
            }
        }
    }
};

/**
 * Hold the error number produced by okIPv4, or 0 for no error
 * @type {number}
 */
okIPv4.errno = 0;

/**
 * okIPv4 response code messages
 * Customized script by altering this before okIPv4 is called
 * @type {Array}
 */
okIPv4.errors = [
    'IPv4 Validation Passed',  // 0
    'Malformed IPv4 address',  // 1
    'Invalid IPv4 Octet',      // 2
    'Public address required', // 3
    'IPv4 Validation Failed'   // Unknown Error
];

/**
 * querySelector for which inputs will be validated
 * Customized script by altering this before okIPv4.init is called
 * @type {string}
 */
okIPv4.query = 'input[type=ipv4],'
    + 'input.js-ok-ipv4,'
    + 'input.js-ok-ipv4-loose,'
    + 'input.js-ok-ipv4-strict'
;

/**
 * CSS class to be applied to inputs with invalid ipv4 values
 * Customized script by altering this before okIPv4 is called
 * Style Invalid inputs by styling this class
 * @type {string}
 */
okIPv4.errorClass = 'js-ok-ipv4-error';

// Run okIPv4.init() when the page loads
window.addEventListener
    ? window.addEventListener('load', okIPv4.init, false)
    : window.attachEvent && window.attachEvent('onload', okIPv4.init)
;
