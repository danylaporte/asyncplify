var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('last', function () {
    asyncplify
        .range(4)
        .last(function (v) { return v < 3; })
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues({
            title: 'should take a function',
            values: [2]
        }));
});