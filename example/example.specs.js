pavlov.specify("Pavlov Example", function(){

    describe("A feature that is being described", function(){

        var foo;

        before(function(){
            foo = "bar";
        });

        after(function(){
            foo = "baz";
        });

        it("can be specified like so", function(){
            assert(foo).equals('bar');
        });

        it("fails with 'Not Implemented' if a specification does not have an associated test");

        given([2,2,4], [5,2,7], [6,-4,2]).
            it("can generate row data tests", function(a, b, c) {
                assert(c).equals(a + b);
            });

        it("can contain as many specs as necessary", function(){
            assert(function(){
                throw "Exception!";
            }).throwsException();
        });

        it("can specify asynchronous features", async(function(){
            // an async spec implementation will pause the test runner until 'resume()'
            setTimeout(function(){
                assert.pass();
                resume();
            }, 500);
        }));

        describe("can also have nested examples", function(){

            before(function(){
                foo = foo + "bar";
            });

            it("with their own specs", function(){
                assert(foo).equals("barbar");
            });

            given([2,2,4], [5,2,7], [6,-4,2]).
                it("can generate nested row data tests", function(a, b, c) {
                    assert(c).equals(a + b);
                });

        });

    });

});