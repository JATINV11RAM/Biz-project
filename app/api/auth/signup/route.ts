import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 400 }
      );
    }

    // Create user record in users table
    const { error: dbError } = await supabaseAdmin
      .from("users")
      .insert({
        id: data.user.id,
        email: email,
        plan: "free",
        credits_remaining: 10,
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error("Error creating user record:", dbError);
      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Signup successful. Please check your email to confirm.",
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to sign up" },
      { status: 500 }
    );
  }
}
