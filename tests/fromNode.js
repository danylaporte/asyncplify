var asyncplify = require('../dist/asyncplify');
var common = require('./common');

describe('fromNode', function () {
    var source = asyncplify
        .fromNode(function (cb) { cb(null, 10); });

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [10]);
})