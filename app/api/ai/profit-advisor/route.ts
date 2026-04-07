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

    // System prompt for Profit Advisor
    const systemPrompt = `You are BizSaathi AI, a smart business assistant for Indian small business owners. You provide practical profit optimization advice tailored to Indian business context.

Your task: Analyze the user's business situation and provide:
- 3-5 actionable recommendations to increase profit
- Cost-saving strategies specific to Indian businesses
- Revenue optimization ideas
- Implementation timeline
- Realistic impact estimates

Consider GST compliance, local market dynamics, and common challenges faced by Indian SMEs.
Language: ${language}
Be practical and specific with your advice.`;

    const output = await callAI(systemPrompt, userInput);

    if (userId) {
      await deductCredit(userId);
    }

    await supabaseAdmin.from("tool_usage").insert({
      user_id: userId,
      tool_name: "profit_advisor",
      output: output.substring(0, 1000),
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ output });
  } catch (error) {
    console.error("Profit Advisor Error:", error);
    return NextResponse.json(
      { error: "Failed to generate profit advice" },
      { status: 500 }
    );
  }
}
