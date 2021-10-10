/* eslint-env browser */
/* global CodeMirror */

'use strict';

const CheckedEmitter = require('checked-emitter');

const ohmEditor = new CheckedEmitter();

ohmEditor.registerEvents({
  // Emitted when the CodeMirror instances for the input and grammar have been initialized.
  'init:inputEditor': ['codeMirror'],
  'init:grammarEditor': ['codeMirror'],

  // Emitted as soon as the user has made a change in the respective editor. Any listeners which
  // may be long running should use 'change:input' or 'change:grammar' instead.
  'change:inputEditor': ['codeMirror'],
  'change:grammarEditor': ['codeMirror'],

  // Emitted after a short delay when one or more editor change events have occurred.
  'change:grammar': ['grammarSource'],
  'change:input': ['inputSource'],

  // Emitted after attempting to parse the grammar and the input, respectively.
  'parse:grammar': ['matchResult', 'grammar', 'err'],
  'parse:input': ['matchResult', 'trace'],

  // Emitted when the user indicates they want to preview contextual information about a
  // Failure, e.g. when hovering over the failure message.
  'peek:failure': ['failure'],
  'unpeek:failure': [], // Ends the preview.

  // Emitted when the user indicates they want jump to a location relevant to a Failure.
  // Usually comes after a 'peek:failure' event, and if so, it implies that there will be
  // no matching 'unpeek:failure'.
  'goto:failure': ['failure'],

  // Emitted when the user indicates they want to preview a rule definition, e.g. when
  // hovering over a node in the visualizer.
  'peek:ruleDefinition': ['ruleName'],
  'unpeek:ruleDefinition': [], // Ends the preview.

  // Emitted when the user checks or unchecks one of the option checkboxes.
  'change:option': ['optionName'],
});

ohmEditor.grammar = null;
ohmEditor.startRule = null;
ohmEditor.options = {};

ohmEditor.semantics = new CheckedEmitter();
ohmEditor.semantics.registerEvents({
  // Emitted after adding an new operation/attribute.
  'add:operation': ['type', 'name', 'optArguments'],

  // Emitted after selecting an operation button.
  'select:operation': ['operationName'],

  // Emitted after pressing cmd/ctrl-S in semantics editor
  'save:action': ['operation', 'key', 'args', 'body'],

  // Emitted when user want to add a new semantic editor
  'add:semanticEditor': ['type', 'name'],
});

ohmEditor.examples = new CheckedEmitter();
ohmEditor.examples.registerEvents({
  'add:example': ['id'],
  'set:example': ['id', 'oldValue', 'newValue'],
  'set:selected': ['id'],
  'remove:example': ['id'],
});

ohmEditor.ui = {
  inputEditor: null, // Initialized in example-list.vue.
  grammarEditor: CodeMirror(
    document.querySelector('#grammarContainer .editorWrapper')
  ),
};

ohmEditor.emit('init:grammarEditor', ohmEditor.ui.grammarEditor);

// Exports
// -------

module.exports = ohmEditor;
