import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import ScrollMenu from "../components/ScrollMenu";
import "../css/Profile.css";
import { useEffect, useState } from "react";
import XIcon from "@mui/icons-material/X";
import GitHubIcon from "@mui/icons-material/GitHub";
import InstagramIcon from "@mui/icons-material/Instagram";
import MailIcon from "@mui/icons-material/Mail";

export default function Profile() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  const profileImages = [
    {
      src: "/img/JPHacks.jpg",
      alt: "ハッカソン",
      text: "ハッカソンに\n出場した時の\n写真です!",
    },
    {
      src: "/img/choko.jpg",
      alt: "チョコ",
      text: "愛犬の\nトイプードル\n名前は\nチョコ!",
    },
    {
      src: "/img/sanrio.jpg",
      alt: "プライベート写真",
      text: "人生初の\nサンリオ\nピューロ\nランド!",
    },
    {
      src: "/img/gamba.jpg",
      alt: "ガンバ大阪",
      text: "ガンバ大阪\nのサポーター\nです!",
    },
    {
      src: "/img/taniguchi.jpg",
      alt: "谷口 友浩",
      text: "実家の前で\n撮らされた\n写真です!",
    },
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % profileImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + profileImages.length) % profileImages.length
    );
  };

  useEffect(() => {
    // ページが読み込まれた時に上部にスクロール
    window.scrollTo(0, 0);

    // スクロールアニメーション用のIntersection Observer
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, observerOptions);

    // アニメーション対象の要素を監視
    const animatedElements = document.querySelectorAll(
      ".detail-item, .profile-text, .skill-card, .skills-section, .timeline-container, .timeline-item"
    );
    animatedElements.forEach((el) => {
      observer.observe(el);
    });

    // クリーンアップ
    return () => {
      animatedElements.forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, []);

  // ヘッダーの表示/非表示を検知するuseEffect
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector(".navigation");
      if (header) {
        const headerBottom = header.offsetTop + header.offsetHeight;
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        setIsHeaderVisible(scrollTop < headerBottom);
      }
    };

    // 初期設定
    handleScroll();

    // スクロールイベントのリスナーを追加
    window.addEventListener("scroll", handleScroll);

    // クリーンアップ
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // スキルレベルを判定する関数
  const getSkillLevel = (percentage) => {
    if (percentage === 0) return "未経験者";
    if (percentage >= 1 && percentage <= 25) return "初心者";
    if (percentage >= 26 && percentage <= 50) return "初級者";
    if (percentage >= 51 && percentage <= 75) return "中級者";
    if (percentage >= 76 && percentage <= 100) return "上級者";
    return "未経験者";
  };

  // スキルレベルに応じたクラスを取得する関数
  const getSkillLevelClass = (percentage) => {
    if (percentage === 0) return "beginner";
    if (percentage >= 1 && percentage <= 25) return "novice";
    if (percentage >= 26 && percentage <= 50) return "elementary";
    if (percentage >= 51 && percentage <= 75) return "intermediate";
    if (percentage >= 76 && percentage <= 100) return "advanced";
    return "beginner";
  };
  return (
    <div className="profile-container">
      <Header />
      <div className="profile-content">
        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-content-grid">
            <div className="profile-text">
              <div className="profile-heading">
                <hr />
                <h1>Profile</h1>
              </div>

              <div className="profile-name">
                <br />
                <h2>谷口 友浩</h2>
                <p className="name-subtitle">~Tomohiro Taniguchi~</p>
                <div className="sns-icons">
                  <a
                    href="https://x.com/tguchi_tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sns-link"
                  >
                    <XIcon className="sns-icon" />
                  </a>
                  <a
                    href="https://github.com/Tomohiro-Taniguchi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sns-link"
                  >
                    <GitHubIcon className="sns-icon" />
                  </a>
                  <a
                    href="https://www.instagram.com/t.guchi1202"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sns-link"
                  >
                    <InstagramIcon className="sns-icon" />
                  </a>
                  <a
                    href="mailto:ttaniguchi.131202@gmail.com"
                    className="sns-link"
                  >
                    <MailIcon className="sns-icon" />
                  </a>
                </div>
              </div>
            </div>

            <div className="profile-image-container">
              <button
                className="image-nav-button prev-button"
                onClick={prevImage}
              >
                ‹
              </button>

              <div className="profile-image">
                <img
                  src={profileImages[currentImageIndex].src}
                  alt={profileImages[currentImageIndex].alt}
                />
                <div className="circular-overlay">
                  <p>
                    {profileImages[currentImageIndex].text
                      .split("\n")
                      .map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          {index <
                            profileImages[currentImageIndex].text.split("\n")
                              .length -
                              1 && <br />}
                        </React.Fragment>
                      ))}
                  </p>
                </div>
              </div>

              <button
                className="image-nav-button next-button"
                onClick={nextImage}
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="details-section">
          <div className="details-content">
            <div className="detail-item" id="basic-info">
              <div className="section-bar">
                <hr />
              </div>
              <h3>基本情報</h3>
              <ul className="info-list">
                <li>
                  <span className="info-label">所属：</span>
                  広島大学大学院 先進理工系科学研究科 先進理工系科学専攻
                  情報科学プログラム
                </li>
                <li>
                  <span className="info-label">学年：</span>
                  博士課程前期 2年
                </li>
                <li>
                  <span className="info-label">生年月日：</span>
                  2001/12/02
                </li>
                <li>
                  <span className="info-label">出身地：</span>
                  大阪府箕面市
                </li>
                <li>
                  <span className="info-label">居住地：</span>
                  広島県東広島市
                </li>
                <li>
                  <span className="info-label">座右の銘：</span>
                  「自分の中に毒を持て」（岡本太郎）
                </li>
                <li>
                  <span className="info-label">MBTI：</span>
                  INFJ（提唱者）
                </li>
              </ul>
            </div>

            <div className="scroll-button-container">
              <button
                className="scroll-button"
                onClick={() =>
                  document
                    .getElementById("basic-info")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                <span>↑</span>
                <p>基本情報へ</p>
              </button>
              <button
                className="scroll-button"
                onClick={() =>
                  document
                    .getElementById("career-history")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                <span>↓</span>
                <p>経歴へ</p>
              </button>
            </div>

            <div className="detail-item" id="career-history">
              <div className="section-bar">
                <hr />
              </div>
              <h3>経歴</h3>
              <div className="timeline-container">
                <div className="timeline">
                  <div className="school">
                    <div className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="school-with-logo">
                          <h4>箕面市立西小学校</h4>
                          <img
                            src="/img/nishisyo.png"
                            alt="箕面市立西小学校校章"
                            className="inline-logo"
                          />
                        </div>
                        <p className="timeline-date">2008年4月 ~ 2014年3月</p>
                      </div>
                    </div>
                  </div>

                  <div className="school">
                    <div className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="school-with-logo">
                          <h4>箕面市立第一中学校</h4>
                          <img
                            src="/img/1chu.png"
                            alt="箕面市立第一中学校校章"
                            className="inline-logo"
                          />
                        </div>
                        <p className="timeline-date">2014年4月 ~ 2017年3月</p>
                      </div>
                    </div>
                  </div>

                  <div className="school">
                    <div className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="school-with-logo">
                          <h4>大阪府立池田高等学校 普通科</h4>
                          <img
                            src="/img/Ikeda.gif"
                            alt="池田高校校章"
                            className="inline-logo"
                          />
                        </div>
                        <p className="timeline-date">2017年4月 ~ 2020年3月</p>
                      </div>
                    </div>
                  </div>

                  <div className="school">
                    <div className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="school-with-logo">
                          <h4>広島大学 情報科学部 情報科学科</h4>
                          <img
                            src="/img/HiroshimaUniv.jpg"
                            alt="広島大学学章"
                            className="inline-logo"
                          />
                        </div>
                        <p className="timeline-date">2020年4月 ~ 2024年3月</p>
                        <p className="timeline-detail">
                          インフォマティクスコース
                        </p>
                        <p className="timeline-detail">
                          情報セキュリティ研究室
                        </p>
                        <p className="timeline-detail">
                          研究概要：
                          ローカル5G通信における電波伝搬特性/伝送性能の測定と可視化
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="school">
                    <div className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="school-with-logo">
                          <h4>
                            広島大学大学院 先進理工系科学研究科
                            先進理工系科学専攻
                          </h4>
                          <div className="dual-logos">
                            <img
                              src="/img/HiroshimaUniv.jpg"
                              alt="広島大学学章"
                              className="inline-logo"
                            />
                            <img
                              src="/img/advance-tech.jpg"
                              alt="先進理工系科学研究科"
                              className="inline-logo"
                            />
                          </div>
                        </div>
                        <p className="timeline-date">
                          2024年4月 ~ 2026年3月修了予定
                        </p>
                        <p className="timeline-detail">
                          情報科学プログラム 博士課程前期
                        </p>
                        <p className="timeline-detail">
                          情報セキュリティ研究室
                        </p>
                        <p className="timeline-detail">
                          研究概要：
                          広島大学ローカル5G通信環境のデジタルツイン構築と評価
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="scroll-button-container">
              <button
                className="scroll-button"
                onClick={() =>
                  document
                    .getElementById("career-history")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                <span>↑</span>
                <p>経歴へ</p>
              </button>
              <button
                className="scroll-button"
                onClick={() =>
                  document
                    .getElementById("other-career-history")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                <span>↓</span>
                <p>その他の経歴へ</p>
              </button>
            </div>

            <div className="detail-item" id="other-career-history">
              <div className="section-bar">
                <hr />
              </div>
              <h3>その他の経歴</h3>

              <div className="timeline-container">
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <div className="school-with-logo">
                        <h4>GeekSalon WebExpertコース 78期受講生</h4>
                      </div>
                      <p className="timeline-date">2024年8月 ~ 2024年10月</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="timeline-container">
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <div className="school-with-logo">
                        <h4>
                          GeekSalon 東京拠点 WebExpertコース
                          メンター（長期インターン）
                        </h4>
                      </div>
                      <p className="timeline-detail">
                        業務内容: プログラミング指導・コース運営,
                        マーケティング, 人事採用・育成活動, 就活セミナー司会者,
                        etc...
                      </p>
                      <p className="timeline-date">2024年12月 ~ 現在</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="timeline-container">
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <div className="school-with-logo">
                        <h4>JANOG56 Meeting 若者支援プログラム</h4>
                      </div>
                      <p className="timeline-date">
                        2025年7月30日 ~ 2025年8月1日
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="scroll-button-container">
              <button
                className="scroll-button"
                onClick={() =>
                  document
                    .getElementById("other-career-history")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                <span>↑</span>
                <p>その他の経歴へ</p>
              </button>
              <button
                className="scroll-button"
                onClick={() =>
                  document
                    .getElementById("qualifications")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                <span>↓</span>
                <p>保有資格へ</p>
              </button>
            </div>
            <div className="detail-item" id="qualifications">
              <div className="section-bar">
                <hr />
              </div>
              <h3>保有資格</h3>
              <ul className="info-list">
                <li>普通自動車第一種運転免許（2020年9月取得）</li>
                <li>基本情報技術者試験（2025年5月合格）</li>
                <li>第三級陸上特殊無線技士（2025年8月取得）</li>
                <li>
                  未だ寂しいですが、資格はこれから頑張って増やしていきます...(┳◇┳)
                </li>
              </ul>
            </div>

            <div className="scroll-button-container">
              <button
                className="scroll-button"
                onClick={() =>
                  document
                    .getElementById("qualifications")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                <span>↑</span>
                <p>保有資格へ</p>
              </button>
              <button
                className="scroll-button"
                onClick={() =>
                  document
                    .getElementById("career-skills")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                <span>↓</span>
                <p>スキルへ</p>
              </button>
            </div>

            <div className="detail-item" id="career-skills">
              <div className="section-bar">
                <hr />
              </div>
              <h3>スキル</h3>

              {/* スキル評価基準 */}
              <div className="skill-evaluation-guide">
                <h4>スキル評価基準</h4>
                <div className="evaluation-criteria">
                  <div className="criteria-item">
                    <span className="criteria-level">未経験者</span>
                    <span className="criteria-range">0%</span>
                    <span className="criteria-description">学習開始前</span>
                  </div>
                  <div className="criteria-item">
                    <span className="criteria-level">初心者</span>
                    <span className="criteria-range">1-25%</span>
                    <span className="criteria-description">学習開始</span>
                  </div>
                  <div className="criteria-item">
                    <span className="criteria-level">初級者</span>
                    <span className="criteria-range">26-50%</span>
                    <span className="criteria-description">基礎理解</span>
                  </div>
                  <div className="criteria-item">
                    <span className="criteria-level">中級者</span>
                    <span className="criteria-range">51-75%</span>
                    <span className="criteria-description">実践レベル</span>
                  </div>
                  <div className="criteria-item">
                    <span className="criteria-level">上級者</span>
                    <span className="criteria-range">76-100%</span>
                    <span className="criteria-description">エキスパート</span>
                  </div>
                </div>
              </div>

              {/* プログラミング言語 */}
              <div className="skills-section">
                <h4>プログラミング言語</h4>
                <div className="skills-grid">
                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/C.png"
                        alt="C"
                        className="skill-icon"
                      />
                      <span className="skill-name">C</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "50%" }}
                        ></div>
                      </div>
                      <span className="progress-text">50%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(50)}`}>
                      {getSkillLevel(50)}
                    </div>
                  </div>

                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/C++.png"
                        alt="C++"
                        className="skill-icon"
                      />
                      <span className="skill-name">C++</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "55%" }}
                        ></div>
                      </div>
                      <span className="progress-text">55%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(55)}`}>
                      {getSkillLevel(55)}
                    </div>
                  </div>

                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/C_sharp.png"
                        alt="C#"
                        className="skill-icon"
                      />
                      <span className="skill-name">C#</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "35%" }}
                        ></div>
                      </div>
                      <span className="progress-text">35%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(35)}`}>
                      {getSkillLevel(35)}
                    </div>
                  </div>

                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/Python.png"
                        alt="Python3"
                        className="skill-icon"
                      />
                      <span className="skill-name">Python3</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "70%" }}
                        ></div>
                      </div>
                      <span className="progress-text">70%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(70)}`}>
                      {getSkillLevel(70)}
                    </div>
                  </div>

                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/JavaScript.png"
                        alt="JavaScript"
                        className="skill-icon"
                      />
                      <span className="skill-name">JavaScript</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "75%" }}
                        ></div>
                      </div>
                      <span className="progress-text">75%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(75)}`}>
                      {getSkillLevel(75)}
                    </div>
                  </div>

                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/TypeScript.png"
                        alt="TypeScript"
                        className="skill-icon"
                      />
                      <span className="skill-name">TypeScript</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "50%" }}
                        ></div>
                      </div>
                      <span className="progress-text">50%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(50)}`}>
                      {getSkillLevel(50)}
                    </div>
                  </div>

                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/Java.png"
                        alt="Java"
                        className="skill-icon"
                      />
                      <span className="skill-name">Java</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "45%" }}
                        ></div>
                      </div>
                      <span className="progress-text">45%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(45)}`}>
                      {getSkillLevel(45)}
                    </div>
                  </div>

                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/R.png"
                        alt="R"
                        className="skill-icon"
                      />
                      <span className="skill-name">R</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "30%" }}
                        ></div>
                      </div>
                      <span className="progress-text">30%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(30)}`}>
                      {getSkillLevel(30)}
                    </div>
                  </div>

                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/VHDL.png"
                        alt="VHDL"
                        className="skill-icon"
                      />
                      <span className="skill-name">VHDL</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "5%" }}
                        ></div>
                      </div>
                      <span className="progress-text">5%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(5)}`}>
                      {getSkillLevel(5)}
                    </div>
                  </div>

                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/SQL.png"
                        alt="SQL"
                        className="skill-icon"
                      />
                      <span className="skill-name">SQL</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "20%" }}
                        ></div>
                      </div>
                      <span className="progress-text">20%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(20)}`}>
                      {getSkillLevel(20)}
                    </div>
                  </div>

                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/HTML.png"
                        alt="HTML"
                        className="skill-icon"
                      />
                      <span className="skill-name">HTML</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "80%" }}
                        ></div>
                      </div>
                      <span className="progress-text">80%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(80)}`}>
                      {getSkillLevel(80)}
                    </div>
                  </div>

                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/CSS.png"
                        alt="CSS"
                        className="skill-icon"
                      />
                      <span className="skill-name">CSS</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "70%" }}
                        ></div>
                      </div>
                      <span className="progress-text">70%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(70)}`}>
                      {getSkillLevel(70)}
                    </div>
                  </div>
                </div>
              </div>

              {/* フレームワーク&ライブラリ */}
              <div className="skills-section">
                <h4>フレームワーク&ライブラリ</h4>
                <div className="skills-grid">
                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/Next.png"
                        alt="Next.js"
                        className="skill-icon"
                      />
                      <span className="skill-name">Next.js</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "40%" }}
                        ></div>
                      </div>
                      <span className="progress-text">40%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(40)}`}>
                      {getSkillLevel(40)}
                    </div>
                  </div>

                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/Node.png"
                        alt="Node.js"
                        className="skill-icon"
                      />
                      <span className="skill-name">Node.js</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "40%" }}
                        ></div>
                      </div>
                      <span className="progress-text">40%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(40)}`}>
                      {getSkillLevel(40)}
                    </div>
                  </div>

                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/React.png"
                        alt="React"
                        className="skill-icon"
                      />
                      <span className="skill-name">React</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "75%" }}
                        ></div>
                      </div>
                      <span className="progress-text">75%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(75)}`}>
                      {getSkillLevel(75)}
                    </div>
                  </div>

                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/Unity.webp"
                        alt="Unity"
                        className="skill-icon"
                      />
                      <span className="skill-name">Unity</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "55%" }}
                        ></div>
                      </div>
                      <span className="progress-text">55%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(55)}`}>
                      {getSkillLevel(55)}
                    </div>
                  </div>
                </div>
              </div>

              {/* データベース */}
              <div className="skills-section">
                <h4>データベース</h4>
                <div className="skills-grid">
                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/MySQL.png"
                        alt="MySQL"
                        className="skill-icon"
                      />
                      <span className="skill-name">MySQL</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "40%" }}
                        ></div>
                      </div>
                      <span className="progress-text">40%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(40)}`}>
                      {getSkillLevel(40)}
                    </div>
                  </div>

                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/InfluxDB.png"
                        alt="InfluxDB"
                        className="skill-icon"
                      />
                      <span className="skill-name">InfluxDB</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "50%" }}
                        ></div>
                      </div>
                      <span className="progress-text">50%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(50)}`}>
                      {getSkillLevel(50)}
                    </div>
                  </div>
                </div>
              </div>

              {/* クラウドプラットフォーム */}
              <div className="skills-section">
                <h4>クラウドプラットフォーム</h4>
                <div className="skills-grid">
                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/AWS.png"
                        alt="AWS"
                        className="skill-icon"
                      />
                      <span className="skill-name">AWS</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "20%" }}
                        ></div>
                      </div>
                      <span className="progress-text">20%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(20)}`}>
                      {getSkillLevel(20)}
                    </div>
                  </div>

                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/Firebase.png"
                        alt="Firebase"
                        className="skill-icon"
                      />
                      <span className="skill-name">Firebase</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "75%" }}
                        ></div>
                      </div>
                      <span className="progress-text">75%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(75)}`}>
                      {getSkillLevel(75)}
                    </div>
                  </div>
                </div>
              </div>

              {/* その他 */}
              <div className="skills-section">
                <h4>その他</h4>
                <div className="skills-grid">
                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/Git.png"
                        alt="Git"
                        className="skill-icon"
                      />
                      <span className="skill-name">Git</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "80%" }}
                        ></div>
                      </div>
                      <span className="progress-text">80%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(80)}`}>
                      {getSkillLevel(80)}
                    </div>
                  </div>

                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/GitHub.png"
                        alt="GitHub"
                        className="skill-icon"
                      />
                      <span className="skill-name">GitHub</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "80%" }}
                        ></div>
                      </div>
                      <span className="progress-text">80%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(80)}`}>
                      {getSkillLevel(80)}
                    </div>
                  </div>

                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/Linux.png"
                        alt="Linux"
                        className="skill-icon"
                      />
                      <span className="skill-name">Linux</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "60%" }}
                        ></div>
                      </div>
                      <span className="progress-text">60%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(60)}`}>
                      {getSkillLevel(60)}
                    </div>
                  </div>

                  <div className="skill-card">
                    <div className="skill-header">
                      <img
                        src="/img/skill/Docker.png"
                        alt="Docker"
                        className="skill-icon"
                      />
                      <span className="skill-name">Docker</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "10%" }}
                        ></div>
                      </div>
                      <span className="progress-text">10%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(10)}`}>
                      {getSkillLevel(10)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="scroll-button-container">
              <button
                className="scroll-button"
                onClick={() =>
                  document
                    .getElementById("career-skills")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                <span>↑</span>
                <p>スキルへ</p>
              </button>
              <button
                className="scroll-button"
                onClick={() =>
                  document
                    .getElementById("hobbies")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                <span>↓</span>
                <p>趣味・興味へ</p>
              </button>
            </div>

            <div className="detail-item" id="hobbies">
              <div className="section-bar">
                <hr />
              </div>
              <h3>趣味・興味</h3>
              <ul className="info-list">
                <li>ガンバ大阪</li>
                <li>阪神タイガース</li>
                <li>お笑い（さらば青春の光, 霜降り明星, ジャルジャルなど）</li>
                <li>温泉・サウナ</li>
                <li>旅行</li>
                <li>写真撮影</li>
                <li>運動</li>
                <li>ドライブ</li>
                <li>動物（実家ではトイプードル飼ってます）</li>
                <li>👆見たら分かるように結構広く浅く多趣味な人間です！</li>
              </ul>
            </div>
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

      {/* Scroll Menu - ヘッダーが見えなくなった時に表示 */}
      {!isHeaderVisible && <ScrollMenu />}

      <Footer />
    </div>
  );
}
