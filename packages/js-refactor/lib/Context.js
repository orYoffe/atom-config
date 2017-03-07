'use babel'

import {parse} from 'babylon'
import traverse from 'babel-traverse'
import debug from 'debug/browser'
const d = debug('js-refactor')

export default class Context {
	setCode(code, options) {
		this._ast = parse(code, options)
	}
	identify(loc) {
		d('identify', loc)
		let binding
		traverse(this._ast, {
			Identifier(path) {
				const {start, end, name} = path.node
				if (loc >= start && loc <= end && test(path)) {
					binding = path.scope.getBinding(name)
					if (!binding) {
						// global?
					}
					this.stop()
				}
			}
		})
		if (binding) return binding
	}
}

function test(path) {
	d('test', path,
		path.isReferencedIdentifier(),
		path.isBindingIdentifier(),
		path.isImportSpecifier(),
		path.isFunction())

	if (path.isReferencedIdentifier()) return true
	if (path.isBindingIdentifier()) return true
	const p = path.parentPath
	if (p.isFunction()) return true // for Method/ArrowFunction, seems babel's bug
	if (p.isImportSpecifier()) return path.node === p.node.local
	d('WTF', path)
	return false
}
