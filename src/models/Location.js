import mongoose from 'mongoose';
const LocationSchema = new mongoose.Schema({
    locationName: { type: Number, required: true },
    hint: { type: String, required: true },
  }, {
    collection: 'Location' // 👈 EXACTLY matches your DB collection name
  });
  

export const Location= mongoose.models.Location || mongoose.model('Location', LocationSchema);
