import "./css/App.css";
import Header from "./components/Header";
import { useState, useEffect } from "react";

function App() {
  const [videoSource, setVideoSource] = useState("/img/cat.mp4");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setVideoSource("/img/cat-mobile.mp4");
      } else {
        setVideoSource("/img/cat.mp4");
      }
    };

    // 初期設定
    handleResize();

    // リサイズイベントのリスナーを追加
    window.addEventListener("resize", handleResize);

    // クリーンアップ
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="app-container">
      <div className="hero-section">
        <video
          key={videoSource}
          className="background-video"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={videoSource} type="video/mp4" />
        </video>
        <Header />
      </div>
      <h1>About Me</h1>
    </div>
  );
}

export default App;
