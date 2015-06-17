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
        .take(function (v) { return v > 1; })
        .pipe(tests.itShouldEmitValues({
            title: 'should take a function',
            values: [2, 3]
        }));
        
    asyncplify
        .range(4)
        .take({
            count: 1,
            cond: function (v) { return v > 1; }
        })
        .pipe(tests.itShouldEmitValues({
            title: 'should take a cond and a count',
            values: [2]
        }));

    asyncplify
        .range(4)
        .take(0)
        .pipe(tests.itShouldEmitValues({
            title: 'should not emit value when count is 0',
            values: []
        }));
});