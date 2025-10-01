import { Link, useLocation } from "react-router";
import "../css/Header.css";

export default function Header() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navigation">
      <div className="nav-left">
        <Link to="/" className="logo-link">
          <img src="/img/TT.png" alt="Logo" className="logo" />
          <span className="logo-text">TT's Lab & Hub ~Portfolio~</span>
        </Link>
      </div>
      <div className="nav-center">
        <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
          HOME
        </Link>
        <Link
          to="/profile"
          className={`nav-link ${isActive("/profile") ? "active" : ""}`}
        >
          PROFILE
        </Link>
        <Link
          to="/blog"
          className={`nav-link ${isActive("/blog") ? "active" : ""}`}
        >
          BLOG
        </Link>
        <Link
          to="/gallery"
          className={`nav-link ${isActive("/gallery") ? "active" : ""}`}
        >
          GALLERY
        </Link>
        <Link
          to="/admin"
          className={`nav-link ${isActive("/admin") ? "active" : ""}`}
        >
          ADMIN
        </Link>
      </div>
    </nav>
  );
}
