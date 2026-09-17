import { NextResponse } from "next/server";

const REQUIRED_FIELDS = [
  "jobDescription",
  "hiringManager",
  "location",
  "team",
  "compensation",
  "roleDetails",
  "uniqueSellingPoints",
  "interviewProcess",
];

export async function POST(request) {
  const data = await request.json();

  for (const field of REQUIRED_FIELDS) {
    if (!data[field] || !String(data[field]).trim()) {
      return NextResponse.json(
        { success: false, error: `Missing required field: ${field}` },
        { status: 400 }
      );
    }
  }

  if (!data.orgLeaderApproval || !data.maxNardiApproval) {
    return NextResponse.json(
      { success: false, error: "Both approval checkboxes are required." },
      { status: 400 }
    );
  }

  const sheetsUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const sheetsSecret = process.env.GOOGLE_SHEETS_SECRET;
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

  const sheetsRes = await fetch(sheetsUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: sheetsSecret, ...data }),
  });
  const sheetsResult = await sheetsRes.json();

  if (!sheetsRes.ok || sheetsResult.error) {
    return NextResponse.json(
      { success: false, error: "Could not save the submission. Please try again." },
      { status: 502 }
    );
  }

  await fetch(slackWebhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: [
        ":tada: *New role approved to open!*",
        `*Team:* ${data.team}`,
        `*Location:* ${data.location}`,
        `*Hiring Manager:* ${data.hiringManager}`,
        `*Compensation:* ${data.compensation}`,
        "Both org leader and Max Nardi approvals are confirmed. Full details are saved in the Job Requests sheet.",
      ].join("\n"),
    }),
  });

  return NextResponse.json({ success: true });
}
