import PersonalInfoForm from "./PersonalInfoForm";
import SummaryForm from "./SummaryForm";
import EducationForm from "./EducationForm";
import ExperienceForm from "./ExperienceForm";
import SkillsForm from "./SkillsForm";
import ProjectForm from "./ProjectForm";

export default function CVForm({ data, setData }) {
  return (
    <div className="space-y-6">
      <PersonalInfoForm data={data} setData={setData} />
      <SummaryForm value={data.summary} setData={setData} />
      <EducationForm items={data.education} setData={setData} />
      <ExperienceForm items={data.experience} setData={setData} />
      <SkillsForm items={data.skills} setData={setData} />
      <ProjectForm items={data.projects} setData={setData} />
    </div>
  );
}
