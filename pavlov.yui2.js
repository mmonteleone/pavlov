/**
 * pavlov - Behavioral API over JavaScript Test Frameworks
 * YUI 2 Test adapter
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
pavlov.adapt("YUI 2", {
    initiate: function(name) {
        
    },
    /**
     * Implements assert
     */
    assert: function(expr, msg) {
        // run the assertion against the YAHOO namespace
        YAHOO.util.Assert.isTrue(expr, msg);        
    },
    /**
     * Compiles nested set of examples into flat array of test cases
     * returned bound up in a single callable function
     * @param {Array} examples Array of possibly nested Example instances
     * @returns function of which, when called, will execute all YUI Test test cases
     */
    compile: function(name, examples) {
        
        return function() {
            var each = pavlov.util.each,
                suite = new YAHOO.tool.TestSuite(name);

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
                suite.add(new YAHOO.tool.TestCase(template));

                // recurse through example's nested examples
                each(example.children, function() {
                    compileDescription(this);
                });
            };

            // compile all root examples
            each(examples, function() {
                compileDescription(this);
            });

            YAHOO.util.Event.onDOMReady(function (){
                //create the logger
                var logger = new YAHOO.tool.TestLogger();

                //add the test suite to the runner's queue
                YAHOO.tool.TestRunner.add(suite);

                //run the tests
                YAHOO.tool.TestRunner.run();
            });            
        };
    }
});
