var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('combineLatest', function () {
    asyncplify
        .combineLatest([asyncplify.value(0), asyncplify.fromArray([1, 2])])
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([[0, 1], [0, 2]]));
        
    asyncplify
        .combineLatest({
            items: [asyncplify.value(0), asyncplify.fromArray([1, 2])],
            mapper: function (x, y) { return {x: x, y: y}; }
        })
        .pipe(tests.itShouldEmitValues({
            title: 'should support a mapper',
            values: [{x: 0, y: 1}, {x: 0, y: 2}]
        }));
    
    asyncplify
        .combineLatest({
            emitUndefined: true,
            items: [asyncplify.value(0), asyncplify.fromArray([1, 2])]
        })
        .pipe(tests.itShouldEmitValues({
            title: 'should emit undefined values',
            values: [[0, undefined], [0, 1], [0, 2]]
        }));
});