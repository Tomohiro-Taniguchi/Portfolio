import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import "../css/ScrollMenu.css";

export default function ScrollMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClick = () => {
    setIsMenuOpen(false);
  };

  // メニューの外側をクリックした時の処理
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const menuItems = [
    { path: "/", label: "HOME" },
    { path: "/profile", label: "PROFILE" },
    { path: "/blog", label: "BLOG" },
    { path: "/gallery", label: "GALLERY" },
    { path: "/admin", label: "ADMIN" },
  ];

  return (
    <div className="scroll-menu-container" ref={menuRef}>
      {/* ハンバーガーボタン */}
      <button
        className={`scroll-menu-button ${isMenuOpen ? "open" : ""}`}
        onClick={toggleMenu}
        aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
      >
        <div className="hamburger-lines">
          <span className="line line1"></span>
          <span className="line line2"></span>
          <span className="line line3"></span>
        </div>

        {/* メニューコンテンツ */}
        {isMenuOpen && (
          <div className="scroll-menu-content">
            <nav className="scroll-menu-nav">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="scroll-menu-link"
                >
                  <div className="menu-item-text">
                    <span className="menu-item-main">{item.label}</span>
                  </div>
                </Link>
              ))}
            </nav>

            {/* 画像 */}
            <div className="scroll-menu-image">
              <img
                src="/img/TTs-lab-hub-pcman.png"
                alt="TTs Lab Hub PCMan"
                className="menu-image"
              />
            </div>
          </div>
        )}
      </button>
    </div>
  );
}
