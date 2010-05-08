/**
 * pavlov - Behavioral API over JavaScript Test Frameworks
 * FireUnit Test adapter
 *
 * version 0.3.0pre
 *
 * http://michaelmonteleone.net/projects/pavlov
 * http://github.com/mmonteleone/pavlov
 *
 * Copyright (c) 2010 Michael Monteleone
 * Licensed under terms of the MIT License (README.markdown)
 */

/**
 * FireUnit Test adapter for Pavlov to allow Pavlov examples to be run against FireUnit
 */
(function(){
    pavlov.adapt("FireUnit", {
        initiate: function(name) {
        },
        /**
        * Implements assert
        */
        assert: function(expr, msg) {
            // run the assertion against fireunit's ok()
            fireunit.ok(expr, msg || "");
        },
        /**
        * Implements wait against the current fireunit test case's native wait()
        * @param {Number} ms milliseconds to pause the test runner
        * @param {Function} fn callback to run after resuming test runner
        */
        wait: function(ms, fn) {
            // proxy against normal setTimeout.  This obviously won't block
            // like other test frameworks' async support, which may or may not be a bad thing
            setTimeout(fn, ms);
        },         
        /**
        * Compiles nested set of examples into flat array of fireunit statements
        * returned bound up in a single callable function
        * @param {Array} examples Array of possibly nested Example instances
        * @returns function of which, when called, will execute all fireunit statements
        */
        compile: function(name, examples) {
            var each = pavlov.util.each,
            statements = [];

            /**
            * Comples a single example and its children into fireunit Test test cases
            * @param {Example} example Single example instance
            * possibly with nested instances
            */
            var compileDescription = function(example) {
                // begin a new grouping of tests for this example
                statements.push(function(){ fireunit.group(example.name); });

                var befores = example.befores(),
                    afters = example.afters();				 

                // attach each "it" examples as a test
                each(example.specs, function() {
                    var spec = this;
                    statements.push(function(){
                        each(befores, function(){ this(); });
                        // wrapping running of test in try/catch
                        // that explicitly fails the test if the test throws an exception
                        // since fireunit seems to stop fatally on exceptions
                        // in the test.  strange, o well.
                        try{
                            // since each spec could contain multiple assertions, let's consider
                            // the whole test to be a group, instead of assertions itself.  less than optimal, o well.
                            fireunit.group(spec[0]);
                            spec[1]();
                            fireunit.groupEnd();
                        } catch(e) {
                            console.log(e);
                            pavlov.adapter.assert(false);
                        }
                        each(afters, function(){ this(); });
                    });
                });

                // recurse through example's nested examples
                each(example.children, function() {
                    compileDescription(this);
                });

                // end this grouping of examples
                statements.push(function(){ fireunit.groupEnd(); });
            };

            // compile all root examples
            each(examples, function() {
                compileDescription(this);
            });

            // end the test suite
            statements.push(function(){ fireunit.testDone(); });

            return function() {
                // run compiled fireunit statements
                each(statements, function(){ this(); });
            };
        }
    });

})();
