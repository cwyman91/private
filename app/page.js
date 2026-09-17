"use client";

import { useState } from "react";
import styles from "./page.module.css";

const FIELDS = [
  { name: "jobDescription", label: "Job Description", multiline: true },
  { name: "hiringManager", label: "Hiring Manager", multiline: false },
  { name: "location", label: "Location", multiline: false },
  { name: "team", label: "Team", multiline: false },
  { name: "compensation", label: "Compensation", multiline: false },
  { name: "roleDetails", label: "Role Details", multiline: true },
  {
    name: "uniqueSellingPoints",
    label: "Unique Selling Points (why someone would want this role)",
    multiline: true,
  },
  { name: "interviewProcess", label: "Interview Process", multiline: true },
];

const EMPTY_FORM = FIELDS.reduce((acc, field) => {
  acc[field.name] = "";
  return acc;
}, {});

export default function Home() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [orgLeaderApproval, setOrgLeaderApproval] = useState(false);
  const [maxNardiApproval, setMaxNardiApproval] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = orgLeaderApproval && maxNardiApproval && !submitting;

  function handleFieldChange(name, value) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          orgLeaderApproval,
          maxNardiApproval,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setFormData(EMPTY_FORM);
    setOrgLeaderApproval(false);
    setMaxNardiApproval(false);
    setSubmitted(false);
    setError(null);
  }

  if (submitted) {
    return (
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>Request submitted</h1>
          <p className={styles.confirmation}>
            Your job request has been saved and the team has been notified in
            Slack. This role is now approved to open.
          </p>
          <button className={styles.button} onClick={handleReset}>
            Submit another request
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.title}>Job Request Intake</h1>
        <p className={styles.subtitle}>
          Fill out this form to request approval to open a new role.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {FIELDS.map((field) => (
            <div className={styles.fieldGroup} key={field.name}>
              <label className={styles.label} htmlFor={field.name}>
                {field.label}
              </label>
              {field.multiline ? (
                <textarea
                  id={field.name}
                  className={styles.textarea}
                  required
                  rows={4}
                  value={formData[field.name]}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                />
              ) : (
                <input
                  id={field.name}
                  className={styles.input}
                  type="text"
                  required
                  value={formData[field.name]}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                />
              )}
            </div>
          ))}

          <div className={styles.approvals}>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={orgLeaderApproval}
                onChange={(e) => setOrgLeaderApproval(e.target.checked)}
              />
              Org leader approval
            </label>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={maxNardiApproval}
                onChange={(e) => setMaxNardiApproval(e.target.checked)}
              />
              Max Nardi approval to open
            </label>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.button} type="submit" disabled={!canSubmit}>
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </main>
  );
}
