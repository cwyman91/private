"use client";

import { useState } from "react";
import styles from "./page.module.css";

const LOCATION_OPTIONS = [
  "New York - (hybrid)",
  "San Francisco - (hybrid)",
  "Remote",
];

const TEAM_OPTIONS = ["Product", "Engineering", "Operations", "Marketing", "GTM"];

const LEVEL_OPTIONS = ["Junior", "Mid", "Senior"];

const FIELDS = [
  {
    name: "jobDescription",
    label: "Job Description",
    type: "textarea",
    guidance: (
      <>
        See a{" "}
        <a
          href="https://app.notion.com/p/NEW-JOB-EXAMPLE-3f042cc7c5658027b8fcc84f03ec837b"
          target="_blank"
          rel="noopener noreferrer"
        >
          sample intake example
        </a>{" "}
        for formatting guidance.
      </>
    ),
  },
  {
    name: "hiringManager",
    label: "Hiring Manager",
    type: "text",
    guidance: "Who is hiring for this role?",
  },
  {
    name: "location",
    label: "Location",
    type: "multiselect",
    options: LOCATION_OPTIONS,
  },
  {
    name: "team",
    label: "Team",
    type: "select",
    options: TEAM_OPTIONS,
  },
  {
    name: "level",
    label: "Level",
    type: "select",
    options: LEVEL_OPTIONS,
    guidance: "Select the seniority level for this role.",
  },
  {
    name: "additionalDetails",
    label: "Additional Details",
    type: "textarea",
    guidance:
      "Include details not on the JD, such as team structure, unique selling points, etc.",
  },
];

const EMPTY_FORM = FIELDS.reduce((acc, field) => {
  acc[field.name] = field.type === "multiselect" ? [] : "";
  return acc;
}, {});

function isFieldEmpty(value) {
  return Array.isArray(value) ? value.length === 0 : !value || !String(value).trim();
}

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

  function handleMultiSelectToggle(name, option) {
    setFormData((prev) => {
      const current = prev[name];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [name]: next };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    for (const field of FIELDS) {
      if (isFieldEmpty(formData[field.name])) {
        setError(`Please fill out ${field.label}.`);
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          location: formData.location.join(", "),
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
              {field.guidance && <p className={styles.guidance}>{field.guidance}</p>}

              {field.type === "textarea" && (
                <textarea
                  id={field.name}
                  className={styles.textarea}
                  rows={4}
                  value={formData[field.name]}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                />
              )}

              {field.type === "text" && (
                <input
                  id={field.name}
                  className={styles.input}
                  type="text"
                  value={formData[field.name]}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                />
              )}

              {field.type === "select" && (
                <select
                  id={field.name}
                  className={styles.select}
                  value={formData[field.name]}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                >
                  <option value="">Select {field.label.toLowerCase()}...</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}

              {field.type === "multiselect" && (
                <div className={styles.checkboxGroup}>
                  {field.options.map((option) => (
                    <label className={styles.checkboxOption} key={option}>
                      <input
                        type="checkbox"
                        checked={formData[field.name].includes(option)}
                        onChange={() => handleMultiSelectToggle(field.name, option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
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
