module.exports = {
  getManifestFilepaths: function(mimeType, keyPath){
    return this.manifest_filepaths[mimeType + keyPath] || [];
  },
  setManifestFilepaths: function(mimeType, keyPath, filepaths){
    return this.manifest_filepaths[mimeType + keyPath] = filepaths;
  }
};