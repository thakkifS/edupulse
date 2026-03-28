const PREFIX = "edupulse_qa_best_";

export function progressKey(courseId) {
  return `${PREFIX}${courseId}`;
}

export function loadBestProgress(courseId) {
  if (typeof window === "undefined" || !courseId) return null;
  try {
    const raw = localStorage.getItem(progressKey(courseId));
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (typeof v?.percent !== "number") return null;
    return v;
  } catch {
    return null;
  }
}

export function saveBestProgress(courseId, payload) {
  if (typeof window === "undefined" || !courseId) return;
  const prev = loadBestProgress(courseId);
  const nextPct = payload.percent;
  if (prev && typeof prev.percent === "number" && prev.percent > nextPct) return;
  try {
    localStorage.setItem(
      progressKey(courseId),
      JSON.stringify({
        ...payload,
        at: new Date().toISOString(),
      })
    );
  } catch {
    /* ignore */
  }
}
