export default function ExperienceForm({ items, setData }) {
  const addExperience = () => {
    const newExperience = {
      id: Date.now(),
      role: "",
      company: "",
      startDate: "",
      endDate: "",
      description: ""
    };
    setData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const updateExperience = (index, field, value) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeExperience = (index) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">Experience</h2>
        <button 
          onClick={addExperience}
          className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
        >
          Add Experience
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
                value={item.role}
                onChange={(e) => updateExperience(index, "role", e.target.value)}
                placeholder="Role/Position"
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
              />
              <input
                value={item.company}
                onChange={(e) => updateExperience(index, "company", e.target.value)}
                placeholder="Company"
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
              />
              <input
                value={item.startDate}
                onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                placeholder="Start Date"
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
              />
              <input
                value={item.endDate}
                onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                placeholder="End Date"
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
              />
            </div>
            <textarea
              value={item.description}
              onChange={(e) => updateExperience(index, "description", e.target.value)}
              placeholder="Job description and achievements"
              rows={3}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
            />
            <button
              onClick={() => removeExperience(index)}
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
