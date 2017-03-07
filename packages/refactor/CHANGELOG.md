## v0.9.2 on 2016-06-30

* Add keymap example to README, and fix link to keymap.cson
* Use original debug package to solve install failures
* Support different styles for references/mutations/declaration

## v0.8.0
* Correct refactor of shorthands

## v0.6.1 on 2016-06-22
* Fix issues of #10 reference markers leak

## v0.6.0 on 2015-09-08

* Improve error handling
* Only update references/errors when needed, increase performance
* Use onDidStopChanging and increase delay of cursor move, increase performance
* Fix styles for shadow dom
* Use a config schema to fix #3

## v0.5.0, v0.5.1 on 2015-06-16

* Republished and maintained by [hax](https://github.com/hax)
* Fix issues of using deprecated api

## v0.4.1 on 2014/08/16

* Replace deprecated method. #10

## v0.4.0 on 2014/07/31

* Improves renaming process with using `Marker` and `Decoration`.
* Fixes an issue that highlighting process didn't work when file is opened and window is reloaded.
* Fixes an issue that renaming process fails to rename symbol starting with `$`.

## v0.3.0 on 2014/07/28

* Replace highlighting implementation to `Decoration` API.
* Start support for React editor and finish support for the editor based on space-pen.
* Remove `constructor` and `destruct` from [API interface](https://github.com/minodisk/refactor#interface).

## v0.2.2 on 2014/07/23

* Fixes an issue that highlighting process didn't work when the cursor is left of a word starting with `$`.

## v0.2.1 on 2014/07/23

* Improve highlighting process. Remove duplicated call in an event cycle.

## v0.2.0 on 2014/07/19

* Improve finding symbol process. Use the start point of selection, not the range of word.

## v0.1.2 on 2014/07/16

* Add more description to README for plugin developer.

## v0.1.0-v0.1.1 on 2014/07/16

* Reform refactor ecosystem to get better performance and maintainability.
