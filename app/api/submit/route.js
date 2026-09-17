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

async function getAccessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error("Failed to refresh Google access token: " + JSON.stringify(data));
  }
  return data.access_token;
}

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

  try {
    const accessToken = await getAccessToken();
    const sheetId = process.env.GOOGLE_SHEET_ID;

    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A1:append?valueInputOption=RAW`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [
            [
              new Date().toISOString(),
              data.jobDescription,
              data.hiringManager,
              data.location,
              data.team,
              data.compensation,
              data.roleDetails,
              data.uniqueSellingPoints,
              data.interviewProcess,
              data.orgLeaderApproval,
              data.maxNardiApproval,
            ],
          ],
        }),
      }
    );

    if (!appendRes.ok) {
      const errBody = await appendRes.text();
      throw new Error("Sheets API append failed: " + errBody);
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Could not save the submission. Please try again." },
      { status: 502 }
    );
  }

  await fetch(process.env.SLACK_WEBHOOK_URL, {
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
