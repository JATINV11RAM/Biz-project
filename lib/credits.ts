import { supabaseAdmin } from "./supabase";

const FREE_DAILY_CREDITS = 10;
// Pro users have unlimited credits

type UserPlan = "free" | "pro" | "guest";

export async function getUserPlan(
  userId: string | null
): Promise<{ plan: UserPlan; credits_remaining: number }> {
  if (!userId) {
    return { plan: "guest", credits_remaining: -1 }; // guests use IP-based rate limit
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("plan, credits_remaining")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user plan:", error);
      return { plan: "free", credits_remaining: FREE_DAILY_CREDITS };
    }

    return { plan: data.plan || "free", credits_remaining: data.credits_remaining || 0 };
  } catch (error) {
    console.error("Error in getUserPlan:", error);
    return { plan: "free", credits_remaining: 0 };
  }
}

export async function checkCredits(
  userId: string | null
): Promise<{ canUse: boolean; remaining: number }> {
  if (!userId) {
    // Guests don't have credits, they use rate limiting
    return { canUse: true, remaining: -1 };
  }

  const { plan, credits_remaining } = await getUserPlan(userId);

  if (plan === "pro") {
    return { canUse: true, remaining: Infinity };
  }

  return {
    canUse: credits_remaining > 0,
    remaining: credits_remaining,
  };
}

export async function deductCredit(userId: string | null): Promise<boolean> {
  if (!userId) {
    // Guests don't have credits to deduct
    return true;
  }

  try {
    const { plan } = await getUserPlan(userId);

    if (plan === "pro") {
      // Pro users have unlimited credits
      return true;
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("credits_remaining")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user credits:", error);
      return false;
    }

    if (data.credits_remaining <= 0) {
      return false;
    }

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ credits_remaining: data.credits_remaining - 1 })
      .eq("id", userId);

    if (updateError) {
      console.error("Error deducting credit:", updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deductCredit:", error);
    return false;
  }
}

export async function resetDailyCredits(): Promise<void> {
  // This should be run as a scheduled job (e.g., with Vercel Cron)
  try {
    const { error } = await supabaseAdmin
      .from("users")
      .update({ credits_remaining: FREE_DAILY_CREDITS })
      .eq("plan", "free");

    if (error) {
      console.error("Error resetting daily credits:", error);
    }
  } catch (error) {
    console.error("Error in resetDailyCredits:", error);
  }
}
