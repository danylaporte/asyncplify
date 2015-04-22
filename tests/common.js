require('source-map-support').install();

var should = require('should');
var assert = require('assert');

exports.itShouldClose = function (source) {
    it('should close', function () {
        var v = source.subscribe({
            emit: function () { },
            end: function (err) {
                assert(err === null);
            }
        });

        v.close();
    })
}

exports.itShouldEmitValue = function (source, expected) {
    it('should emit a value', function (done) {
        var array = [];

        source.subscribe({
            emit: array.push.bind(array),
            end: function () {
                array.should.eql([expected]);
                done();
            }
        })
    })
}

exports.itShouldEmitValues = function (source, expected) {
    it('should emit values', function (done) {
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
