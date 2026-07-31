// Server entry point wrapper for cloud hosting platforms (cPanel, Cloud Run, Vercel, Render, etc.)
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
require('./dist/server.cjs');

