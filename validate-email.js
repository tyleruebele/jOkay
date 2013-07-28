/**
 * validate-email.js
 * A pure JavaScript (no dependencies) solution to make HTML
 *  email inputs self-validating
 *
 * Copyright (c) 2013 Tyler Uebele
 * Released under the MIT license.  See included LICENSE.txt
 *  or http://opensource.org/licenses/MIT
 *
 * latest version available at https://github.com/tyleruebele/validate-email
 * 
 * Attaches itself to elements indicated in `validateEmail.query`
 * Manually attach to elements by adding `onchange="validateEmail.input"`
 * Validate email string by calling `validateEmail()`
 * Style errors by styling class in `validateEmail.errorClass`
 * 
 * 2007-04-11 original version
 * 2007-04-20 revised
 * 2013-07-28 refactored for ease of use
 * 
 * @link http://data.iana.org/TLD/tlds-alpha-by-domain.txt
 * @link http://www.icann.org/registries/listing.html
 * @link http://github.com/tyleruebele/validate-email
 */

/**
 * Validate an Email
 *
 * @param email      The email address to validate
 * @param beStrict   Whether to require an internet domain
 * @param beStricter Whether to require a known TLD
 * @returns int 0 on success
 */
function validateEmail(email, beStrict, beStricter) {
    // Set defaults for strictness parameters
    beStrict = 'undefined' !== typeof beStrict ? beStrict : true;
    beStricter = 'undefined' !== typeof beStricter ? beStricter : false;

    // Grab user and host, fails if not exactly one @ character
    var Parts = /^([^@]+)@([^@]+)$/.exec(email);
    if (Parts == null) {
        return 1;
    }
    var user = Parts[1];
    var domain = Parts[2];

    // NOT:       CTRL     SP  (   )   <   >   @   ,   ;   :   \   "   .   [   ]  DEL EXT
    var atom = '[^\000-\037\040\050\051\074\076\100\054\073\072\134\042\056\133\\]\177\200-\377]+';
    var quoted = '"[\040\041\043-\176]+"';
    var LocalPartRE = new RegExp('^(' + quoted + '|' + atom + ')(\\.(' + quoted + '|' + atom + '))*$');

    // test user
    if (user.match(LocalPartRE) == null) {
        return 2;
    }

    // An IP based email address is @[#.#.#.#], that is, an IP in square brackets
    var domainIP = '\\[(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\]';
    var DomainIPRE = new RegExp('^' + domainIP + '$');
    var DomainNaRE = new RegExp('^' + atom + '(\\.' + atom + ')*$');
    var DomainRE = new RegExp('^(' + domainIP + '|(' + atom + '(\\.' + atom + ')*))$');

    // test domain
    if (domain.match(DomainRE) == null) {
        return 3;
    }

    // if IP, validate IP
    if (Parts = domain.match(DomainIPRE)) {
        if (Parts[1] > 255 || Parts[2] > 255 || Parts[3] > 255 || Parts[4] > 255) {
            return 4;
        } else {
            return 0; // Success
        }
    }

    // if beStrict && Named Domain, validate tld & RFC1035
    if (true === beStrict && domain.match(DomainNaRE) != null) {
        Parts = domain.split('.');

        var TLDRE;
        if (true === beStricter) {
            // check complete list
            // TLD list taken from http://data.iana.org/TLD/tlds-alpha-by-domain.txt
            // # Version 2013071400, Last Updated Sun Jul 14 07:07:01 2013 UTC
            TLDRE = /^(AC|AD|AE|AERO|AF|AG|AI|AL|AM|AN|AO|AQ|AR|ARPA|AS|ASIA|AT|AU|AW|AX|AZ|BA|BB|BD|BE|BF|BG|BH|BI|BIZ|BJ|BM|BN|BO|BR|BS|BT|BV|BW|BY|BZ|CA|CAT|CC|CD|CF|CG|CH|CI|CK|CL|CM|CN|CO|COM|COOP|CR|CU|CV|CW|CX|CY|CZ|DE|DJ|DK|DM|DO|DZ|EC|EDU|EE|EG|ER|ES|ET|EU|FI|FJ|FK|FM|FO|FR|GA|GB|GD|GE|GF|GG|GH|GI|GL|GM|GN|GOV|GP|GQ|GR|GS|GT|GU|GW|GY|HK|HM|HN|HR|HT|HU|ID|IE|IL|IM|IN|INFO|INT|IO|IQ|IR|IS|IT|JE|JM|JO|JOBS|JP|KE|KG|KH|KI|KM|KN|KP|KR|KW|KY|KZ|LA|LB|LC|LI|LK|LR|LS|LT|LU|LV|LY|MA|MC|MD|ME|MG|MH|MIL|MK|ML|MM|MN|MO|MOBI|MP|MQ|MR|MS|MT|MU|MUSEUM|MV|MW|MX|MY|MZ|NA|NAME|NC|NE|NET|NF|NG|NI|NL|NO|NP|NR|NU|NZ|OM|ORG|PA|PE|PF|PG|PH|PK|PL|PM|PN|POST|PR|PRO|PS|PT|PW|PY|QA|RE|RO|RS|RU|RW|SA|SB|SC|SD|SE|SG|SH|SI|SJ|SK|SL|SM|SN|SO|SR|ST|SU|SV|SX|SY|SZ|TC|TD|TEL|TF|TG|TH|TJ|TK|TL|TM|TN|TO|TP|TR|TRAVEL|TT|TV|TW|TZ|UA|UG|UK|US|UY|UZ|VA|VC|VE|VG|VI|VN|VU|WF|WS|XN--0ZWM56D|XN--11B5BS3A9AJ6G|XN--3E0B707E|XN--45BRJ9C|XN--80AKHBYKNJ4F|XN--80AO21A|XN--90A3AC|XN--9T4B11YI5A|XN--CLCHC0EA0B2G2A9GCD|XN--DEBA0AD|XN--FIQS8S|XN--FIQZ9S|XN--FPCRJ9C3D|XN--FZC2C9E2C|XN--G6W251D|XN--GECRJ9C|XN--H2BRJ9C|XN--HGBK6AJ7F53BBA|XN--HLCJ6AYA9ESC7A|XN--J1AMH|XN--J6W193G|XN--JXALPDLP|XN--KGBECHTV|XN--KPRW13D|XN--KPRY57D|XN--LGBBAT1AD8J|XN--MGB9AWBF|XN--MGBAAM7A8H|XN--MGBAYH7GPA|XN--MGBBH1A71E|XN--MGBC0A9AZCG|XN--MGBERP4A5D4AR|XN--MGBX4CD0AB|XN--O3CW4H|XN--OGBPF8FL|XN--P1AI|XN--PGBS0DH|XN--S9BRJ9C|XN--WGBH1C|XN--WGBL6A|XN--XKC2AL3HYE2A|XN--XKC2DL3A5EE0H|XN--YFRO4I67O|XN--YGBI2AMMX|XN--ZCKZAH|XXX|YE|YT|ZA|ZM|ZW)$/i;
            if (Parts[Parts.length - 1].match(TLDRE) == null) {
                return 5;
            }
        } else {
            // check short list, and assume a 2 letter TLD is a valid one
            // TLD list taken from http://www.icann.org/registries/listing.html
            TLDRE = /^(aero|asia|arpa|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|post|pro|tel|travel|xxx)$/i;
            if (Parts[Parts.length - 1].length != 2
                && Parts[Parts.length - 1].match(TLDRE) == null
                ) {
                return 5;
            }
        }

        for (var i = 0; i < Parts.length; i++) {
            if (Parts[i].length > 63) {
                return 6;
            }
            // check for hyphens below to be more specific in our error
            if (Parts[i].charAt(0) == '-') {
                return 7;
            }
            if (Parts[i].charAt(Parts[i].length - 1) == '-') {
                return 8;
            }
            // even though RFC1035 says start with a letter, we don't always
            if (Parts[i].match(/^[a-zA-Z0-9\-]{1,63}$/) == null) {
                return 9;
            }
        }
    }

    return 0;
}

/**
 * Input event handler, adds email validation to selected inputs
 * 
 * @param Input
 * @param beStrict
 * @param beStricter
 */
validateEmail.input = function(Input, beStrict, beStricter) {
    // If beStrict was not passed, seek counter-indicative className
    if ('undefined' === typeof beStrict) {
        beStrict = !Input.className.match(/js-validate-email-looser/);
    }
    // If beStricter was not passed, seek indicative className
    if ('undefined' === typeof beStricter) {
        beStricter = !!Input.className.match(/js-validate-email-stricter/);
    }

    Input.className = Input.className.replace(validateEmail.errorClass, '');
    
    if ('' == Input.value) {
        Input.title = '';
    } else {
        var isInvalid = validateEmail(Input.value, beStrict, beStricter);
        if (0 === isInvalid) {
            Input.title = validateEmail.Errors[0];
        } else if ('undefined' != typeof validateEmail.Errors[isInvalid]) {
            Input.title = validateEmail.Errors[isInvalid];
            Input.className += ' ' + validateEmail.errorClass;
        } else {
            Input.title = validateEmail.Errors[validateEmail.Errors.length - 1];
            Input.className += ' ' + validateEmail.errorClass;
        }
    }
};

/**
 * Attaches input event handler to selected inputs
 */
validateEmail.init = function() {
    // Find all specified inputs
    var Inputs = document.querySelectorAll(validateEmail.query);
    for (var i = Inputs.length - 1; i >= 0; i--) {
        Inputs[i].addEventListener('change', function() {
            validateEmail.input(this);
        });
    }
};

/**
 * validateEmail response code messages
 * Customized script by altering this before validateEmail is called
 * @type {Array}
 */
validateEmail.Errors = [
    'Email Validation Passed', // 0
    "Wrong number of '@'",     // 1
    'Invalid Email User',      // 2
    'Invalid Email Domain',    // 3
    'Invalid IP address',      // 4
    'Invalid Domain TLD',      // 5
    'Maximum Length Error',    // 6
    'Leading Hyphen Error',    // 7
    'Trailing Hyphen Error',   // 8
    'Invalid Domain Label',    // 9
    'Email Validation Failed'  // Unknown Error
];

/**
 * querySelector for which inputs will be validated
 * Customized script by altering this before validateEmail.init is called
 * @type {string}
 */
validateEmail.query = 'input[type=email],'
    + 'input.js-validate-email,'
    + 'input.js-validate-email-looser,'
    + 'input.js-validate-email-strict,'
    + 'input.js-validate-email-stricter'
;

/**
 * CSS class to be applied to inputs with invalid email values
 * Customized script by altering this before validateEmail is called
 * Style Invalid inputs by styling this class
 * @type {string}
 */
validateEmail.errorClass = 'js-validate-email-error';

// Run validateEmail.init() when the page loads
window.addEventListener
    ? window.addEventListener('load', validateEmail.init, false)
    : window.attachEvent && window.attachEvent('onload', validateEmail.init)
;
