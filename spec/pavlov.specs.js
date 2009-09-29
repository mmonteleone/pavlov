var standardQUnitTestRan = false;

module("standard QUnit module");

test("standard QUnit Test should still run alongside QUnit.specify", function() {
    expect(1);
    standardQUnitTestRan = true;
    ok(standardQUnitTestRan);
});


QUnit.specify("Pavlov", function() {

    describe("a QUnit.specify()", function() {
        it("should set the document title to spec name + ' Specifications'", function() {
            // temporarily mock jQuery.fn.attr to track 
            // the usage of it 
            /*
            var originalAttr = $.fn.attr;
            try{
                var passedName = null;
                var passedVal = null;
                $.fn.attr = function(name, val) {
                    passedName = name;
                    passedVal = val;                    
                };
                QUnit.specify("Pavlov", function(){});
            } finally {
                $.fn.attr = originalAttr;
            } 
            */
            assert($(document).attr('title')).isEqualTo("Pavlov Specifications");
        });

        it("should run the spec lambda", function() {
            // implicitly true by virtue of having executed            
            assert.pass();
        });

        it("should run the resulting flattened qunit tests", function() {
            // implicitly true by virtue of having executed            
            assert.pass();
        });

        it("should not pollute the global namespace", function() {
            $.each("describe,it,wait,assert,before,after,given".split(','), function() {
                assert(window[String(this)]).isUndefined();
            });
        });

        it("should be able to run alongside standard QUnit modules and tests", function() {
            assert(standardQUnitTestRan).isTrue();
        });
    });

    describe("a describe()", function() {
        var variableDefinedInDescribe = "y";
        var beforeCalls = [];
        var afterCalls = [];

        var beforeCallCount = 0;
        before(function() {
            beforeCallCount++;
            beforeCalls.push('x');
        });

        var afterCallCount = 0;
        after(function() {
            afterCallCount++;
            afterCalls.push('y');
        });

        it("should execute lambda", function() {
            // implicitly true by virtue of this running
            assert.pass();
        });

        it("should execute before() before each it()", function() {
            assert(beforeCallCount).equals(2);
            assert(afterCallCount).equals(1);
        });

        it("should execute after() after each it()", function() {
            assert(beforeCallCount).equals(3);
            assert(afterCallCount).equals(2);
        });

        describe("with a nested describe()", function() {
            var variableDefinedInNestedDescribe = "x";

            before(function() {
                beforeCalls.push('a');
            });

            after(function() {
                afterCalls.push('b');
            });

            it("should execute all before()s from outside-in", function() {
                assert(beforeCalls).isSameAs(['x', 'x', 'x', 'x', 'x', 'a']);
                assert(afterCalls).isSameAs(['y', 'y', 'y', 'y']);
            });

            it("should execute all after()s from inside-out", function() {
                assert(beforeCalls).isSameAs(['x', 'x', 'x', 'x', 'x', 'a', 'x', 'a']);
                assert(afterCalls).isSameAs(['y', 'y', 'y', 'y', 'b', 'y']);
            });

            it("should have access to own describe scope", function() {
                assert(variableDefinedInNestedDescribe).isDefined();
            });

            it("should have access to parent describe scope", function() {
                assert(variableDefinedInDescribe).isDefined();
            });
        });

        it("should have access to describe scope", function() {
            assert(variableDefinedInDescribe).isDefined();
        });
    });

    describe("an it()", function() {
        it("should generate and run a test", function() {
            ok(true);  // implicitly true by virtue of this running           
        });

        describe("when not passed a test lambda", function(){

            it("should generate a failing (todo) test when not passed a lambda", function(){
                var originalIt = it;
                var args;
                try{
                    // mock up an it
                    // when passed single arg, let Pavlov do it's job (to test it)
                    // when passed 2 args, intercept and capture the response to 
                    // keep Pavlov from doing its job
                    // later, will verify the correct behavior happened with 1 arg.
                    it = function() {
                        if(arguments.length == 2) {
                            args = $.makeArray(arguments);
                        } else {
                            originalIt.apply(this,arguments);
                        }
                    };

                    // run the method under test
                    it("no lambda");

                    var todoGeneratingFn = args[1];

                    var originalFail = assert.fail;
                    var failMessage = null;
                    try
                    {
                        assert.fail = function(message) {
                            failMessage = message;
                        };
                        todoGeneratingFn();
                    } finally {
                        assert.fail = originalFail;
                    }

                } finally {
                    it = originalIt;
                }
                assert(args[0]).equals("no lambda");
                assert(args.length).equals(2);
                assert(failMessage).equals("Not Implemented");
            });

        });

        describe("after a given()", function() {

            var singleArgGivenCount = 0;

            given(1, 2, 3).
                it("should test for each of given()'s args when passed flat args", function(x) {
                    assert(x).equals(singleArgGivenCount + 1);
                    singleArgGivenCount++;
            });

            var multiArgGivenCount = 0;

            given([1, 2, 3], [4, 5, 6], [7, 8, 9]).
                it("should test for each of given()'s args when passed array arguments", function(x, y, z) {
                    assert(x).equals(multiArgGivenCount * 3 + 1, "some message");
                    assert(y).equals(multiArgGivenCount * 3 + 2);
                    assert(z).equals(multiArgGivenCount * 3 + 3);
                    multiArgGivenCount++;
            });
        });

        describe("with a wait()", function() {

            it("should stop(), run a setTimeout() for duration, then execute lambda and start()", function() {
                var original = {
                    stop: stop,
                    start: start,
                    setTimeout: setTimeout                                        
                };
                var calls = [];
                var setTimeoutMs = 0;
                var waitLambdaCalled = false;

                try{
                    // mock timing functions to capture their calls from wait()
                    stop = function() { calls.push('stop'); };
                    start = function() { calls.push('start'); };
                    setTimeout = function(fn, ms) {
                        calls.push('settimeout');
                        setTimeoutMs = ms;
                        fn();
                    };
                    
                    // call wait
                    wait(40, function(){
                        calls.push('waitlambda');
                    });
                    
                } finally {
                    // undo mocking
                    stop = original.stop;
                    start = original.start;
                    setTimeout = original.setTimeout;                                        
                }
                
                // check if calls to mocked fn's occurred correctly
                assert(calls).isSameAs(['stop','settimeout','waitlambda','start']);
                assert(setTimeoutMs).equals(40);
            });

        });
    });



    describe("assertions", function() {

        /* quick and dirty mocking of native qunit functions
         * temporarily replaces a method in window namespace with one 
         * that just gathers and returns the values of passed arguments
         * undoes mocking after scope completes
         */
        var mockQunitAssertion = function(method, scope){
            var originalMethod = window[method];
            var args = [];
            try {
                window[method] = function(){
                    args = $.makeArray(arguments);
                };
                scope();
            } finally {
                window[method] = originalMethod;
            }
            return args;
        };
    
        describe("equals()", function() {

            it("should pass arguments to qunit's equals()", function() {
                var passedArgs = mockQunitAssertion('equals', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(4).equals(2, "some message");
                });
                
                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([4,2,"some message"]);
            });

        });

        describe("isEqualTo()", function() {

            it("should pass arguments to qunit's equals()", function() {
                var passedArgs = mockQunitAssertion('equals', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(4).isEqualTo(2, "some message");
                });
                
                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([4,2,"some message"]);
            });

        });

        describe("isNotEqualTo()", function(){

            it("should pass true to qunit's ok() when actual !== expected", function() {
                var passedArgs = mockQunitAssertion('ok', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(4).isNotEqualTo(2, "some message");
                });
                
                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([true,"some message"]);
            });

            it("should pass false to qunit's ok() when actual === expected", function() {
                var passedArgs = mockQunitAssertion('ok', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(2).isNotEqualTo(2, "some message");
                });
                
                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([false,"some message"]);
            });

        });

        describe("isSameAs()", function() {

            it("should pass arguments to qunit's same()", function() {
                var passedArgs = mockQunitAssertion('same', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(4).isSameAs(2, "some message");
                });
                
                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([4,2,"some message"]);
            });

        });

        describe("isNotSameAs()", function(){
            
            var originalEquiv;
            var equivActual;
            var equivExpected;
            
            
            before(function(){
                originalEquiv = QUnit.equiv;
                equivActual = null;
                equivExpected = null;                
            });

            it("should pass true when !QUnit.equiv of arguments is true to qunit's ok()", function() {
                try {
                    QUnit.equiv = function(actual, expected) {
                        equivActual = actual;
                        equivExpected = expected;
                        return false;                        
                    };
                    var passedArgs = mockQunitAssertion('ok', function(){
                        // run spec assertion while underlying qunit assertion is mocked
                        assert(4).isNotSameAs(2, "some message");
                    });                    
                } finally {
                    QUnit.equiv = originalEquiv;
                }
                
                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([true,"some message"]);
                assert(equivActual).equals(4);
                assert(equivExpected).equals(2);
            });
            
            it("should pass false when !QUnit.equiv of arguments is false to qunit's ok()", function() {
                try {
                    QUnit.equiv = function(actual, expected) {
                        equivActual = actual;
                        equivExpected = expected;
                        return true;                        
                    };
                    var passedArgs = mockQunitAssertion('ok', function(){
                        // run spec assertion while underlying qunit assertion is mocked
                        assert(4).isNotSameAs(2, "some message");
                    });                    
                } finally {
                    QUnit.equiv = originalEquiv;
                }
                
                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([false,"some message"]);
                assert(equivActual).equals(4);
                assert(equivExpected).equals(2);
            });            

        });

        describe("isTrue()", function() {

            it("should pass argument to qunit's ok()", function() {
                var passedArgs = mockQunitAssertion('ok', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(true).isTrue("some message");
                });
                
                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([true,"some message"]);
            });

        });

        describe("isFalse()", function(){

            it("should pass true to qunit's ok() when expr is false", function() {
                var passedArgs = mockQunitAssertion('ok', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(false).isFalse("some message");
                });
                
                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([true,"some message"]);
            });

            it("should pass false to qunit's ok() when expr is true", function() {
                var passedArgs = mockQunitAssertion('ok', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(true).isFalse("some message");
                });
                
                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([false,"some message"]);
            });
        });
        
        describe("isNull()", function() {

            it("should pass true to qunit' ok when actual === null", function() {
                var passedArgs = mockQunitAssertion('ok', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(null).isNull("message");
                });
                
                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([true,"message"]);
            });

            it("should pass false to qunit' ok when actual !== null", function() {
                var passedArgs = mockQunitAssertion('ok', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(0).isNull("message");
                });
                
                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([false,"message"]);
            });

        });

        describe("isNotNull()", function(){

            it("should pass true to qunit's ok when actual !== null", function() {
                var passedArgs = mockQunitAssertion('ok', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(0).isNotNull("message");
                });
                
                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([true,"message"]);
            });

            it("should pass false to qunit's ok when actual === null", function() {
                var passedArgs = mockQunitAssertion('ok', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(null).isNotNull("message");
                });
                
                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([false,"message"]);
            });

        });
        
        describe("isDefined()", function() {

            it("should pass true to qunit's ok when typeof(argument) !== 'undefined'", function() {
                var x = "something";
                var passedArgs = mockQunitAssertion('ok', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(x).isDefined("message");
                });
                
                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([true,"message"]);
            });

            it("should pass false to qunit's ok when typeof(argument) === 'undefined'", function() {
                var x;
                var passedArgs = mockQunitAssertion('ok', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(x).isDefined("message");
                });
                
                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([false,"message"]);
            });

        });

        describe("isUndefined()", function(){

            it("should pass true to qunit()'s ok when typeof(argument) === 'undefined'", function() {
                var x;
                var passedArgs = mockQunitAssertion('ok', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(x).isUndefined("message");
                });
                
                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([true,"message"]);
            });

            it("should pass false to qunit()'s ok when typeof(argument) !== 'undefined'", function() {
                var x = 1;
                var passedArgs = mockQunitAssertion('ok', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(x).isUndefined("message");
                });
                
                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([false,"message"]);
            });

        });
        
        
        describe("pass()", function(){
            
            it("should pass true to qunit's ok()", function(){
                var passedArgs = mockQunitAssertion('ok', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert().pass("message");
                });              

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([true,"message"]);
            });
            
            it("should also be called from assert.pass()", function(){
                
                var passedArgs = mockQunitAssertion('ok', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert.pass("message");
                });              

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([true,"message"]);                
                                
            });
                        
        });

        describe("fail()", function(){
            
            it("should pass false to qunit's ok()", function(){
                var passedArgs = mockQunitAssertion('ok', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert().fail("message");
                });              

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([false,"message"]);
            });
                        
            it("should also be called from assert.false()", function(){
                
                var passedArgs = mockQunitAssertion('ok', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert.fail("message");
                });              

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([false,"message"]);                
                                
            });
                        
        });
        
        describe("throwsException()", function(){
            
            it("should pass true to qunit's ok() when function throws exception", function(){
                var passedArgs = mockQunitAssertion('ok', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(function(){
                        // should throw undefined exceptions
                        var totalPrice = unitPrice * quantity;
                    }).throwsException("message");
                });
                
                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([true,"message"]);
            });
            
            it("should pass false to qunit's ok() when function does not throw exception", function(){
                var passedArgs = mockQunitAssertion('ok', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(function(){
                        var unitPrice = 10;
                        var quantity = 4;
                        var totalPrice = unitPrice * quantity;
                    }).throwsException("message");
                });
                
                // verify correct arguments would have been passed to qunit
                assert(passedArgs).isSameAs([false,"message"]);                
            });
            
        });
        
        describe("custom assertions", function(){

            it("should be able to be added via QUnit.specify.extendAssertions with 3 arg asserts", function(){
                var gtArgs, ltArgs;
                QUnit.specify.extendAssertions({
                    isGreaterThan: function(actual, expected, message) {
                        gtArgs = $.makeArray(arguments);
                    },
                    isLessThan: function(actual, expected, message) {
                        ltArgs = $.makeArray(arguments);
                    }
                });

                assert(4).isGreaterThan(2,"some message");
                assert(2).isLessThan(4,"some message");

                assert(gtArgs).isSameAs([4,2,"some message"]);
                assert(ltArgs).isSameAs([2,4,"some message"]);
            });

            it("should be able to be added via QUnit.specify.extendAssertions with 2 arg asserts", function(){
                var purpleArgs, yellowArgs;
                QUnit.specify.extendAssertions({
                    isPurple: function(actual, message) {
                        purpleArgs = $.makeArray(arguments);
                    },
                    isYellow: function(actual, message) {
                        yellowArgs = $.makeArray(arguments);
                    }
                });

                assert(4).isPurple("some message");
                assert(2).isYellow("some message");

                assert(purpleArgs).isSameAs([4,"some message"]);
                assert(yellowArgs).isSameAs([2,"some message"]);
            });

        });
    });
});

var secondStandardQUnitTest = false;

module("second standard QUnit module");

test("second standard QUnit Test should still run alongside Pavlov", function() {
    expect(1);
    secondStandardQUnitTest = true;
    ok(secondStandardQUnitTest);
});

