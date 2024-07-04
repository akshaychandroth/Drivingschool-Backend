const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SessionSchema = new Schema({
  id:String,
  sessionname:{type:String,required:true},
  descripition:{type:String,required:true},
  date:{type:Date,required:true},
  duration:{type:String,required:true},
  finished: { type: Boolean, default: false },
  sessionRating: { type: Number },
  tutorRating: { type: Number  },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'RemoteTutor' },
  selectedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RemoteStudent' }]  });

  
  const Session = mongoose.model('Session',SessionSchema);
  
  module.exports = Session;