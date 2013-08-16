/**
 * ok-date.js
 * A pure JavaScript (no dependencies) solution to make HTML date inputs
 *  self-validating
 *
 * Copyright (c) 2013 Tyler Uebele
 * Released under the MIT license.  See included LICENSE
 *  or http://opensource.org/licenses/MIT
 *
 * latest version available at https://github.com/tyleruebele/jOkay
 *
 * Attaches itself to elements indicated in `okDate.query`
 * Manually attach to elements by adding `onchange="okDate.input"`
 * Validate date string by calling `okDate()`
 * Style errors by styling class in `okDate.errorClass`
 *
 * History:
 * 2006-12-07 : Initial version
 * 2007-05-17 : revised
 * 2013-08-11 : refactored to stand-alone script, added to jOkay
 */

/**
 * Core function which validates date strings
 * 
 * @param inDate String to parse as date
 * @param endian Date part order: {YMD,DMY,MDY}
 * @returns {*}
 */
function okDate(inDate, endian) {
    inDate = inDate.replace(/^\s+|\s+$/g, '');
    endian = 'undefined' !== typeof endian ? endian : 'mdy';
    okDate.errno = 0;

    var OutDate = new Date();
    /*
     * Common single words for dates
     */
    // Now
    if (/^now/i.exec(inDate)) {
        return OutDate;
    }

    // Today
    if (/^tod(ay?)?$/i.exec(inDate)) {
        return OutDate;
    }

    // Tomorrow
    if (new RegExp('^' + inDate, 'i').test('tomorrow')) {
        OutDate.setDate(OutDate.getDate() + 1);
        return OutDate;
    }

    // Yesterday
    if (new RegExp('^' + inDate, 'i').test('yesterday')) {
        OutDate.setDate(OutDate.getDate() - 1);
        return OutDate;
    }


    /*
     * Common formats including day-of-month
     */
    var bits;
    var month;
    
    // nth
    if (bits = /^(\d{1,2})(?:st|nd|rd|th)?$/i.exec(inDate)) {
        month = OutDate.getMonth();
        OutDate.setDate(parseInt(bits[1], 10));
    
        if (month != OutDate.getMonth()) {
            okDate.errno = 1;
            return false;
        }
        return OutDate;
    }

    // nth Month
    if (bits = /^(\d{1,2})(?:st|nd|rd|th)? (\w+)$/i.exec(inDate)) {
        OutDate.setDate(1);
        OutDate.setMonth(month = okDate.month(bits[2]));
        OutDate.setDate(parseInt(bits[1], 10));
    
        if (false === month) {
            okDate.errno = 3;
            return false;
        }
        if (month != OutDate.getMonth()) {
            okDate.errno = 2;
            return false;
        }
        return OutDate;
    }

    // nth Month YYYY
    if (bits = /^(\d{1,2})(?:st|nd|rd|th)? (\w+),? (\d{2,4})$/i.exec(inDate)) {
        OutDate.setDate(1);
        OutDate.setFullYear(okDate.year(parseInt(bits[3], 10)));
        OutDate.setMonth(month = okDate.month(bits[2]));
        OutDate.setDate(parseInt(bits[1], 10));

        if (false === month) {
            okDate.errno = 3;
            return false;
        }
        if (month != OutDate.getMonth()) {
            okDate.errno = 2;
            return false;
        }
        return OutDate;
    }

    // Month nth
    if (bits = /^(\w+) (\d{1,2})(?:st|nd|rd|th)?$/i.exec(inDate)) {
        OutDate.setDate(1);
        OutDate.setMonth(month = okDate.month(bits[1]));
        OutDate.setDate(parseInt(bits[2], 10));

        if (false === month) {
            okDate.errno = 3;
            return false;
        }
        if (month != OutDate.getMonth()) {
            okDate.errno = 2;
            return false;
        }
        return OutDate;
    }

    // Month nth YYYY
    if (bits = /^(\w+) (\d{1,2})(?:st|nd|rd|th)?,? (\d{2,4})$/i.exec(inDate)) {
        OutDate.setDate(1);
        OutDate.setFullYear(okDate.year(parseInt(bits[3], 10)));
        OutDate.setMonth(month = okDate.month(bits[1]));
        OutDate.setDate(parseInt(bits[2], 10));

        if (false === month) {
            okDate.errno = 3;
            return false;
        }
        if (month != OutDate.getMonth()) {
            okDate.errno = 2;
            return false;
        }
        return OutDate;
    }


    /*
     * Common day-of-week expressions
     */
    var day;
    var newDay;
    var addDays;

    // Thatday - this is suspect due to varying expectations about implied next/last day
    if (bits = /^(\w+)$/i.exec(inDate)) {
        day = OutDate.getDay();
        newDay = okDate.weekday(bits[1]);
        if (false === newDay) {
            okDate.errno = 4;
            return false;
        }
        addDays = newDay - day;
        OutDate.setDate(OutDate.getDate() + addDays);
        return OutDate;
    }

    // Thatday week - Australian way of saying a week from this coming Tuesday
    if (bits = /^(\w+) week$/i.exec(inDate)) {
        day = OutDate.getDay();
        newDay = okDate.weekday(bits[1]);
        if (false === newDay) {
            okDate.errno = 4;
            return false;
        }
        addDays = newDay - day;
        if (newDay <= day) { // for coming [specified]day
            addDays += 7;
        }
        addDays += 7; // for the week after
        OutDate.setDate(OutDate.getDate() + addDays);
        return OutDate;
    }

    // next Thatday - this is suspect due to sometimes ambiguous meaning of "next"
    if (bits = /^next? (\w+)$/i.exec(inDate)) {
        day = OutDate.getDay();
        newDay = okDate.weekday(bits[1]);
        if (false === newDay) {
            okDate.errno = 4;
            return false;
        }
        addDays = newDay - day;
        if (newDay <= day) {
            addDays += 7;
        }
        OutDate.setDate(OutDate.getDate() + addDays);
        return OutDate;
    }

    // last Thatday - this is suspect due to sometimes ambiguous meaning of "last"
    if (bits = /^last? (\w+)$/i.exec(inDate)) {
        day = OutDate.getDay();
        newDay = okDate.weekday(bits[1]);
        if (false === newDay) {
            okDate.errno = 4;
            return false;
        }
        addDays = newDay - day;
        if (newDay >= day) {
            addDays -= 7;
        }
        OutDate.setDate(OutDate.getDate() + addDays);
        return OutDate;
    }
    

    /*
     * Common Numeric formats
     */
    // mm/dd(/(cc)yy) (Middle-Endian/American style)
    // dd/mm(/(cc)yy) (Little-Endian/Terran style) depends on endian flag set to false
    if (bits = /^(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?$/.exec(inDate)) {
        if ('dmy' != endian) {
            var tmp = bits[1];
            bits[1] = bits[2];
            bits[2] = tmp;
        }
        OutDate.setDate(1);
        if (bits[3]) {
            OutDate.setFullYear(okDate.year(parseInt(bits[3], 10)));
        }
        OutDate.setMonth(month = parseInt(bits[2], 10) - 1); // Because months indexed from 0
        OutDate.setDate(parseInt(bits[1], 10));
        
        if (month >= 12) {
            okDate.errno = 3;
            return false;
        }
        if (month != OutDate.getMonth()) {
            okDate.errno = 2;
            return false;
        }
        return OutDate;
    }

    // yyyy-mm-dd (Big-Endian/ISO style)
    if (bits = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(inDate)) {
        OutDate.setDate(1);
        OutDate.setFullYear(parseInt(bits[1], 10));
        OutDate.setMonth(month = parseInt(bits[2], 10) - 1); // Because months indexed from 0
        OutDate.setDate(parseInt(bits[3], 10));
        
        if (month >= 12) {
            okDate.errno = 3;
            return false;
        }
        if (month != OutDate.getMonth()) {
            okDate.errno = 2;
            return false;
        }
        return OutDate;
    }

    
    var milli;
    // now that I've checked what and how I want to check, let the JS API try what's left.
    if (milli = Date.parse(inDate)) {
        OutDate.setTime(milli);
        return OutDate;
    }

    okDate.errno = okDate.errors.length - 1;
    return false;
}

/**
 * Convert year of various notation to full year
 * 
 * @param year Year to convert
 * @returns {number} Converted year
 */
okDate.year = function(year) {
    return year < 70
        ? year + 2000
        : (year < 100
            ? year + 1900
            : (year < 1000
                ? year + 1000
                : year
              )
          )
        ;
};

/**
 * List of month names
 * @type {Array}
 */
okDate.months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Takes a string, returns the index of the month matching that string
 *
 * @param month
 * @returns {*}
 */
okDate.month = function(month) {
    var matches = okDate.months.filter(function(item) {
        return new RegExp("^" + month, "i").test(item);
    });
    if (matches.length != 1) {
        return false;
    }
    
    return okDate.months.indexOf(matches[0]);
};

/**
 * List of days of week
 * @type {Array}
 */
okDate.weekdays = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
    'Saturday'
];

/**
 * Takes a string, returns the index of the weekday matching that string
 * 
 * @param weekday
 * @returns {*}
 */
okDate.weekday = function(weekday) {
    var matches = okDate.weekdays.filter(function(item) {
        return new RegExp('^' + weekday, 'i').test(item);
    });
    if (matches.length != 1) {
        return false;
    }
    
    return okDate.weekdays.indexOf(matches[0]);
};

/**
 * Hold the error number produced by okDate, or 0 for no error
 * @type {number}
 */
okDate.errno = 0;

/**
 * okDate response code messages
 * Customized script by altering this before okDate is called
 * @type {Array}
 */
okDate.errors = [
    'Date Validation Passed',            // 0
    'Too many days for current month',   // 1
    'Too many days for specified month', // 2
    'Invalid month specified',           // 3
    'Invalid weekday specified',         // 4
    'Date Validation Failed'             // ?
];

/**
 * querySelector for which inputs will be validated
 * Customized script by altering this before okDate.init is called
 * @type {string}
 */
okDate.query = 'input[type=date],'
    + 'input.js-ok-date,'
    + 'input.js-ok-date-ymd,' // ISO
    + 'input.js-ok-date-mdy,' // American
    + 'input.js-ok-date-dmy'  // Rest of Earth
;

/**
 * CSS class to be applied to inputs with invalid date values
 * Customized script by altering this before okDate is called
 * Style Invalid inputs by styling this class
 * @type {string}
 */
okDate.errorClass = 'js-ok-date-error';

/**
 * Attaches input event handler to selected inputs
 */
okDate.init = function() {
    // Find all specified inputs
    var Inputs = document.querySelectorAll(okDate.query);
    for (var i = Inputs.length - 1; i >= 0; i--) {
        Inputs[i].addEventListener('blur', function(event) {
            event.preventDefault();
            okDate.blur(event, this);
        });
        if ('text' == Inputs[i].type) {
            Inputs[i].addEventListener('keyup', function(event) {
                event.preventDefault();
                okDate.key(event, this);
            });
        }
    }
};

/**
 * Input event handler, adds date validation to selected inputs
 *
 * @param event  JS Event object
 * @param Input  DOM object for triggering input
 * @param endian Date part order: {YMD,DMY,MDY}
 */
okDate.blur = function(event, Input, endian) {
    // If endian was not passed, seek indicative className
    if ('undefined' === typeof endian) {
        endian = Input.className.match(/js-ok-date-mdy/) ? 'mdy'
            : Input.className.match(/js-ok-date-dmy/) ? 'dmy' : 'ymd';
    }

    Input.className = Input.className.replace(okDate.errorClass, '');

    var OutDate = okDate(Input.value, endian);
    if ('' != Input.value && false === OutDate) {
        Input.title = okDate.errors[okDate.errno];
        Input.className += ' ' + okDate.errorClass;
    } else {
        Input.title = '';
        Input.value = okDate.format(OutDate, endian);
    }
};

/**
 * Input event handler, adds date validation to selected inputs
 *
 * @param event  JS Event object
 * @param Input  DOM object for triggering input
 * @param endian Date part order: {YMD,DMY,MDY}
 */
okDate.key = function(event, Input, endian) {
    // If endian was not passed, seek indicative className
    if ('undefined' === typeof endian) {
        endian = Input.className.match(/js-ok-date-mdy/) ? 'mdy'
            : Input.className.match(/js-ok-date-dmy/) ? 'dmy' : 'ymd';
    }

    var key = event.keyCode ? event.keyCode : event.which;
    var OutDate;

    switch (key) {
        case 38: // up
            OutDate = okDate(Input.value || 'today', endian);
            OutDate.setDate(OutDate.getDate() + 1);
            Input.value = okDate.format(OutDate, endian);
            break;
 
        case 40: // down
            OutDate = okDate(Input.value || 'today', endian);
            OutDate.setDate(OutDate.getDate() - 1);
            Input.value = okDate.format(OutDate, endian);
            break;
 
        case 39: // right
            if (Input.value != '') {
                break;
            }
            OutDate = okDate('today', endian);
            Input.value = okDate.format(OutDate, endian);
            break;
    }
    return true;
};

/**
 * Reformat date according to specified endian format
 *
 * @param InDate Date object to format
 * @param endian Date part order: {YMD,DMY,MDY}
 * @returns {string}
 */
okDate.format = function(InDate, endian) {
    var year  = String(InDate.getFullYear());
    var month = String(InDate.getMonth() + 1);
    var date  = String(InDate.getDate());
    month = 1 === month.length ? '0' + month : month;
    date  = 1 === date.length  ? '0' + date  : date;
    
    // Reformat date according to specified endian format
    if ('mdy' == endian) {
        return month + '/' + date + '/' + year;
    }
    if ('dmy' == endian) {
        return date + '/' + month + '/' + year;
    }

    return year + '-' + month + '-' + date;
};

// Run validatePhone.init() when the page loads
window.addEventListener
    ? window.addEventListener('load', okDate.init, false)
    : window.attachEvent && window.attachEvent('onload', okDate.init)
;
