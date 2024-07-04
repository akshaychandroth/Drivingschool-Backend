const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const remotestudentSchema = new Schema({
  name:{type:String,required:true},
  address:{type:String,required:true},
  phone:{type:Number,required:true},
  email:{type:String,required:true},
    commonAuth: { type: Schema.Types.ObjectId, ref: 'Collection', required: true },
    selectedSessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }] ,
    selectedPackages: [{
      type: Schema.Types.ObjectId,
      ref: 'Package'
    }] });
  
  const RemoteStudent = mongoose.model('RemoteStudent',remotestudentSchema);
  
  module.exports = RemoteStudent;