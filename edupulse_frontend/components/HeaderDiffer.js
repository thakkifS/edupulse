"use client";

import { useContext, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaSignOutAlt, FaUser, FaChevronDown } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

export default function HeaderDiffer() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);

  const [showMenu, setShowMenu] = useState(false);
  const [showEduMenu, setShowEduMenu] = useState(false);

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
      <header className="header-diff">
        
        {/* LOGO */}
        <div className="logo-section-diff">
          <img src="/Logo1.png" alt="Logo" className="logo-diff" />
          <div className="title-block-diff">
            <h1 className="main-title-diff">
              BOOKTECH <span className="sub-title-diff">Digital Library</span>
            </h1>
            <p className="tagline-diff">Knowledge at your fingertips.</p>
          </div>
        </div>

        {/* NAVBAR */}
        <nav className="nav-bar-diff">
          <Link href="/" className="nav-link-diff">Home</Link>

          {/* DROPDOWN */}
          <div
            className="nav-dropdown"
            onMouseEnter={() => setShowEduMenu(true)}
            onMouseLeave={() => setShowEduMenu(false)}
          >
            <div className="nav-link-diff dropdown-title">
              EduLearner <FaChevronDown size={12} />
            </div>

            {showEduMenu && (
              <div className="dropdown-menu">
                <Link href="/books">Books</Link>
                <Link href="/qa">Courses</Link>
                <Link href="/survey">Career Survey</Link>
                <Link href="/scheduler">Weekly Scheduler</Link>
                <Link href="/student/cv-builder">CV Builder</Link>
                <Link href="/student/career-finder">Career Finder</Link>
                <Link href="/aboutus">About Us</Link>
              </div>
            )}
          </div>

          <Link href="/aboutus" className="nav-link-diff">About Us</Link>
        </nav>

        {/* PROFILE */}
        <div
          className="sign-btn-diff"
          onClick={() => (user ? setShowMenu((p) => !p) : handleSignInClick())}
        >
          {user ? (
            user.profileImage ? (
              <img src={user.profileImage} className="profile-circle-diff" />
            ) : (
              <div className="profile-circle-diff">
                {String(user.Name || "U").charAt(0).toUpperCase()}
              </div>
            )
          ) : (
            <div className="profile-circle-diff">
              <FaUser />
            </div>
          )}

          <div className="profile-name-diff">
            {user ? String(user.Name || "").split(" ")[0] : "Sign In"}
          </div>

          {showMenu && user && (
            <div className="profile-menu-diff">
              <button onClick={handleProfileClick}>
                <FaUser /> Profile
              </button>
              <button onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="header-line-diff"></div>
    </>
  );
}