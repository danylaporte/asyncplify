#Performance
Stats are provided by [arewefaster](https://github.com/danylaporte/arewefaster)


###combineLatest

|name|time ± error margin|
|---|-----|
|asyncplify|98,800 ops ± 4.99%|
|rx|4,770 ops ± 4.99%|
asyncplify is 20.71x faster than rx

###count

|name|time ± error margin|
|---|-----|
|asyncplify|325,041 ops ± 4.99%|
|rx|9,524 ops ± 4.99%|
asyncplify is 34.13x faster than rx

###filter/map

|name|time ± error margin|
|---|-----|
|asyncplify|365,344 ops ± 4.99%|
|transducers-js|161,444 ops ± 4.99%|
|rx|35,733 ops ± 4.99%|
asyncplify is 2.26x faster than transducers-js

###flatMap

|name|time ± error margin|
|---|-----|
|asyncplify|161,056 ops ± 4.99%|
|rx|16,166 ops ± 4.99%|
asyncplify is 9.96x faster than rx

###fromNode

|name|time ± error margin|
|---|-----|
|asyncplify|187,212 ops ± 4.99%|
|bluebird|85,537 ops ± 4.99%|
|rx|30,271 ops ± 10.28%|
asyncplify is 2.19x faster than bluebird

###merge

|name|time ± error margin|
|---|-----|
|asyncplify|161,149 ops ± 4.99%|
|rx|4,269 ops ± 4.99%|
asyncplify is 37.75x faster than rx

###sum

|name|time ± error margin|
|---|-----|
|asyncplify|289,698 ops ± 4.99%|
|rx|7,488 ops ± 4.96%|
asyncplify is 38.69x faster than rx

###toArray

|name|time ± error margin|
|---|-----|
|asyncplify|340,825 ops ± 4.99%|
|rx|69,705 ops ± 4.99%|
asyncplify is 4.89x faster than rx

###value

|name|time ± error margin|
|---|-----|
|asyncplify|415,707 ops ± 4.99%|
|rx|204,555 ops ± 4.99%|
asyncplify is 2.03x faster than rx

###zip

|name|time ± error margin|
|---|-----|
|asyncplify|98,957 ops ± 4.99%|
|rx|11,761 ops ± 4.99%|
asyncplify is 8.41x faster than rx
