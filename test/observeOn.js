var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('observeOn', function () {
    
    asyncplify
        .range(3)
        .observeOn()
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndAsync())
        .pipe(tests.itShouldEmitValues([0, 1, 2]));
});