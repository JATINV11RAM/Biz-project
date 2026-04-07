import { NextRequest, NextResponse } from "next/server";
import { resetDailyCredits } from "@/lib/credits";

// This endpoint is meant to be called by a scheduled cron job (e.g., Vercel Cron)
// Configure in vercel.json with:
// {
//   "crons": [{
//     "path": "/api/cron/reset-credits",
//     "schedule": "0 0 * * *"
//   }]
// }

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await resetDailyCredits();

    return NextResponse.json({
      success: true,
      message: "Daily credits reset successfully",
    });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json(
      { error: "Failed to reset credits" },
      { status: 500 }
    );
  }
}
