= Lacanian sudoku =

A simple implementation of sudoku in JavaScript, with display tweaks to use the symbols from Lacan's mathemes. Hopefully, this is a slightly more fun version of the shuffling of symbols that sometimes passes for theory from Lacanians.

You can play Lacanian sudoku at http://sparkle.voyou.org/sudoku

The source code is available under the GPL, version 3. For full details, see LICENSE.txt in this repository. If you want to work with the source code, check it out from the repository with:

```
git clone https://github.com/voyou/sudoku.git
```

The JavaScript is written as CommonJS modules, so they need to be converted into a format that can be served to browsers using browserify. To do that, you should have npm installed; then type:

```
npm install
```

You can then upload the contents of the static/ folder to a web host and serve your own version of Lacanian sudoku from there.

You can start a development server, which will also automatically rerun browserify when the JavaScript source changes by typing:

```
npm start
```

