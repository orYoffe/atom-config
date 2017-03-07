# Refactor Package

Let's refactor code!
With this package, you can rename the name of variables and functions easily.

![capture_rename](https://cloud.githubusercontent.com/assets/514164/2929354/b4e848d4-d788-11e3-99c2-620f406d5e6f.gif)

## Language Support

This package works with these language plugins.
You can install using the preferences pane.

* JavaScript: [js-refactor](https://atom.io/packages/js-refactor) [![Build Status](https://travis-ci.org/hax/js-refactor.svg?branch=master)](https://travis-ci.org/hax/js-refactor) with [ES6+ support](https://github.com/hax/js-refactor/issues/6)
* CoffeeScript: [coffee-refactor](https://atom.io/packages/coffee-refactor)
* [PHP](https://github.com/hax/refactor/issues/2)

## Usage

1. Set cursor to a symbol.
2. Start renaming by using `ctrl-alt-r`.
3. Type new name.
4. Finish renaming by using `enter` or removing cursor from the focused symbol.

## User Setting

* Override [keymap](keymaps/refactor.cson) by using `Atom > Open Your Keymap`.

For example, you can override the shortcut to `ctrl-alt-e`
```cson
'atom-text-editor:not(.mini)':
  'ctrl-alt-r': 'unset!'
  'ctrl-alt-e': 'refactor:rename'
```

* Override [stylesheet](styles/refactor.less) by using `Atom > Open Your Stylesheet`.

## API Documentation (for plugin developer)

### package.json

Add `refactor` as `engines` in `package.json`.

```
{
  ...
  "engines": {
    "atom": ">=1.0.0",
    "refactor": ">=0.6.0"
  },
  ...
}
```

### Interface

You should implement `Ripper` class in main module.

* `Ripper.scopeNames []String` : **[Required]** Array of scope name, like 'source.coffee', 'source.js' and all that.
* `Ripper#parse(code String, callback Function)` : **[Required]** Parse code, and you should callback when the parsing process is done. Callback specify the params as an array of error `Object`. The error `Object` should have params `range` and `message`.
* `Ripper#find(point Point) []Range` : **[Required]** Return an array of found symbols' [`Range`](https://atom.io/docs/api/latest/api/classes/Range) at the passed [`Point`](https://atom.io/docs/api/latest/api/classes/Point).

```coffeescript
{ Range, Point } = require 'atom'
class Riper
  @scopeNames: []
  parse: (code, callback) ->
    # parse code
    callback [
      range = new Range()
      message: 'foo'
    ]
  find: (point) ->
    # find references
    [
      new Range()
      new Range()
      ...
      new Range()
    ]
```

### Examples

* [hax/js-refactor](https://github.com/hax/js-refactor)
* [Ragg-/coffee-refactor](https://github.com/Ragg-/coffee-refactor)


## See

* [Changelog](CHANGELOG.md)
