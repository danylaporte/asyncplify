var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('count', function(){
    asyncplify
        .range(4)
        .count()
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([4]));
	
	asyncplify
		.fromArray([1, 2, 3, 4])
        .count(function (v) { return v % 2; })
        .pipe(tests.itShouldEmitValues({
            title: 'should support having a filter',
            values: [2]
        }));
});