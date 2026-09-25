"use client";

// Global error boundary for the ROOT layout. Must render its own
// `<html>` and `<body>` (the root layout is replaced while this is
// shown). globals.css is NOT loaded outside the root layout, so this
// component uses minimal inline styles to guarantee readable presentation.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          backgroundColor: "#fcfafc",
          color: "#27272a",
          textAlign: "center",
          margin: 0,
        }}
      >
        <p
          style={{
            fontSize: "12px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#71717a",
            marginBottom: "8px",
          }}
        >
          Error · {error.digest ?? "Unexpected"}
        </p>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "600",
            margin: "0 0 12px 0",
            color: "#430330",
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            maxWidth: "420px",
            fontSize: "14px",
            lineHeight: "1.5",
            color: "#52525b",
            marginBottom: "24px",
          }}
        >
          An unexpected error occurred. You can try again, or reload the page.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "10px 20px",
            backgroundColor: "#430330",
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
