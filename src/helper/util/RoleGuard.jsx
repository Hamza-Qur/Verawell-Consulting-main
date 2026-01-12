import { useAuth } from "./AuthContext";

const RoleGuard = ({ allowedRoles = [], children, fallback = null }) => {
  const { user } = useAuth();

  if (!user) return null;

  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) return fallback;

  return <>{children}</>;
};

export default RoleGuard;
