const mongoose = require('mongoose')
const Schema = mongoose.Schema

const collectionSchema = new Schema({
  username: { type: String, required: true, unique: true},
  password: { type: String, required: true },
    role: { type: String, required: true },
    status:{type:String }
  });

  const Collection = mongoose.model('Collection', collectionSchema);

  module.exports = Collection;