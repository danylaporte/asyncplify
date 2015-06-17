var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('groupBy', function () {
    asyncplify
        .range(4)
        .groupBy(function (v) { return v % 2; })
        .flatMap(function (g) { return g.toArray(); })
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([[0,2],[1,3]]));
    
    asyncplify
        .range(4)
        .groupBy(function (v) { return v % 2; })
        .map(function (v) { return v.key; })
        .pipe(tests.itShouldEmitValues([0, 1]));
});