var asyncplify = require('../dist/asyncplify');
var assert = require('assert');
var common = require('./common');
var should = require('should');

describe('flatMap', function () {
    var source = asyncplify
        .range(2)
        .flatMap(function (v) { return asyncplify.value(v); });

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [0, 1]);

    it('should call mapper for each item', function () {
        var mapperCount = 0;

        asyncplify
            .range(2)
            .flatMap(function (x) {
                mapperCount++;
                return asyncplify.value(x);
            })
            .subscribe(function () { });

        mapperCount.should.equal(2);
    });
});
