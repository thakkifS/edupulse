export default function EducationForm({ items, setData }) {
  const addEducation = () => {
    const newEducation = {
      id: Date.now(),
      school: "",
      degree: "",
      startDate: "",
      endDate: "",
      gpa: ""
    };
    setData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  const updateEducation = (index, field, value) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeEducation = (index) => {
    setData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">Education</h2>
        <button 
          onClick={addEducation}
          className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
        >
          Add Education
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
                value={item.school}
                onChange={(e) => updateEducation(index, "school", e.target.value)}
                placeholder="School/University"
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
              />
              <input
                value={item.degree}
                onChange={(e) => updateEducation(index, "degree", e.target.value)}
                placeholder="Degree"
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
              />
              <input
                value={item.startDate}
                onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                placeholder="Start Date"
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
              />
              <input
                value={item.endDate}
                onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                placeholder="End Date"
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
              />
              <input
                value={item.gpa}
                onChange={(e) => updateEducation(index, "gpa", e.target.value)}
                placeholder="GPA (optional)"
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
              />
            </div>
            <button
              onClick={() => removeEducation(index)}
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
