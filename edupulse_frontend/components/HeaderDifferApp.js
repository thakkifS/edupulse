"use client";

import { useContext, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaSignOutAlt, FaUser } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

export default function HeaderDifferApp() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext) || {};
  const [showMenu, setShowMenu] = useState(false);

  const handleSignInClick = () => router.push("/auth");
  const handleProfileClick = () => {
    setShowMenu(false);
    router.push("/profile");
  };
  const handleLogout = () => {
    logout?.();
    setShowMenu(false);
    router.push("/");
  };

  return (
    <>
      <header className="header-diff">
        <div className="logo-section-diff">
          <img src="/Logo1.png" alt="Logo" className="logo-diff" />
          <div className="title-block-diff">
            <h1 className="main-title-diff">
              BOOKTECH <span className="sub-title-diff">Digital Library</span>
            </h1>
            <p className="tagline-diff">Knowledge at your fingertips.</p>
          </div>
        </div>

        <nav className="nav-bar-diff">
          <Link href="/" className="nav-link-diff">
            Home
          </Link>
          <Link href="/survey" className="nav-link-diff">
            Career Survey
          </Link>
          <Link href="/scheduler" className="nav-link-diff">
            Weekly Scheduler
          </Link>
          <Link href="/books" className="nav-link-diff">
            Books
          </Link>
          <Link href="/qa" className="nav-link-diff">
            Q & A
          </Link>
          <Link href="/aboutus" className="nav-link-diff">
            About Us
          </Link>
        </nav>

        <div
          className="sign-btn-diff"
          onClick={() => (user ? setShowMenu((p) => !p) : handleSignInClick())}
        >
          {user ? (
            user.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="profile-circle-diff" />
            ) : (
              <div className="profile-circle-diff">
                {String(user.Name || "U")
                  .charAt(0)
                  .toUpperCase()}
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
      <div className="header-line-diff"></div>
    </>
  );
}

