var asyncplify = require('../dist/asyncplify');
var common = require('./common');

describe('ignoreElements', function () {
    var source = asyncplify
        .range(2)
        .ignoreElements();

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, []);
})
