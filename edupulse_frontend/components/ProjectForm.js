export default function ProjectForm({ items, setData }) {
  const addProject = () => {
    const newProject = {
      id: Date.now(),
      name: "",
      description: "",
      technologies: "",
      startDate: "",
      endDate: "",
      url: ""
    };
    setData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };

  const updateProject = (index, field, value) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeProject = (index) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">Projects</h2>
        <button 
          onClick={addProject}
          className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
        >
          Add Project
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="space-y-4 rounded-2xl border border-slate-200 p-4"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                value={item.name}
                onChange={(e) => updateProject(index, "name", e.target.value)}
                placeholder="Project Name"
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
              />
              <input
                value={item.technologies}
                onChange={(e) => updateProject(index, "technologies", e.target.value)}
                placeholder="Technologies Used"
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
              />
              <input
                value={item.startDate}
                onChange={(e) => updateProject(index, "startDate", e.target.value)}
                placeholder="Start Date"
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
              />
              <input
                value={item.endDate}
                onChange={(e) => updateProject(index, "endDate", e.target.value)}
                placeholder="End Date"
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
              />
              <input
                value={item.url}
                onChange={(e) => updateProject(index, "url", e.target.value)}
                placeholder="Project URL (optional)"
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
              />
            </div>
            <textarea
              value={item.description}
              onChange={(e) => updateProject(index, "description", e.target.value)}
              placeholder="Project description and your role"
              rows={3}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
            />
            <button
              onClick={() => removeProject(index)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
