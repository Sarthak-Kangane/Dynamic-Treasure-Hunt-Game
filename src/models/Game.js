import mongoose from 'mongoose';
const GameSchema = new mongoose.Schema({
    isGameStarted: { type: Boolean, default: false },
    isGameOver: { type: Boolean, default: false },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
    startTime: { type: Date, default: null },
    endTime: { type: Date, default: null },
    duration: { type: Number, default: 2 * 60 * 60 * 1000 }, // Default 2 hours in milliseconds, but configurable
    durationHours: { type: Number, default: 2 }, // Store hours for easy display
    durationMinutes: { type: Number, default: 0 }, // Store minutes for easy display
});

export default mongoose.models.Game || mongoose.model("Game", GameSchema);
