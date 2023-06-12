import Replicate from "replicate";
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const res = await req.formData();
  const imageBlob = res.get('image') as Blob;
  if (!imageBlob) return;
  // Converte o Blob em Buffer
  const imageBuffer = await imageBlob.arrayBuffer();

  // Converte o Buffer em uma string base64
  const base64Image = `data:image/jpeg;base64,${Buffer.from(imageBuffer).toString('base64')}`;
  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN || 'r8_FqRaWEerRQa9JVZbRdJ52Eyme3EBItQ3XUxES',
    });
    
    const output = await replicate.run(
      "cjwbw/real-esrgan:d0ee3d708c9b911f122a4ad90046c5d26a0293b99476d697f6bb7f2e251ce2d4",
      {
        input: {
          image: base64Image,
          upscale: 2,
        },
      }
    );
    return NextResponse.json(output);
  } catch (error) {
    return NextResponse.json(error);
  }
}
