var asyncplify = require('../dist/asyncplify');
var should = require('should');
var tests = require('asyncplify-tests');

describe('fromArray', function () {
    asyncplify
        .fromArray([0, 1])
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([0, 1]));
        
    asyncplify
        .fromArray([])
        .pipe(tests.itShouldEmitValues([]));
});