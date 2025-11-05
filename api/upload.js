import { put } from '@vercel/blob';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ message: 'Form parsing failed' });
    }

    const file = files.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      const data = fs.readFileSync(file.filepath);
      const blob = await put(file.originalFilename, data, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      res.status(200).json({ message: 'Uploaded successfully!', url: blob.url });
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      res.status(500).json({ message: 'Upload failed', error: uploadError.message });
    }
  });
}
