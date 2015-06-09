#Performance
Stats are provided by [arewefaster](https://github.com/danylaporte/arewefaster)


###combineLatest

|name|time ± error margin|
|---|-----|
|asyncplify|94,101 ops ± 4.99%|
|rx|4,984 ops ± 4.99%|
asyncplify is 18.88x faster than rx

###count

|name|time ± error margin|
|---|-----|
|asyncplify|321,256 ops ± 4.99%|
|rx|10,735 ops ± 4.99%|
asyncplify is 29.93x faster than rx

###map/filter

|name|time ± error margin|
|---|-----|
|asyncplify|376,832 ops ± 4.99%|
|transducers-js|163,076 ops ± 4.99%|
|rx|35,863 ops ± 4.99%|
asyncplify is 2.31x faster than transducers-js

###fromNode

|name|time ± error margin|
|---|-----|
|asyncplify|187,435 ops ± 4.99%|
|bluebird|87,162 ops ± 4.99%|
|rx|29,769 ops ± 8.95%|
asyncplify is 2.15x faster than bluebird

###merge

|name|time ± error margin|
|---|-----|
|asyncplify|169,451 ops ± 5.55%|
|rx|4,618 ops ± 4.99%|
asyncplify is 36.69x faster than rx

###sum

|name|time ± error margin|
|---|-----|
|asyncplify|289,467 ops ± 4.99%|
|rx|8,347 ops ± 4.99%|
asyncplify is 34.68x faster than rx

###toArray

|name|time ± error margin|
|---|-----|
|asyncplify|310,128 ops ± 4.99%|
|rx|72,137 ops ± 4.99%|
asyncplify is 4.3x faster than rx

###value

|name|time ± error margin|
|---|-----|
|asyncplify|396,539 ops ± 4.99%|
|rx|183,070 ops ± 4.99%|
asyncplify is 2.17x faster than rx

###zip

|name|time ± error margin|
|---|-----|
|asyncplify|96,263 ops ± 4.99%|
|rx|12,895 ops ± 4.99%|
asyncplify is 7.47x faster than rx
