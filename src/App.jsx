import "./css/App.css";
import Header from "./components/header";
import { useState, useEffect } from "react";
import { Link } from "react-router";

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
              <Link to="/profile" className="nav-link">
                <div className="cta-button">
                  <span className="arrow">→</span>
                </div>
                <span className="cta-text">詳しく見る</span>
              </Link>
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
      <div className="purpose-section">
        <div className="purpose-content">
          <div className="purpose-text">
            <div className="purpose-heading">
              <hr />
              <h1>Purpose of This Site</h1>
            </div>
            <p className="about-description">
              このポートフォリオサイトは、私がこれまでに学んできたIT分野に関することを形に残しておきたいと思って製作したWebサイトです。
              <br />
              ネットワークや情報セキュリティに関する知識を深めるために、インプットだけでなくアウトプットも行いたいと感じたことが1つのきっかけですが、
              将来フロントエンド開発を副業として取り組むことにも興味を抱いているので、簡単にWebデザインの勉強もして、React.jsでお手製のWebサイトを実装してみました。
              <br />
              ポートフォリオサイト×テックブログのような使い方を中心としますが、完全に自己満で全く無関係な趣味の内容も掲載していこうかなと思います。
              <br />
              IT分野に興味がある人にとって、少しでも参考になれば幸いです(ˆ▿ˆ)/
            </p>
          </div>
          <div className="purpose-image">
            <img src="/img/my-icon.jpg" alt="My Icon" />
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        className="scroll-to-top-button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="画面上部へスクロール"
      >
        <span>↑</span>
      </button>
    </div>
  );
}

export default App;
