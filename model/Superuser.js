const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SuperSchema = new Schema({
  
    commonAuth: { type: Schema.Types.ObjectId, ref: 'Collection', required: true },
  });
  
  const Superuser= mongoose.model('SuperUser', SuperSchema);
  
  module.exports = Superuser;