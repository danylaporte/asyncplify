var asyncplify = require('../dist/asyncplify');
var bluebird = require('bluebird');
var fs = require('fs');
var rx = require('rx');

function work(cb) {
    process.nextTick(cb);
}

var rxReadFile = rx.Observable.fromNodeCallback(work);
var bluebirdReadFile = bluebird.promisify(work);

module.exports = {
    name: 'fromNode',
    tests: {
        asyncplify: {
            defer: true,
            fn: function (defer) {
                asyncplify.fromNode(work).subscribe(function () {
                    defer.resolve();
                });
            }
        },
        blueBird: {
            defer: true,
            fn: function (defer) {
                bluebirdReadFile().then(function () {
                    defer.resolve();
                })
            }
        },
        callback: {
            defer: true,
            fn: function (defer) {
                work(function () {
                    defer.resolve();
                })
            }
        },
        rx: {
            defer: true,
            fn: function (defer) {
                rxReadFile().subscribe(function () {
                    defer.resolve();
                });
            }
        }
    }
}
