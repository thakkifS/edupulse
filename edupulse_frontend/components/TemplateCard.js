import Link from "next/link";

export default function TemplateCard({
  title,
  description,
  letter,
  href,
  variant = "classic",
}) {
  const previewStyles = {
    classic: "bg-slate-100 text-slate-700",
    modern: "bg-sky-50 text-sky-600",
    minimal: "bg-zinc-100 text-zinc-900",
    professional: "bg-emerald-50 text-emerald-700",
  };

  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div
        className={`mb-5 flex h-[260px] items-center justify-center rounded-2xl text-6xl font-bold ${previewStyles[variant]}`}
      >
        {letter}
      </div>

      <h3 className="text-3xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-lg leading-7 text-slate-500">{description}</p>
    </Link>
  );
}
