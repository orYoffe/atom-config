'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _react = _interopRequireWildcard(require('react'));

var _NativeLaunchUiComponent;

function _load_NativeLaunchUiComponent() {
  return _NativeLaunchUiComponent = _interopRequireDefault(require('./NativeLaunchUiComponent'));
}

var _NativeAttachUiComponent;

function _load_NativeAttachUiComponent() {
  return _NativeAttachUiComponent = _interopRequireDefault(require('./NativeAttachUiComponent'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class NativeLaunchAttachProvider extends (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).DebuggerLaunchAttachProvider {
  constructor(targetUri) {
    super('Native (VSP)', targetUri);
  }

  getCallbacksForAction(action) {
    return {
      /**
       * Whether this provider is enabled or not.
       */
      isEnabled: (() => {
        var _ref = (0, _asyncToGenerator.default)(function* () {
          return true;
        });

        return function isEnabled() {
          return _ref.apply(this, arguments);
        };
      })(),

      /**
       * Returns a list of supported debugger types + environments for the specified action.
       */
      getDebuggerTypeNames: super.getCallbacksForAction(action).getDebuggerTypeNames,

      /**
       * Returns the UI component for configuring the specified debugger type and action.
       */
      getComponent: (debuggerTypeName, configIsValidChanged) => {
        if (action === 'launch') {
          return _react.createElement((_NativeLaunchUiComponent || _load_NativeLaunchUiComponent()).default, {
            targetUri: this.getTargetUri(),
            configIsValidChanged: configIsValidChanged
          });
        } else if (action === 'attach') {
          return _react.createElement((_NativeAttachUiComponent || _load_NativeAttachUiComponent()).default, {
            targetUri: this.getTargetUri(),
            configIsValidChanged: configIsValidChanged
          });
        } else {
          if (!false) {
            throw new Error('Unrecognized action for component.');
          }
        }
      }
    };
  }

  dispose() {}
}
exports.default = NativeLaunchAttachProvider;