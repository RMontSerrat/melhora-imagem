import axios from 'axios';
import Replicate from "replicate";
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
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
      "mv-lab/swin2sr:a01b0512004918ca55d02e554914a9eca63909fa83a29ff0f115c78a7045574f",
      {
        input: {
          image: base64Image,
          // scale: 2,
        },
      }
    );
    return NextResponse.json(output);
  } catch (error) {
    console.log('error', error)
    return NextResponse.json(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = process.env.REPLICATE_API_TOKEN || 'r8_FqRaWEerRQa9JVZbRdJ52Eyme3EBItQ3XUxES';
    const url = 'https://api.replicate.com/v1/predictions';

    // Realiza a requisição GET com o cabeçalho de autorização
    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    return NextResponse.json({ status: 200, results: response.data.results.length });
  } catch (error) {
    return NextResponse.json({ status: 500 });
  }
}
