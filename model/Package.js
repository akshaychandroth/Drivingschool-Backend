const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PackageSchema = new Schema({
  id:String,
  type:{type:String,required:true},
  packagename:{type:String,required:true},
  descripition:{type:String,required:true},
  amount:{type:String,required:true},
  });
  
  const Package = mongoose.model('Package',PackageSchema);
  
  module.exports = Package;