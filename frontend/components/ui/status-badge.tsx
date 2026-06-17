export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  let colorClasses: string;
  let label = status;

  switch (normalized) {
    case "reserved":
      colorClasses =
        "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
      label = "Pending";
      break;
    case "taken":
      colorClasses =
        "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
      label = "Rented";
      break;
    case "returned":
      colorClasses =
        "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
      label = "Returned";
      break;
    case "canceled":
      colorClasses =
        "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300";
      label = "Canceled";
      break;
    case "overdue":
      colorClasses =
        "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
      label = "Overdue";
      break;
    case "waiting for payment":
      colorClasses =
        "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
      label = "Waiting for payment";
      break;
    default:
      colorClasses = "bg-muted text-muted-foreground";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full ${colorClasses}`}
    >
      {label}
    </span>
  );
}
