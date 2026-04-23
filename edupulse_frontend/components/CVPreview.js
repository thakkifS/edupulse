export default function CVPreview({ template, data }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
          {template} Template
        </p>
      </div>

      <div className="p-8">
        <div className="border-b border-slate-200 pb-6">
          <h2 className="text-3xl font-bold text-slate-900">
            {data.personal?.fullName}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {data.personal?.email} · {data.personal?.phone} ·{" "}
            {data.personal?.location}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {data.personal?.linkedIn} · {data.personal?.github}
          </p>
        </div>

        <div className="mt-6 space-y-6">
          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-900">
              Professional Summary
            </h3>
            <p className="text-sm leading-7 text-slate-600">{data.summary}</p>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-900">
              Education
            </h3>
            <div className="space-y-3">
              {data.education?.map((item) => (
                <div key={item.id}>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.degree} at {item.school}
                  </p>
                  <p className="text-sm text-slate-600">
                    {item.startDate} - {item.endDate} {item.gpa && `· GPA: ${item.gpa}`}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-900">
              Experience
            </h3>
            <div className="space-y-4">
              {data.experience?.map((item) => (
                <div key={item.id}>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.role} at {item.company}
                  </p>
                  <p className="text-sm text-slate-600">
                    {item.startDate} - {item.endDate}
                  </p>
                  <p className="mt-1 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-900">
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.skills?.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-900">
              Projects
            </h3>
            <div className="space-y-4">
              {data.projects?.map((project) => (
                <div key={project.id}>
                  <p className="text-sm font-semibold text-slate-900">
                    {project.name}
                  </p>
                  <p className="text-sm text-slate-600">
                    {project.technologies}
                  </p>
                  <p className="mt-1 text-sm leading-7 text-slate-600">
                    {project.description}
                  </p>
                  {project.url && (
                    <p className="text-xs text-sky-600 mt-1">
                      <a href={project.url} target="_blank" rel="noopener noreferrer">
                        View Project
                      </a>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
