require('source-map-support').install();

var should = require('should');
var assert = require('assert');

exports.itShouldClose = function (source, title) {
    it(title || 'should close', function () {
        source.subscribe().close();
    })
}

exports.itShouldEmitValues = function (source, expected, title) {
    it(title || 'should emit values', function (done) {
        var array = [];

        source.subscribe({
            emit: array.push.bind(array),
            end: function () {
                array.should.eql(expected);
                done();
            }
        })
    })
}

exports.itShouldEndAsync = function (source) {
    it('should end asynchronously', function (done) {
        var called = false;

        source.subscribe({
            emit: function () { },
            end: function () {
                called = true;
                setTimeout(done, 0);
            }
        })

        called.should.equal(false);
    })
}

exports.itShouldEndOnce = function (source) {
    var count = 0;

    it('should end once', function (done) {
        source.subscribe({
            emit: function () { },
            end: function () {
                count++;
                count.should.equal(1);
                setTimeout(done, 0);
            }
        })
    })
}

exports.itShouldEndSync = function (source) {
    it('should end synchronously', function (done) {
        var called = false;

        source.subscribe({
            emit: function () { },
            end: function () {
                called = true;
            }
        })

        called.should.equal(true);
        done();
    })
}

exports.itShouldEndWithError = function (source, error) {
    it('should end with error', function (done) {
        source.subscribe({
            emit: function () { },
            end: function (err) {
                err.should.equal(error);
                done();
            }
        })
    })
}

exports.itShouldNotProduceAnError = function (source) {
    it('should not produce an error', function (done) {
        source.subscribe({
            emit: function () { },
            end: function (err) {
                assert(err === null);
                done();
            }
        })
    })
}
