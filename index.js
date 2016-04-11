//
// Makes it possible to use Jasmine matchers + SpyOn in mocha tests
// By converting the result to to an thrown exception.
//
(function () {
    'use strict';
    var jasmineRequire = require('jasmine-core/lib/jasmine-core/jasmine'),
        jasmine = jasmineRequire.core(jasmineRequire);

    //
    // Custom matchers
    //

    // Check if an object has certain keys and only those keys.
    jasmine.matchers.toHaveKeys = function toHaveKeys(util, customEqualityTesters) {
        return {
            compare: function (actual, expectedKeys) {
                expectedKeys = expectedKeys.sort();
                actual = JSON.parse(JSON.stringify(actual));
                var actualKeys = Object.keys(actual).sort();

                var result = {
                    pass: util.equals(actualKeys, expectedKeys, customEqualityTesters),
                    message: {
                        // We use message as a carrier to replace the actual an expected values
                        // to show a object diff.
                        message: 'Expected object to have only have the following keys: ' +
                            expectedKeys.join(','),
                        actual: actualKeys,
                        expected: expectedKeys
                    }
                };

                return result;
            }
        };
    };

    jasmine.Expectation.addCoreMatchers(jasmine.matchers);

    function expect(actual) {
        var options = {
            actual: actual,
            util: jasmine.matchersUtil,
            addExpectationResult: function (pass, result) {
                /* istanbul ignore if */
                if (!pass) {
                    // Message is only way to pass values from custom tests.
                    if (typeof result.message !== 'string') {
                        result.actual = result.message.actual;
                        result.expected = result.message.expected;
                        result.message = result.message.message;
                    }

                    var error = new Error(result.message);
                    error.actual = result.actual;
                    error.expected = result.expected;
                    error.showDiff = true;
                    throw error;
                }
            }
        };

        return jasmine.Expectation.Factory(options);
    }

    function spyOn(obj, methodName) {
        var spy = jasmine.createSpy(methodName, obj[methodName]);
        obj[methodName] = spy;

        return spy;
    }

    module.exports = {
        global: function registerJasmineGlobally() {
            if (!global.jasmine) {
                global.jasmine = jasmine;
                global.spyOn = spyOn;
                global.expect = expect;
            }
        },
        spyOn: spyOn,
        jasmine: jasmine,
        expect: expect
    };
}());