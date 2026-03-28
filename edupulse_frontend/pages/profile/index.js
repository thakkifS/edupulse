import { useContext, useMemo, useState } from "react";
import { useRouter } from "next/router";
import HeaderDiffer from "../../components/HeaderDiffer";
import { AuthContext } from "../../context/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useContext(AuthContext);
  const [name, setName] = useState(user?.Name || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const initial = useMemo(
    () =>
      String(user?.Name || "U")
        .charAt(0)
        .toUpperCase(),
    [user]
  );

  if (!user) {
    return (
      <>
        <HeaderDiffer />
        <div className="page-wrap">
          <div className="card-center">
            <h2>Please sign in first</h2>
            <button className="primary-btn" onClick={() => router.push("/auth")}>
              Go to Sign In
            </button>
          </div>
        </div>
      </>
    );
  }

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateUser({ profileImage: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSave = (event) => {
    event.preventDefault();
    if (password && password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    if (password && password !== confirmPassword) {
      alert("Password and confirm password must match");
      return;
    }
    updateUser({ Name: name, Password: password || undefined });
    alert("Profile updated");
  };

  return (
    <>
      <HeaderDiffer />
      <div className="page-wrap">
        <form className="profile-card" onSubmit={handleSave}>
          <h2>Profile Dashboard</h2>
          <div className="profile-preview">
            {user.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="profile-big" />
            ) : (
              <div className="profile-big">{initial}</div>
            )}
          </div>
          <label className="upload-label">
            Add / Change Profile Image
            <input type="file" accept="image/*" onChange={handleImage} />
          </label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" />
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" />
          <button type="submit" className="primary-btn">
            Save Changes
          </button>
        </form>
      </div>
    </>
  );
}
