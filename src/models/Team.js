import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
    teamName: { type: String, required: true },
    password: { type: String, required: true },
    currentLocationIndex: { type: Number, default: 0 ,required: true},  // Track the current location index in the path
    locationPath: [{ type: Number, required: true }],  // Array to store the random path of locations
    answeredQuestions: {
        type: Map,
        of: String,  // Stores question status ('answered' or 'not answered')
        default: {}
    },
    startTime: { type: Date, default: Date.now },
});
export const Team = mongoose.models.Team || mongoose.model('Team', TeamSchema);
