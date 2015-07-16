require('source-map-support').install();
var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('catch', function () {

    var s1 = asyncplify.throw('error1');
	var s2 = asyncplify.throw('error2');
	var s3 = asyncplify.throw('error3');
	var s4 = asyncplify.value(2);

	s1
        .catch([s2, s3])
        .pipe(tests.itShouldEndSync({ error: 'error3' }));

	s1
        .catch([s2, s3, s4])
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEmitValues([2]));
        
    s1
        .catch(function (err) { return asyncplify.value(2); })
        .pipe(tests.itShouldEmitValues({ values: [2], title: 'should support having a mapper'}));
});