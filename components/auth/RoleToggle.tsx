type Role = "patient" | "doctor";

interface RoleToggleProps {
  activeRole: Role;
  onRoleChange: (role: Role) => void;
}

export default function RoleToggle({ activeRole, onRoleChange }: RoleToggleProps) {
  return (
    <div className="p-1 bg-surface-variant rounded-xl flex">
      <button
        type="button"
        onClick={() => onRoleChange("patient")}
        className={`flex-1 py-2 rounded-lg text-label-lg font-semibold transition-all duration-300 ${
          activeRole === "patient"
            ? "bg-surface text-text shadow-sm"
            : "text-text-secondary hover:text-text"
        }`}
      >
        Patient Login
      </button>
      <button
        type="button"
        onClick={() => onRoleChange("doctor")}
        className={`flex-1 py-2 rounded-lg text-label-lg font-semibold transition-all duration-300 ${
          activeRole === "doctor"
            ? "bg-surface text-text shadow-sm"
            : "text-text-secondary hover:text-text"
        }`}
      >
        Doctor Login
      </button>
    </div>
  );
}
