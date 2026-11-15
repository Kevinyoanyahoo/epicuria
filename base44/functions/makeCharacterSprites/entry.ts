import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import OpenAI from 'npm:openai@6.45.0';

const REF = 'https://media.base44.com/images/public/6af8f74f0cdae61f0ade2dc8/cf7469444_generated_f901f7f5.jpg';

const STYLE = 'Stylized 3D-painted game character illustration, same art style and rendering as the reference image, warm cream, brown and forest-green palette, soft studio lighting, clean shapes, semi-realistic cartoon proportions. Full body from head to feet, standing, facing the viewer, arms relaxed along the body, centered in frame, no ground, no cast shadow, no props, no text, isolated cut-out on a fully transparent background.';

const CHARACTERS = [
  'A young African woman with deep brown skin, short natural curls, wearing a forest-green blazer over a cream top and brown trousers.',
  'A young African man with dark brown skin, round glasses and a short beard, wearing a cream shirt, a rust-brown vest and dark navy trousers.',
  'An African woman with medium brown skin and a patterned wax-print headwrap, wearing a terracotta top and a long green skirt.',
  'An African man with very dark skin and short hair, wearing an emerald green dashiki-style shirt and beige chino trousers.',
  'An African woman with light brown skin and a neat hair bun, wearing a beige cardigan over an olive blouse and dark trousers.',
  'An African man with medium brown skin and short curly hair, wearing a cream polo shirt and brown trousers with a green belt.',
];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const only = Array.isArray(body.indexes)
      ? body.indexes.filter((i: number) => Number.isInteger(i) && i >= 0 && i < CHARACTERS.length)
      : Number.isInteger(body.index)
        ? [body.index]
        : CHARACTERS.map((_, i) => i);

    const { baseURL, token, headers } = base44.asServiceRole.aiGateway.connection();
    const client = new OpenAI({ baseURL, apiKey: token, defaultHeaders: headers, maxRetries: 0 });

    const urls: string[] = [];
    for (const i of only) {
      const { data } = await client.images.generate({
        model: 'gpt_image_2_5_sunburst',
        prompt: `${CHARACTERS[i]} ${STYLE}`,
        n: 1,
        response_format: 'url',
        aspect_ratio: '2:3',
        resolution: '1K',
        quality: 'medium',
        output_format: 'png',
        background: 'transparent',
        reference_image_urls: [REF],
      });
      urls.push(data[0].url);
    }
    return Response.json({ urls });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}