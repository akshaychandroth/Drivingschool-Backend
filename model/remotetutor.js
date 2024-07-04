const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const remotetutorSchema = new Schema({
  id:{type:String,required:true},

  name:{type:String,required:true},
  address:{type:String,required:true},
  phone:{type:Number,required:true},
  email:{type:String,required:true},
  idcard:{type:String,required:true},
  // status:{type:String,default:'pending'},

  
  
    commonAuth: { type: Schema.Types.ObjectId, ref: 'Collection', required: true },
  });
  
  const RemoteTutor = mongoose.model('RemoteTutor', remotetutorSchema);
  
  module.exports = RemoteTutor;