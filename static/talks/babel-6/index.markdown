% How do I Babel 6?
% Jesse Hallett &lt;jesse@sitr.us&gt;
% PDXjs, January 2016


~~~~ {.javascript}
import { readFile } from 'fs'

export function main() {
  readFile('greeting.txt', (err, data) => {
    console.log(`output: ${data}`)
  })
}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.main = main;

var _fs = require('fs');

function main() {
  (0, _fs.readFile)('greeting.txt', function (err, data) {
    console.log('output: ' + data);
  });
}

~~~~~~~~~~~~~~~~~~~~~~

---

~~~~
$ npm install babel-cli

$ export PATH="node_modules/.bin:$PATH"

$ babel main.es6 > main.js
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
// .babelrc

{
  "presets": [
    "es2015"
  ]
}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~
check-es2015-constants
transform-es2015-arrow-functions
transform-es2015-block-scoped-functions
transform-es2015-block-scoping
transform-es2015-classes
transform-es2015-computed-properties
transform-es2015-destructuring
transform-es2015-for-of
transform-es2015-function-name
transform-es2015-literals
transform-es2015-modules-commonjs
transform-es2015-object-super
transform-es2015-parameters
transform-es2015-shorthand-properties
transform-es2015-spread
transform-es2015-sticky-regex
transform-es2015-template-literals
transform-es2015-typeof-symbol
transform-es2015-unicode-regex
transform-regenerator
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
// .babelrc

{
  "presets": [
    "es2015"
  ]
}
~~~~~~~~~~~~~~~~~~~~~~

~~~~ {.javascript}
// package.json

"devDependencies": {
  "babel-cli": "6.4.5",
  "babel-preset-es2015": "6.3.13"
}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~
$ babel main.es6 > main.js

$ node
> require('./main').main()

> output: hello world
~~~~~~~~~~~~~~~~~~~~~~

---


~~~~ {.javascript}
{
  "presets": [
    "react",
    "es2015"
  ],
  "plugins": [
    "transform-runtime",
    "transform-class-properties"
  ]
}
~~~~~~~~~~~~~~~~~~~~~~

. . .

~~~~ {.javascript}
"devDependencies": {
  "babel-cli": "6.4.5",
  "babel-plugin-transform-class-properties": "6.4.0",
  "babel-plugin-transform-runtime": "6.3.13",
  "babel-preset-es2015": "6.3.13",
  "babel-preset-react": "6.3.13"
},
"dependencies": {
  "babel-runtime": "6.3.19"
}
~~~~~~~~~~~~~~~~~~~~~~

---

②ality – JavaScript and more

www.2ality.com

---

- Stage 0: strawman
- Stage 1: proposal
- Stage 2: draft
- Stage 3: candidate
- Stage 4: finished

http://www.2ality.com/2015/11/tc39-process.html

---

~~~~ {.Makefile}
# Makefile

.PHONY: all clean

babel     := node_modules/.bin/babel
src_files := $(shell find . -name '*.js.flow' -not -path './node_modules/*')
out_files := $(patsubst %.js.flow,%.js,$(src_files))

all: $(out_files)

%.js: %.js.flow
	$(babel) $< --out-file $@

clean:
	rm -f $(out_files)
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.Makefile}
# Makefile

.PHONY: all clean watch

src := $(shell find src)

all: $(src)
  $(babel) src \
    --out-dir build \
    --source-maps

watch:
  $(babel) src \
    --out-dir build \
    --source-maps \
    --watch

clean:
	rm -rf build
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~
$ make
~~~~~~~~~~~~~~~~~~~~~~

. . .

~~~~
$ find . -not -path './node_modules/*' | entr -d make
~~~~~~~~~~~~~~~~~~~~~~
