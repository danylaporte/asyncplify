var asyncplify = require('../dist/asyncplify');
var common = require('./common');
var rx = require('rx');

describe('fromRx', function () {
    var source = asyncplify
        .fromRx(rx.Observable.range(0, 3));

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [0, 1, 2]);
})