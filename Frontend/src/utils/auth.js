const VALID_ROLES = ["USER", "ADMIN"];

export function getAuthSession() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  let user = null;
  try {
    const stored = localStorage.getItem("user");
    user = stored ? JSON.parse(stored) : null;
  } catch {
    clearAuthSession();
    return null;
  }

  const role =
    user?.role ||
    localStorage.getItem("userRole")?.toUpperCase() ||
    null;

  if (!role || !VALID_ROLES.includes(role)) {
    clearAuthSession();
    return null;
  }

  return { token, user, role };
}

export function isRoleAllowed(role, allowedRoles) {
  if (!role || !allowedRoles?.length) return false;
  return allowedRoles.includes(role);
}

export function clearAuthSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("userRole");
  sessionStorage.clear();
}

export function getDefaultRouteForRole(role) {
  return role === "ADMIN" ? "/admin-dashboard" : "/dashboard";
}
