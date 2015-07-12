#Performance
Stats are provided by [arewefaster](https://github.com/danylaporte/arewefaster)


###combineLatest

|name|time ± error margin|
|---|-----|
|asyncplify|76,418 ops ± 4.99%|
|rx|7,843 ops ± 4.99%|
asyncplify is 9.74x faster than rx

###concat

|name|time ± error margin|
|---|-----|
|asyncplify|430,938 ops ± 4.99%|
|rx|8,764 ops ± 4.99%|
asyncplify is 49.17x faster than rx

###count

|name|time ± error margin|
|---|-----|
|asyncplify|719,496 ops ± 4.99%|
|rx|13,866 ops ± 4.99%|
asyncplify is 51.89x faster than rx

###filter/map

|name|time ± error margin|
|---|-----|
|asyncplify|939,252 ops ± 4.99%|
|transducers-js|399,707 ops ± 4.99%|
|rx|80,472 ops ± 4.99%|
asyncplify is 2.35x faster than transducers-js

###flatMap

|name|time ± error margin|
|---|-----|
|asyncplify|268,619 ops ± 4.99%|
|rx|34,154 ops ± 4.99%|
asyncplify is 7.87x faster than rx

###fromNode

|name|time ± error margin|
|---|-----|
|asyncplify|486,216 ops ± 4.99%|
|bluebird|223,454 ops ± 4.99%|
|rx|60,245 ops ± 10.84%|
asyncplify is 2.18x faster than bluebird

###merge

|name|time ± error margin|
|---|-----|
|asyncplify|445,735 ops ± 4.99%|
|rx|7,278 ops ± 4.99%|
asyncplify is 61.24x faster than rx

###sum

|name|time ± error margin|
|---|-----|
|asyncplify|732,962 ops ± 4.99%|
|rx|13,391 ops ± 4.99%|
asyncplify is 54.74x faster than rx

###toArray

|name|time ± error margin|
|---|-----|
|asyncplify|858,603 ops ± 4.99%|
|rx|154,570 ops ± 4.99%|
asyncplify is 5.55x faster than rx

###value

|name|time ± error margin|
|---|-----|
|asyncplify|1,151,123 ops ± 4.99%|
|rx|537,755 ops ± 4.99%|
asyncplify is 2.14x faster than rx

###zip

|name|time ± error margin|
|---|-----|
|asyncplify|157,594 ops ± 4.99%|
|rx|24,694 ops ± 4.99%|
asyncplify is 6.38x faster than rx
