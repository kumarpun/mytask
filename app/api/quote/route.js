import { NextResponse } from "next/server";
import { getRandomQuote, getDayOfQuote } from "motivate-quotes";

// GET /api/quote?random=true
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const isRandom = searchParams.get("random") === "true";

  const quote = isRandom ? getRandomQuote() : getDayOfQuote();

  return NextResponse.json({
    text: quote.text,
    author: quote.author,
  });
}
