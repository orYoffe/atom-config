{ satisfies } = require 'semver'
{ Emitter } = require 'atom'
{ packages } = atom

isFunction = (func) -> (typeof func) is 'function'

module.exports =
class ModuleManager

  constructor: ->
    { @version } = require '../package.json'
    @modules = {}
    @emitter = new Emitter
    #TODO update when package is enabled
    @update()

  dispose: ->
    @modules = null
    @emitter.dispose()

  onActivated: (callback) ->
    @emitter.on 'activated', callback

  update: =>
    @modules = {}
    # Search packages related to refactor package.
    for metaData in packages.getAvailablePackageMetadata()
      # Verify enabled, defined in engines, and satisfied version.
      { name, engines } = metaData
      continue unless !packages.isPackageDisabled(name) and
                      (requiredVersion = engines?.refactor)? and
                      satisfies @version, requiredVersion
      @activate name

  activate: (name) ->
    packages
    .activatePackage name
    .then (pkg) =>
      # Verify module interface.
      { Ripper } = module = pkg.mainModule
      unless Ripper? and
             Array.isArray(Ripper.scopeNames) and
             isFunction(Ripper::parse) and
             isFunction(Ripper::find)
        console.error "'#{name}' should implement Ripper.scopeNames, Ripper.parse() and Ripper.find()"
        return

      for scopeName in Ripper.scopeNames
        @modules[scopeName] = module

      @emitter.emit 'activated', name

  getModule: (sourceName) ->
    @modules[sourceName]
