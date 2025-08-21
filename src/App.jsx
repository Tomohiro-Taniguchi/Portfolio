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
      <div className="about-me-section">
        <div className="about-content">
          <div className="about-text">
            <div className="about-heading">
              <hr />
              <h1>About Me</h1>
            </div>
            <h2>谷口 友浩</h2>
            <p className="about-subtitle">～Tomohiro Taniguchi～</p>
            <p className="about-description">
              2001年12月2日生まれ。
              <br />
              大阪府箕面市出身。広島県東広島市在住。
              <br />
              大学では情報科学を専攻しており、特に研究ではネットワーク＆情報セキュリティ分野を学んでいます。
              <br />
              来年からネットワーク業界のエンジニアとして就職予定ですが、現在長期インターンにてWebサイト制作（JavaScript,
              React.jsなど）といったフロントエンド開発も勉強中です。
            </p>
            <div className="about-cta">
              <div className="cta-button">
                <span className="arrow">→</span>
              </div>
              <span className="cta-text">詳しく見る</span>
            </div>
          </div>
          <div className="about-image">
            <img src="/img/pic-t-2026.jpg" alt="谷口 友浩" />
            <div className="circular-text">
              WELCOME <br /> TO MY <br /> PORTFOLIO !
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
