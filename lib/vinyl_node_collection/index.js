var util, path, Node, Edge, SuperNode, RequireState, Collection;
util = require('util');
path = require('path');
Node = require('./node');
Edge = require('./edge');
SuperNode = require('./super_node');
RequireState = require('./require_state');
Collection = (function(){
  Collection.displayName = 'Collection';
  var prototype = Collection.prototype, constructor = Collection;
  function Collection(){
    this._nodes = {};
    this._version = Date.now();
  }
  Object.defineProperty(prototype, 'vinyls', {
    get: function(){
      var keyPath, ref$, vn, results$ = [];
      for (keyPath in ref$ = this._nodes) {
        vn = ref$[keyPath];
        results$.push(vn.vinyl);
      }
      return results$;
    },
    configurable: true,
    enumerable: true
  });
  Object.defineProperty(prototype, 'version', {
    get: function(){
      return this._version;
    },
    configurable: true,
    enumerable: true
  });
  prototype.updateVersion = function(){
    this._version = Date.now();
  };
  Object.defineProperty(prototype, 'isStable', {
    get: function(){
      var keyPath, ref$, vn;
      for (keyPath in ref$ = this._nodes) {
        vn = ref$[keyPath];
        if (vn.isUnstable) {
          return false;
        }
      }
      return true;
    },
    configurable: true,
    enumerable: true
  });
  prototype.createNode = function(vinyl, stream){
    return this._createNodeWith(vinyl.relative).tryUnstablize(this, vinyl);
  };
  prototype.finalizeNode = function(vinyl, stream){
    var ref$, keyPathWithMin, keyPath, fromNode;
    ref$ = parseKeyPath(vinyl.relative), keyPathWithMin = ref$[0], keyPath = ref$[1];
    fromNode = (keyPathWithMin && this._nodes[keyPathWithMin]) || this._nodes[keyPath];
    if (fromNode) {
      fromNode.stablize(vinyl);
    } else {
      stream.emit('error', "[VinylNode.Collection] Can't finalize node (" + vinyl.path + ")");
    }
  };
  prototype.createRequireStates = function(){
    var keyPath, ref$, node, results$ = [];
    for (keyPath in ref$ = this._nodes) {
      node = ref$[keyPath];
      if (node.hasAnyEdges) {
        results$.push(node.buildDependencies(new RequireState(keyPath, this)));
      }
    }
    return results$;
  };
  return Collection;
}());
module.exports = Collection;
/*
 * Private APIs
 */
function parseKeyPath(relative){
  var ref$, keyPath, firstExtname;
  ref$ = relative.split('.'), keyPath = ref$[0], firstExtname = ref$[1];
  if ('min' === firstExtname) {
    return [keyPath + "__iLoveSprocket__min", keyPath];
  } else {
    return [void 8, keyPath];
  }
}
Collection.prototype._createNodeWith = function(it){
  var parsedKeyPaths, keyPath, ref$;
  parsedKeyPaths = parseKeyPath(it);
  keyPath = parsedKeyPaths.shift() || parsedKeyPaths[0];
  return (ref$ = this._nodes)[keyPath] || (ref$[keyPath] = new Node(keyPath));
};