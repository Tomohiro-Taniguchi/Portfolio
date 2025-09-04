import Header from "../components/header";
import "../css/Profile.css";
import { useEffect } from "react";

export default function Profile() {
  useEffect(() => {
    // ページが読み込まれた時に上部にスクロール
    window.scrollTo(0, 0);
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
              </div>
            </div>

            <div className="profile-image">
              <img src="/img/JPHacks.jpg" alt="谷口 友浩" />
              <div className="circular-overlay">
                <p>ハッカソンに出場した時の写真です!</p>
              </div>
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
                  「自分の中に毒を持て」
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
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <h4>箕面市立西小学校</h4>
                      <p className="timeline-date">2008年4月 ~ 2014年3月</p>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <h4>箕面市立第一中学校</h4>
                      <p className="timeline-date">2014年4月 ~ 2017年3月</p>
                    </div>
                  </div>

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
                      <p className="timeline-detail">情報セキュリティ研究室</p>
                      <p className="timeline-detail">
                        研究概要：
                        ローカル5G通信における電波伝搬特性/伝送性能の測定と可視化
                      </p>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <div className="school-with-logo">
                        <h4>
                          広島大学大学院 先進理工系科学研究科 先進理工系科学専攻
                        </h4>
                        <img
                          src="/img/HiroshimaUniv.jpg"
                          alt="広島大学学章"
                          className="inline-logo"
                        />
                      </div>
                      <p className="timeline-date">
                        2024年4月 ~ 2026年3月修了予定
                      </p>
                      <p className="timeline-detail">
                        情報科学プログラム 博士課程前期
                      </p>
                      <p className="timeline-detail">情報セキュリティ研究室</p>
                      <p className="timeline-detail">
                        研究概要：
                        広島大学ローカル5G通信におけるデジタルツインネットワークの構築と評価
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
                      <span className="skill-icon">⚡</span>
                      <span className="skill-name">JavaScript</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "60%" }}
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
                      <span className="skill-icon">⚛️</span>
                      <span className="skill-name">React.js</span>
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
                      <span className="skill-icon">🌐</span>
                      <span className="skill-name">HTML/CSS</span>
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
                      <span className="skill-icon">🐍</span>
                      <span className="skill-name">Python</span>
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
                      <span className="skill-icon">☕</span>
                      <span className="skill-name">Java</span>
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
                      <span className="skill-icon">⚙️</span>
                      <span className="skill-name">C/C++</span>
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
                      <span className="skill-icon">🐘</span>
                      <span className="skill-name">PHP</span>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "0%" }}
                        ></div>
                      </div>
                      <span className="progress-text">0%</span>
                    </div>
                    <div className={`skill-level ${getSkillLevelClass(0)}`}>
                      {getSkillLevel(0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* フレームワーク・ツール */}
              <div className="skills-section">
                <h4>フレームワーク・ツール</h4>
                <div className="skills-grid">
                  <div className="skill-card">
                    <div className="skill-header">
                      <span className="skill-icon">🔥</span>
                      <span className="skill-name">Firebase</span>
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
                      <span className="skill-icon">📦</span>
                      <span className="skill-name">Git</span>
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
                </div>
              </div>

              {/* その他のスキル */}
              <div className="skills-section">
                <h4>その他のスキル</h4>
                <ul className="info-list">
                  <li>来年からネットワーク業界のエンジニアとして就職予定</li>
                  <li>現在長期インターンにてWebサイト制作を勉強中</li>
                  <li>JavaScript, React.jsなどのフロントエンド開発</li>
                </ul>
              </div>
            </div>

            <div className="scroll-button-container">
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
                <li>ガンバ大阪サポーター</li>
                <li>阪神ファン</li>
                <li>お笑い（さらば青春の光, 霜降り明星, ジャルジャルなど）</li>
                <li>温泉・サウナ</li>
                <li>旅行</li>
                <li>写真撮影</li>
                <li>運動</li>
                <li>ドライブ</li>
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
    </div>
  );
}
