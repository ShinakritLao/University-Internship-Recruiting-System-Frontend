// Confirms the local Go backend is reachable before any tests run.
// Without this, every test would fail with cryptic network errors.

const BACKEND_URL = process.env.VITE_API_URL || "http://localhost:8080";

export default async function globalSetup() {
  const url = `${BACKEND_URL}/health`;
  try {
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      throw new Error(`Backend /health returned HTTP ${res.status}`);
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error("\n❌ Backend health check failed at " + url);
    console.error("   Reason: " + reason);
    console.error(
      "\n   Start the Go backend before running these tests:\n" +
        "     cd ../University-Internship-Recruiting-System-Backend\n" +
        "     go run ./src\n",
    );
    throw new Error("Backend unavailable — aborting Playwright run.");
  }
  console.log("✓ Backend reachable at " + BACKEND_URL);
}
