export default function PersonalInfoForm({ data, setData }) {
  const fields = [
    { label: "Full Name", key: "fullName", value: data.fullName },
    { label: "Email", key: "email", value: data.email },
    { label: "Phone", key: "phone", value: data.phone },
    { label: "Location", key: "location", value: data.location },
    { label: "LinkedIn", key: "linkedIn", value: data.linkedIn },
    { label: "GitHub", key: "github", value: data.github },
  ];

  const handleChange = (key, value) => {
    setData(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [key]: value
      }
    }));
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-2xl font-semibold text-slate-900">
        Personal Information
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label}>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {field.label}
            </label>
            <input
              value={field.value || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
