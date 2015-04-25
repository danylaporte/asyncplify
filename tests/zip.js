var asyncplify = require('../dist/asyncplify');
var assert = require('assert');
var common = require('./common');
var should = require('should');

describe('zip', function () {

    var source = asyncplify.zip([asyncplify.value(0), asyncplify.fromArray([1, 2])]);

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [[0, 1]]);
})
