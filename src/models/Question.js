import mongoose from 'mongoose';
const QuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    sequenceNumber: { type: Number, required: true },
});

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);
