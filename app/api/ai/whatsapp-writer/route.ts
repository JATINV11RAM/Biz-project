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

    // Get client IP for rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    // Get userId from auth header if available
    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      // In production, verify JWT properly
      userId = authHeader.substring(7);
    }

    // Check rate limit for guests
    if (!userId) {
      const withinRateLimit = await checkRateLimit(ip);
      if (!withinRateLimit) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Maximum 3 requests per day." },
          { status: 429 }
        );
      }
    } else {
      // Check credits for authenticated users
      const { canUse } = await checkCredits(userId);
      if (!canUse) {
        return NextResponse.json(
          { error: "Insufficient credits. Please upgrade to Pro plan." },
          { status: 402 }
        );
      }
    }

    // System prompt for WhatsApp Writer
    const systemPrompt = `You are BizSaathi AI, a smart business assistant for Indian small business owners. Your role is to help create compelling WhatsApp messages for business owners.

Your task: Generate professional yet friendly WhatsApp messages that are:
- Concise and engaging
- Suitable for business communication
- In ${language} language
- Include relevant emojis when appropriate
- Call-to-action oriented

Always provide the message ready to copy-paste.`;

    const output = await callAI(systemPrompt, userInput);

    // Deduct credit if user is authenticated
    if (userId) {
      await deductCredit(userId);
    }

    // Log usage
    await supabaseAdmin.from("tool_usage").insert({
      user_id: userId,
      tool_name: "whatsapp_writer",
      output: output.substring(0, 1000), // Store first 1000 chars
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ output });
  } catch (error) {
    console.error("WhatsApp Writer Error:", error);
    return NextResponse.json(
      { error: "Failed to generate WhatsApp message" },
      { status: 500 }
    );
  }
}
