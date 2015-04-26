##Performance
Stats are provided by [Benchmark.js](https://github.com/bestiejs/benchmark.js).

|operator|asyncplify|rxjs|comment|
|--------|----------|----|-------|
|sum|1,248,679 ops/sec|102,377 ops/sec|asyncplify 164.7x faster than rx|
|toArray|1,857,880 ops/sec|102,377 ops/sec|asyncplify 18.1x faster than rx|
|value|4,198,496 ops/sec|552,155 ops/sec|asyncplify 7.6x faster than rx|
*higher is better
