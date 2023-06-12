import { NextResponse } from 'next/server'
 
export async function GET(req, { params }) {
  const { id } = params;
  const response = await fetch(
    "https://api.replicate.com/v1/predictions/" + id,
    {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json()
 
  return NextResponse.json(data)
}