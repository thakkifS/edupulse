import Loader from "./Loader";

/**
 * Same full-screen loading experience as pages/_app.js (route changes):
 * solid backdrop + centered logo animation — no dimmed overlay card.
 */
export default function FullScreenLoader() {
  return (
    <div className="loader-fullscreen-root" aria-busy="true" aria-live="polite">
      <Loader />
    </div>
  );
}
