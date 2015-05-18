var asyncplify = require('../dist/asyncplify');
var common = require('./common');

describe('catch', function () {

    var s1 = asyncplify.throw('error1');
	var s2 = asyncplify.throw('error2');
	var s3 = asyncplify.throw('error3');
	var s4 = asyncplify.value(2);

	var source = s1.catch([s2, s3]);

    common.itShouldClose(source);
    common.itShouldEndWithError(source, 'error3');
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);

	source = s1.catch([s2, s3, s4]);
    common.itShouldEmitValues(source, [2]);
    
    source = s1.catch(function (err) { return asyncplify.value(2); });
    common.itShouldEmitValues(source, [2], 'should support having a mapper');
});
