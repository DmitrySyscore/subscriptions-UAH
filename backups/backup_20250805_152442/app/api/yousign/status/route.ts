import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const requestId = searchParams.get('signatureRequestId');

  if (!requestId) {
    return new Response(JSON.stringify({ error: 'Missing signatureRequestId' }), { status: 400 });
  }

  const apiKey = process.env.YOUSIGN_API_KEY!;

  try {
    const res = await fetch(`https://api-sandbox.yousign.app/v3/signature_requests/${requestId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ error: 'Failed to fetch status', details: errText }), { status: 500 });
    }

    const data = await res.json();
    return new Response(JSON.stringify({ status: data.status }), 
    {
      status: 200,
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
