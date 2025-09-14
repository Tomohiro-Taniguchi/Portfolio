import "../css/Footer.css";
import XIcon from "@mui/icons-material/X";
import GitHubIcon from "@mui/icons-material/GitHub";
import InstagramIcon from "@mui/icons-material/Instagram";
import MailIcon from "@mui/icons-material/Mail";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h3>TT's Lab & Hub ~Portfolio~</h3>
        </div>

        <div className="footer-social">
          <a
            href="https://x.com/tguchi_tech"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            aria-label="X (旧Twitter)"
          >
            <XIcon />
          </a>
          <a
            href="https://github.com/Tomohiro-Taniguchi"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            aria-label="GitHub"
          >
            <GitHubIcon />
          </a>
          <a
            href="https://www.instagram.com/t.guchi1202"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            aria-label="Instagram"
          >
            <InstagramIcon />
          </a>
          <a
            href="mailto:ttaniguchi.131202@gmail.com"
            className="social-link"
            aria-label="メール"
          >
            <MailIcon />
          </a>
        </div>

        <div className="footer-copyright">
          <p>© Tomohiro Taniguchi 2025</p>
        </div>
      </div>
    </footer>
  );
}
