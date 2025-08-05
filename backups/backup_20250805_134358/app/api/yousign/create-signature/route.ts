import { NextResponse } from 'next/server';

export async function POST() {
  const apiKey = process.env.YOUSIGN_API_KEY;
  
  const response = await fetch('https://api.yousign.app/v3/procedures', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: "Document for signing",
      description: "The user must sign before proceeding to payment.",
      start: true,
      members: [
        {
          firstname: "First name",
          lastname: "Second name",
          email: "Dmitry@syscore.io", // replace with new user's email
          phone: "+000000000000",
          fileObjects: [
            {
              file: "file_id",
              page: 1,
              position: { x: 100, y: 100 },
              mention: "Sign here",
              mention2: "Thank you",
            },
          ],
        },
      ],
    }),
  });

  const data = await response.json();

  return NextResponse.json(data);
}
