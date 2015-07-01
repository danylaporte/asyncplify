var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('take', function () {
    asyncplify
        .range(10)
        .take(2)
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues({
            title: 'should take a count', 
            values: [0, 1]
        }));

    asyncplify
        .range(4)
        .take(0)
        .pipe(tests.itShouldEmitValues({
            title: 'should not emit value when count is 0',
            values: []
        }));
});