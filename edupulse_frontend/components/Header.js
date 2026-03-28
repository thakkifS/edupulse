import { useContext, useState } from "react";
import { FaSignOutAlt, FaUser } from "react-icons/fa";
import { useRouter } from "next/router";
import { AuthContext } from "../context/AuthContext";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);

  const handleSignInClick = () => router.push("/auth");
  const handleProfileClick = () => {
    setShowMenu(false);
    router.push("/profile");
  };
  const handleLogout = () => {
    logout();
    setShowMenu(false);
    router.push("/");
  };

  return (
    <>
      <header className="header">
        <div className="logo-section">
          <img src="/Logo1.png" alt="Logo" className="big-logo" />
          <div className="title-block">
            <h1 className="main-title">
              EDUPulse <span className="sub-title">Digital Learner</span>
            </h1>
            <p className="tagline">Feel the Pulse of Learning.</p>
          </div>
        </div>

        <div
          className="sign-btn"
          onClick={() => (user ? setShowMenu((p) => !p) : handleSignInClick())}
        >
          {user ? (
            user.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="profile-circle" />
            ) : (
              <div className="profile-circle">
                {String(user.Name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )
          ) : (
            <div className="profile-circle">
              <FaUser />
            </div>
          )}

          <div className="profile-name">
            {user ? String(user.Name).split(" ")[0] : "Sign In"}
          </div>

          {showMenu && user && (
            <div className="profile-menu">
              <button type="button" onClick={handleProfileClick}>
                <FaUser /> Profile
              </button>
              <button type="button" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </header>
      <div className="header-line"></div>
    </>
  );
}
