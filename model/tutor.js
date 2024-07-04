const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tutorSchema = new Schema({

 id:String,
  name:{type:String,required:true},
  address:{type:String,required:true},
  phone:{type:Number,required:true},
  email:{type:String,required:true},
  idcard:{type:String,required:true},
  
  
    commonAuth: { type: Schema.Types.ObjectId, ref: 'Collection', required: true },
   
  });
  
  const Tutor = mongoose.model('Tutor', tutorSchema);
  
  module.exports = Tutor;