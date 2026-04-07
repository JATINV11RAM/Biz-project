import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    // In production, verify JWT properly using Supabase
    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser(token);
    return user?.id || null;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const userId = await getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("credits_remaining, plan")
      .eq("id", userId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch credits" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      credits_remaining: data.credits_remaining,
      plan: data.plan,
    });
  } catch (error) {
    console.error("Get credits error:", error);
    return NextResponse.json(
      { error: "Failed to get credits" },
      { status: 500 }
    );
  }
}
