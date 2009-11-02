Pavlov
======
Behavioral API over [QUnit][1]  
[http://github.com/mmonteleone/pavlov][11]

What's all this then?
---------------------

Pavlov extends JavaScript testing framework [QUnit][1] with a rich, higher-level, Behavioral API with the following:

### Features:

* Nested examples (describes)
* Cascading befores and afters (setups and teardowns)
* Generative row tests
* Fluent, extendable, assertions
* Spec stubbing
* Simplified async support
* Non-DOM-polluting

### Example!

**Given the following (nested) specification...** (With a nod to [RSpec][9])

    describe("Bowling", function(){
        // variables scoped only to this and nested examples
        var bowling;        
        
        // befores and afters:
  
        before(function(){
            // this setup occurs before all specs both
            // in this example, and any nested examples
            bowling = new Bowling();        
        });
                
        // specs:
      
        it("should score 0 for gutter game", function(){
            for(var i=0;i<20;i++) {
                bowling.hit(0);
            }
        
            assert(bowling.score).equals(0);
        });
                          
        // stubs specs which yield "Not Implemented" failures:
        
        it("should allow 2 rolls on frame 1-9");
        it("should allow 3 rolls on the last frame");      
            
        // generative row tests:
        
        given([5, 4], [8, 2], [9, 1]).
            it("should award a spare if all knocked down on 2nd roll", function(roll1, roll2) {
                // this spec is called 3 times, with each of the 3 sets of given()'s 
                // parameters applied to it as arguments

                if(roll1 + roll2 == 10) {
                    bowling.display('Spare!');
                }

                assert(bowling.displayMessage).equals('Spare!');
            });
      
        // nested examples (n-level depth):

        describe("Duck Pin Variation", function(){
        
            before(function(){
                // setup method which occurs before all of this example's
                // specs, but after the parent example's before()
                bowling.mode = BowlingMode.DuckPin;
            })
        
            it("should allow 3 balls per frame");
            it("should award no bonus if knocked down in 3rd frame");
                
        });
        
        // fluent assertions
        
        it("should only allow 10 frames", function(){
            // add 10 frames
            for(var i=0;i<10;i++) {
                bowling.moveNextFrame();
            } 
        
            // try to add an 11th  
            // expect an exception      
            assert(function(){
                bowling.moveNextFrame();
            }).throwsException();
        });
              
    });

**...Pavlov compiles the examples down into flattened vanilla QUnit `module` and `test` statements which are then executed**

    Bowling: should score 0 for gutter game
    Bowling: should only allow 10 frames
    Bowling: should allow 2 rolls on frame 1-9
    Bowling: should allow 3 rolls on the last frame
    Bowling: given 5,4, should award a spare if all knocked down on 2nd roll
    Bowling: given 8,2, should award a spare if all knocked down on 2nd roll
    Bowling: given 9,1, should award a spare if all knocked down on 2nd roll
    Bowling, Duck Pin Variation: should allow 3 balls per frame
    Bowling, Duck Pin Variation: should award no bonus if knocked down in 3rd frame

Notice how the nested example became a composite module, and how the given() call generated three tests, one for each argument.

      
Reasonable Questions Reasonable People Should Ask
-------------------------------------------------

**Really?  Another JavaScript testing framework?  Really?**

No, not really.  Pavlov is just a library providing a higher-level way of interacting with an already established framework, [QUnit][1].  In fact, Pavlov examples can live alongside standard QUnit tests even within the same script.

**So it's just an aliased syntax for the QUnit?**

No.  Pavlov provides a different mode of testing with higher level constructs for operating in that mode.  Just like other Behavior Driven Development (BDD) testing frameworks, this shifts the focus of unit testing from QA to Design.  Here is the point in the worn-out debate where many reasonable arguments can be made about how that's what TDD was always about in the first place.  I'd probably agree.  

At any rate, being able to define nested, private, example scopes with cascading befores/afters and data-generated row tests can be really useful, strict BDD or otherwise.  It's a natural, hierarchical, way of composing and testing functionality.  

**So why would I want this?**

You want a BDD framework that can boast wide stability and support out of the gate by offloading the work to QUnit. You like the idea of your Pavlov specs being able to "just work" against QUnit-supporting [JsTestDriver][2] and [TestSwarm][3].  You already have an investment in QUnit, but are envious of other frameworks' richer APIs.  You want specific testing features not necessarily available in other BDD frameworks like async support, generative data row-tests, spec stubbing, nested examples with cascading setups and teardowns, and more.

**And why would I not want this?**

You might already have a large investment in some other test framework, and simply no need for another.  You might not care for the BDD approach.

**Looks like [Screw.Unit][6].  Why not just use Screw.Unit or fork it?**

Yeah, it looks *really* similar.  And Screw.Unit might well be perfect for you and your project.  However, Pavlov is a response to a need for certain features not provided by other BDD frameworks, including among others, compatibility with QUnit.  

By simply layering on top of QUnit, Pavlov gains all of QUnit's simplicity, stability, and maturity/integration with tools, while also being able to quickly build up a BDD API.

Surprisingly, Pavlov's API similarities with Screw.Unit are purely coincidental and are due to its imitation of RSpec rather than other JS librarires.  I will admit to shamelessly borrowing one trick from Screw.Unit: [Yehuda Katz][5]'s clever metaprogramming technique for injecting extra scope (like api methods) into a function instead of extending the global scope.  This *can* be disabled for scenarios when it destroys your debugging.


Documentation:
--------------

### Usage Requirements

* [QUnit][1] (testrunner.js, testsuite.css, testsuite.html)

### Downloading/Installing/Setup

If you're just using Pavlov and not developing it or running its unit tests, just download the [latest packaged release from Github][10].

Contained in the package is a barebones **example spec setup**, which is just a standard QUnit test host document including the the normal QUnit dependencies, but also pavlov.js and a spec suite script.  

### Running tests

Tests can be run by simply opening the test host document in a browser or by taking advantage of any other tools which can run QUnit tests, including [JsTestDriver][2], [TestSwarm][3], etc.  For a demonstration of how this can be accomplished, Pavlov's source uses Pavlov, QUnit, and JsTestDriver to test itself.

### Creating Examples


#### QUnit.specify()

Function which declares a new QUnit.specify context.  It's the required top-level method which provides an overall scope for creation, compilation, and running of Pavlov specs.  

*Parameters*

* name (String) - name of what's being specified
* fn (Function) - Function containing exmaples and specs

*Example*

    QUnit.specify("The Rules of Bowling", function(){
        // descriptions contained within specification context
        describe(....  
        describe(....  
    });

#### describe()

Initiates a new Example.  A description translates to a QUnit module.

*Parameters*

* description (String) - Name of what's being "described"
* fn (Function) - containing description (before, after, specs, nested examples)

*Example*

    //... within a QUnit.specify scope
    describe("Bowling", function(){
        // specs contained within this description
        it(...
        it(...
    });
    
#### before()

Sets a function to occur before all contained specs and nested examples' specs.  The function(s) is/are executed within a QUnit module's setup option.

*Parameters*

* fn (Function) - function to occur

*Example*

    describe("Bowling", function(){
        var bowling;

        before(function(){
            bowling = new Bowling();        
        });
    ...

#### after()

Sets a function to occur after all contained specs and nested examples' specs.  The function(s) is/are executed within a QUnit module's teardown option.

*Parameters*

* fn (Function) - function to occur

*Example*

    describe("Bowling", function(){
        var bowling;

        before(function(){
            bowling = new Bowling();        
        });
    ...

#### Nested Examples

Examples can be nested as deep as necessary.  

* A nested example has access to the parent's scope.
* A a parent example's before and after methods still occur before and after all nested example's specs, in the following pattern:
  *  Nested befores are executed before specs in order from outermost-to-innermost 
  *  Nested afters are executed after specs in order from innermost-to-outermost

*Example*

    //... within a QUnit.specify scope
    describe("Bowling", function(){
        // specs contained within this description
        before(...
        after(...
        it(...
        it(...
          
        // nested example
        describe("Duck Pin Variation", function(){
            before(...
            after(...
            it(...
            it(...            
        });    
    });
  
### Defining Specs


#### it()

Creates a spec (test) to occur within an example (decribe)
When not passed fn, creates a spec-stubbing fn which asserts fail "Not Implemented"

*Parameters*
* specification (String) - Description of what "it" "should do"
* fn (Function) - Optional function containing a test to assert that it does indeed do it (optional)

*Example*

    //.. within a describe 
    it("should score 0 for gutter game", function(){
        // code and assertion to test the specification    
        for(var i=0;i<20;i++) {
            bowling.hit(0);
        }
        assert(bowling.score).equals(0);
    });

    // stubs specs which yield "Not Implemented" failures:
    it("should allow 2 rolls on frame 1-9");
    it("should allow 3 rolls on the last frame");
    
#### given()

Generates a row spec for each argument passed, applying each argument to a new call against the spec.  
Returns an object with an it() function for declaring a spec to be called for each of the given's arguments.

*Parameters*

* arguments (Array) - either a list of values or list of arrays of values (when the spec's fn accepts multiple arguments)

*Example*

    given([2,2,4], [5,2,7], [6,-4,2]).
        it("can generate row data tests", function(a, b, c) {
            assert(c).equals(a + b);
        });
    
    given(1, 3, 4).
        it("doesn't require arrays", function(x) {
            assert(x > 0).isTrue();
        });    

### Using Assertions

Pavlov's assertions are fluent extensions to QUnit's assertion primitives.  Pavlov's assertions can be extended with custom domain-specific fluent assertions for more readable tests.

Syntax usually follows the pattern:

    assert(actual).comparisonMethod(expected, optionalMessage);
    
A few Examples:

    assert(foo).equals("bar");
    assert(foo).isNotNull();
    assert(bar).isUndefined("this should be undefined");  // message here was optional
    assert(function(){
      // asserting that contained code should properly throw an exception
    }).throwsException();
    assert(baz).isFalse();
    assert(foo).isSameAs(bar);  // uses QUnit's equiv to deep-compare objects/arrays
    assert.fail();    // explicitly fail a test

#### Built-in Assertions

Most are self-explanatory.  Message parameter is always optional.

* assert(actual).equals(expected, message);
* assert(actual).isEqualTo(expected, message);
* assert(actual).isNotEqualTo(expected, message);
* assert(actual).isSameAs(expected, message);   // deep value comparison using QUnit's equiv()
* assert(actual).isNotSameAs: function(actual, expected, message);            
* assert(actual).isTrue(message);     
* assert(actual).isFalse(message);            
* assert(actual).isNull(message);
* assert(actual).isNotNull(message);            
* assert(actual).isDefined(message);
* assert(actual).isUndefined(message);
* assert.pass(message);  // shortcut for assert().pass(message);
* assert.fail(message);  // shortcut for assert().fail(message);
* assert(fn).throwsException(expectedErrorDescription, message);  // asserts that executing passed fn throws an exception (optionally with expected description)


#### Adding custom Assertions

`QUnit.specify.extendAssertions()`

For more readable tests, domain-specific assertions can be added.

*Parameters*

* asserts (Object) - object containing implementations for assertions.  Each gets wrapped into an extension available when calling assert().  

*Example*

    // first provide assertion implementations
    // each accepts an actual, optional expected, and message
    // the implementation names become the names of the assertions
    
    QUnit.specify.extendAssertions({
        isGreaterThan: function(actual, expected, message) {
            ok(actual > expected, message);
        },
        isLessThan: function(actual, expected, message) {
            ok(actual < expected, message);
        },
        containsExactlyTwoElements(actual, message) {
            // note this does not have an expected parameter
            ok(actual.length == 2);
        }
    });
    
    // then make use of the generated assertions
    
    assert(4).isGreaterThan(2);
    assert(5).isLessThan(10, "some message");
    assert(["a", b]).containsExactlyTwoElements();


### Extra


#### wait()

One of QUnit's strengths is its support for testing asynchronous code.  To slightly help with this, the `wait` method wraps up the pattern of pausing the test runner for a duration, running code, and then re-starting.   Not unlike a setTimeout, except it backs against QUnit's `stop` and `start`.  This is really only meant for scenarios where injecting/overriding the clock isn't practical.

*Parameters*

* ms (Number) - number of milliseconds to pause the test runner
* fn (Function) - function to run after waiting, but before restarting test runner

*Example*

    describe("a wait()", function(){
        it("should pause the test runner", function(){
            var timeoutCompleted = false;
              
            setTimeout(function(){
                timeoutCompleted = true;    
            }, 40);

            // wait long enough for timeout to have completed
            wait(50, function(){
                assert(timeoutCompleted).isTrue();
            });      
        });
    });

#### Toggling global scope

Pavlov shamelessly borrows Screw.Unit's clever metaprogramming technique to keep from having to inject its API into the global scope.  But if you're debugging, the fun can quickly come to an end as your tests' source have been modified and re-evaled.  Thankfully, Pavlov allows the API to be injected globally as well.

Just set `QUnit.specify.globalApi = true;` before a `QUnit.specify()` block.  It defaults to `false`.

*Property*

* QUnit.specify.globalApi
  * false (default): does not globally inject API, uses metaprogramming
  * true: globally injects API, no metaprogramming 

*Example*

    QUnit.specify.globalApi = true;  // injects API into global scope
    // before a standard specify 
    QUnit.specify(... 

Contributing
------------

Development Requirements (for building and test running):

* Ruby + Rake, PackR, rubyzip gems: for building and minifying
* Java: if you want to test using the included JsTestDriver setup

Clone the source at `http://github.com/mmonteleone/pavlov.git` and have at it.

The following build tasks are available:

    rake build     # builds package and minifies
    rake test      # runs Pavlov specs against QUnit testrunner in default browser
    rake server    # downloads, starts [JsTestDriver][2] server, binds common browsers
    rake testdrive # runs Pavlov specs against running JsTestDriver server

Credit
------

Credit of course goes to:  

[QUnit][1]: Copyright (c) 2008 John Resig, Jörn Zaefferer, used under the terms of the MIT LICENSE  
[RSpec][9]: David Chelimsky and RSpec Development Team  
[Screw.Unit][6]: Copyright (c) 2008 Nick Kallen and especially Yehuda Katz metaprogramming contributions to it

Changelog
---------

* 0.2.3 
    - removed GPL license.  Now just MIT.  So long, jQuery dual license weirdness.
    - cleaned up and hopefully simplified project tree
* 0.2.2
    - now supports `expectedErrorDescription` argument on `assert.throwsException`
    - supports `rake release`
    - updated to latest release of qunit
    - reports own version at QUnit.specify.version
    - throws proper exceptions when methods not passed expected arguments
* 0.2.1 - Updated to latest version of qunit.js/css, Fixed an IE regression in 0.2
* 0.2 - Removed Pavlov's jQuery dependence along with QUnit's independence from jQuery
* 0.1 - Initial Release
  
License
-------

Copyright (c) 2009 Michael Monteleone, http://michaelmonteleone.net

The MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


[0]: http://jquery.com "jQuery"
[1]: http://docs.jquery.com/QUnit "QUnit"
[2]: http://code.google.com/p/js-test-driver/ "JsTestDriver"
[3]: http://wiki.github.com/jeresig/testswarm "TestSwarm"
[4]: http://michaelmonteleone.net "Michael Monteleone"
[5]: http://yehudakatz.com/ "Yehuda Katz"
[6]: http://github.com/nathansobo/screw-unit/tree/master "Screw.Unit"
[7]: http://github.com/jcoglan/packr "PackR"
[8]: http://rake.rubyforge.org/ "Rake"
[9]: http://rspec.info/ "RSpec"
[10]: http://cloud.github.com/downloads/mmonteleone/pavlov/pavlov.zip "Pavlov Download"
[11]: http://github.com/mmonteleone/pavlov "Pavlov"

