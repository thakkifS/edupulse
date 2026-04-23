import Link from "next/link";
import { FileText, Clock3, Pencil, Eye, Trash2 } from "lucide-react";

function formatTemplateName(template) {
  if (!template || template.length === 0) return "Classic";
  return template.charAt(0).toUpperCase() + template.slice(1);
}

function formatDate(date) {
  if (!date) {
    console.error('Invalid date passed to formatDate:', date);
    return 'Invalid Date';
  }
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date passed to formatDate:', date);
    return 'Invalid Date';
  }
  return dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function slugifyTemplateName(template) {
  if (!template || typeof template !== 'string') return "classic";
  return template.trim().toLowerCase().replace(/\s+/g, "-");
}

export default function SavedCVCard({
  id,
  fullName,
  template,
  updatedAt,
  status,
  onDelete,
}) {
  const safeTemplate = template || "Classic";
  const templateSlug = slugifyTemplateName(safeTemplate);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <FileText size={22} />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              {fullName || "Untitled CV"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {formatTemplateName(safeTemplate)} Template
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            status === "completed"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {status === "completed" ? "Completed" : "Draft"}
        </span>
      </div>

      <div className="mb-5 flex items-center gap-2 text-sm text-slate-500">
        <Clock3 size={16} />
        <span>Updated {formatDate(updatedAt)}</span>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/student/cv-builder/create/${templateSlug}?id=${id}`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Pencil size={16} />
          Edit
        </Link>

        <Link
          href={`/student/cv-builder/view/${id}`}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600"
        >
          <Eye size={16} />
          View
        </Link>

        <button
          type="button"
          onClick={() => onDelete?.(id)}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
}
