import mongoose from 'mongoose';
const LocationSchema = new mongoose.Schema({
    locationName: { type: Number, required: true },
    hint: { type: String, required: true },
});

export default mongoose.models.Location || mongoose.model('Location', LocationSchema);
