import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <p className="footer-main">EDUPulse Digital Learner - Feel the Pulse of Learning.</p>
        <p className="footer-sub">
          EDUPulse empowers learners to access knowledge anytime, anywhere.
        </p>
      </div>

      <nav className="footer-nav">
        <Link href="/" className="footer-link">
            Home
          </Link>
          <Link href="/books" className="footer-link">
            Books
          </Link>
          <Link href="/qa" className="footer-link">
            Courses
          </Link>
          <Link href="/survey" className="footer-link">
            Career Survey
          </Link>
          <Link href="/scheduler" className="footer-link">
            Scheduler
          </Link>
          <Link href="/aboutus" className="footer-link">
            About Us
          </Link>

      </nav>

      <div className="footer-social">
        <a href="#" aria-label="Facebook">
          <FaFacebookF />
        </a>
        <a href="#" aria-label="Twitter">
          <FaTwitter />
        </a>
        <a href="#" aria-label="Instagram">
          <FaInstagram />
        </a>
      </div>

      <hr className="footer-line" />
      <div className="footer-bottom">
        <p>
          © 2026 EDUPulse Digital Learner. All rights reserved. Supporting students in
          their academic journey.
        </p>
      </div>
    </footer>
  );
}
