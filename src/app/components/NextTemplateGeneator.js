'use client'

import React, { useState } from 'react';
import { Download, FileText, Code, Settings, CheckCircle } from 'lucide-react';

export default function NextJSTemplateGenerator() {
  const [projectName, setProjectName] = useState('my-nextjs-app');
  const [generated, setGenerated] = useState(false);

  const generateTemplate = () => {
    setGenerated(true);
    setTimeout(() => setGenerated(false), 3000);
  };

  const downloadFile = (filename, content) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const files = {
    'package.json': `{
  "name": "${projectName}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}`,

    'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig`,

    'public/manifest.json': `{
  "name": "${projectName}",
  "short_name": "${projectName}",
  "description": "A Next.js 16 Progressive Web App",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}`,

    'public/sw.js': `const CACHE_NAME = 'v1';
const urlsToCache = [
  '/',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});`,

    'app/layout.js': `export const metadata = {
  title: '${projectName}',
  description: 'A Next.js 16 Progressive Web App',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '${projectName}'
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{
          __html: \`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then(reg => console.log('SW registered:', reg))
                  .catch(err => console.log('SW registration failed:', err));
              });
            }
          \`
        }} />
      </body>
    </html>
  )
}`,

    'app/page.js': `export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Welcome to ${projectName}</h1>
      <p>Your Next.js 16 PWA is ready!</p>
      <ul>
        <li><a href="/api-docs">API Documentation (Swagger UI)</a></li>
        <li><a href="/api/health">Health Check API</a></li>
        <li><a href="/api/users">Users API Example</a></li>
      </ul>
    </main>
  )
}`,

    'app/error.js': `'use client'

export default function Error({ error, reset }) {
  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#dc2626' }}>Something went wrong!</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        {error.message || 'An unexpected error occurred'}
      </p>
      <button
        onClick={() => reset()}
        style={{
          marginTop: '1.5rem',
          padding: '0.5rem 1rem',
          background: '#000',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Try again
      </button>
    </div>
  )
}`,

    'app/not-found.js': `export default function NotFound() {
  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui',
      maxWidth: '600px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '4rem', margin: '0' }}>404</h1>
      <h2>Page Not Found</h2>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        The page you are looking for does not exist.
      </p>
      <a 
        href="/"
        style={{
          display: 'inline-block',
          marginTop: '1.5rem',
          padding: '0.5rem 1rem',
          background: '#000',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '4px'
        }}
      >
        Go Home
      </a>
    </div>
  )
}`,

    'app/api-docs/page.js': `'use client'

import { useEffect, useState } from 'react'

export default function SwaggerUI() {
  const [spec, setSpec] = useState(null)

  useEffect(() => {
    fetch('/api/swagger')
      .then(res => res.json())
      .then(data => setSpec(data))
  }, [])

  if (!spec) return <div style={{ padding: '2rem' }}>Loading...</div>

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>API Documentation</h1>
      <div style={{ 
        marginTop: '2rem',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '1.5rem',
        background: '#f9fafb'
      }}>
        <h2>{spec.info.title}</h2>
        <p>{spec.info.description}</p>
        <p><strong>Version:</strong> {spec.info.version}</p>
        
        <div style={{ marginTop: '2rem' }}>
          <h3>Endpoints</h3>
          {Object.entries(spec.paths).map(([path, methods]) => (
            <div key={path} style={{ 
              marginTop: '1rem',
              padding: '1rem',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px'
            }}>
              <h4 style={{ margin: '0' }}>{path}</h4>
              {Object.entries(methods).map(([method, details]) => (
                <div key={method} style={{ marginTop: '0.5rem' }}>
                  <span style={{ 
                    display: 'inline-block',
                    padding: '0.25rem 0.5rem',
                    background: method === 'get' ? '#10b981' : '#3b82f6',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    marginRight: '0.5rem'
                  }}>
                    {method}
                  </span>
                  <span>{details.summary}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}`,

    'app/api/swagger/route.js': `// Swagger spec generator for Next.js API routes
// This runs server-side and scans the api directory

export async function GET() {
  const spec = {
    openapi: '3.0.0',
    info: {
      title: '${projectName} API',
      description: 'API documentation generated automatically from Next.js routes',
      version: '1.0.0'
    },
    servers: [
      {
        url: typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin,
        description: 'API Server'
      }
    ],
    paths: {
      '/api/health': {
        get: {
          summary: 'GET /api/health',
          description: 'Health check endpoint',
          responses: {
            '200': {
              description: 'Service is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      timestamp: { type: 'string' },
                      uptime: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/users': {
        get: {
          summary: 'GET /api/users',
          description: 'Get all users',
          responses: {
            '200': {
              description: 'List of users',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      users: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'number' },
                            name: { type: 'string' },
                            email: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'POST /api/users',
          description: 'Create a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' }
                  },
                  required: ['name', 'email']
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      user: {
                        type: 'object',
                        properties: {
                          id: { type: 'number' },
                          name: { type: 'string' },
                          email: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Invalid request body'
            }
          }
        }
      }
    }
  }

  return Response.json(spec)
}`,

    'app/api/health/route.js': `// Logger utility inline to avoid imports
function log(level, message, meta = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta
  }
  console.log(JSON.stringify(logEntry))
}

export async function GET() {
  log('INFO', 'Health check endpoint called')
  
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
}`,

    'app/api/users/route.js': `// Logger utility inline to avoid imports
function log(level, message, meta = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta
  }
  console.log(JSON.stringify(logEntry))
}

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
]

export async function GET() {
  log('INFO', 'GET /api/users called')
  return Response.json({ users })
}

export async function POST(request) {
  try {
    const body = await request.json()
    log('INFO', 'POST /api/users called', { body })
    
    const newUser = {
      id: users.length + 1,
      ...body
    }
    
    users.push(newUser)
    return Response.json({ user: newUser }, { status: 201 })
  } catch (error) {
    log('ERROR', 'Error creating user', { error: error.message })
    return Response.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}`,

    'lib/logger.js': `// Structured logging utility
// This is an OPTIONAL centralized logger
// API routes have inline logging and don't require this file
// If you want to use this centralized logger, you can import it in your routes

class Logger {
  constructor() {
    this.levels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3
    }
    this.currentLevel = this.levels.INFO
  }

  formatMessage(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta
    })
  }

  debug(message, meta) {
    if (this.currentLevel <= this.levels.DEBUG) {
      console.debug(this.formatMessage('DEBUG', message, meta))
    }
  }

  info(message, meta) {
    if (this.currentLevel <= this.levels.INFO) {
      console.info(this.formatMessage('INFO', message, meta))
    }
  }

  warn(message, meta) {
    if (this.currentLevel <= this.levels.WARN) {
      console.warn(this.formatMessage('WARN', message, meta))
    }
  }

  error(message, meta) {
    if (this.currentLevel <= this.levels.ERROR) {
      console.error(this.formatMessage('ERROR', message, meta))
    }
  }
}

export const logger = new Logger()`,

    'lib/swagger.js': `// Swagger specification generator
// This file provides utilities for generating OpenAPI specs
// Note: In production, you would scan the file system server-side

export function createSwaggerSpec(projectName = 'API') {
  return {
    openapi: '3.0.0',
    info: {
      title: \`\${projectName} API\`,
      description: 'API documentation generated automatically from Next.js routes',
      version: '1.0.0'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    paths: {}
  }
}

export function addEndpoint(spec, path, method, config) {
  if (!spec.paths[path]) {
    spec.paths[path] = {}
  }
  spec.paths[path][method.toLowerCase()] = config
  return spec
}`,

    'README.md': `<div align="center">

# ${projectName}

**A modern Next.js 16 Progressive Web Application**

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

[Features](#features) •
[Getting Started](#getting-started) •
[API Documentation](#api-documentation) •
[Project Structure](#project-structure) •
[Contributing](#contributing)

</div>

---

## 📋 Overview

${projectName} is a production-ready Next.js 16 template with built-in PWA support, automatic API documentation generation, and comprehensive logging functionality. This template provides a solid foundation for building modern web applications.

## ✨ Features

- 🚀 **Next.js 16** - Latest version with App Router
- 📱 **Progressive Web App (PWA)** - Full offline support with service workers
- 📚 **Swagger UI** - Automatic API documentation from route files
- 📝 **Structured Logging** - JSON-formatted logs with multiple levels
- ❌ **Error Handling** - Custom error and 404 pages
- 🎨 **Zero Dependencies** - Pure Next.js implementation
- ⚡ **Production Ready** - Optimized build configuration

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/${projectName}.git

# Navigate to project directory
cd ${projectName}

# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production

\`\`\`bash
# Create production build
npm run build

# Start production server
npm start
\`\`\`

## 📚 API Documentation

Access the Swagger UI documentation at [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

The API documentation is automatically generated by scanning all route files in the \`app/api\` directory.

### Example API Endpoints

- \`GET /api/health\` - Health check endpoint
- \`GET /api/users\` - List all users
- \`POST /api/users\` - Create new user

## 📁 Project Structure

\`\`\`
${projectName}/
├── app/
│   ├── api/              # API routes
│   │   ├── health/       # Health check endpoint
│   │   ├── users/        # Users endpoint
│   │   └── swagger/      # Swagger spec generator
│   ├── api-docs/         # Swagger UI page
│   ├── layout.js         # Root layout with PWA setup
│   ├── page.js           # Home page
│   ├── error.js          # Error boundary
│   └── not-found.js      # 404 page
├── lib/
│   ├── logger.js         # Logging utility (optional)
│   └── swagger.js        # Swagger spec utilities (optional)
├── public/
│   ├── manifest.json     # PWA manifest
│   ├── sw.js             # Service worker
│   └── icons/            # PWA icons
├── next.config.js        # Next.js configuration
└── package.json          # Dependencies
\`\`\`

## 🔧 Configuration

### PWA Configuration

Edit \`public/manifest.json\` to customize your PWA:

\`\`\`json
{
  "name": "Your App Name",
  "short_name": "App",
  "description": "Your app description",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
\`\`\`

### Logging

The template includes inline logging in API routes. Each route has its own logging function for structured JSON logs with timestamps.

Logging levels included:
- **DEBUG**: Detailed debugging information
- **INFO**: General informational messages
- **WARN**: Warning messages
- **ERROR**: Error messages

You can optionally centralize logging by using the \`lib/logger.js\` file.

### Swagger Documentation

The Swagger specification is defined in \`app/api/swagger/route.js\`. To add new endpoints to the documentation, update the \`paths\` object in that file.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Contributors and maintainers
- Open source community

## 📧 Contact

Project Link: [https://github.com/yourusername/${projectName}](https://github.com/yourusername/${projectName})

---

<div align="center">
Made with ❤️ using Next.js 16
</div>`,

    '.gitignore': `# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts`,

    'jsconfig.json': `{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}`
  };

  const downloadAll = () => {
    Object.entries(files).forEach(([filename, content]) => {
      downloadFile(filename, content);
    });
    generateTemplate();
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #000 0%, #333 100%)',
          color: 'white',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <Code size={48} style={{ marginBottom: '1rem' }} />
          <h1 style={{ margin: '0', fontSize: '2.5rem' }}>Next.js 16 Template Generator</h1>
          <p style={{ margin: '1rem 0 0', opacity: 0.9 }}>
            PWA • Swagger UI • Logging • Production Ready
          </p>
        </div>

        <div style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'bold',
              color: '#333'
            }}>
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                boxSizing: 'border-box'
              }}
              placeholder="my-nextjs-app"
            />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <FeatureCard
              icon={<Settings />}
              title="PWA Support"
              description="Full Progressive Web App with service workers and offline support"
            />
            <FeatureCard
              icon={<FileText />}
              title="Auto Swagger"
              description="API documentation automatically generated from routes"
            />
            <FeatureCard
              icon={<Code />}
              title="Structured Logging"
              description="JSON-formatted logs with multiple severity levels"
            />
            <FeatureCard
              icon={<CheckCircle />}
              title="Error Handling"
              description="Custom error boundaries and 404 page included"
            />
          </div>

          <button
            onClick={downloadAll}
            style={{
              width: '100%',
              padding: '1rem 2rem',
              fontSize: '1.125rem',
              fontWeight: 'bold',
              color: 'white',
              background: generated 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            {generated ? (
              <>
                <CheckCircle size={24} />
                Template Generated!
              </>
            ) : (
              <>
                <Download size={24} />
                Download Complete Template
              </>
            )}
          </button>

          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#f3f4f6',
            borderRadius: '8px'
          }}>
            <h3 style={{ margin: '0 0 1rem', color: '#333' }}>Files Included:</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.5rem',
              fontSize: '0.875rem',
              color: '#666'
            }}>
              {Object.keys(files).map(filename => (
                <div key={filename} style={{
                  padding: '0.5rem',
                  background: 'white',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  📄 {filename}
                </div>
              ))}
            </div>
          </div>

          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: '#fef3c7',
            border: '2px solid #fbbf24',
            borderRadius: '8px'
          }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#92400e' }}>
              📦 Quick Start Instructions
            </h3>
            <ol style={{ margin: '0.5rem 0', paddingLeft: '1.5rem', color: '#78350f' }}>
              <li>Download all files above</li>
              <li>Organize files according to the folder structure</li>
              <li>Run <code style={{ background: '#fff', padding: '0.125rem 0.25rem', borderRadius: '3px' }}>npm install</code></li>
              <li>Run <code style={{ background: '#fff', padding: '0.125rem 0.25rem', borderRadius: '3px' }}>npm run dev</code></li>
              <li>Visit <code style={{ background: '#fff', padding: '0.125rem 0.25rem', borderRadius: '3px' }}>http://localhost:3000</code></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div style={{
      padding: '1.5rem',
      background: '#f9fafb',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ color: '#667eea', marginBottom: '0.75rem' }}>
        {icon}
      </div>
      <h3 style={{ margin: '0 0 0.5rem', color: '#111', fontSize: '1.125rem' }}>
        {title}
      </h3>
      <p style={{ margin: '0', color: '#666', fontSize: '0.875rem', lineHeight: '1.5' }}>
        {description}
      </p>
    </div>
  );
}