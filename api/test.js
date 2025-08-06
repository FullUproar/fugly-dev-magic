export default function handler(req, res) {
  return res.status(200).json({ 
    message: 'Plain JS endpoint working',
    timestamp: new Date().toISOString()
  });
}