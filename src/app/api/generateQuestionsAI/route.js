import { NextResponse } from "next/server";

export async function POST(req) {
  const { topic, numQuestions, difficulty, questionType, regenerateIndex, existingQuestions } = await req.json();
  if (!topic) {
    return NextResponse.json({ message: 'topic is required' }, { status: 400 });
  }
  if (!numQuestions) {
    return NextResponse.json({ message: 'numQuestions is required' }, { status: 400 });
  }

  // Compose prompt for OpenAI
  let prompt = '';
  if (typeof regenerateIndex === 'number') {
    prompt = `Generate 1 ${difficulty ? difficulty + ' ' : ''}${questionType ? questionType + ' ' : ''}quiz question and answer about "${topic}". Respond ONLY with compact, single-line JSON: {\"questionText\": \"...\", \"correctAnswer\": \"...\"}. No extra text, no newlines, no explanations.`;
  } else {
    prompt = `Generate ${numQuestions} ${difficulty ? difficulty + ' ' : ''}${questionType ? questionType + ' ' : ''}quiz questions and answers about "${topic}". Respond ONLY with compact, single-line JSON array: [{\"questionText\": \"...\", \"correctAnswer\": \"...\"}]. No extra text, no newlines, no explanations.`;
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
        temperature: 0.7
      })
    });
    const data = await openaiRes.json();
    let text = data.choices?.[0]?.message?.content || "";
    let questions = [];
    try {
      if (typeof regenerateIndex === 'number') {
        let q = null;
        let match = text.match(/\{.*\}/s);
        if (!match) {
          // Try to clean the response
          const first = text.indexOf('{');
          const last = text.lastIndexOf('}');
          if (first !== -1 && last !== -1) {
            match = [text.slice(first, last + 1)];
          }
        }
        if (match) {
          q = JSON.parse(match[0]);
        } else {
          q = JSON.parse(text);
        }
        questions = [q];
      } else {
        let match = text.match(/\[.*\]/s);
        if (!match) {
          // Try to clean the response
          const first = text.indexOf('[');
          const last = text.lastIndexOf(']');
          if (first !== -1 && last !== -1) {
            match = [text.slice(first, last + 1)];
          }
        }
        if (match) {
          questions = JSON.parse(match[0]);
        } else {
          questions = JSON.parse(text);
        }
      }
    } catch (e) {
      return NextResponse.json({ message: 'Failed to parse AI response', text, note: 'Raw AI response included for debugging.' }, { status: 500 });
    }
    // Add sequenceNumber
    if (typeof regenerateIndex === 'number' && Array.isArray(existingQuestions)) {
      // Replace the question at regenerateIndex
      const updated = [...existingQuestions];
      updated[regenerateIndex] = { ...questions[0], sequenceNumber: regenerateIndex + 1 };
      return NextResponse.json({ questions: updated });
    } else {
      questions = questions.map((q, i) => ({ ...q, sequenceNumber: i + 1 }));
      return NextResponse.json({ questions });
    }
  } catch (error) {
    return NextResponse.json({ message: 'AI generation failed', error: error.message }, { status: 500 });
  }
} 