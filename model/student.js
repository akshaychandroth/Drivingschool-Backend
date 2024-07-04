const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({

    name:{type:String,required:true},
    address:{type:String,required:true},
    phone:{type:Number,required:true},
    email:{type:String,required:true},
 commonAuth: { type: Schema.Types.ObjectId, ref: 'Collection', required: true },
 tutor: {
    type:Schema.Types.ObjectId,
    ref: 'Tutor'
  },
  selectedPackages: [{
   type: Schema.Types.ObjectId,
   ref: 'Package'
 }]
  });
  
  const Student = mongoose.model('Student', studentSchema);
  
  module.exports = Student;