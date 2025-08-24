import Header from "../components/header";
import "../css/Blog.css";
import { useEffect } from "react";

export default function Blog() {
  useEffect(() => {
    // ページが読み込まれた時に上部にスクロール
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="blog-container">
      <Header />
      <div className="blog-content">
        <h1>Blog</h1>
      </div>
    </div>
  );
}
