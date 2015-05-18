var asyncplify = require('../dist/asyncplify');
var assert = require('assert');
var common = require('./common');
var should = require('should');

describe('flatMapLatest', function () {
    var source = asyncplify
        .range(2)
        .flatMapLatest(function (v) { return asyncplify.value(v); });

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [0, 1]);

    source = asyncplify
        .range(2)
        .flatMapLatest(function (v) { return asyncplify.value(v).observeOn(); });

    common.itShouldEmitValues(source, [1]);
});