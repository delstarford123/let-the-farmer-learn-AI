// /api/upload.js
export const config = { api: { bodyParser: false } }; // we will read the raw stream

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    res.status(500).json({ error: 'Blob token not configured' });
    return;
  }

  try {
    // read incoming request body into a Buffer
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    // optional filename header from client; fallback to timestamp
    const clientFilename = req.headers['x-filename'] || `note-${Date.now()}.pdf`;

    const resp = await fetch('https://api.vercel.com/v2/blob', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': req.headers['content-type'] || 'application/pdf',
        'x-filename': `notes/${clientFilename}` // store under notes/
      },
      body: buffer
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.error('Vercel Blob error', data);
      res.status(resp.status).json({ error: data });
      return;
    }

    // data.url contains the public blob URL
    res.status(200).json({ url: data.url, meta: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed', details: String(err) });
  }
}
