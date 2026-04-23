import { useState } from "react";

export default function SkillsForm({ items, setData }) {
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim()) {
      setData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (index) => {
    setData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">Skills</h2>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addSkill()}
          placeholder="Add a new skill"
          className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
        />
        <button
          onClick={addSkill}
          className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {items.map((skill, index) => (
          <span
            key={index}
            className="flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700"
          >
            {skill}
            <button
              onClick={() => removeSkill(index)}
              className="text-sky-500 hover:text-sky-700"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </section>
  );
}
