import { ComplaintStatus, STATUS_BADGE_CLASS, STATUS_LABEL } from "@/types/database";
import clsx from "clsx";

export default function StatusBadge({ status }: { status: ComplaintStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        STATUS_BADGE_CLASS[status]
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
