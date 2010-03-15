/**
 * pavlov - Behavioral API over JavaScript Test Frameworks
 * YUI 3 Test adapter
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
 * YUI Test adapter for Pavlov to allow Pavlov examples to be run against YUI Test
 */
(function(){
    // holds captured local references to yui cases' "wait" 
    // methods so that pavlov's wait() can proxy it
    var currentWaitFunction;
    
    pavlov.adapt("YUI 3", {
        initiate: function(name) {
            // allow a test suite to have possibly pre-injected a YUI instance into the
            // adapter.  Otherwise, build a defalt one.
            pavlov.adapter.YUI = pavlov.adapter.YUI || YUI();
        },
        /**
         * Implements assert
         */
        assert: function(expr, msg) {
            // run the assertion against the YUI instance in the adapter
            pavlov.adapter.YUI.assert(expr, msg);
        },
        /**
         * Implements wait against the current yui test case's native wait()
         * @param {Number} ms milliseconds to pause the test runner
         * @param {Function} fn callback to run after resuming test runner
         */
        wait: function(ms, fn) {
            // proxy against the current capatured test cases's wait method
            currentWaitFunction(fn, ms);
        },
        /**
         * Compiles nested set of examples into flat array of test cases
         * returned bound up in a single callable function
         * @param {Array} examples Array of possibly nested Example instances
         * @returns function of which, when called, will execute all YUI Test test cases
         */
        compile: function(name, examples) {
            return function() {
                // compile and run tests in context of the YUI instance in the adapter
                pavlov.adapter.YUI.use("console","test", function(Y) {
                    var each = pavlov.util.each,
                        suite = new Y.Test.Suite(name);

                    /**
                     * Comples a single example and its children into YUI Test test cases
                     * @param {Example} example Single example instance
                     * possibly with nested instances
                     */
                    var compileDescription = function(example) {
                        // get before and after rollups
                        var befores = example.befores(),
                            afters = example.afters();

                        // prepare template for test case
                        var template = {
                            name: example.names(),
                            setUp: function() {
                                // capture a local reference to the case's "wait" 
                                // method so that pavlov's wait() can proxy it
                                currentWaitFunction = this.wait;
                                each(befores, function() { this(); });
                            },
                            tearDown: function() {
                                each(afters, function() { this(); });
                            }
                        };

                        // attach each "it" examples to template
                        each(example.specs, function() {
                            template['test: ' + example.names() + " " + this[0]] = this[1];
                        });

                        // create test case and attach it to test cases
                        suite.add(new Y.Test.Case(template));

                        // recurse through example's nested examples
                        each(example.children, function() {
                            compileDescription(this);
                        });
                    };

                    // compile all root examples
                    each(examples, function() {
                        compileDescription(this);
                    });

                    //initialize the console
                    new Y.Console({ newestOnTop: false }).render('#log');

                    //run the tests
                    Y.Test.Runner.add(suite);
                    Y.Test.Runner.run();
                });
            };
        }
    });    
})();
