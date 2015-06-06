#Performance
Stats are provided by [arewefaster](https://github.com/danylaporte/arewefaster)


###combineLatest

|name|time ± error margin|
|---|-----|
|asyncplify|41,601 ops ± 4.99%|
|rx|2,086 ops ± 4.99%|
asyncplify is 19.94x faster than rx

###count

|name|time ± error margin|
|---|-----|
|asyncplify|169,403 ops ± 4.99%|
|rx|3,965 ops ± 4.99%|
asyncplify is 42.72x faster than rx

###flatMap

|name|time ± error margin|
|---|-----|
|asyncplify|140,932 ops ± 4.99%|
|rx|9,811 ops ± 4.99%|
asyncplify is 14.36x faster than rx

###fromNode

|name|time ± error margin|
|---|-----|
|asyncplify|118,132 ops ± 4.99%|
|bluebird|127,086 ops ± 5.15%|
|rx|32,747 ops ± 8.99%|
bluebird is 1.08x faster than asyncplify

###merge

|name|time ± error margin|
|---|-----|
|asyncplify|79,896 ops ± 4.99%|
|rx|2,428 ops ± 4.99%|
asyncplify is 32.91x faster than rx

###sum

|name|time ± error margin|
|---|-----|
|asyncplify|188,037 ops ± 4.99%|
|rx|4,547 ops ± 4.94%|
asyncplify is 41.35x faster than rx

###toArray

|name|time ± error margin|
|---|-----|
|asyncplify|254,874 ops ± 4.99%|
|rx|47,370 ops ± 4.99%|
asyncplify is 5.38x faster than rx

###value

|name|time ± error margin|
|---|-----|
|asyncplify|470,570 ops ± 4.99%|
|rx|160,398 ops ± 4.99%|
asyncplify is 2.93x faster than rx

###zip

|name|time ± error margin|
|---|-----|
|asyncplify|92,296 ops ± 4.99%|
|rx|6,668 ops ± 4.99%|
asyncplify is 13.84x faster than rx
