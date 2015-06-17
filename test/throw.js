var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('throw', function () {
    var error = 'error test';
    
    asyncplify
        .throw(error)
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync({ error: error }));
});