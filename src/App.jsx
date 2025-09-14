import "./css/App.css";
import Header from "./components/header";
import Footer from "./components/footer";
import ScrollMenu from "./components/ScrollMenu";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { db, storage } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";

// Markdownからテキストを抽出して概要文を生成する関数
const generateSummary = (content, maxLength = 150) => {
  if (!content) return "";

  // Markdownの記法を除去してプレーンテキストに変換
  let text = content
    .replace(/#{1,6}\s+/g, "") // 見出し記法を除去
    .replace(/\*\*(.*?)\*\*/g, "$1") // 太字記法を除去
    .replace(/\*(.*?)\*/g, "$1") // 斜体記法を除去
    .replace(/`(.*?)`/g, "$1") // インラインコード記法を除去
    .replace(/```[\s\S]*?```/g, "") // コードブロックを除去
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // リンク記法を除去
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1") // 画像記法を除去
    .replace(/^[-*+]\s+/gm, "") // リスト記法を除去
    .replace(/^\d+\.\s+/gm, "") // 番号付きリスト記法を除去
    .replace(/\n{3,}/g, "\n\n") // 3つ以上の連続改行を2つに変換
    .replace(/[ \t]+/g, " ") // 連続するスペースやタブを1つに
    .trim();

  // 指定された長さで切り取り
  if (text.length <= maxLength) {
    return text;
  }

  // 単語の境界で切り取り
  let summary = text.substring(0, maxLength);
  const lastSpace = summary.lastIndexOf(" ");
  if (lastSpace > maxLength * 0.8) {
    // 80%以上が単語の境界ならそこで切り取り
    summary = summary.substring(0, lastSpace);
  }

  return summary + "...";
};

function App() {
  const [videoSource, setVideoSource] = useState("/img/cat.mp4");
  const [latestPost, setLatestPost] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [chokoImages, setChokoImages] = useState([]);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
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

  // ページが読み込まれた時に上部にスクロール
  useEffect(() => {
    window.scrollTo(0, 0);
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

  // 最新記事を取得
  useEffect(() => {
    const fetchLatestPost = async () => {
      try {
        // 公開済みの投稿のみを取得
        const q = query(
          collection(db, "blogPosts"),
          where("status", "==", "published")
        );
        const querySnapshot = await getDocs(q);

        const posts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 投稿日順でソート（新しい順）
        const sortedPosts = posts.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });

        // 最新記事を設定
        if (sortedPosts.length > 0) {
          setLatestPost(sortedPosts[0]);
        } else {
        }
      } catch (error) {
        console.error("Error fetching latest post:", error);
        console.error("Error details:", error.message);
        console.error("Error code:", error.code);
      }
    };

    fetchLatestPost();
  }, []);

  // Gallery画像を取得
  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        // Firebase Storageのgallery-imagesフォルダから画像を取得
        const storageRef = ref(storage, "gallery-images");
        const listResult = await listAll(storageRef);

        const imagePromises = listResult.items.map(async (itemRef) => {
          try {
            const url = await getDownloadURL(itemRef);
            const metadata = await getMetadata(itemRef);

            return {
              id: itemRef.name,
              name: itemRef.name.replace(/^\d+_/, ""), // タイムスタンププレフィックスを除去
              url: url,
              size: metadata.size,
              uploadedAt: new Date(metadata.timeCreated),
              path: itemRef.fullPath,
              type: itemRef.name.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i)
                ? "video"
                : "image",
            };
          } catch (error) {
            console.error(
              `Gallery画像情報の取得に失敗 (${itemRef.name}):`,
              error
            );
            return null;
          }
        });

        const images = (await Promise.all(imagePromises)).filter(
          (img) => img !== null
        );

        // アップロード日時でソート（新しい順）し、最新10枚を取得
        const sortedImages = images
          .sort((a, b) => b.uploadedAt - a.uploadedAt)
          .slice(0, 10);

        setGalleryImages(sortedImages);
      } catch (error) {
        console.error("Gallery画像の取得に失敗:", error);
      }
    };

    fetchGalleryImages();
  }, []);

  // Choko画像を取得
  useEffect(() => {
    const fetchChokoImages = async () => {
      try {
        // 画像の存在確認をPromiseでラップする関数
        const checkImageExists = (path) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(path);
            img.onerror = () => reject(new Error(`Image not found: ${path}`));
            img.src = path;
          });
        };

        // 各画像の存在確認を並列で実行
        const imagePromises = [];
        for (let i = 1; i <= 20; i++) {
          const jpgPath = `/img/choko/choko${i}.jpg`;
          const JPGPath = `/img/choko/choko${i}.JPG`;

          // .jpgを先に試し、失敗したら.JPGを試す
          const imagePromise = checkImageExists(jpgPath)
            .catch(() => checkImageExists(JPGPath))
            .then((url) => ({
              id: `choko${i}`,
              url: url,
              name: url.includes(".JPG") ? `choko${i}.JPG` : `choko${i}.jpg`,
            }))
            .catch((error) => {
              return null; // 見つからない場合はnullを返す
            });

          imagePromises.push(imagePromise);
        }

        // 全ての画像チェックが完了するまで待機
        const results = await Promise.all(imagePromises);

        // nullでない画像のみをフィルタリングし、番号順にソート
        const validImages = results
          .filter((img) => img !== null)
          .sort((a, b) => {
            const numA = parseInt(a.id.replace("choko", ""));
            const numB = parseInt(b.id.replace("choko", ""));
            return numA - numB;
          });

        setChokoImages(validImages);
      } catch (error) {
        console.error("Choko画像の取得に失敗:", error);
      }
    };

    fetchChokoImages();
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
        <div className="logo-overlay">
          <img
            src="/img/TTs-lab-hub.png"
            alt="TTs Lab Hub"
            className="overlay-logo"
          />
        </div>
        <Header />
      </div>
      <div className="section-container">
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
                来年からネットワーク業界のエンジニアとして就職予定ですが、現在は東京都目黒区に拠点を構えるベンチャー系IT企業の長期インターン生として、Webサイト制作（JavaScript,React.jsなど）といったフロントエンド開発も勉強中です。
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
              <div className="about-image-container">
                <img src="/img/pic-t-2026.jpg" alt="谷口 友浩" />
                <div className="circular-text">
                  WELCOME <br /> TO MY <br /> PORTFOLIO !
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="section-container">
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
                将来フロントエンド開発を副業として取り組むことにも興味を抱いているので、簡単にWebデザインの勉強もして、React.jsを中心に一からWebサイトをプログラミングで製作してみました。
                <br />
                ポートフォリオサイト×テックブログのような用途を中心としますが、個人的な趣味に関する内容も掲載していければと考えています。
                <br />
                IT分野に興味がある人にとって、少しでも参考になれば幸いです。(ˆ▿ˆ)/
              </p>
            </div>
            <div className="purpose-image">
              <img src="/img/my-icon.jpg" alt="My Icon" />
            </div>
          </div>
        </div>
      </div>

      {/* Blog Section */}
      <div className="homepage-blog-section">
        <div className="section-container">
          <div className="homepage-blog-content">
            <div className="homepage-blog-text">
              <div className="homepage-blog-heading">
                <hr />
                <h1>Blog</h1>
              </div>
              {latestPost ? (
                <>
                  <p className="homepage-blog-subtitle">最新の記事</p>
                  <h2>{latestPost.title}</h2>

                  <div className="homepage-blog-description">
                    {(
                      latestPost.summary ||
                      latestPost.excerpt ||
                      latestPost.description ||
                      generateSummary(latestPost.content) ||
                      "記事の概要を読み込んでいます..."
                    )
                      .split("\n")
                      .map((line, index) => (
                        <p
                          key={index}
                          style={{
                            margin: index === 0 ? "0 0 10px 0" : "10px 0",
                          }}
                        >
                          {line}
                        </p>
                      ))}
                  </div>
                  <div className="homepage-blog-cta">
                    <Link to="/blog" className="nav-link">
                      <div className="cta-button">
                        <span className="arrow">→</span>
                      </div>
                      <span className="cta-text">詳しく見る</span>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h2>記事を読み込み中...</h2>
                  <p className="homepage-blog-subtitle">最新の記事</p>
                  <p className="homepage-blog-description">
                    Firebaseから記事を取得しています。しばらくお待ちください。
                  </p>
                  <div className="homepage-blog-cta">
                    <Link to="/blog" className="nav-link">
                      <div className="cta-button">
                        <span className="arrow">→</span>
                      </div>
                      <span className="cta-text">詳しく見る</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
            <div className="homepage-blog-card">
              {latestPost && (
                <Link
                  to={`/blog/${latestPost.id}`}
                  className="homepage-blog-card-link"
                >
                  <article className="homepage-blog-post-card">
                    {latestPost.featuredImage && (
                      <div className="homepage-post-image">
                        <img
                          src={latestPost.featuredImage}
                          alt="アイキャッチ画像"
                          className="homepage-post-thumbnail"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML =
                              '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999; font-size: 0.9rem;">画像の読み込みに失敗しました</div>';
                          }}
                        />
                      </div>
                    )}
                    <div className="homepage-post-info">
                      <h3 className="homepage-post-title">
                        {latestPost.title}
                      </h3>
                      <div className="homepage-post-meta">
                        <div className="homepage-post-date-container">
                          <span className="homepage-post-date">
                            {latestPost.createdAt?.toDate?.()
                              ? latestPost.createdAt
                                  .toDate()
                                  .toLocaleDateString("ja-JP", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })
                              : "不明"}
                          </span>
                        </div>
                        {latestPost.tags && latestPost.tags.length > 0 && (
                          <div className="homepage-post-tags">
                            {latestPost.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="homepage-tag">
                                {tag}
                              </span>
                            ))}
                            {latestPost.tags.length > 3 && (
                              <span className="homepage-tag-more">
                                +{latestPost.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="homepage-gallery-section">
        <div className="section-container">
          <div className="homepage-gallery-content">
            <div className="homepage-gallery-heading">
              <hr />
              <h1>Gallery</h1>
            </div>

            {galleryImages.length > 0 && (
              <div className="homepage-gallery-flow">
                <div className="homepage-gallery-flow-inner">
                  {[...galleryImages, ...galleryImages, ...galleryImages].map(
                    (image, index) => (
                      <div
                        key={`${image.id}-${index}`}
                        className="homepage-gallery-item"
                      >
                        <div className="homepage-gallery-image-wrapper">
                          {image.type === "video" ? (
                            <video
                              src={image.url}
                              className="homepage-gallery-image"
                              preload="metadata"
                              muted
                              loop
                            />
                          ) : (
                            <img
                              src={image.url}
                              alt={image.name}
                              className="homepage-gallery-image"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.parentElement.innerHTML =
                                  '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999; font-size: 0.9rem;">画像の読み込みに失敗しました</div>';
                              }}
                            />
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="homepage-gallery-cta">
              <Link to="/gallery" className="nav-link">
                <div className="cta-button">
                  <span className="arrow">→</span>
                </div>
                <span className="cta-text">詳しく見る</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* My Dog Section */}
      <div className="homepage-mydog-section">
        <div className="section-container">
          <div className="homepage-mydog-content">
            <div className="homepage-mydog-heading">
              <hr />
              <h1>My Dog</h1>
            </div>

            {chokoImages.length > 0 ? (
              <div className="homepage-mydog-flow">
                <div className="homepage-mydog-flow-inner">
                  {[...chokoImages, ...chokoImages, ...chokoImages].map(
                    (image, index) => (
                      <div
                        key={`${image.id}-${index}`}
                        className="homepage-mydog-item"
                      >
                        <div className="homepage-mydog-image-wrapper">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="homepage-mydog-image"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.innerHTML =
                                '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999; font-size: 0.9rem;">画像の読み込みに失敗しました</div>';
                            }}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#666",
                  background: "#f8f9fa",
                  borderRadius: "10px",
                }}
              >
                <p>チョコの画像を読み込み中...</p>
                <p>画像数: {chokoImages.length}枚</p>
              </div>
            )}

            <div className="homepage-mydog-info">
              <div className="mydog-card">
                <div className="mydog-card-header">
                  <h2>チョコ</h2>
                </div>
                <div className="mydog-card-content">
                  <div className="mydog-info-item">
                    <span className="mydog-info-label">性別　　：</span>
                    <span className="mydog-info-value female">♀（女の子）</span>
                  </div>
                  <div className="mydog-info-item">
                    <span className="mydog-info-label">犬種　　：</span>
                    <span className="mydog-info-value">トイ・プードル</span>
                  </div>
                  <div className="mydog-info-item">
                    <span className="mydog-info-label">生年月日：</span>
                    <span className="mydog-info-value">2011年7月24日</span>
                  </div>
                  <div className="mydog-info-item">
                    <span className="mydog-info-label">出生地　：</span>
                    <span className="mydog-info-value">香川県</span>
                  </div>
                  <div className="mydog-info-item">
                    <span className="mydog-info-label">性格　　：</span>
                    <span className="mydog-info-value">
                      昼寝・ご飯・走り回るのが大好き。
                      <br />
                      結構犬見知りするけど、人懐っこい性格。
                      <br />
                      自分が小学生の頃から一緒に成長したので、妹みたいな大切な家族です。
                      <br />
                      今は自分が実家の大阪を離れているので、帰省した時しか会えていないです...。
                    </span>
                  </div>
                </div>
              </div>
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

export default App;
