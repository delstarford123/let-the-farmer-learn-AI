// /api/list.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    res.status(500).json({ error: 'Blob token not configured' });
    return;
  }

  try {
    // List blobs with prefix notes/
    const resp = await fetch('https://api.vercel.com/v2/blobs?prefix=notes/', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await resp.json();
    if (!resp.ok) {
      console.error('Vercel list error', data);
      res.status(resp.status).json({ error: data });
      return;
    }

    // return array of blobs
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'List failed', details: String(err) });
  }
}
