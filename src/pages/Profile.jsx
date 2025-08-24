import Header from "../components/header";
import "../css/Profile.css";
import { useEffect } from "react";

export default function Profile() {
  useEffect(() => {
    // ページが読み込まれた時に上部にスクロール
    window.scrollTo(0, 0);
  }, []);
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
              <ul className="info-list">
                <li>来年からネットワーク業界のエンジニアとして就職予定</li>
                <li>現在長期インターンにてWebサイト制作を勉強中</li>
                <li>JavaScript, React.jsなどのフロントエンド開発</li>
              </ul>
            </div>

            <div className="detail-item">
              <div className="section-bar">
                <hr />
              </div>
              <h3>趣味・興味</h3>
              <p>写真撮影</p>
              <p>Web開発</p>
              <p>ネットワーク技術</p>
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
