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

    // System prompt for GST Helper
    const systemPrompt = `You are BizSaathi AI, a smart business assistant for Indian small business owners. You provide GST (Goods and Services Tax) guidance for Indian businesses.

Your task: Based on the user's question, provide:
- Clear GST implications and rules
- Applicable GST rates for their business category
- Compliance checklist
- Filing deadlines and requirements
- Common mistakes to avoid
- Links to relevant sections of GST law (where applicable)

Language: ${language}
Be accurate but keep explanations simple for small business owners without tax background.
Note: This is informational only, not a substitute for professional tax advice.`;

    const output = await callAI(systemPrompt, userInput);

    if (userId) {
      await deductCredit(userId);
    }

    await supabaseAdmin.from("tool_usage").insert({
      user_id: userId,
      tool_name: "gst_helper",
      output: output.substring(0, 1000),
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ output });
  } catch (error) {
    console.error("GST Helper Error:", error);
    return NextResponse.json(
      { error: "Failed to generate GST guidance" },
      { status: 500 }
    );
  }
}
