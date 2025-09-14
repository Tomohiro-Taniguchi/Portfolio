import { Link } from "react-router";
import "../css/Header.css";

export default function Header() {
  return (
    <nav className="navigation">
      <div className="nav-left">
        <Link to="/" className="logo-link">
          <img src="/img/TT.png" alt="Logo" className="logo" />
          <span className="logo-text">TT's Lab & Hub ~Portfolio~</span>
        </Link>
      </div>
      <div className="nav-center">
        <Link to="/" className="nav-link">
          HOME
        </Link>
        <Link to="/profile" className="nav-link">
          PROFILE
        </Link>
        <Link to="/blog" className="nav-link">
          BLOG
        </Link>
        <Link to="/gallery" className="nav-link">
          GALLERY
        </Link>
        <Link to="/admin" className="nav-link">
          ADMIN
        </Link>
      </div>
    </nav>
  );
}
