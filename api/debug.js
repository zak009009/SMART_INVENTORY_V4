// Vercel serverless function for debugging
export default function handler(req, res) {
  const mongoUri = process.env.MONGO_URI;
  
  res.status(200).json({
    status: 'debug',
    hasMongoUri: !!mongoUri,
    mongoUriLength: mongoUri ? mongoUri.length : 0,
    mongoUriStart: mongoUri ? mongoUri.substring(0, 20) + '...' : 'NOT_SET',
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.includes('MONGO') || key.includes('JWT') || key.includes('NODE')
    )
  });
}
