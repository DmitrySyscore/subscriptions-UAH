import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  const userId = params.userId;

  // Generate a link with a referral parameter
  const referralUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/signup?ref=${userId}`;

  return NextResponse.json({ referralUrl });
}
