var path, crypto, File, Edge, SuperNode, Node, DIRECTIVE_REGEX;
path = require('path');
crypto = require('crypto');
File = require('vinyl');
Edge = require('./edge');
SuperNode = require('./super_node');
Node = (function(){
  Node.displayName = 'Node';
  var prototype = Node.prototype, constructor = Node;
  Node._null_file = new File();
  function Node(keyPath){
    this.keyPath = keyPath;
    this._cached_deps = '';
    this._cached_hash = void 8;
    this._unstable = false;
    this._src_path = void 8;
    this._dest_vinyl = constructor._null_file;
    this._edges = [];
  }
  Object.defineProperty(prototype, 'hasAnyEdges', {
    get: function(){
      return this._edges.length > 0;
    },
    configurable: true,
    enumerable: true
  });
  Object.defineProperty(prototype, 'vinyl', {
    get: function(){
      return this._dest_vinyl;
    },
    configurable: true,
    enumerable: true
  });
  Object.defineProperty(prototype, 'isUnstable', {
    get: function(){
      return this._unstable;
    },
    configurable: true,
    enumerable: true
  });
  /*
   * Returns false if it cannot unstablize (the content isn't changed!)
   */
  prototype.tryUnstablize = function(collection, vinyl){
    var contents, newHash, dependencies;
    contents = vinyl.contents.toString();
    newHash = crypto.createHash('sha1').update(contents).digest('hex');
    this._unstable = newHash !== this._cached_hash;
    if (this._unstable) {
      this._cached_hash = newHash;
      this._src_path = vinyl.path;
      dependencies = parseDependencies(contents);
      this._cached_deps = JSON.stringify(dependencies);
      this._edges = dependencies.map(function(it){
        return new (getEdgeCtor(it))(collection, this, it);
      }, this);
    }
    return this._unstable;
  };
  prototype.stablize = function(vinyl){
    this._unstable = false;
    this._dest_vinyl = vinyl;
  };
  prototype._resolveKeyPath = function(keyPath){
    return path.join(path.dirname(this._src_path), keyPath, path.sep);
  };
  prototype.pathMatches = function(regex){
    return this._src_path.match(regex);
  };
  prototype.buildDependencies = function(state){
    if (state.needRequireOrInclude(this)) {
      this._edges.forEach(state.buildDependenciesInState, state);
      state.addNodeIfNeeded(this);
    }
    return state;
  };
  return Node;
}());
module.exports = Node;
/*
 * Private APIs
 */
DIRECTIVE_REGEX = /^.*=\s*(require|include)(_self|_directory|_tree)?(\s+([\w\.\/-]+))?$/gm;
function getEdgeCtor(dependency){
  switch (dependency.targetDirective) {
  case '_directory':
    return SuperNode.Directory;
  case '_tree':
    return SuperNode;
  case '_self':
    if (dependency.isRequireState) {
      return Edge.Circular;
    } else {
      return Edge;
    }
    break;
  default:
    return Edge;
  }
}
function parseDependencies(contents){
  var that, results$ = [];
  while (that = DIRECTIVE_REGEX.exec(contents)) {
    results$.push({
      isRequireState: 'require' === that[1],
      targetDirective: that[2],
      keyPath: that[4]
    });
  }
  return results$;
}