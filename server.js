// Server entry point wrapper for cloud hosting platforms (cPanel, Cloud Run, Vercel, Render, etc.)
// Runs the bundled production server
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
require('./dist/server.cjs');
