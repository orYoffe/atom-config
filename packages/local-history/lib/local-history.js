'use strict';

/**
 * @name local-history (main)
 * @author Nicolas Tallefourtane <dev@nicolab.net>
 * @link https://github.com/Nicolab/atom-local-history
 * @license MIT https://github.com/Nicolab/atom-local-history/blob/master/LICENSE.md
 */
const utils = require('./utils');

module.exports = {
  localHistoryView: null,

  config: {

    // 256 KB
    fileSizeLimit: {
      type: 'integer',
      default: 262144
    },

    // in days
    daysLimit: {
      type: 'integer',
      default: 30
    },

    historyStoragePath: {
      type: 'string',
      default: utils.getLocalHistoryPath()
    },

    difftoolCommand: {
      type: 'string',
      default: 'meld "{current-file}" "{revision-file}"'
    }
  },

  activate(state) {
    let _this, fsPlus, fileSizeLimit, workspaceView;

    _this         = this;
    fsPlus        = require('fs-plus');
    fileSizeLimit = atom.config.get('local-history.fileSizeLimit');
    workspaceView = atom.views.getView(atom.workspace);

    atom.workspace.observeTextEditors(function(editor) {
      editor.buffer.onWillSave(function(/*willSaved*/) {
        let buffer      = editor.buffer;
        let hasFilePath = buffer && buffer.file && buffer.file.path;

        if (buffer.isModified()
        && hasFilePath
        && fsPlus.getSizeSync(buffer.file.path) < fileSizeLimit) {
          _this.getView().saveRevision(buffer);
        }
      });
    });

    atom.commands.add(
      'atom-workspace',
      'local-history:current-file', 
      function() {
        let view = _this.getView();

        view.currentCommand = 'current-file';
        view.findLocalHistory();
      }
    );

    atom.commands.add(
      'atom-workspace', 
      'local-history:difftool-current-file', 
      function() {
        let view = _this.getView();

        view.currentCommand = 'difftool-current-file';
        view.findLocalHistory();
      }
    );

    atom.commands.add(
      'atom-workspace', 
      'local-history:purge', 
      function() {
        let view = _this.getView();

        view.currentCommand = 'purge';
        view.purge();
      }
    );
  },

  deactivate() {
    return this.getView().destroy();
  },

  serialize() {
    return {
      localHistoryViewState: this.getView().serialize()
    };
  },

  getView() {
    if (!this.localHistoryView) {
      let LocalHistoryView  = require('./local-history-view');
      this.localHistoryView = new LocalHistoryView();
    }

    return this.localHistoryView;
  }
};

