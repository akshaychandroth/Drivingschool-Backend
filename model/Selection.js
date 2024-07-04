
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SelectionSchema = new Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }, // Reference to the Student model
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true }, // Reference to the Session model
    date: { type: Date, required: true }, // Date of the selection
  });
  
  const Selection = mongoose.model('Selection',SelectionSchema);
  
  module.exports = Selection