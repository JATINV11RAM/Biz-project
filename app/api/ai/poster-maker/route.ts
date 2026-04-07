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

    // System prompt for Poster Maker
    const systemPrompt = `You are BizSaathi AI, a smart business assistant for Indian small business owners. You help create engaging social media posters and promotional content.

Your task: Generate a complete poster caption/design brief that includes:
- Eye-catching headline
- Compelling body text
- Call-to-action
- Emoji suggestions for visual appeal
- Layout recommendations
- Suitable for Instagram, Facebook, or WhatsApp

Language: ${language}
Make it professional yet engaging for Indian small businesses.`;

    const output = await callAI(systemPrompt, userInput);

    if (userId) {
      await deductCredit(userId);
    }

    await supabaseAdmin.from("tool_usage").insert({
      user_id: userId,
      tool_name: "poster_maker",
      output: output.substring(0, 1000),
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ output });
  } catch (error) {
    console.error("Poster Maker Error:", error);
    return NextResponse.json(
      { error: "Failed to generate poster" },
      { status: 500 }
    );
  }
}
