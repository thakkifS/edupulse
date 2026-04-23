/**
 * Simple role-based guard middleware.
 *
 * Usage:
 *   router.delete("/:id", requireRole("admin"), controller.deleteUser);
 *
 * Expects req.user to be set upstream (e.g. by a JWT middleware).
 * Currently a stub — wire in your JWT/session auth when ready.
 */
const requireRole = (...roles) => (req, res, next) => {
  // TODO: replace with real session / JWT verification
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, message: "Unauthorized — not logged in" });
  }
  if (!roles.includes(user.role)) {
    return res
      .status(403)
      .json({ success: false, message: `Forbidden — requires role: ${roles.join(" or ")}` });
  }
  next();
};

module.exports = { requireRole };