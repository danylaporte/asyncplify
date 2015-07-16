var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('throw', function () {
    var error = 'error test';
    
    asyncplify
        .throw(error)
        //.pipe(tests.itShouldClose())  // Actually throw an exception.
        .pipe(tests.itShouldEndSync({ error: error }));
});