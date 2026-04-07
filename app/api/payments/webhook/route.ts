import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";

interface RazorpayWebhookPayment {
  entity: string;
  id: string;
  entity_id: string;
  entity_type: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  description: string;
  amount_refunded: number;
  refund_status: string;
  captured: boolean;
  description_1: string;
  email: string;
  contact: string;
  fee: number;
  tax: number;
  error_code: string;
  error_description: string;
  error_source: string;
  error_reason: string;
  error_step: string;
  error_metadata: Record<string, unknown>;
  acquirer_data: Record<string, unknown>;
  notes: Record<string, unknown>;
  created_at: number;
}

interface RazorpayWebhookEvent {
  id: string;
  entity: string;
  event: string;
  contains: string[];
  payload: {
    payment: {
      entity: RazorpayWebhookPayment;
    };
    order?: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        amount_paid: number;
        amount_due: number;
        currency: string;
        receipt: string;
        offer_id: string;
        status: string;
        attempts: number;
        notes: Record<string, unknown>;
        created_at: number;
      };
    };
  };
  created_at: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: RazorpayWebhookEvent = await request.json();

    // Verify webhook signature
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpayKeySecret) {
      return NextResponse.json(
        { error: "Payment configuration error" },
        { status: 500 }
      );
    }

    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // Create signature hash
    const text = JSON.stringify(body);
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(text)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // Handle different webhook events
    if (
      body.event === "payment.authorized" ||
      body.event === "payment.captured"
    ) {
      const payment = body.payload.payment.entity;
      const orderId = payment.entity_id; // This is the Razorpay order ID

      if (payment.status === "captured") {
        // Update order status to completed
        const { error: orderError } = await supabaseAdmin
          .from("orders")
          .update({ status: "completed" })
          .eq("razorpay_order_id", orderId);

        if (orderError) {
          console.error("Error updating order:", orderError);
          return NextResponse.json(
            { error: "Failed to update order" },
            { status: 500 }
          );
        }

        // Get the order to find user_id
        const { data: orderData, error: fetchError } = await supabaseAdmin
          .from("orders")
          .select("user_id")
          .eq("razorpay_order_id", orderId)
          .single();

        if (fetchError || !orderData) {
          console.error("Error fetching order:", fetchError);
          return NextResponse.json(
            { error: "Order not found" },
            { status: 404 }
          );
        }

        // Update user plan to pro
        const { error: userError } = await supabaseAdmin
          .from("users")
          .update({ plan: "pro", credits_remaining: -1 }) // -1 for unlimited
          .eq("id", orderData.user_id);

        if (userError) {
          console.error("Error updating user plan:", userError);
          return NextResponse.json(
            { error: "Failed to update user plan" },
            { status: 500 }
          );
        }

        return NextResponse.json({ status: "success" });
      }
    }

    if (body.event === "payment.failed") {
      const payment = body.payload.payment.entity;
      const orderId = payment.entity_id;

      // Update order status to failed
      const { error } = await supabaseAdmin
        .from("orders")
        .update({ status: "failed" })
        .eq("razorpay_order_id", orderId);

      if (error) {
        console.error("Error updating order:", error);
      }

      return NextResponse.json({ status: "success" });
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
