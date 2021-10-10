/* eslint-env browser */
/* global CodeMirror, ohm */

'use strict';

require('es6-object-assign/auto'); // Object.assign polyfill

const domUtil = require('./domUtil');
const ohmEditor = require('./ohmEditor');

require('./editorErrors');
require('./examples');
require('./externalRules');
require('./parseTree');
require('./ruleHyperlinks');
require('./searchBar');
require('./splitters');
require('./persistence');

let grammarChanged = true;
let inputChanged = true;

let showFailuresImplicitly = true;

const $ = domUtil.$;
const $$ = domUtil.$$;

let grammarMatcher = ohm.ohmGrammar.matcher();

// Helpers
// -------

function parseGrammar() {
  const matchResult = grammarMatcher.match();

  let grammar;
  let err;

  if (matchResult.succeeded()) {
    const ns = {};
    try {
      ohm._buildGrammar(matchResult, ns);
      const firstProp = Object.keys(ns)[0];
      if (firstProp) {
        grammar = ns[firstProp];
      }
    } catch (ex) {
      err = ex;
    }
  } else {
    err = {
      message: matchResult.message,
      shortMessage: matchResult.shortMessage,
      interval: matchResult.getInterval(),
    };
  }
  return {
    matchResult,
    grammar,
    error: err,
  };
}

// Return the name of a valid start rule for grammar, or null if `optRuleName` is
// not valid and the grammar has no default starting rule.
function getValidStartRule(grammar, optRuleName) {
  if (optRuleName && optRuleName in grammar.rules) {
    return optRuleName;
  }
  if (grammar.defaultStartRule) {
    return grammar.defaultStartRule;
  }
  return null;
}

function refresh() {
  const grammarEditor = ohmEditor.ui.grammarEditor;
  const inputEditor = ohmEditor.ui.inputEditor;

  const grammarSource = grammarEditor.getValue();
  const inputSource = inputEditor.getValue();

  ohmEditor.saveState(inputEditor, 'input');

  // Refresh the option values.
  for (let i = 0; i < checkboxes.length; ++i) {
    const checkbox = checkboxes[i];
    ohmEditor.options[checkbox.name] = checkbox.checked;
  }

  if (inputChanged || grammarChanged) {
    showFailuresImplicitly = true; // Reset to default.
  }

  if (inputChanged) {
    inputChanged = false;
    ohmEditor.emit('change:input', inputSource);
  }

  if (grammarChanged) {
    grammarChanged = false;
    ohmEditor.emit('change:grammar', grammarSource);

    const result = parseGrammar();
    ohmEditor.grammar = result.grammar;
    ohmEditor.emit(
      'parse:grammar',
      result.matchResult,
      result.grammar,
      result.error
    );
  }

  if (ohmEditor.grammar) {
    const startRule = getValidStartRule(ohmEditor.grammar, ohmEditor.startRule);
    if (startRule) {
      const trace = ohmEditor.grammar.trace(inputSource, startRule);

      // When the input fails to parse, turn on "show failures" automatically.
      if (showFailuresImplicitly) {
        const checked = ($('input[name=showFailures]').checked =
          trace.result.failed());
        ohmEditor.options.showFailures = checked;
      }

      ohmEditor.emit('parse:input', trace.result, trace);
    }
  }
}

ohmEditor.setGrammar = function (grammar) {
  if (grammar === null) {
    // load from local storage or default element
    grammar = localStorage.getItem('grammar');
    if (!grammar || grammar === '') {
      grammar = $('#sampleGrammar').textContent; // default element
    }
  }
  const doc = CodeMirror.Doc(grammar, 'null');
  ohmEditor.ui.grammarEditor.swapDoc(doc);
};

ohmEditor.saveState = function (editor, key) {
  localStorage.setItem(key, editor.getValue());
};

// Main
// ----

let refreshTimeout;
function triggerRefresh(delay) {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }
  refreshTimeout = setTimeout(refresh.bind(ohmEditor), delay || 0);
}

function resetGrammarMatcher() {
  grammarMatcher = ohm.ohmGrammar.matcher();
  grammarMatcher.setInput(ohmEditor.ui.grammarEditor.getValue());
}

const checkboxes = $$('#options input[type=checkbox]');
checkboxes.forEach(function (cb) {
  cb.addEventListener('click', function (e) {
    const optionName = cb.name;

    // Respect the user's wishes if they automatically enable/disable "show failures".
    if (optionName === 'showFailures') {
      showFailuresImplicitly = false;
    }
    ohmEditor.options[optionName] = cb.checked;
    ohmEditor.emit('change:option', e.target.name);
    triggerRefresh();
  });
});

ohmEditor.setGrammar(null /* restore local storage */);

ohmEditor.ui.inputEditor.on('change', function (cm) {
  inputChanged = true;
  ohmEditor.emit('change:inputEditor', cm);
  triggerRefresh(250);
});

ohmEditor.ui.grammarEditor.on('beforeChange', function (cm, change) {
  grammarMatcher.replaceInputRange(
    cm.indexFromPos(change.from),
    cm.indexFromPos(change.to),
    change.text.join('\n')
  );
});

ohmEditor.ui.grammarEditor.on('swapDoc', resetGrammarMatcher);

ohmEditor.ui.grammarEditor.on('change', function (cm, change) {
  grammarChanged = true;
  ohmEditor.emit('change:grammarEditor', cm);
  triggerRefresh(250);
});
ohmEditor.ui.grammarEditor.on('swapDoc', function (cm) {
  grammarChanged = true;
  ohmEditor.emit('change:grammarEditor', cm);
  triggerRefresh(250);
});

/* eslint-disable no-console */
console.log(
  '%cOhm visualizer',
  'color: #e0a; font-family: Avenir; font-size: 18px;'
);
console.log(
  [
    '- `ohm` is the Ohm library',
    '- `ohmEditor` is editor object with',
    '  `.grammar` as the current grammar object (if the source is valid)',
    '  `.ui` containing the `inputEditor` and `grammarEditor`',
  ].join('\n')
);
/* eslint-enable no-console */

resetGrammarMatcher();
refresh();
