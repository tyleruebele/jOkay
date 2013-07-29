/**
 * validate-phone.js
 * A pure JavaScript (no dependencies) solution to make HTML
 *  phone inputs self-validating
 *
 * Copyright (c) 2013 Tyler Uebele
 * Released under the MIT license.  See included LICENSE.txt
 *  or http://opensource.org/licenses/MIT
 *
 * latest version available at https://github.com/tyleruebele/validate-phone
 *
 * Attaches itself to elements indicated in `validatePhone.query`
 * Manually attach to elements by adding `onchange="validatePhone.input"`
 * Validate phone string by calling `validatePhone()`
 * Style errors by styling class in `validatePhone.errorClass`
 *
 * 2007-04-11 original version
 * 2007-04-20 revised
 * 2013-07-29 refactored for ease of use
 *
 * @link http://www.nanpa.com/enas/geoAreaCodeNumberReport.do
 * @link http://github.com/tyleruebele/validate-phone
 */

/**
 * Validate an Phone
 *
 * @param phone    The phone address to validate
 * @param beStrict Whether to require a known area code
 * @param beWordy  Whether to accept letters
 * @returns bool|string false on failure, formatted number on success
 */
function validatePhone(phone, beStrict, beWordy) {
    // Set defaults for strictness parameters
    beStrict = 'undefined' !== typeof beStrict ? beStrict : false;
    beWordy = 'undefined' !== typeof beWordy ? beWordy : false;

    // replace letters with numbers
    if (beWordy) {
        phone = phone.replace(/[a-c]/ig, '2');
        phone = phone.replace(/[d-f]/ig, '3');
        phone = phone.replace(/[g-i]/ig, '4');
        phone = phone.replace(/[j-l]/ig, '5');
        phone = phone.replace(/[m-o]/ig, '6');
        phone = phone.replace(/[p-s]/ig, '7');
        phone = phone.replace(/[t-v]/ig, '8');
        phone = phone.replace(/[w-z]/ig, '9');
    }
    
    // Reject letters
    if (/[a-z]/i.exec(phone)) {
        validatePhone.errno = 1;
        return false;
    }

    // Strip non-numbers
    phone = phone.replace(/[^0-9]/ig, '');

    // we don't really want the leading 1 in eleven digit US numbers
    if (phone.length == 11 && phone.charAt(0) == 1) {
        phone = phone.substr(1, 11);
    }

    // no ones number starts with 911!
    if (phone.substr(0, 3) == '911') {
        validatePhone.errno = 2;
        return false;
    }

    // Full american phone number
    if (phone.length == 10) { 
        if (beStrict && !validatePhone.areaCodes[phone.substr(0, 3)]) {
            validatePhone.errno = 3;
            return false;
        }
        if (phone.charAt(0) < 2           //0,1 reserved
            || phone.charAt(1) == '9'     //N9X - expansion codes reserved
            || phone.substr(1, 2) == '11' //service codes
            || phone.substr(0, 2) == '37' //37X - reserved
            || phone.substr(0, 2) == '96' //96X - reserved
        ) {
            validatePhone.errno = 3;
            return false;
        }
        if (phone.charAt(3) < 2) {
            validatePhone.errno = 4;
            return false;
        }

        return phone.substr(0, 3) + '-' + phone.substr(3, 3) + '-' + phone.substr(6, 4);
    }

    // Local american phone number
    if (!beStrict && phone.length == 7) { 
        return phone.substr(0, 3) + '-' + phone.substr(3, 4);
    }

    validatePhone.errno = 5;
    return false;
}

/**
 * Input event handler, adds phone validation to selected inputs
 *
 * @param Input
 * @param beStrict
 * @param beWordy
 */
validatePhone.input = function(Input, beStrict, beWordy) {
    // If beStrict was not passed, seek counter-indicative className
    if ('undefined' === typeof beStrict) {
        beStrict = !!Input.className.match(/js-validate-phone-strict/);
    }
    // If beWordy was not passed, seek indicative className
    if ('undefined' === typeof beWordy) {
        beWordy = !!Input.className.match(/js-validate-phone-wordy/);
    }

    Input.className = Input.className.replace(validatePhone.errorClass, '');
    Input.title = '';

    var phone = validatePhone(Input.value, beStrict, beWordy);
    if ('' != Input.value && false === phone) {
        Input.title = validatePhone.errors[validatePhone.errno];
        Input.className += ' ' + validatePhone.errorClass;
    } else {
        Input.title = validatePhone.areaCodes[phone.substr(0,3)] || '';
        Input.value = phone;
    }
};

/**
 * Attaches input event handler to selected inputs
 */
validatePhone.init = function() {
    // Find all specified inputs
    var Inputs = document.querySelectorAll(validatePhone.query);
    for (var i = Inputs.length - 1; i >= 0; i--) {
        Inputs[i].addEventListener('blur', function() {
            validatePhone.input(this);
        });
    }
};

/**
 * validatePhone response code messages
 * Customized script by altering this before validatePhone is called
 * @type {Array}
 */
validatePhone.errors = [
    'Phone Validation Passed', // 0
    'Letters in phone number', // 1
    'Can\'t start with 911',   // 2
    'Invalid Area Code',       // 3
    'Invalid Exchange',        // 4
    'Invalid Phone Length',    // 5
    'Phone Validation Failed'  // Unknown Error
];

/**
 * querySelector for which inputs will be validated
 * Customized script by altering this before validatePhone.init is called
 * @type {string}
 */
validatePhone.query = 'input[type=tel],'
    + 'input.js-validate-phone,'
    + 'input.js-validate-phone-loose,'
    + 'input.js-validate-phone-strict,'
    + 'input.js-validate-phone-wordy'
;

/**
 * CSS class to be applied to inputs with invalid phone values
 * Customized script by altering this before validatePhone is called
 * Style Invalid inputs by styling this class
 * @type {string}
 */
validatePhone.errorClass = 'js-validate-phone-error';

// http://www.nanpa.com/enas/geoAreaCodeNumberReport.do
validatePhone.areaCodes = {
    '201':'NJ',
    '202':'DC',
    '203':'CT',
    '204':'MANITOBA',
    '205':'AL',
    '206':'WA',
    '207':'ME',
    '208':'ID',
    '209':'CA',
    '210':'TX',
    '212':'NY',
    '213':'CA',
    '214':'TX',
    '215':'PA',
    '216':'OH',
    '217':'IL',
    '218':'MN',
    '219':'IN',
    '224':'IL',
    '225':'LA',
    '226':'ONTARIO',
    '228':'MS',
    '229':'GA',
    '231':'MI',
    '234':'OH',
    '236':'BRITISH COLUMBIA',
    '239':'FL',
    '240':'MD',
    '242':'BAHAMAS',
    '246':'BARBADOS',
    '248':'MI',
    '249':'ONTARIO',
    '250':'BRITISH COLUMBIA',
    '251':'AL',
    '252':'NC',
    '253':'WA',
    '254':'TX',
    '256':'AL',
    '260':'IN',
    '262':'WI',
    '264':'ANGUILLA',
    '267':'PA',
    '268':'ANTIGUA / BARBUDA',
    '269':'MI',
    '270':'KY',
    '276':'VA',
    '281':'TX',
    '284':'BRITISH VIRGIN ISLANDS',
    '289':'ONTARIO',
    '301':'MD',
    '302':'DE',
    '303':'CO',
    '304':'WV',
    '305':'FL',
    '306':'SASKATCHEWAN',
    '307':'WY',
    '308':'NE',
    '309':'IL',
    '310':'CA',
    '312':'IL',
    '313':'MI',
    '314':'MO',
    '315':'NY',
    '316':'KS',
    '317':'IN',
    '318':'LA',
    '319':'IA',
    '320':'MN',
    '321':'FL',
    '323':'CA',
    '325':'TX',
    '330':'OH',
    '331':'IL',
    '334':'AL',
    '336':'NC',
    '337':'LA',
    '339':'MA',
    '340':'USVI',
    '343':'ONTARIO',
    '345':'CAYMAN ISLANDS',
    '347':'NY',
    '351':'MA',
    '352':'FL',
    '360':'WA',
    '361':'TX',
    '365':'ONTARIO',
    '385':'UT',
    '386':'FL',
    '401':'RI',
    '402':'NE',
    '403':'ALBERTA',
    '404':'GA',
    '405':'OK',
    '406':'MT',
    '407':'FL',
    '408':'CA',
    '409':'TX',
    '410':'MD',
    '412':'PA',
    '413':'MA',
    '414':'WI',
    '415':'CA',
    '416':'ONTARIO',
    '417':'MO',
    '418':'QUEBEC',
    '419':'OH',
    '423':'TN',
    '424':'CA',
    '425':'WA',
    '430':'TX',
    '431':'MANITOBA',
    '432':'TX',
    '434':'VA',
    '435':'UT',
    '437':'ONTARIO',
    '438':'QUEBEC',
    '440':'OH',
    '441':'BERMUDA',
    '442':'CA',
    '443':'MD',
    '450':'QUEBEC',
    '458':'OR',
    '469':'TX',
    '470':'GA',
    '473':'GRENADA',
    '475':'CT',
    '478':'GA',
    '479':'AR',
    '480':'AZ',
    '484':'PA',
    '501':'AR',
    '502':'KY',
    '503':'OR',
    '504':'LA',
    '505':'NM',
    '506':'NEW BRUNSWICK',
    '507':'MN',
    '508':'MA',
    '509':'WA',
    '510':'CA',
    '512':'TX',
    '513':'OH',
    '514':'QUEBEC',
    '515':'IA',
    '516':'NY',
    '517':'MI',
    '518':'NY',
    '519':'ONTARIO',
    '520':'AZ',
    '530':'CA',
    '534':'WI',
    '539':'OK',
    '540':'VA',
    '541':'OR',
    '551':'NJ',
    '559':'CA',
    '561':'FL',
    '562':'CA',
    '563':'IA',
    '567':'OH',
    '570':'PA',
    '571':'VA',
    '573':'MO',
    '574':'IN',
    '575':'NM',
    '579':'QUEBEC',
    '580':'OK',
    '581':'QUEBEC',
    '585':'NY',
    '586':'MI',
    '587':'ALBERTA',
    '601':'MS',
    '602':'AZ',
    '603':'NH',
    '604':'BRITISH COLUMBIA',
    '605':'SD',
    '606':'KY',
    '607':'NY',
    '608':'WI',
    '609':'NJ',
    '610':'PA',
    '612':'MN',
    '613':'ONTARIO',
    '614':'OH',
    '615':'TN',
    '616':'MI',
    '617':'MA',
    '618':'IL',
    '619':'CA',
    '620':'KS',
    '623':'AZ',
    '626':'CA',
    '630':'IL',
    '631':'NY',
    '636':'MO',
    '639':'SASKATCHEWAN',
    '641':'IA',
    '646':'NY',
    '647':'ONTARIO',
    '649':'TURKS & CAICOS ISLANDS',
    '650':'CA ',
    '651':'MN',
    '657':'CA',
    '660':'MO',
    '661':'CA',
    '662':'MS',
    '664':'MONTSERRAT',
    '667':'MD',
    '669':'CA',
    '670':'CNMI',
    '671':'GU',
    '678':'GA',
    '681':'WV',
    '682':'TX',
    '684':'AS',
    '701':'ND',
    '702':'NV',
    '703':'VA',
    '704':'NC',
    '705':'ONTARIO',
    '706':'GA',
    '707':'CA',
    '708':'IL',
    '709':'NEWFOUNDLAND',
    '712':'IA',
    '713':'TX',
    '714':'CA',
    '715':'WI',
    '716':'NY',
    '717':'PA',
    '718':'NY',
    '719':'CO',
    '720':'CO',
    '721':'SINT MAARTEN',
    '724':'PA',
    '727':'FL',
    '731':'TN',
    '732':'NJ',
    '734':'MI',
    '737':'TX',
    '740':'OH',
    '747':'CA',
    '754':'FL',
    '757':'VA',
    '758':'ST.LUCIA',
    '760':'CA',
    '762':'GA',
    '763':'MN',
    '765':'IN',
    '767':'DOMINICA',
    '769':'MS',
    '770':'GA',
    '772':'FL',
    '773':'IL',
    '774':'MA',
    '775':'NV',
    '778':'BRITISH COLUMBIA',
    '779':'IL',
    '780':'ALBERTA',
    '781':'MA',
    '784':'ST.VINCENT & GRENADINES',
    '785':'KS',
    '786':'FL',
    '787':'PUERTO RICO',
    '801':'UT',
    '802':'VT',
    '803':'SC',
    '804':'VA',
    '805':'CA',
    '806':'TX',
    '807':'ONTARIO',
    '808':'HI',
    '809':'DOMINICAN REPUBLIC',
    '810':'MI',
    '812':'IN',
    '813':'FL',
    '814':'PA',
    '815':'IL',
    '816':'MO',
    '817':'TX',
    '818':'CA',
    '819':'QUEBEC',
    '828':'NC',
    '829':'DOMINICAN REPUBLIC',
    '830':'TX',
    '831':'CA',
    '832':'TX',
    '843':'SC',
    '845':'NY',
    '847':'IL',
    '848':'NJ',
    '849':'DOMINICAN REPUBLIC',
    '850':'FL',
    '856':'NJ',
    '857':'MA',
    '858':'CA',
    '859':'KY',
    '860':'CT',
    '862':'NJ',
    '863':'FL',
    '864':'SC',
    '865':'TN',
    '867':'YUKON - NW TERR. - NUNAVUT',
    '868':'TRINIDAD & TOBAGO',
    '869':'ST.KITTS & NEVIS',
    '870':'AR',
    '872':'IL',
    '873':'QUEBEC',
    '876':'JAMAICA',
    '878':'PA',
    '901':'TN',
    '902':'NOVA SCOTIA - PRINCE EDWARD ISLAND',
    '903':'TX',
    '904':'FL',
    '905':'ONARIO',
    '906':'MI',
    '907':'AK',
    '908':'NJ',
    '909':'CA',
    '910':'NC',
    '912':'GA',
    '913':'KS',
    '914':'NY',
    '915':'TX',
    '916':'CA',
    '917':'NY',
    '918':'OK',
    '919':'NC',
    '920':'WI',
    '925':'CA',
    '928':'AZ',
    '929':'NY',
    '931':'TN',
    '936':'TX',
    '937':'OH',
    '938':'AL',
    '939':'PUERTO RICO',
    '940':'TX',
    '941':'FL',
    '947':'MI',
    '949':'CA',
    '951':'CA',
    '952':'MN',
    '954':'FL',
    '956':'TX',
    '970':'CO',
    '971':'OR',
    '972':'TX',
    '973':'NJ',
    '978':'MA',
    '979':'TX',
    '980':'NC',
    '984':'NC',
    '985':'LA',
    '989':'MI'
};

// Run validatePhone.init() when the page loads
window.addEventListener
    ? window.addEventListener('load', validatePhone.init, false)
    : window.attachEvent && window.attachEvent('onload', validatePhone.init)
;
