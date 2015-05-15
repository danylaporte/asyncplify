var asyncplify = require('../dist/asyncplify');
var common = require('./common');

describe('groupBy', function () {
    var source = asyncplify
        .range(4)
        .groupBy(function (v) { return v % 2; })
        .flatMap(function (g) { return g.toArray() });

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [[0,2],[1,3]]);
    
    source = asyncplify
        .range(4)
        .groupBy(function (v) { return v % 2; })
        .map(function (v) { return v.key; });
        
    common.itShouldEmitValues(source, [0, 1]);
})
