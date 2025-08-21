import { Link } from "react-router";

export default function Header() {
  return (
    <nav className="navigation">
      <div className="nav-left">
        <Link to="/" className="logo-link">
          <img src="/img/TT.png" alt="Logo" className="logo" />
        </Link>
      </div>
      <div className="nav-center">
        <Link to="/" className="nav-link">
          HOME
        </Link>
        <Link to="/profile" className="nav-link">
          PROFILE
        </Link>
      </div>
    </nav>
  );
}
