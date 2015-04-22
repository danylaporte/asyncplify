var asyncplify = require('../dist/asyncplify');
var assert = require('assert');
var common = require('./common');
var should = require('should');

describe('empty', function () {
    var source = asyncplify.empty();

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);

    it('should not returns a value', function () {
        asyncplify
            .empty()
            .subscribe(function () {
                assert(false);
            });
    })
})
