import Header from "../components/header";
import "../css/Gallery.css";
import { useEffect } from "react";

export default function Gallery() {
  useEffect(() => {
    // ページが読み込まれた時に上部にスクロール
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="gallery-container">
      <Header />
      <div className="gallery-content">
        <h1>Gallery</h1>
      </div>
    </div>
  );
}
