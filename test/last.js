var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('last', function () {
    asyncplify
        .range(4)
        .last(2)
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues({
            title: 'should take a count',
            values: [2, 3]
        }));

    asyncplify
        .range(4)
        .last(function (v) { return v < 3; })
        .pipe(tests.itShouldEmitValues({
            title: 'should take a function',
            values: [2]
        }));
        
    asyncplify
        .range(4)
        .last({
            count: 2,
            cond: function (v) { return v < 3; }
        })
        .pipe(tests.itShouldEmitValues({
            title: 'should take a function and a count',
            values: [1, 2]
        }));
        
    asyncplify
        .range(4)
        .last(0)
        .pipe(tests.itShouldEmitValues({
            title: 'should not emit value when count is 0',
            values: []
        }));
        
    asyncplify
        .range(4)
        .last(-1)
        .pipe(tests.itShouldEmitValues({
            title: 'should emit all values when count is negative',
            values: [0, 1, 2, 3]
        }));
});