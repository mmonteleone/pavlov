module("Standard QUnit module");
var firstStandardQUnitTestRan = false;
test("should be able to run before Pavlov's QUnit Adapter", function() {
    expect(1);
    firstStandardQUnitTestRan = true;
    ok(firstStandardQUnitTestRan);
});

// intercept calls to adapter methods for testing they were run
var capturedSuiteName;
var adapterMethods = {
    initiate: pavlov.adapter.initiate
};
pavlov.util.extend(pavlov.adapter, {
    initiate: function(suiteName) {
        capturedSuiteName = suiteName;
        adapterMethods.initiate(suiteName);
    }
});

var global = this;


(function(){
    var isArray = function(obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
    };
    var contentsEqual = function(actual, expected) {
        if(actual === null) {
            throw "Actual argument required";
        }
        if(expected === null) {
            throw "Expected argument required";
        }
        if(actual.length !== expected.length) {
            ok(false, message);
            return false;
        }
        var areEqual = true;
        for(var i = 0;i < actual.length; i++) {
            if(isArray(expected[i]) && isArray(actual[i])) {
                areEqual = areEqual && contentsEqual(expected[i], actual[i]);
            } else {
                areEqual = areEqual && (expected[i] == actual[i]);
            }
            if(!areEqual) {
                break;
            }
        }
        return areEqual;
    };
    pavlov.extendAssertions({
        /**
         * Asserts two arrays contain same values
         */
        contentsEqual: function(actual, expected, message){
            var areEqual = contentsEqual(actual, expected);
            pavlov.adapter.assert(areEqual, message);
        }
    });
}())

pavlov.specify("Pavlov", function() {

    /* quick and dirty mocking of native qunit functions
     * temporarily replaces a method in window namespace with one
     * that just gathers and returns the values of passed arguments
     * undoes mocking after scope completes
     */
    var mock = function(object, methodName, callback){
        var args = [],
            originalMethod,
            parts, i;
        try {
            originalMethod = object[methodName];
            object[methodName] = function(){
                args = makeArray(arguments);
            };
            if(callback.apply(this, args) === true) {
                originalMethod.apply(object, args);
            }
        } finally {
            object[methodName] = originalMethod;
        }
        return args;
    };
    var makeArray = function(args) {
        return Array.prototype.slice.call(args);
    };

    describe("version", function(){
        it("should return the current version", function(){
            assert(pavlov.version).equals('0.3.0pre');
        });
    });

    describe("adapter", function(){
        describe("name", function(){
            it("should be the name passed to adapt", function(){
                assert(pavlov.adapter.name).isEqualTo('QUnit');
            });
        });
    });

    describe("adapt()", function(){
        it("should throw exception if not passed frameworkName or testFrameworkAdapter", function(){
            assert(function(){
                pavlov.adapt();
            }).throwsException("both 'frameworkName' and 'testFrameworkAdapter' arguments are required");
            assert(function(){
                pavlov.adapt('name');
            }).throwsException("both 'frameworkName' and 'testFrameworkAdapter' arguments are required");
            assert(function(){
                pavlov.adapt('name', null);
            }).throwsException("both 'frameworkName' and 'testFrameworkAdapter' arguments are required");
        });
        it("should extend pavlov.adapter", function(){
            var fakeMethod = function(){};
            pavlov.adapt("Adapter Name", {
                fakeMethod: fakeMethod
            });
            assert(pavlov.adapter.name).equals("Adapter Name");
            assert(pavlov.adapter.fakeMethod).isStrictlyEqualTo(fakeMethod);
        });
    });

    describe("util", function(){
        describe("each()", function(){
            var targetObject = { a: 1, b: 2 };
            var targetArray = ["abc","def"];
            it("should throw exception if not passed object or callback", function(){
                assert(function(){
                    pavlov.util.each();
                }).throwsException("both 'target' and 'callback' arguments are required");
                assert(function(){
                    pavlov.util.each(targetObject);
                }).throwsException("both 'target' and 'callback' arguments are required");
                assert(function(){
                    pavlov.util.each(targetObject, null);
                }).throwsException("both 'target' and 'callback' arguments are required");
            });
            it("should iterate over array when passed an array", function(){
                var keyValuePairs = [];
                pavlov.util.each(targetArray, function(index, value){
                    keyValuePairs.push([index, value]);
                });
                assert(keyValuePairs).contentsEqual([[0,"abc"],[1,"def"]]);
            });
            it("should iterate object members when passed an object", function(){
                var keyValuePairs = [];
                pavlov.util.each(targetObject, function(key, value){
                    keyValuePairs.push([key, value]);
                });
                assert(keyValuePairs).contentsEqual([["a",1],["b",2]]);
            });
        });
        describe("extend()", function(){
            var target = { a: 1, b: 2, c: 3 };
            var source = { c: 5, d: 6, e: 7 };
            it("should throw exception if not passed source or target", function(){
                assert(function(){
                    pavlov.util.extend();
                }).throwsException("both 'source' and 'target' arguments are required")
                assert(function(){
                    pavlov.util.extend(target);
                }).throwsException("both 'source' and 'target' arguments are required")
                assert(function(){
                    pavlov.util.extend(target, null);
                }).throwsException("both 'source' and 'target' arguments are required")
            });
            it("should copy all members of source to target", function(){
                pavlov.util.extend(target, source);
                assert(target.a).equals(1);
                assert(target.c).equals(5);
                assert(target.d).equals(6);
            });
        });
    });

    describe("specify()", function() {
        it("should throw exception if name or fn params not passed", function(){
            assert(function(){
                pavlov.specify(function(){});
            }).throwsException("both 'name' and 'fn' arguments are required");
            assert(function(){
                pavlov.specify("description");
            }).throwsException("both 'name' and 'fn' arguments are required");
        });

        it("should run the spec lambda", function() {
            // implicitly true by virtue of having executed
            assert.pass();
        });

        it("should call the adapter's initiate() with the suite name", function(){
            assert(capturedSuiteName).equals('Pavlov Specifications');
        });

        it("should set the document title to spec name + Pavlov + Adapter'", function() {
            assert(document.title).isEqualTo("Pavlov Specifications - Pavlov - QUnit");
        });

        it("should run the resulting flattened pavlov tests", function() {
            // implicitly true by virtue of having executed
            assert.pass();
        });

        it("should not pollute the global namespace", function() {
            pavlov.util.each("describe,it,wait,before,after,given".split(','), function() {
                assert(global[String(this)]).isUndefined();
            });
        });
    });

    describe("describe()", function() {
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

        it("should throw exception if not passed a description and fn", function(){
            assert(function(){
                describe("some description");
            }).throwsException("both 'description' and 'fn' arguments are required");
            assert(function(){
                describe(function(){});
            }).throwsException("both 'description' and 'fn' arguments are required");
        });

        it("should throw exception when before() not passed an fn", function(){
            assert(function(){
                before();
            }).throwsException("'fn' argument is required")
        });

        it("should throw exception when after() not passed an fn", function(){
            assert(function(){
                after();
            }).throwsException("'fn' argument is required")
        });

        it("should execute lambda", function() {
            // implicitly true by virtue of this running
            assert.pass();
        });

        it("should execute before() before each it()", function() {
            assert(beforeCallCount).equals(5);
            assert(afterCallCount).equals(4);
        });

        it("should execute after() after each it()", function() {
            assert(beforeCallCount).equals(6);
            assert(afterCallCount).equals(5);
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
                assert(beforeCalls).contentsEqual(['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'a']);
                assert(afterCalls).contentsEqual(['y', 'y', 'y', 'y', 'y', 'y', 'y']);
            });

            it("should execute all after()s from inside-out", function() {
                assert(beforeCalls).contentsEqual(['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'a', 'x', 'a']);
                assert(afterCalls).contentsEqual(['y', 'y', 'y', 'y', 'y', 'y', 'y', 'b', 'y']);
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

    describe("it()", function() {
        it("should throw exception if not passed at least a specification", function(){
            assert(function(){
                it();
            }).throwsException("'specification' argument is required");
        });

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
                        if(arguments.length === 2) {
                            args = makeArray(arguments);
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

            it("should throw exception when given() not passed at least an arg", function(){
                assert(function(){
                    given();
                }).throwsException("at least one argument is required");
            });

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

            var arrayPassedMultiArgGivenCount = 0;

            given([[1, 2, 3], [4, 5, 6], [7, 8, 9]]).
                it("should test for each of given()'s args when passed array of array arguments", function(x, y, z) {
                    assert(x).equals(arrayPassedMultiArgGivenCount * 3 + 1, "some message");
                    assert(y).equals(arrayPassedMultiArgGivenCount * 3 + 2);
                    assert(z).equals(arrayPassedMultiArgGivenCount * 3 + 3);
                    arrayPassedMultiArgGivenCount++;
            });

            given([1,1],[2,2],[3,3]).
                it("should delegate arguments to async tests", async(function(a,b){
                    assert(typeof a).isNotEqualTo("undefined");
                    assert(typeof b).isNotEqualTo("undefined");
                    assert(a).equals(b);
                    resume();
                }));
        });

        describe("with a wait()", function() {

            it("should throw exception if not passed both fn and ms", function(){
                assert(function(){
                    wait();
                }).throwsException("both 'ms' and 'fn' arguments are required")
                assert(function(){
                    wait(54);
                }).throwsException("both 'ms' and 'fn' arguments are required")
                assert(function(){
                    wait(function(){});
                }).throwsException("both 'ms' and 'fn' arguments are required")
            });

            it("should run adapter's pause(), run a setTimeout() for duration, then execute lambda and run adapter's resume()", function() {
                var original = {
                    pause: pavlov.adapter.pause,
                    resume: pavlov.adapter.resume,
                    setTimeout: global.setTimeout
                };
                var calls = [];
                var setTimeoutMs = 0;
                var waitLambdaCalled = false;

                try{
                    // mock timing functions to capture their calls from wait()
                    pavlov.adapter.pause = function() { calls.push('pause'); };
                    pavlov.adapter.resume = function() { calls.push('resume'); };
                    global.setTimeout = function(fn, ms) {
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
                    pavlov.adapter.pause = original.pause;
                    pavlov.adapter.resume = original.resume;
                    global.setTimeout = original.setTimeout;
                }

                // check if calls to mocked fn's occurred correctly
                assert(calls).contentsEqual(['pause','settimeout','waitlambda','resume']);
                assert(setTimeoutMs).equals(40);
            });

        });

        describe("with a pause()", function(){
            it("should proxy adapter's pause()", function(){
                var originalPause = pavlov.adapter.pause;
                var paused = false;
                pavlov.adapter.pause = function() { paused = true; }
                pause();
                pavlov.adapter.pause = originalPause;
                assert(paused).isTrue();
            });
        });

        describe("with a resume()", function(){
            it("should proxy adapter's resume()", function(){
                var originalResume = pavlov.adapter.resume;
                var resumed = false;
                pavlov.adapter.resume = function() { resumed = true; }
                resume();
                pavlov.adapter.resume = originalResume;
                assert(resumed).isTrue();
            });
        });

        describe("with an async()", function(){
            it("should return a function which calls pause and then the original function", function(){
                var calls = [];
                var specImplementation = function() { calls.push('spec'); };
                var originalPause = pavlov.adapter.pause;
                pavlov.adapter.pause = function(){ calls.push('pause'); };

                var asyncSpecImplementation = async(specImplementation);
                asyncSpecImplementation();

                pavlov.adapter.pause = originalPause;
                assert(calls).contentsEqual(['pause','spec']);
            });
        });
    });

    describe("assertions", function() {

        describe("equals()", function() {

            it("should pass true to adapter's assert when expected == actual", function() {
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(1).equals(true, "some message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([true,"some message"]);
            });

        });

        describe("isEqualTo()", function() {

            it("should pass true to adapter's assert when expected == actual", function() {
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(1).isEqualTo(true, "some message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([true,"some message"]);
            });

            it("should pass false to adapter's assert when expected != actual", function() {
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(4).isEqualTo(7, "some message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([false,"some message"]);
            });
        });

        describe("isNotEqualTo()", function(){

            it("should pass true to adapter's assert when actual != expected", function() {
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(4).isNotEqualTo(2, "some message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([true,"some message"]);
            });

            it("should pass false to adapter's assert when actual == expected", function() {
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(2).isNotEqualTo(2, "some message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([false,"some message"]);
            });

        });

        describe("isStrictlyEqualTo()", function() {

            it("should pass true to adapter's assert when expected === actual", function() {
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert("abc").isStrictlyEqualTo("abc", "some message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([true,"some message"]);
            });

            it("should pass false to adapter's assert when expected !== actual", function() {
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(0).isStrictlyEqualTo(false, "some message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([false,"some message"]);
            });
        });

        describe("isNotStrictlyEqualTo()", function(){

            it("should pass true to adapter's assert when actual !== expected", function() {
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(1).isNotStrictlyEqualTo(true, "some message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([true,"some message"]);
            });

            it("should pass false to adapter's assert when actual === expected", function() {
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(5).isNotStrictlyEqualTo(5, "some message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([false,"some message"]);
            });

        });

        describe("isTrue()", function() {

            it("should pass true to adapter's assert when expr is true", function() {
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(true).isTrue("some message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([true,"some message"]);
            });

            it("should pass false to adapter's assert when expr is false", function() {
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(false).isTrue("some message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([false,"some message"]);
            });

        });

        describe("isFalse()", function(){

            it("should pass true to adapter's assert when expr is false", function() {
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(false).isFalse("some message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([true,"some message"]);
            });

            it("should pass false to adapter's assert when expr is true", function() {
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(true).isFalse("some message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([false,"some message"]);
            });
        });

        describe("isNull()", function() {

            it("should pass true to adapter's assert when actual === null", function() {
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(null).isNull("message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([true,"message"]);
            });

            it("should pass false to adapter's assert when actual !== null", function() {
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(0).isNull("message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([false,"message"]);
            });

        });

        describe("isNotNull()", function(){

            it("should pass true to adapter's assert when actual !== null", function() {
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(0).isNotNull("message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([true,"message"]);
            });

            it("should pass false to adapter's assert when actual === null", function() {
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(null).isNotNull("message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([false,"message"]);
            });

        });

        describe("isDefined()", function() {

            it("should pass true to adapter's assert when typeof(argument) !== 'undefined'", function() {
                var x = "something";
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(x).isDefined("message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([true,"message"]);
            });

            it("should pass false to adapter's assert when typeof(argument) === 'undefined'", function() {
                var x;
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(x).isDefined("message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([false,"message"]);
            });

        });

        describe("isUndefined()", function(){

            it("should pass true to adapter's assert when typeof(argument) === 'undefined'", function() {
                var x;
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(x).isUndefined("message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([true,"message"]);
            });

            it("should pass false to adapter's assert when typeof(argument) !== 'undefined'", function() {
                var x = 1;
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(x).isUndefined("message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([false,"message"]);
            });

        });


        describe("pass()", function(){

            it("should pass true to adapter's assert", function(){
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert().pass("message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([true,"message"]);
            });

            it("should also be called from assert.pass()", function(){

                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert.pass("message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([true,"message"]);

            });

        });

        describe("fail()", function(){

            it("should pass false to adapter's assert", function(){
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert().fail("message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([false,"message"]);
            });

            it("should also be called from assert.false()", function(){

                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert.fail("message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([false,"message"]);

            });

        });

        describe("isFunction()", function(){

            it("shold pass false to adapter's assert when not a funciton", function(){
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert({}).isFunction("message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([false,"message"]);
            });

            it("should pass true to adapter's assert if a function is passed", function(){

                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(function(){}).isFunction("message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([true,"message"]);

            });

        });

        describe("isNotFunction()", function(){

            it("shold pass true to when not a funciton", function(){
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert({}).isNotFunction("message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([true,"message"]);
            });

            it("should return false if a function is passed in", function(){

                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(function(){}).isNotFunction("message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([false,"message"]);

            });

        });

        describe("throwsException()", function(){

            it("should pass true to adapter's assert when function throws exception", function(){
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(function(){
                        // should throw undefined exceptions
                        var totalPrice = unitPrice * quantity;
                    }).throwsException();
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([true,'asserting function() throws exception']);
            });

            it("should pass false to adapter's assert when function does not throw exception", function(){
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(function(){
                        var unitPrice = 10;
                        var quantity = 4;
                        var totalPrice = unitPrice * quantity;
                    }).throwsException();
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([false,'asserting function() throws exception']);
            });

            it("should pass true to adapter's assert when function throws exception with expected description", function(){
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(function(){
                        throw("expected description");
                    }).throwsException("expected description", "message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([true,"message"]);
            });

            it("should pass false to adapter's assert when function throws exception with unexpected description", function(){
                var passedArgs = mock(pavlov.adapter, 'assert', function(){
                    // run spec assertion while underlying qunit assertion is mocked
                    assert(function(){
                        throw("some other error description");
                    }).throwsException("expected description", "message");
                });

                // verify correct arguments would have been passed to qunit
                assert(passedArgs).contentsEqual([false,"message"]);
            });
        });

        describe("custom assertions", function(){

            it("should be able to be added via pavlov.extendAssertions with 3 arg asserts", function(){
                var gtArgs, ltArgs;
                pavlov.extendAssertions({
                    isGreaterThan: function(actual, expected, message) {
                        gtArgs = makeArray(arguments);
                    },
                    isLessThan: function(actual, expected, message) {
                        ltArgs = makeArray(arguments);
                    }
                });

                assert(4).isGreaterThan(2,"some message");
                assert(2).isLessThan(4,"some message");

                assert(gtArgs).contentsEqual([4,2,"some message"]);
                assert(ltArgs).contentsEqual([2,4,"some message"]);
            });

            it("should be able to be added via pavlov.extendAssertions with 2 arg asserts", function(){
                var purpleArgs, yellowArgs;
                pavlov.extendAssertions({
                    isPurple: function(actual, message) {
                        purpleArgs = makeArray(arguments);
                    },
                    isYellow: function(actual, message) {
                        yellowArgs = makeArray(arguments);
                    }
                });

                assert(4).isPurple("some message");
                assert(2).isYellow("some message");

                assert(purpleArgs).contentsEqual([4,"some message"]);
                assert(yellowArgs).contentsEqual([2,"some message"]);
            });

        });

        describe("that have provided messages", function(){
            it("should display those messages", function(){
                var gtArgs, ltArgs;
                pavlov.extendAssertions({
                    isGreaterThan: function(actual, expected, message) {
                        gtArgs = makeArray(arguments);
                    }
                });
                assert(4).isGreaterThan(2,"some message");
                assert(gtArgs).contentsEqual([4,2,"some message"]);
            });
        });

        describe("that do not have provided messages", function(){
            it("should generate messages using letter-cased assertion name and serialized expected/actuals", function(){
                var gtArgs, ltArgs;
                pavlov.extendAssertions({
                    isGreaterThan: function(actual, expected, message) {
                        gtArgs = makeArray(arguments);
                    }
                });
                assert(4).isGreaterThan(2);
                assert(gtArgs).contentsEqual([4,2,"asserting 4 is greater than 2"]);
            });

            describe("when the values are arrays", function(){
                it("should properly serialize", function(){
                    var gtArgs, ltArgs;
                    pavlov.extendAssertions({
                        hasLengthOf: function(actual, expected, message) {
                            gtArgs = makeArray(arguments);
                        }
                    });
                    assert(['a','b','c']).hasLengthOf(3);
                    assert(gtArgs).contentsEqual([['a','b','c'],3,"asserting [a,b,c] has length of 3"]);
                });
            });

            describe("when the values are functions", function(){
                it("should properly serialize", function(){
                    var gtArgs, ltArgs;
                    pavlov.extendAssertions({
                        isAFunction: function(actual, message) {
                            gtArgs = makeArray(arguments);
                        }
                    });
                    var helloFn = function() { alert('hello'); };
                    assert(helloFn).isAFunction();
                    assert(gtArgs).contentsEqual([helloFn,"asserting function() is a function"]);
                });
            });

            describe("when the values are strings", function(){
                it("should properly serialize", function(){
                    var gtArgs, ltArgs;
                    pavlov.extendAssertions({
                        isAStringWithLengthOf: function(actual, expected, message) {
                            gtArgs = makeArray(arguments);
                        }
                    });
                    assert("test string").isAStringWithLengthOf(11);
                    assert(gtArgs).contentsEqual(["test string",11,"asserting \"test string\" is a string with length of 11"]);
                });
            });

            describe("when the values are primitives", function(){
                given([4,5],[false,true],[3.14,2.718])
                    .it("should properly serialize", function(a,b){
                        var gtArgs, ltArgs;
                        pavlov.extendAssertions({
                            isNotTheSameLiteralValueAs: function(actual, expected, message) {
                                gtArgs = makeArray(arguments);
                            }
                        });
                        assert(a).isNotTheSameLiteralValueAs(b);
                        assert(gtArgs).contentsEqual([a,b,("asserting " + a.toString() + " is not the same literal value as " + b.toString())]);
                    });
            });
        });
    });

    describe("QUnit adapter", function(){
        describe("specify()", function() {
            it("should be equivalent to pavlov.specify for legacy support", function(){
                assert(QUnit.specify).isStrictlyEqualTo(pavlov.specify);
            });
            it("should contain the same methods as pavlov.specify for legacy support", function(){
                var containsAllMethods = true;
                pavlov.util.each(pavlov.specify, function(name, fn) {
                    containsAllMethods = containsAllMethods && (pavlov.specify[name] === QUnit.specify[name]);
                });
                assert(containsAllMethods).isTrue();
            });
            it("should be able to run alongside standard QUnit modules and tests", function() {
                assert(firstStandardQUnitTestRan).isTrue();
            });
        });
        describe("initiate", function(){
            it("should update heading to suite name", function(){
                var h1s = document.getElementsByTagName('h1');
                if(h1s && h1s.length > 0) {
                    assert(h1s[0].innerHTML).equals('Pavlov Specifications');
                }
            });
        });
        describe("assert", function(){
            it("should proxy QUnit's ok()", function(){
                var args = mock(global, 'ok', function(expression, message){
                    pavlov.adapter.assert(true, "some message");
                });
                assert(args).contentsEqual([true, 'some message']);
            });
        });
        describe("pause", function(){
            it("should proxy QUnit's stop()", function(){
                var stopped = false;
                mock(global, 'stop', function(){
                    stopped = true;
                    pavlov.adapter.pause();
                });
                assert(stopped).isTrue();
            });
        });
        describe("resume", function(){
            it("should proxy QUnit's start()", function(){
                var started = false;
                mock(global, 'start', function(){
                    started = true;
                    pavlov.adapter.resume();
                });
                assert(started).isTrue();
            });
        });
        describe("assertion extensions", function(){
            describe("isSameAs", function(){
                it("should proxy QUnit's deepEqual()", function(){
                    var args = mock(global, 'deepEqual', function(actual, expected, message){
                        assert('something').isSameAs('somethingElse', "some message");
                    });
                    assert(args).contentsEqual(['something','somethingElse','some message']);
                });
            });
            describe("isNotSameAs", function(){
                it("should proxy QUnit's notDeepEqual()", function(){
                    var args = mock(global, 'notDeepEqual', function(actual, expected, message){
                        assert('something').isNotSameAs('somethingElse', "some message");
                    });
                    assert(args).contentsEqual(['something','somethingElse','some message']);
                });
            });
        });
    });

    describe("api", function(){
        it("should expose 'describe'", function(){
            assert(pavlov.api.describe).isSameAs(describe);
        });
        it("should expose 'before'", function(){
            assert(pavlov.api.before).isSameAs(before);
        });
        it("should expose 'after'", function(){
            assert(pavlov.api.after).isSameAs(after);
        });
        it("should expose 'it'", function(){
            assert(pavlov.api.it).isSameAs(it);
        });
        it("should expose 'async'", function(){
            assert(pavlov.api.async).isSameAs(async);
        });
        it("should expose 'given'", function(){
            assert(pavlov.api.given).isSameAs(given);
        });
        it("should expose 'assert'", function(){
            assert(pavlov.api.assert).isSameAs(assert);
        });
        it("should expose 'wait'", function(){
            assert(pavlov.api.wait).isSameAs(wait);
        });
        it("should expose 'pause'", function(){
            assert(pavlov.api.pause).isSameAs(pause);
        });
        it("should expose 'resume'", function(){
            assert(pavlov.api.resume).isSameAs(resume);
        });
    });
});

module("Second Standard QUnit module");
var secondStandardQUnitTestRan = false;
test("should be able to run after Pavlov's QUnit Adapter", function() {
    expect(1);
    secondStandardQUnitTestRan = true;
    ok(secondStandardQUnitTestRan);
});
