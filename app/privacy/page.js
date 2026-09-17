export const metadata = {
  title: "Privacy Policy — Job Request Intake",
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px", lineHeight: 1.6 }}>
      <h1>Privacy Policy</h1>
      <p>
        This is an internal tool used by our company to collect and route new
        job opening requests. Information submitted through this form
        (job description, hiring manager, location, team, compensation, role
        details, and approval status) is stored in a company-controlled
        Google Sheet and shared via a Slack notification to internal staff.
      </p>
      <p>
        This tool does not share submitted data with any third party outside
        the company, and is not used to collect data from the general public.
      </p>
    </main>
  );
}
