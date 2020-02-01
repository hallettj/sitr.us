!SLIDE
# ECMAScript 6 Now! #
## Lightning talk at PDXjs ##
### 2014-04-23 ###
### Jesse Hallett \<jesse@sitr.us\> ###

!SLIDE

    @@@ javascript
    import _ from 'lodash'

    export default function MyClass(opts) {
        this.opts = _.assign(
            {},
            defaults,
            opts
        )
    }
    var defaults = {
        /* ... */
    }

!SLIDE

    @@@ html
    <script type="module" src="MyClass.js"></script>

!SLIDE

    $ npm install -g traceur

    $ traceur --dir source/ compiled/ --modules=amd

!SLIDE

    @@@ javascript
    define(['lodash'], function(_) {
        "use strict";
        var $__default = function MyClass(opts) {
            this.opts = _.assign({}, this.defaults, opts);
        };
        var defaults = {
            /* ... */
        };
        return {
            get default() {
                return $__default;
            }
        };
    })

!SLIDE

    @@@ javascript
    var person = {
        name: "Harriet",
        occupation: "hacker",
        twitter: "@sue"
    }

    var { name, occupation, twitter } = person

    assert(
        name === "Sue"
    )

!SLIDE

    @@@ javascript
    import _ from 'lodash'

    export evenSum
    export oddSum
    export thirdFunc

    function evenSum(xs) {
        return
        _.reduce(_.filter(_.map(xs, Number), isEven),
                 (sum, x) => sum + x,
                 0
        )
    }
    function oddSum(xs) { /* ... */ }
    function thirdFunc(xs) { /* ... */ }


!SLIDE

    @@@ javascript
    import { reduce, filter, map } from 'lodash'

    export {
        evenSum,
        oddSum,
        thirdFunc
    }

    function evenSum(xs) {
        return
        reduce(filter(map(xs, Number), isEven),
                 (sum, x) => sum + x,
                 0
        )
    }
    function oddSum(xs) { /* ... */ }
    function thirdFunc(xs) { /* ... */ }
