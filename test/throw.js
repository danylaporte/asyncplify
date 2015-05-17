var asyncplify = require('../dist/asyncplify');
var common = require('./common');

describe('throw', function () {
    var error = new Error('error test');
    var source = asyncplify.throw(error);

    common.itShouldClose(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEndWithError(source, error);
    common.itShouldEmitValues(source, []);
});