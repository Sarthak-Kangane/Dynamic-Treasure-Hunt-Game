import mongoose from 'mongoose';
const GameSchema = new mongoose.Schema({
    isGameOver: { type: Boolean, default: false },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
    startTime: { type: Date, default: Date.now },
    duration: { type: Number, default: 2 * 60 * 60 * 1000 }, // 2 hours in milliseconds
});

export default mongoose.models.Game || mongoose.model("Game", GameSchema);
