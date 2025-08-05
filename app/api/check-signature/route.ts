
import fetch from 'node-fetch';

export async function GET(req: Request) {
  const apiKey = process.env.YOUSIGN_API_KEY!;
  const { searchParams } = new URL(req.url);
  const requestId = searchParams.get('requestId');

  if (!requestId) {
    return new Response(JSON.stringify({ error: 'Missing requestId' }), { status: 400 });
  }

  const res = await fetch(`https://api-sandbox.yousign.app/v3/signature_requests/${requestId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.text();
    return new Response(JSON.stringify({ error: 'Failed to check status', details: err }), { status: 500 });
  }

  const data = await res.json();

  const isSigned = data['status'] === 'done'; // Status: 'done' = document signed
  console.log('isSigned', isSigned);

  return new Response(JSON.stringify({ signed: isSigned }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
