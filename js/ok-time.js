/**
 * ok-time.js
 * A pure JavaScript (no dependencies) solution to make HTML
 *  time inputs self-validating
 *
 * Copyright (c) 2013 Tyler Uebele
 * Released under the MIT license.  See included LICENSE
 *  or http://opensource.org/licenses/MIT
 *
 * latest version available at https://github.com/tyleruebele/jOkay
 *
 * Attaches itself to elements indicated in `okTime.query`
 * Manually attach to elements by adding `onblur="okTime.blur"`
 * Validate time string by calling `okTime()`
 * Style errors by styling class in `okTime.errorClass`
 *
 * History
 * 2013-08-16 : original version
 *
 * @link http://github.com/tyleruebele/jOkay
 */

/**
 * Validate a time
 *
 * @param inTime The time to validate
 * @returns bool|Date false on failure, Date object on success
 */
function okTime(inTime) {
    inTime = inTime.replace(/^\s+|\s+$/g, '');
    var bits;
    var OutTime = new Date();

    // Blank
    if ('' == inTime) {
        okTime.errno = 4;
        return false;
    }
    
    // Now
    if (/^now/i.exec(inTime)) {
        return OutTime;
    }

    // Noon
    if (/^(12(00)?n|noon?|midd(ay?)?)/i.exec(inTime)) {
        OutTime.setSeconds(0);
        OutTime.setMinutes(0);
        OutTime.setHours(12);
        return OutTime;
    }
    
    // Midnight
    if (new RegExp('^' + inTime, 'i').test('midnight')) {
        OutTime.setSeconds(0);
        OutTime.setMinutes(0);
        OutTime.setHours(0);
        return OutTime;
    }

    var hour;
    var minute;
    var second;
    // 0530
    if (bits = /^(\d{1,2})(\d{2})?(\d{2})?\s*(am?|pm?)?$/i.exec(inTime)) {
        hour = parseInt(bits[1], 10);
        if (hour > 23) {
            okTime.errno = 1;
            return false;
        }
        minute = parseInt(bits[2], 10);
        if (minute > 59) {
            okTime.errno = 2;
            return false;
        }
        second = parseInt(bits[3], 10);
        if (second > 59) {
            okTime.errno = 3;
            return false;
        }
        if (bits[4]) {
            hour += bits[4].toLowerCase().indexOf('p') > -1 ? 12 : 0;
            if (hour == 12) {
                hour = 0;
            }
        }
        OutTime.setSeconds(second || 0);
        OutTime.setMinutes(minute || 0);
        OutTime.setHours(hour);
        
        return OutTime;
    }

    // hh:mm:ss
    if (bits = /^(\d{1,2}):(\d{1,2})(:(\d{1,2}))?\s*(am?|pm?)?$/i.exec(inTime)) {
        hour = parseInt(bits[1], 10);
        if (hour > 23) {
            okTime.errno = 1;
            return false;
        }
        minute = parseInt(bits[2], 10);
        if (minute > 59) {
            okTime.errno = 2;
            return false;
        }
        second = parseInt(bits[4], 10);
        if (second > 59) {
            okTime.errno = 3;
            return false;
        }
        if (bits[5]) {
            hour += bits[5].toLowerCase().indexOf('p') > -1 ? 12 : 0;
            if (hour == 12) {
                hour = 0;
            }
        }
        OutTime.setSeconds(second || 0);
        OutTime.setMinutes(minute || 0);
        OutTime.setHours(hour);
        return OutTime;
    }

    var milli;
    // now that I've checked what and how I want to check, let the JS API try what's left.
    if (milli = Date.parse(inTime)) { // is there a better way to do this?
        OutTime.setSeconds(0);
        OutTime.setMinutes(0);
        OutTime.setHours(0);
        OutTime.setDate(1);
        OutTime.setFullYear(1970);
        OutTime.setMonth(0); // Because months indexed from 0
        OutTime.setMilliseconds(milli);
        return OutTime;
    }

    okTime.errno = okTime.errors.length;
    return false;
}

/**
 * Input event handler, adds time validation to selected inputs
 *
 * @param event JS Event object
 * @param Input DOM object for triggering input
 * @param be24  Whether to require public address
 */
okTime.blur = function(event, Input, be24) {
    // If beStrict was not passed, seek counter-indicative className
    if ('undefined' === typeof be24) {
        be24 = !!Input.className.match(/js-ok-time-24/);
    }

    if ('' == Input.value.replace(/^\s+|\s+$/g, '')) {
        return;
    }

    Input.className = Input.className.replace(okTime.errorClass, '');

    var OutTime = okTime(Input.value);
    if (false === OutTime) {
        Input.title = okTime.errors[okTime.errno];
        Input.className += ' ' + okTime.errorClass;
    } else {
        Input.title = '';
        Input.value = okTime.format(OutTime, be24);
    }
};

/**
 * Input event handler, adjusts time in selected inputs
 *
 * @param event JS Event object
 * @param Input DOM object for triggering input
 * @param be24  Time format: 12/24 hour clock
 */
okTime.key = function(event, Input, be24) {
    // If be24 was not passed, seek indicative className
    if ('undefined' === typeof be24) {
        be24 = !!Input.className.match(/js-ok-time-24/);
    }

    var key = event.keyCode ? event.keyCode : event.which;
    var OutTime;

    switch (key) {
        case 38: // up
            OutTime = okTime(Input.value || 'now');
            if (false === OutTime) {
                break;
            }
            if (event.shiftKey) {
                OutTime.setHours(OutTime.getHours() + 1);
            } else {
                OutTime.setMinutes(OutTime.getMinutes() + 1);
            }
            Input.value = okTime.format(OutTime, be24);
            Input.className = Input.className.replace(okTime.errorClass, '');
            break;

        case 40: // down
            OutTime = okTime(Input.value || 'now');
            if (false === OutTime) {
                break;
            }
            if (event.shiftKey) {
                OutTime.setHours(OutTime.getHours() - 1);
            } else {
                OutTime.setMinutes(OutTime.getMinutes() - 1);
            }
            Input.value = okTime.format(OutTime, be24);
            Input.className = Input.className.replace(okTime.errorClass, '');
            break;

        case 39: // right
            if ('' == Input.value) {
                Input.value = okTime.format(new Date(), be24);
            }
            break;
    }
    
    return true;
};

/**
 * Attaches input event handler to selected inputs
 */
okTime.init = function() {
    // Find all specified inputs
    var Inputs = document.querySelectorAll(okTime.query);
    for (var i = Inputs.length - 1; i >= 0; i--) {
        // If the browser supports time inputs, don't interfere
        if ('text' == Inputs[i].type) {
            if (window.addEventListener) {
                Inputs[i].addEventListener('blur', function(event) {
                    okTime.blur(event, this);
                });
                Inputs[i].addEventListener('keyup', function(event) {
                    okTime.key(event, this);
                });
            } else if (window.attachEvent) {
                Inputs[i].attachEvent('onblur', function(event) {
                    event = event || window.event;
                    okTime.blur(event, event.target || event.srcElement);
                });
                Inputs[i].attachEvent('onkeyup', function(event) {
                    event = event || window.event;
                    okTime.key(event, event.target || event.srcElement);
                });
            }
        }
    }
};

/**
 * Reformat time according to specified format
 *
 * @param InTime Date object to format
 * @param be24   Time format: 12/24 hour clock
 * @returns {string}
 */
okTime.format = function(InTime, be24) {
    var hours = InTime.getHours();
    var minutes = String(InTime.getMinutes());
    var seconds = String(InTime.getSeconds());
    var meridiem = '';
  
    if (!be24) {
        meridiem = hours > 11 ? 'pm' : 'am';
        hours %= 12;
        if (hours == 0) {
            hours = 12;
        }
        hours = String(hours);
    } else {
        hours = String(hours);
        hours = 1 === hours.length ? '0' + hours : hours;
    }
    minutes = 1 === minutes.length ? '0' + minutes : minutes;
    seconds = 1 === seconds.length ? '0' + seconds : seconds;

    return hours + ':' + minutes + ':' + seconds + meridiem;
};


/**
 * Hold the error number produced by okTime, or 0 for no error
 * @type {number}
 */
okTime.errno = 0;

/**
 * okTime response code messages
 * Customized script by altering this before okTime is called
 * @type {Array}
 */
okTime.errors = [
    'Time Validation Passed',    // 0
    'Invalid Hour',              // 1
    'Invalid Minute',            // 2
    'Invalid Second',            // 3
    'Empty String',              // 4
    'Time Validation Failed'     // Unknown Error
];

/**
 * querySelector for which inputs will be validated
 * Customized script by altering this before okTime.init is called
 * @type {string}
 */
okTime.query = 'input[type=time],'
    + 'input.js-ok-time,'
    + 'input.js-ok-time-12,'
    + 'input.js-ok-time-24'
;

/**
 * CSS class to be applied to inputs with invalid time values
 * Customized script by altering this before okTime is called
 * Style Invalid inputs by styling this class
 * @type {string}
 */
okTime.errorClass = 'js-ok-time-error';

// Run okTime.init() when the page loads
window.addEventListener
    ? window.addEventListener('load', okTime.init, false)
    : window.attachEvent && window.attachEvent('onload', okTime.init)
;
