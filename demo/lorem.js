/**
 * Lorem - 0.4.0 - JQuery-based Lorem Ipsum provider
 *
 * https://github.com/shyiko/lorem
 *
 * Copyright (c) 2012 Stanley Shyiko
 * Licensed under the MIT license.
 */
(function (fn) {
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        var $; try { $ = require('jquery'); } catch(ex) { } fn($, exports); // node.js
    } else if (typeof define === 'function' && define['amd']) {
        define(['jquery', 'exports'], fn); // amd
    } else {
        fn(jQuery, this.lorem = {}); // <script> tag
    }
}(function ($, exports) {

    /**
     * @param {String} text text
     * @param {*} delimiter delimiter
     * @return {Array} array of tokens
     */
    function tokenize(text, delimiter) {
        var words = text.split(delimiter), result = [];
        for (var i = 0; i < words.length; i++) {
            var word = words[i];
            if (word.length > 0) {
                result.push(word.toLowerCase());
            }
        }
        return result;
    }

    /**
     * @param {String} string string to capitalize
     * @return {String} original string with first letter capitalized
     */
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * @param {Number} min lower bound
     * @param {Number} max higher bound
     * @return {Number} number between min and max
     */
    function between(min, max){
        return Math.round(Math.random() * (max - min) + min);
    }

    /**
     * @param {Function} fn function
     * @param {Number} length length of target array
     * @return {Array} array where each element was obtained by calling fn
     */
    function array(fn, length) {
        var result = [];
        for (var i = 0; i < length; i++) {
            result.push(fn());
        }
        return result;
    }

    /**
     * @param {String} string string to parse
     * @param {*} defaultValue value to return if result is NaN or less than 1
     * @return {Number} substring(1, index of '_' (if any))
     */
    function extractNumber(string, defaultValue) {
        var extensionIndex = string.indexOf('_');
        if (extensionIndex < 0) {
            extensionIndex = string.length;
        }
        var number = parseInt(string.substr(1, extensionIndex), 10);
        return !isNaN(number) && number > 0 ? number : defaultValue;
    }

    /**
     * @param {String} string string to parse
     * @param {*} defaultValueOnTheLeft {this value}x{indifferent}
     * @param {*} defaultValueOnTheRight {indifferent}x{this value}
     * @return {Object} {left: valueOnTheLeft, right: valueOnTheRight}
     */
    function extractExtension(string, defaultValueOnTheLeft, defaultValueOnTheRight) {
        var extensionIndex = string.indexOf('_'),
            result = { left: defaultValueOnTheLeft, right: defaultValueOnTheRight };
        if (extensionIndex > -1) {
            var indexOfDelimiter = string.indexOf('x');
            if (indexOfDelimiter > -1) {
                result.left = parseInt(string.substr(extensionIndex + 1, indexOfDelimiter), 10) || result.left;
                result.right = parseInt(string.substr(indexOfDelimiter + 1), 10) || result.right;
            } else {
                result.right = result.left = parseInt(string.substr(extensionIndex + 1), 10) || result.left;
            }
        }
        return result;
    }

    /**
     * @param string string to parse
     * @return {Number} maximum number of characters, -1 if not provided
     */
    function extractMaximumNumberOfCharacters(string) {
        var extensionIndex = string.indexOf('$');
        if (extensionIndex > -1) {
            var number = parseInt(string.substr(extensionIndex + 1), 10);
            if (!isNaN(number) && number > 0) {
                return number;
            }
        }
        return -1;
    }

    /**
     * @param {Array} array array of strings
     * @param {String} stringBefore string to prepped before each array element
     * @param {String} stringAfter string to append after each array element
     * @return {String} stringBefore + array.join(stringAfter + stringBefore) + stringAfter
     */
    function join(array, stringBefore, stringAfter) {
        return stringBefore.concat(
            array.join(stringAfter.concat(stringBefore))
        ).concat(stringAfter);
    }

    var defaults = {
        text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
            'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ' +
            'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ' +
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ' +
            'At vero eos et accusamus et iusto odio dignissimos ducimus, qui blanditiis praesentium voluptatum deleniti atque corrupti, ' +
            'quos dolores et quas molestias excepturi sint, obcaecati cupiditate non provident, similique sunt in culpa, ' +
            'qui officia deserunt mollitia animi, id est laborum et dolorum fuga. ' +
            'Et harum quidem rerum facilis est et expedita distinctio. ' +
            'Nam libero tempore, cum soluta nobis est eligendi optio, cumque nihil impedit, quo minus id, quod maxime placeat, ' +
            'facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.',
        wordDelimiter: /\s|[,.]/,
        numberOfSentencesPerParagraph: {min: 4, max: 7},
        numberOfWordsPerSentence: {min: 4, max: 9},
        imageURL: 'http://placehold.it/${w}x${h}',
        offlineImage: 'data:image/gif;base64,R0lGODdhAQABAIABAMzMzP///ywAAAAAAQABAAACAkQBADs=',
        useOfflineImage: false,
        /**
         * {String} class prefix to apply lorem to
         */
        prefix: 'lorem_',
        /**
         * {String} class to add to all lorem-recognized elements. optional
         */
        markerClass: 'lorem-marker',
        /**
         * {String} data- attribute to apply lorem to
         */
        dataAttribute: 'lorem'
    };

    defaults._tokens = tokenize(defaults.text, defaults.wordDelimiter);

    /**
     * @return {Object} copy of lorem defaults
     */
    exports.defaults = function() {
        var o = {};
        for (var dkey in defaults) {
            o[dkey] = defaults[dkey];
        }
        return o;
    };

    /**
     * @param {Object} options options. can be undefined
     * @return {Object} default options overridden with provided ones
     */
    function mergeWithDefaultOnes(options) {
        var o = exports.defaults();
        mergePropertiesIn(o, options);
        return o;
    }

    /**
     * @param target destination object
     * @param source object to copy properties from
     */
    function mergePropertiesIn(target, source) {
        if (source) {
            for (var okey in source) {
                target[okey] = source[okey];
            }
            if (source.hasOwnProperty('text')) {
                target._tokens = tokenize(target.text, target.wordDelimiter);
                if (target._tokens.length < 1) {
                    throw new Error('Tokenization of text must provide at least one token');
                }
            }
        }
    }

    /**
     * @param {Object} options options to replace default ones
     */
    exports.overrideDefaults = function(options) {
        mergePropertiesIn(defaults, options);
    };

    /**
     * @param {String} cls class name
     * @param {Object} options options
     * @return {*} undefined if cls doesn't start with lorem prefix, {html: value, attributes: {...}} otherwise
     */
    function ipsum(cls, options) {
        var op = options.numberOfSentencesPerParagraph,
            os = options.numberOfWordsPerSentence,
            tokenFn = (function() {
                var tokens = options._tokens, numberOfTokens = tokens.length;
                return function() {
                    return tokens[between(0, numberOfTokens - 1)];
                };
            }()),
            cutOffFn = function(string, limit) {
                return limit > -1 ? string.substr(0, limit) : string;
            },
            suffix = cls.substr(0, options.prefix.length) === options.prefix ? // left in order to save backward-compatibility with releases <= 0.3.0
                cls.substr(options.prefix.length) : cls,
            result = { attributes: {} };
        switch(suffix[0]) {
            case 'p': // paragraph p[<number>[_<minimum number of sentences>[x<maximum number of sentences>]]]
                var numberOfParagraphs = extractNumber(suffix, 1),
                    pd = extractExtension(suffix, op.min, op.max),
                    sentenceFnP = function() {
                        return capitalize(array(tokenFn, between(os.min, os.max)).join(' ')
                            .concat('.'));
                    },
                    paragraphFn = function() {
                        return array(sentenceFnP, between(pd.left, pd.right)).join(' ');
                    };
                result.html = join(array(paragraphFn, numberOfParagraphs), '<p>', '</p>');
                break;
            case 's': // sentence s[<number>[_<minimum number of words>[x<maximum number of words>]]][$<maximum number of characters>]
                var numberOfSentences = extractNumber(suffix, 1),
                    sd = extractExtension(suffix, os.min, os.max),
                    sl = extractMaximumNumberOfCharacters(suffix),
                    sentenceFnS = function() {
                        return capitalize(array(tokenFn, between(sd.left, sd.right)).join(' ')
                            .concat('.'));
                    };
                result.html = cutOffFn(array(sentenceFnS, numberOfSentences).join(' '), sl);
                break;
            case 'w': // word w[<number>][$<maximum number of characters>]
                var numberOfWords = extractNumber(suffix, 1),
                    wl = extractMaximumNumberOfCharacters(suffix);
                result.html = cutOffFn(array(tokenFn, numberOfWords).join(' '), wl);
                break;
            case 'i': // image<width>x<height>
                var indexOfDelimiter = suffix.indexOf('x');
                if (indexOfDelimiter > -1) {
                    var width = parseInt(suffix.substr(1, indexOfDelimiter), 10),
                        height = parseInt(suffix.substr(indexOfDelimiter + 1), 10);
                    if (!isNaN(width) && !isNaN(height)) {
                        var attrs = result.attributes;
                        if (options.useOfflineImage) {
                            attrs.src = options.offlineImage;
                            attrs.width = width;
                            attrs.height = height;
                        } else {
                            attrs.src = options.imageURL.
                                replace('${w}', width).replace('${h}', height);
                        }
                    }
                }
        }
        return result;
    }

    /**
     * @param {String} cls class name
     * @param {Object} options overrides for defaults. optional
     * @return {String} generated text/html
     */
    exports.ipsum = function(cls, options) {
        var holder = ipsum(cls, mergeWithDefaultOnes(options));
        if (holder) {
            if (holder.attributes.src) {
                return holder.attributes.src;
            }
            if (holder.html) {
                return holder.html;
            }
        }
    };

    /**
     * @param $el jquery element
     * @param prefix class prefix
     * @return {String} undefined if $el has no class which starts with a prefix, class name otherwise
     */
    function findFirstClassWithAPrefix($el, prefix) {
        var classes = $el.attr('class');
        if (classes) {
            classes = classes.split(' ');
            for (var i = 0, prefixLength = prefix.length; i < classes.length; i++) {
                var cls = classes[i];
                if (cls.substr(0, prefixLength) === prefix) {
                    return cls;
                }
            }
        }
    }

    /**
     * @param {Object} $el jquery element
     * @param {Object} options
     */
    function applyIpsumToElement($el, options) {
        var cls = $el.attr('data-' + options.dataAttribute) || findFirstClassWithAPrefix($el, options.prefix);
        if (cls) {
            var lorem = ipsum(cls, options);
            if (lorem.html) {
                $el[$el.is('input') ? 'val' : 'html'](lorem.html);
            }
            if (!$.isEmptyObject(lorem.attributes)) {
                $el.attr(lorem.attributes);
            }
            if (options.markerClass && !$el.hasClass(options.markerClass)) {
                $el.addClass(options.markerClass);
            }
        }
    }

    /**
     * jQuery Plugin
     * @param {Object} options overrides for defaults. optional
     * @return {Object} jquery objects for chaining
     */
    if ($) {
        $.fn.ipsum = function(options) {
            var o = mergeWithDefaultOnes(options);
            return this.each(function() {
                var $this = $(this), $els = $('[class*="' + o.prefix + '"],[data-' + o.dataAttribute + ']', $this);
                applyIpsumToElement($this, o);
                $els.each(function(index, el) {
                    applyIpsumToElement($(el), o);
                });
            });
        };
    }
}));

