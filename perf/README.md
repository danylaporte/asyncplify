#Performance
Stats are provided by [arewefaster](https://github.com/danylaporte/arewefaster)


###combineLatest

|name|time ± error margin|
|---|-----|
|asyncplify|76,588 ops ± 4.99%|
|rx|7,802 ops ± 4.99%|
asyncplify is 9.82x faster than rx

###concat

|name|time ± error margin|
|---|-----|
|asyncplify|466,637 ops ± 4.99%|
|rx|9,239 ops ± 4.99%|
asyncplify is 50.51x faster than rx

###count

|name|time ± error margin|
|---|-----|
|asyncplify|755,388 ops ± 4.99%|
|rx|13,821 ops ± 4.99%|
asyncplify is 54.65x faster than rx

###filter/map

|name|time ± error margin|
|---|-----|
|asyncplify|901,484 ops ± 4.99%|
|transducers-js|371,263 ops ± 4.99%|
|rx|82,193 ops ± 4.99%|
asyncplify is 2.43x faster than transducers-js

###flatMap

|name|time ± error margin|
|---|-----|
|asyncplify|256,241 ops ± 4.99%|
|rx|32,653 ops ± 4.99%|
asyncplify is 7.85x faster than rx

###fromNode

|name|time ± error margin|
|---|-----|
|asyncplify|518,804 ops ± 4.99%|
|bluebird|215,862 ops ± 4.99%|
|rx|57,269 ops ± 10.76%|
asyncplify is 2.4x faster than bluebird

###merge

|name|time ± error margin|
|---|-----|
|asyncplify|416,690 ops ± 8.82%|
|rx|6,872 ops ± 4.99%|
asyncplify is 60.64x faster than rx

###sum

|name|time ± error margin|
|---|-----|
|asyncplify|708,155 ops ± 4.99%|
|rx|11,913 ops ± 4.99%|
asyncplify is 59.45x faster than rx

###toArray

|name|time ± error margin|
|---|-----|
|asyncplify|826,182 ops ± 4.99%|
|rx|144,303 ops ± 4.99%|
asyncplify is 5.73x faster than rx

###value

|name|time ± error margin|
|---|-----|
|asyncplify|1,078,435 ops ± 4.99%|
|rx|470,941 ops ± 4.99%|
asyncplify is 2.29x faster than rx

###zip

|name|time ± error margin|
|---|-----|
|asyncplify|156,208 ops ± 4.99%|
|rx|21,350 ops ± 4.99%|
asyncplify is 7.32x faster than rx
