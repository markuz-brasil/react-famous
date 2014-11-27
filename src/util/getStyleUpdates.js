'use strict';

import cloneStyle from './cloneStyle'
var styleFields = Object.keys(cloneStyle({}));

export default function getStyleUpdates(lastStyle, nextStyle) {
  if (lastStyle == null) {
    return nextStyle;
  }

  var styleUpdates = {};
  var styleUpdated = false;

  styleFields.forEach(function(styleName) {
    var lastVal = lastStyle[styleName];
    var nextVal = nextStyle[styleName];

    // doesnt exist in either one
    if (!lastVal && !nextVal) {
      return;
    }

    // value changed
    if (lastVal !== nextVal) {
      styleUpdated = true;
      styleUpdates[styleName] = (nextVal || '');
    }
  });

  if (styleUpdated) {
    return styleUpdates;
  }
}

