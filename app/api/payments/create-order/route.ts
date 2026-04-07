import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";

async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser(token);
    return user?.id || null;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

type PlanType = "pro_monthly" | "pro_yearly";

interface CreateOrderBody {
  planType: PlanType;
}

export async function POST(request: NextRequest) {
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

    const { planType }: CreateOrderBody = await request.json();

    if (!planType) {
      return NextResponse.json(
        { error: "planType is required" },
        { status: 400 }
      );
    }

    // Define plan amounts (in paise for Razorpay)
    const planAmounts: Record<PlanType, number> = {
      pro_monthly: 29900, // ₹299 per month
      pro_yearly: 299900, // ₹2999 per year
    };

    const amount = planAmounts[planType];
    if (!amount) {
      return NextResponse.json(
        { error: "Invalid plan type" },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { error: "Payment configuration error" },
        { status: 500 }
      );
    }

    const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    // Note: In production, you'd make an actual API call to Razorpay
    // This is a simplified version - returns order ID for frontend

    // Insert order into database
    const { data, error } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        razorpay_order_id: orderId,
        amount: amount / 100, // Convert paise to rupees
        status: "created",
        created_at: new Date().toISOString(),
      })
      .select("id");

    if (error) {
      console.error("Error creating order:", error);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: orderId,
      amount: amount,
      currency: "INR",
      keyId: razorpayKeyId,
      // Additional data for frontend to initialize Razorpay
      planType: planType,
      databaseId: data[0]?.id,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
