/**
 * pavlov - Behavioral API over JavaScript Test Frameworks
 * QUnit adapter
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
 * QUnit adapter for Pavlov to allow Pavlov examples to be run against QUnit
 */
pavlov.extend({
    /**
     * Implements assert against QUnit's `ok`
     */
    assert: function(expr, msg) { ok(expr, msg); },
    /**
     * Implements equivalence checking against `QUnit.equiv`
     */
    equivalent: function(a, b) { return QUnit.equiv(a, b); },    
    /**
     * Implementes async start against QUnit's `start`
     */
    start: function() { start(); },
    /**
     * Implements async stop against QUnit's `stop`
     */
    stop: function(){ stop(); },

    /**
     * Compiles nested set of examples into flat array of QUnit statements
     * returned bound up in a single callable function 
     * @param {Array} examples Array of possibly nested Example instances
     * @returns function of which, when called, will execute all translated QUnit statements
     */
    compile: function(examples) {
        var statements = [],
            each = pavlov.helpers.each;

        /**
         * Comples a single example and its children into QUnit statements
         * @param {Example} example Single example instance 
         * possibly with nested instances
         */
        var compileDescription = function(example) {

            // get before and after rollups
            var befores = example.befores(),
                afters = example.afters();

            // create a module with setup and teardown 
            // that executes all current befores/afters
            statements.push(function(){
                module(example.names(), {
                    setup: function(){
                        each(befores, function(){ this(); });
                    },
                    teardown: function(){
                        each(afters, function(){ this(); });
                    }
                });
            });

            // create a test for each spec/"it" in the example
            each(example.specs, function(){
                var spec = this;
                statements.push(function(){
                    test(spec[0],spec[1]);
                });
            });

            // recurse through example's nested examples
            each(example.children, function() {
                compileDescription(this);            
            });
        };

        // compile all root examples
        each(examples, function() {
            compileDescription(this, statements);
        });

        // return a single function which, when called, 
        // executes all qunit statements
        return function(){ 
            each(statements, function(){ this(); }); 
        };
    }    
});

// alias pavlov as QUnit.specify for legacy support
QUnit.specify = pavlov;
