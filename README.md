# SiteLingo AI

### Plain-English Website Audit Tool

**Live Demo:** https://site-lingo-ai.vercel.app/

SiteLingo AI is an AI-powered website auditing tool that transforms complex Google PageSpeed Insights and Lighthouse data into clear, plain-English recommendations.

It is designed to help website owners, freelancers, WordPress developers, and SEO specialists understand technical website issues and turn them into practical improvement opportunities.

---

## Live Demo

Try SiteLingo AI here:

**https://site-lingo-ai.vercel.app/**

Enter a public website URL and generate an audit covering:

- Performance
- Accessibility
- SEO
- Lighthouse audit findings
- Plain-English explanations
- Prioritized recommendations
- Freelancer-ready client pitch

---

## Overview

Website performance reports often contain technical terms and audit results that can be difficult for non-technical website owners to understand.

SiteLingo AI simplifies this information by analyzing a website's:

- Performance
- Accessibility
- SEO
- Lighthouse audit findings

The application then uses AI to translate these technical findings into easy-to-understand explanations, prioritized fixes, and a freelancer-ready client pitch.

---

## Key Features

### Website URL Audit

Enter a public website URL to generate an automated website audit.

### Performance Analysis

Retrieves the Google PageSpeed performance score and identifies important performance-related Lighthouse findings.

### Accessibility Analysis

Analyzes accessibility issues such as:

- Missing image alternative text
- Poor color contrast
- Missing document landmarks
- Missing iframe titles
- Other Lighthouse accessibility findings

### SEO Analysis

Retrieves the website's Lighthouse SEO score and identifies relevant technical SEO findings.

### Plain-English AI Explanations

Technical Lighthouse findings are converted into explanations that a non-technical website owner can easily understand.

### Prioritized Recommendations

Each issue includes:

- Technical issue title
- Plain-English explanation
- Impact level
- Recommended solution

### Freelancer Client Pitch

SiteLingo AI generates a concise client-facing pitch that helps freelancers explain the identified website problems and offer appropriate website improvement services.

---

## Example Audit

A website may receive results such as:

| Category | Score | Status |
|----------|------:|--------|
| Performance | 85 | Needs Work |
| Accessibility | 43 | Poor |
| SEO | 91 | Good |

The application then explains the technical findings and provides actionable recommendations.

---

## How It Works

1. The user enters a public website URL.
2. SiteLingo AI sends the URL to Google PageSpeed Insights.
3. PageSpeed Insights analyzes the website using Lighthouse.
4. Performance, accessibility, and SEO scores are retrieved.
5. Relevant Lighthouse audit findings are collected.
6. Groq AI translates the technical findings into plain English.
7. The application generates a business summary and prioritized recommendations.
8. A freelancer-ready client pitch is generated.
9. The results are displayed through an easy-to-understand audit dashboard.

---

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React

### Backend

- Next.js API Routes
- Google PageSpeed Insights API
- Lighthouse
- Groq API

### Development Tools

- Visual Studio Code
- Git
- GitHub
- npm
- Vercel

---

## Project Structure

```text
SiteLingo-AI/
│
├── public/
│
├── src/
│   └── app/
│       ├── api/
│       │   └── audit/
│       │       └── route.ts
│       │
│       ├── layout.tsx
│       ├── page.tsx
│       └── globals.css
│
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── ...
Environment Variables

SiteLingo AI requires API keys for Google PageSpeed Insights and Groq.

Create a .env.local file in the project root:

GROQ_API_KEY=your_groq_api_key
PAGESPEED_API_KEY=your_pagespeed_api_key
Security

Never commit .env.local to GitHub.

API keys should remain private and should only be accessed through server-side environment variables.

The project uses .gitignore to prevent .env.local from being uploaded.

Installation
1. Clone the repository
git clone https://github.com/tubaarif-dev/SiteLingo-AI.git
2. Enter the project directory
cd SiteLingo-AI
3. Install dependencies
npm install
4. Create the environment file

Create:

.env.local

Add:

GROQ_API_KEY=your_groq_api_key
PAGESPEED_API_KEY=your_pagespeed_api_key
5. Start the development server
npm run dev

Open the application at:

http://localhost:3000
Deployment

SiteLingo AI is deployed using Vercel.

Live Application

https://site-lingo-ai.vercel.app/

The production deployment requires the following environment variables to be configured in Vercel:

GROQ_API_KEY
PAGESPEED_API_KEY
Security Considerations

The project uses server-side API routes to communicate with external APIs.

Private API keys should never be placed directly inside frontend files.

Do not:

Commit .env.local
Expose API keys in page.tsx
Use NEXT_PUBLIC_ for private API keys
Share API keys publicly
Future Improvements

Potential future improvements include:

WordPress-specific recommendations
Detailed Core Web Vitals analysis
Technical SEO recommendations
PDF audit reports
Client report export
Audit history
Website comparison
White-label agency reports
Client management
Automated WordPress improvement suggestions
More AI model/provider options
Project Purpose

SiteLingo AI was developed as a practical project combining:

Web development
Website performance analysis
SEO
Accessibility analysis
AI-powered content interpretation
Freelancer client communication

The goal is to make technical website audit information easier to understand and turn complex Lighthouse findings into practical business recommendations.

Author

Tuba Arif

WordPress Developer & SEO Specialist

Website Development | SEO | AI-Powered Web Tools

License

This project is currently provided for educational and portfolio purposes.