// src/app/api/audit/route.ts

import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const PRIMARY_MODEL = "openai/gpt-oss-20b";
const FALLBACK_MODEL = "openai/gpt-oss-120b";

export const maxDuration = 60;

export interface ScoreSet {
  performance: number;
  accessibility: number;
  seo: number;
}

export interface PlainEnglishIssue {
  technicalTitle: string;
  plainEnglishExplanation: string;
  impact: "High" | "Medium" | "Low";
  howToFix: string;
}

export interface AuditResponse {
  scores: ScoreSet;
  executiveSummary: string;
  plainEnglishIssues: PlainEnglishIssue[];
  freelancerPitch: string;
  source: "live" | "sample";
  debugReason?: string;
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

const isDev = process.env.NODE_ENV !== "production";

const responseSchema = {
  type: "object",

  properties: {
    executiveSummary: {
      type: "string",
    },

    plainEnglishIssues: {
      type: "array",

      items: {
        type: "object",

        properties: {
          technicalTitle: {
            type: "string",
          },

          plainEnglishExplanation: {
            type: "string",
          },

          impact: {
            type: "string",
            enum: ["High", "Medium", "Low"],
          },

          howToFix: {
            type: "string",
          },
        },

        required: [
          "technicalTitle",
          "plainEnglishExplanation",
          "impact",
          "howToFix",
        ],

        additionalProperties: false,
      },
    },

    freelancerPitch: {
      type: "string",
    },
  },

  required: [
    "executiveSummary",
    "plainEnglishIssues",
    "freelancerPitch",
  ],

  additionalProperties: false,
};

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  return Promise.race([
    promise,

    new Promise<T>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `${label} timed out after ${ms / 1000}s`
            )
          ),
        ms
      )
    ),
  ]);
}

function buildSampleReport(
  targetUrl: string,
  failureReason?: unknown
): AuditResponse {
  let hostname = "this site";

  try {
    hostname = new URL(targetUrl).hostname;
  } catch {
    // Keep default hostname.
  }

  const reasonText =
    failureReason instanceof Error
      ? failureReason.message
      : String(failureReason ?? "");

  return {
    source: "sample",

    debugReason: isDev ? reasonText : undefined,

    scores: {
      performance: 68,
      accessibility: 91,
      seo: 84,
    },

    executiveSummary: `This is a sample report shown because live analysis for ${hostname} is temporarily unavailable. It illustrates the kind of findings a real audit typically surfaces. Run the audit again shortly for live results.`,

    plainEnglishIssues: [
      {
        technicalTitle:
          "Largest Contentful Paint (example)",

        plainEnglishExplanation: `A typical site like ${hostname} can lose visitors when the main content takes too long to appear, especially on mobile connections.`,

        impact: "High",

        howToFix:
          "Compress and lazy-load large images above the fold and defer non-critical scripts.",
      },

      {
        technicalTitle:
          "Missing meta description (example)",

        plainEnglishExplanation:
          "Pages without a clear meta description may have less useful search-result snippets, which can reduce clicks from search.",

        impact: "Medium",

        howToFix:
          "Add a unique, useful meta description to each important page.",
      },

      {
        technicalTitle:
          "Low color contrast (example)",

        plainEnglishExplanation:
          "Text that does not contrast enough with its background can be difficult for some visitors to read.",

        impact: "Medium",

        howToFix:
          "Adjust text and background colors to meet recommended accessibility contrast ratios.",
      },
    ],

    freelancerPitch: `Hi, I'm Tuba. I ran a quick website audit and found a few areas that could be improved across performance, accessibility, and SEO. I'd be happy to share the findings and discuss practical fixes for the site.`,
  };
}

export async function POST(req: NextRequest) {
  let targetUrl = "";

  try {
    const body = await req.json().catch(() => null);

    targetUrl = body?.targetUrl;

    if (!targetUrl || typeof targetUrl !== "string") {
      return NextResponse.json(
        {
          error:
            "Missing 'targetUrl' in request body.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !targetUrl.startsWith("http://") &&
      !targetUrl.startsWith("https://")
    ) {
      return NextResponse.json(
        {
          error:
            "targetUrl must start with http:// or https://",
        },
        {
          status: 400,
        }
      );
    }

    try {
      new URL(targetUrl);
    } catch {
      return NextResponse.json(
        {
          error:
            "targetUrl is not a valid URL.",
        },
        {
          status: 400,
        }
      );
    }
  } catch {
    return NextResponse.json(
      {
        error: "Couldn't read the request.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    // -----------------------------------------
    // STEP 1: Get real PageSpeed data
    // -----------------------------------------

    const scores =
      await fetchPageSpeedScores(targetUrl);

    // -----------------------------------------
    // STEP 2: Translate results with Groq
    // -----------------------------------------

    const aiPart =
      await generateWithGroq(
        scores.scores,
        scores.failedAudits
      );

    const finalResponse: AuditResponse = {
      source: "live",

      scores: scores.scores,

      executiveSummary:
        aiPart.executiveSummary ?? "",

      plainEnglishIssues:
        aiPart.plainEnglishIssues ?? [],

      freelancerPitch:
        aiPart.freelancerPitch ?? "",
    };

    return NextResponse.json(
      finalResponse,
      {
        status: 200,
      }
    );
  } catch (err) {
    console.warn(
      "Live audit pipeline failed, falling back to sample report:",
      err
    );

    const sample =
      buildSampleReport(
        targetUrl,
        err
      );

    return NextResponse.json(
      sample,
      {
        status: 200,
      }
    );
  }
}

async function fetchPageSpeedScores(
  targetUrl: string
) {
  if (!process.env.PAGESPEED_API_KEY) {
    throw new Error(
      "Missing PAGESPEED_API_KEY"
    );
  }

  const psiUrl =
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      targetUrl
    )}` +
    `&category=PERFORMANCE` +
    `&category=ACCESSIBILITY` +
    `&category=SEO` +
    `&key=${process.env.PAGESPEED_API_KEY}`;

  const controller =
    new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    30000
  );

  try {
    const res = await fetch(
      psiUrl,
      {
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!res.ok) {
      const body =
        await res.json().catch(
          () => null
        );

      throw new Error(
        body?.error?.message ??
          `PageSpeed request failed (${res.status})`
      );
    }

    const data =
      await res.json();

    const categories =
      data?.lighthouseResult
        ?.categories;

    const audits =
      data?.lighthouseResult
        ?.audits;

    if (!categories || !audits) {
      throw new Error(
        "Unexpected PageSpeed response shape"
      );
    }

    const scoreSet: ScoreSet = {
      performance: Math.round(
        (categories.performance
          ?.score ?? 0) * 100
      ),

      accessibility: Math.round(
        (categories.accessibility
          ?.score ?? 0) * 100
      ),

      seo: Math.round(
        (categories.seo
          ?.score ?? 0) * 100
      ),
    };

    const failedAudits =
      Object.values(audits)
        .filter(
          (a: any) =>
            typeof a.score ===
              "number" &&
            a.score < 0.9
        )
        .sort(
          (a: any, b: any) =>
            a.score - b.score
        )
        .slice(0, 8)
        .map(
          (a: any) => ({
            title: a.title,

            description:
              a.description
                ?.replace(
                  /\[.*?\]\(.*?\)/g,
                  ""
                )
                .trim() ?? "",
          })
        );

    return {
      scores: scoreSet,
      failedAudits,
    };
  } catch (err: any) {
    clearTimeout(timeout);

    if (
      err?.name ===
      "AbortError"
    ) {
      throw new Error(
        "PageSpeed Insights timed out after 30s — this site may be too slow or heavy to audit within the time limit."
      );
    }

    throw err;
  }
}

async function generateWithGroq(
  scores: ScoreSet,
  failedAudits: {
    title: string;
    description: string;
  }[]
) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "Missing GROQ_API_KEY"
    );
  }

  const systemPrompt = `
You are a senior website consultant working for Tuba, a freelance WordPress and SEO specialist.

You analyze real Google PageSpeed/Lighthouse results and explain them to a non-technical small business owner.

IMPORTANT:

The numerical scores provided by the application are authoritative.

Never contradict the scores.

Use exactly these score interpretations:

90–100 = Good
50–89 = Needs Work
0–49 = Poor

For example:

Performance 85 = Needs Work.
Accessibility 43 = Poor.
SEO 91 = Good.

Do not say that a category is performing well if its score is below 90.

Do not say that a category is low if its score is 90 or above.

The executive summary MUST accurately describe the strongest and weakest areas based on the actual numerical scores.

When discussing problems, prioritize the most meaningful issues from the supplied Lighthouse findings.

Do not invent problems that are not supported by the supplied data.

Do not exaggerate business impact.

Use simple language that a small business owner can understand.

The freelancer behind this audit is Tuba.

The freelancer pitch should naturally mention Tuba by name.

Do not use markdown.
Do not add commentary outside the JSON.
Return only valid JSON matching the supplied schema.
`;

  const userPrompt = `
Here are the REAL website audit scores:

${JSON.stringify(
  scores,
  null,
  2
)}

Use these exact scores when writing the report.

Here are the REAL top failing Lighthouse checks:

${JSON.stringify(
  failedAudits,
  null,
  2
)}

Create the following:

1. executiveSummary

Write 2 concise sentences.

Sentence 1 should summarize the overall condition of the website based on the actual scores.

Sentence 2 should identify the most important area that needs attention and explain why in business-friendly language.

The summary MUST match the numerical scores.

2. plainEnglishIssues

For each important failing check, provide:

technicalTitle
plainEnglishExplanation
impact
howToFix

Use:

High = significant issue that should receive priority.
Medium = worthwhile improvement.
Low = smaller improvement.

Do not automatically mark something High simply because it sounds technical.

3. freelancerPitch

Write 2 concise sentences.

The pitch is written by Tuba to the website owner.

Naturally mention Tuba by name.

The pitch should offer help with the actual issues found in this audit.

Do not claim that Tuba has already fixed anything.

Do not promise guaranteed rankings, traffic, sales, or conversions.

Keep the pitch professional and realistic.
`;

  const PER_CALL_TIMEOUT_MS =
    12000;

  async function tryModel(
    model: string
  ) {
    const completion =
      await withTimeout(
        groq.chat.completions.create(
          {
            model,

            messages: [
              {
                role: "system",
                content:
                  systemPrompt,
              },

              {
                role: "user",
                content:
                  userPrompt,
              },
            ],

            response_format: {
              type: "json_schema",

              json_schema: {
                name:
                  "audit_report",

                strict: true,

                schema:
                  responseSchema,
              },
            },
          }
        ),
        PER_CALL_TIMEOUT_MS,
        `Groq (${model})`
      );

    const content =
      completion
        .choices?.[0]
        ?.message?.content;

    if (!content) {
      throw new Error(
        `Empty response from ${model}`
      );
    }

    return JSON.parse(
      content
    );
  }

  try {
    return await tryModel(
      PRIMARY_MODEL
    );
  } catch (primaryErr) {
    console.warn(
      `Primary model ${PRIMARY_MODEL} failed, trying fallback:`,
      primaryErr
    );

    return await tryModel(
      FALLBACK_MODEL
    );
  }
}