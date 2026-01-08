import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import groq from '@/lib/groq';
import { FeedbackRequestSchema, FeedbackResponseSchema } from '@/lib/schema';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parse = FeedbackRequestSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }
    const { rating, review_text } = parse.data;
    let aiResponse = { response: '', summary: '', action: '' };
    
    // If review text is empty, generate a static response based on rating instead of calling LLM
    if (!review_text || review_text.trim() === '') {
      if (rating >= 4) {
        aiResponse = {
          response: "Thank you so much for your high rating! We're glad you had a great experience.",
          summary: `High rating (${rating} stars) with no comment.`,
          action: "Maintain current service standards."
        };
      } else if (rating === 3) {
        aiResponse = {
          response: "Thank you for your feedback. We appreciate your rating.",
          summary: "Neutral rating (3 stars) with no comment.",
          action: "Monitor for repeated neutral ratings."
        };
      } else {
        aiResponse = {
          response: "We're sorry to hear we didn't meet your expectations. We'd love to know how we can improve.",
          summary: `Low rating (${rating} stars) with no comment.`,
          action: "Investigate potential service issues."
        };
      }
    } else {
      // Only call LLM if there is actual text to analyze
      const prompt = `Analyze this review: "${review_text}". 
      Return a JSON object with exactly these keys:
      - "response": A friendly response to the user.
      - "summary": A 10-word summary for the admin.
      - "action": A recommended business action.
      
      IMPORTANT: Return ONLY raw JSON. Do not use Markdown code blocks (no \`\`\`json). Do not include any other text.`;

      try {
        const completion = await groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [
              { role: 'system', content: 'You are a helpful AI assistant that outputs only valid JSON.' },
              { role: 'user', content: prompt }
          ],
          temperature: 0.1, // Lower temperature for more deterministic output
          response_format: { type: 'json_object' } // Enforce JSON mode
        });
        const content = completion.choices[0].message.content || '{}';
        aiResponse = JSON.parse(content);
      } catch (e) {
        console.error("Groq Error:", e);
        aiResponse.response = 'Thank you for your feedback.';
      }
    }
    const { data, error } = await supabase.from('feedback_entries').insert({
      rating,
      review_text,
      ai_user_response: aiResponse.response,
      ai_admin_summary: aiResponse.summary,
      ai_admin_action: aiResponse.action,
    }).select('id').single();
    if (error) {
      console.error("Supabase Insert Error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    const response = FeedbackResponseSchema.parse({
      success: true,
      data: { ai_response: aiResponse.response, id: data.id },
    });
    return NextResponse.json(response);
  } catch (err: any) {
    console.error("Unhandled API Error:", err);
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
