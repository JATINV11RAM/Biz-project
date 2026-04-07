import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai";
import { supabaseAdmin } from "@/lib/supabase";
import { deductCredit, checkCredits } from "@/lib/credits";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  try {
    const { userInput, language = "en" } = await request.json();

    if (!userInput) {
      return NextResponse.json(
        { error: "userInput is required" },
        { status: 400 }
      );
    }

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      userId = authHeader.substring(7);
    }

    if (!userId) {
      const withinRateLimit = await checkRateLimit(ip);
      if (!withinRateLimit) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Maximum 3 requests per day." },
          { status: 429 }
        );
      }
    } else {
      const { canUse } = await checkCredits(userId);
      if (!canUse) {
        return NextResponse.json(
          { error: "Insufficient credits. Please upgrade to Pro plan." },
          { status: 402 }
        );
      }
    }

    // System prompt for Review Replier
    const systemPrompt = `You are BizSaathi AI, a smart business assistant for Indian small business owners. You help craft professional and engaging replies to customer reviews.

Your task: Generate a professional reply to the customer review that:
- Acknowledges the customer's feedback
- Shows genuine care for their experience
- Addresses concerns (if negative review)
- Invites them to provide more feedback or return
- Is professional yet warm in tone
- Is ready to post on Google, Trustpilot, or other review platforms

Language: ${language}
Keep it concise (under 200 words) but impactful.`;

    const output = await callAI(systemPrompt, userInput);

    if (userId) {
      await deductCredit(userId);
    }

    await supabaseAdmin.from("tool_usage").insert({
      user_id: userId,
      tool_name: "review_replier",
      output: output.substring(0, 1000),
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ output });
  } catch (error) {
    console.error("Review Replier Error:", error);
    return NextResponse.json(
      { error: "Failed to generate review reply" },
      { status: 500 }
    );
  }
}
