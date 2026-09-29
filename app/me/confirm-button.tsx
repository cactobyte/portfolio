"use client";

/** Submit button that asks before running a destructive form action. */
export default function ConfirmButton({
  children,
  message,
  className = "me-btn me-btn-danger",
}: {
  children: React.ReactNode;
  message: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
