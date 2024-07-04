const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const carSchema = new Schema({
  id:String,
  type:{type:String,required:true},
  vechicleno:{type:String,required:true},
  model:{type:String,required:true},
  color:{type:String,required:true},
  rgno:{type:String,required:true},
  });
  
  const Car = mongoose.model('Car',carSchema);
  
  module.exports = Car;