var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('tap', function(){
    asyncplify
        .range(3)
        .tap(function () { })
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([0, 1, 2]));
});