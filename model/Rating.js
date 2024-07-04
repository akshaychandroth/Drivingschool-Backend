const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RatingSchema = new Schema({
  session: { type: Schema.Types.ObjectId, ref: 'Session', required: true }, 
  tutor: { type: Schema.Types.ObjectId, ref: 'RemoteTutor', required: true }, 
  student: { type: Schema.Types.ObjectId, ref: 'RemoteStudent', required: true },
  sessionRating: { type: Number, required: true }, 
  tutorRating: { type: Number, required: true }

});

  
  const Rating = mongoose.model('Rating',RatingSchema);
  
  module.exports = Rating;