import Header from "../components/header";
import Footer from "../components/footer";
import ScrollMenu from "../components/ScrollMenu";
import "../css/Blog.css";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useParams, useNavigate, useLocation } from "react-router";

// カスタム画像コンポーネント（キャプション付き）
const CustomImage = ({ src, alt, title, width, height, style }) => {
  // カスタム記法の解析: ![alt|scale=0.5](url "title")
  const parseImageScale = (altText) => {
    // scale指定の解析: |scale=0.5のような形式
    const scaleMatch = altText.match(/\|scale=(\d*\.?\d+)/);
    if (scaleMatch) {
      const scale = parseFloat(scaleMatch[1]);
      return {
        scale: scale,
        alt: altText.replace(/\|scale=\d*\.?\d+/, ""), // scale部分を除去
      };
    }
    return { alt: altText };
  };

  const scaleInfo = parseImageScale(alt);
  const finalAlt = scaleInfo.alt;
  const scale = scaleInfo.scale;

  return (
    <span
      className="custom-image-container"
      style={{
        transform: scale ? `scale(${scale})` : undefined,
        transformOrigin: scale ? "center" : undefined,
        display: "inline-block",
        width: "100%",
        textAlign: "center",
      }}
    >
      <img
        src={src}
        alt={finalAlt}
        className="custom-image"
        width={width}
        height={height}
        style={{
          ...style,
          transform: "none", // 画像自体のtransformは削除
        }}
      />
      {title && <span className="image-caption">{title}</span>}
    </span>
  );
};

// 日本語文字をローマ字に変換する関数
const convertToRomanizedId = (text) => {
  const japaneseToRoman = {
    あ: "a",
    い: "i",
    う: "u",
    え: "e",
    お: "o",
    か: "ka",
    き: "ki",
    く: "ku",
    け: "ke",
    こ: "ko",
    さ: "sa",
    し: "shi",
    す: "su",
    せ: "se",
    そ: "so",
    た: "ta",
    ち: "chi",
    つ: "tsu",
    て: "te",
    と: "to",
    な: "na",
    に: "ni",
    ぬ: "nu",
    ね: "ne",
    の: "no",
    は: "ha",
    ひ: "hi",
    ふ: "fu",
    へ: "he",
    ほ: "ho",
    ま: "ma",
    み: "mi",
    む: "mu",
    め: "me",
    も: "mo",
    や: "ya",
    ゆ: "yu",
    よ: "yo",
    ら: "ra",
    り: "ri",
    る: "ru",
    れ: "re",
    ろ: "ro",
    わ: "wa",
    を: "wo",
    ん: "n",
    が: "ga",
    ぎ: "gi",
    ぐ: "gu",
    げ: "ge",
    ご: "go",
    ざ: "za",
    じ: "ji",
    ず: "zu",
    ぜ: "ze",
    ぞ: "zo",
    だ: "da",
    ぢ: "ji",
    づ: "zu",
    で: "de",
    ど: "do",
    ば: "ba",
    び: "bi",
    ぶ: "bu",
    べ: "be",
    ぼ: "bo",
    ぱ: "pa",
    ぴ: "pi",
    ぷ: "pu",
    ぺ: "pe",
    ぽ: "po",
    きゃ: "kya",
    きゅ: "kyu",
    きょ: "kyo",
    しゃ: "sha",
    しゅ: "shu",
    しょ: "sho",
    ちゃ: "cha",
    ちゅ: "chu",
    ちょ: "cho",
    にゃ: "nya",
    にゅ: "nyu",
    にょ: "nyo",
    ひゃ: "hya",
    ひゅ: "hyu",
    ひょ: "hyo",
    みゃ: "mya",
    みゅ: "myu",
    みょ: "myo",
    りゃ: "rya",
    りゅ: "ryu",
    りょ: "ryo",
    ぎゃ: "gya",
    ぎゅ: "gyu",
    ぎょ: "gyo",
    じゃ: "ja",
    じゅ: "ju",
    じょ: "jo",
    びゃ: "bya",
    びゅ: "byu",
    びょ: "byo",
    ぴゃ: "pya",
    ぴゅ: "pyu",
    ぴょ: "pyo",
    部: "bu",
    目: "me",
    次: "ji",
    始: "shi",
    め: "me",
    に: "ni",
  };

  let result = text.toLowerCase();

  // 2文字の組み合わせを先に処理
  for (const [japanese, roman] of Object.entries(japaneseToRoman)) {
    if (japanese.length === 2) {
      result = result.replace(new RegExp(japanese, "g"), roman);
    }
  }

  // 1文字の組み合わせを処理
  for (const [japanese, roman] of Object.entries(japaneseToRoman)) {
    if (japanese.length === 1) {
      result = result.replace(new RegExp(japanese, "g"), roman);
    }
  }

  // 残りの文字を除去し、ハイフンに変換
  result = result
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return result || "section";
};

// カスタム見出しコンポーネント
const CustomHeading = ({ level, children, ...props }) => {
  const HeadingTag = `h${level}`;
  const id = convertToRomanizedId(children?.toString() || "");

  // 目次見出しの場合は特別なクラスを付与
  const isToc = children?.toString() === "目次";
  const className = isToc ? "toc-heading" : "";

  return (
    <HeadingTag id={id} className={className} {...props}>
      {children}
    </HeadingTag>
  );
};

// カスタム下線コンポーネント
const CustomUnderline = ({ children, ...props }) => {
  return (
    <u
      style={{
        textDecoration: "underline",
        textDecorationColor: "#6592c6", // 元の青色に戻す
        textDecorationThickness: "2px",
        textUnderlineOffset: "3px",
      }}
      {...props}
    >
      {children}
    </u>
  );
};

const CustomSpan = ({ children, ...props }) => {
  return (
    <span
      style={{
        color: "red",
      }}
      {...props}
    >
      {children}
    </span>
  );
};

// カスタム数式コンポーネント
const CustomMath = ({ children, className }) => {
  const [rendered, setRendered] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const renderMath = async () => {
      try {
        setError("");

        // KaTeXが読み込まれているかチェック
        if (typeof window.katex === "undefined") {
          // KaTeX CDNを動的に読み込み
          const script = document.createElement("script");
          script.src =
            "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
          script.onload = () => {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href =
              "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
            document.head.appendChild(link);

            // 数式をレンダリング
            try {
              const html = window.katex.renderToString(children, {
                throwOnError: false,
                displayMode: className === "math-display",
              });
              setRendered(html);
            } catch (err) {
              setError("数式のレンダリングに失敗しました: " + err.message);
            }
          };
          script.onerror = () => {
            setError("KaTeXの読み込みに失敗しました");
          };
          document.head.appendChild(script);
        } else {
          // KaTeXが既に読み込まれている場合
          const html = window.katex.renderToString(children, {
            throwOnError: false,
            displayMode: className === "math-display",
          });
          setRendered(html);
        }
      } catch (err) {
        setError("数式のレンダリングに失敗しました: " + err.message);
      }
    };

    if (children) {
      renderMath();
    }
  }, [children, className]);

  if (error) {
    return <div style={{ padding: "10px", color: "red" }}>{error}</div>;
  }

  if (!rendered) {
    return <div style={{ padding: "10px" }}>数式をレンダリング中...</div>;
  }

  return (
    <div
      className={className === "math-display" ? "math-display" : "math-inline"}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  );
};

// CustomSummaryコンポーネントを削除（不要になったため）
// const CustomSummary = ({ children, ...props }) => {
//   return (
//     <summary
//       style={{
//         background: "#f8f9fa",
//         color: "#333",
//         padding: "12px 16px",
//         cursor: "pointer",
//         fontWeight: "400",
//         fontSize: "1rem",
//         userSelect: "none",
//         listStyle: "none", // デフォルトのマーカーを非表示
//         display: "flex",
//         alignItems: "center",
//         gap: "8px",
//       }}
//       {...props}
//     >
//       <span
//         style={{
//           width: "0",
//           height: "0",
//           borderLeft: "4px solid #333",
//           borderTop: "3px solid transparent",
//           borderBottom: "3px solid transparent",
//           transition: "transform 0.2s ease",
//         }}
//       />
//       {children}
//     </summary>
//   );
// };

// カスタムリンクコンポーネント（目次用）
const CustomLink = ({ href, children, ...props }) => {
  const handleClick = (e) => {
    // 目次リンクの場合（#で始まる場合）
    if (href && href.startsWith("#")) {
      e.preventDefault();

      // URLエンコードされた文字をデコード（最初に実行）
      let targetId = decodeURIComponent(href);

      // ##で始まる場合は、##を除去してIDを生成
      if (targetId.startsWith("##")) {
        targetId = targetId.substring(2); // ##を除去
        // 日本語文字をIDに変換
        targetId = convertToRomanizedId(targetId);
      } else if (targetId.startsWith("#")) {
        // 通常の#リンクの場合
        targetId = targetId.substring(1); // #を除去
      }

      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        // スムーズスクロール
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};

export default function Blog() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" or "oldest"
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    title: "",
    dateFrom: "",
    dateTo: "",
    tags: [],
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(9); // 3×3のグリッド表示
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isPaginationTransition, setIsPaginationTransition] = useState(false);
  const { postId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // ページが読み込まれた時に上部にスクロール
    window.scrollTo(0, 0);
    fetchBlogPosts();
  }, []);

  // ブラウザのスクロール位置復元を無効化
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  // ページネーション時のスクロール位置制御
  useEffect(() => {
    // ページネーション時のみ最下部にスクロール
    if (isPaginationTransition) {
      // 即座に最下部にスクロール（アニメーションなし）
      const scrollToBottom = () => {
        // 複数の方法で最下部を取得し、最も確実な値を選択
        const maxHeight = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight,
          document.body.clientHeight,
          document.documentElement.clientHeight
        );

        // 即座にスクロール（アニメーションなし）
        window.scrollTo({
          top: maxHeight,
          left: 0,
          behavior: "instant",
        });
      };

      // 複数回実行して確実にスクロール
      scrollToBottom();
      requestAnimationFrame(scrollToBottom);
      setTimeout(scrollToBottom, 0);
      setTimeout(scrollToBottom, 10);
    }
  }, [currentPage, isPaginationTransition]);

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

  useEffect(() => {
    // URLパラメータから記事を取得
    if (postId && blogPosts.length > 0) {
      const post = blogPosts.find((p) => p.id === postId);
      if (post) {
        setSelectedPost(post);
      } else {
        // 記事が見つからない場合は一覧に戻る
        navigate("/blog");
      }
    } else if (!postId) {
      setSelectedPost(null);
    }
  }, [postId, blogPosts, navigate]);

  const fetchBlogPosts = async () => {
    setIsLoading(true);
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

      setBlogPosts(sortedPosts);
      setCurrentPage(1); // 投稿リストが更新されたら1ページ目に戻す

      // 利用可能なタグを取得
      const allTags = new Set();
      posts.forEach((post) => {
        if (post.tags) {
          post.tags.forEach((tag) => allTags.add(tag));
        }
      });
      setAvailableTags(Array.from(allTags).sort());
    } catch (error) {
      console.error("ブログ記事の取得に失敗:", error);
      console.error("エラーの詳細:", error.message);
      console.error("エラーコード:", error.code);
      setError(`ブログ記事の取得に失敗しました: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostClick = (post) => {
    navigate(`/blog/${post.id}`);
    window.scrollTo(0, 0);
  };

  const handleBackToList = () => {
    navigate("/blog");
  };

  const handleSortChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
    const sortedPosts = [...blogPosts].sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return newSortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
    setBlogPosts(sortedPosts);
    setCurrentPage(1); // 並び替え時に1ページ目に戻す
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTagToggle = (tag) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const applyFilters = () => {
    let filteredPosts = [...blogPosts];

    // タイトルで絞り込み
    if (filters.title) {
      filteredPosts = filteredPosts.filter((post) =>
        post.title.toLowerCase().includes(filters.title.toLowerCase())
      );
    }

    // 日付範囲で絞り込み
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filteredPosts = filteredPosts.filter((post) => {
        const postDate = post.createdAt?.toDate?.() || new Date(0);
        return postDate >= fromDate;
      });
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filteredPosts = filteredPosts.filter((post) => {
        const postDate = post.createdAt?.toDate?.() || new Date(0);
        return postDate <= toDate;
      });
    }

    // タグで絞り込み
    if (filters.tags.length > 0) {
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.tags && filters.tags.some((tag) => post.tags.includes(tag))
      );
    }

    // 並び替えを適用
    const sortedPosts = filteredPosts.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setBlogPosts(sortedPosts);
    setCurrentPage(1); // 絞り込み時に1ページ目に戻す
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilters({
      title: "",
      dateFrom: "",
      dateTo: "",
      tags: [],
    });
    fetchBlogPosts(); // 元の記事一覧を再取得
    setCurrentPage(1); // 絞り込み解除時に1ページ目に戻す
    setShowFilterModal(false);
  };

  const isFilterActive = () => {
    return (
      filters.title ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.tags.length > 0
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "不明";
    return timestamp.toDate().toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ページネーション用の関数
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = blogPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(blogPosts.length / postsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      // ページネーション開始：transitionを無効化
      setIsPaginationTransition(true);
      setCurrentPage(currentPage + 1);

      // transitionを再有効化（useEffectでスクロール処理を行うため）
      setTimeout(() => {
        setIsPaginationTransition(false);
      }, 200);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      // ページネーション開始：transitionを無効化
      setIsPaginationTransition(true);
      setCurrentPage(currentPage - 1);

      // transitionを再有効化（useEffectでスクロール処理を行うため）
      setTimeout(() => {
        setIsPaginationTransition(false);
      }, 200);
    }
  };

  const goToPage = (pageNumber) => {
    // ページネーション開始：transitionを無効化
    setIsPaginationTransition(true);
    setCurrentPage(pageNumber);

    // transitionを再有効化（useEffectでスクロール処理を行うため）
    setTimeout(() => {
      setIsPaginationTransition(false);
    }, 200);
  };

  if (isLoading) {
    return (
      <div className="blog-container">
        <Header />
        <div className="blog-content">
          <div className="loading-container">
            <p>ブログ記事を読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-container">
        <Header />
        <div className="blog-content">
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // 個別記事表示
  if (selectedPost) {
    return (
      <div className="blog-container">
        <Header />
        <div className="blog-content">
          <div className="blog-post-detail">
            <button onClick={handleBackToList} className="back-button">
              ← 記事一覧へ
            </button>

            <article className="post-content">
              <header className="post-header">
                <h1>{selectedPost.title}</h1>
              </header>

              <div className="post-meta">
                <div className="post-dates">
                  <span className="post-date">
                    投稿日: {formatDate(selectedPost.createdAt)}
                  </span>
                  {selectedPost.updatedAt &&
                    selectedPost.updatedAt !== selectedPost.createdAt && (
                      <span className="post-update-date">
                        更新日: {formatDate(selectedPost.updatedAt)}
                      </span>
                    )}
                </div>

                {selectedPost.tags && selectedPost.tags.length > 0 && (
                  <div className="post-tags">
                    {selectedPost.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {selectedPost.featuredImage && (
                <div className="featured-image-container">
                  <img
                    src={selectedPost.featuredImage}
                    alt="アイキャッチ画像"
                    className="featured-image"
                  />
                </div>
              )}

              <div className="post-body">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: (props) => <CustomHeading level={1} {...props} />,
                    h2: (props) => <CustomHeading level={2} {...props} />,
                    h3: (props) => <CustomHeading level={3} {...props} />,
                    h4: (props) => <CustomHeading level={4} {...props} />,
                    h5: (props) => <CustomHeading level={5} {...props} />,
                    h6: (props) => <CustomHeading level={6} {...props} />,
                    a: (props) => <CustomLink {...props} />,
                    u: (props) => <CustomUnderline {...props} />,
                    span: (props) => <CustomSpan {...props} />,
                    img: (props) => <CustomImage {...props} />,
                    code: ({ node, inline, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || "");
                      const language = match ? match[1] : "";

                      // 数式の場合
                      if (language === "math") {
                        return (
                          <CustomMath className="math-display" {...props}>
                            {children}
                          </CustomMath>
                        );
                      }

                      // 通常のコードブロック
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {selectedPost.content}
                </ReactMarkdown>
              </div>
            </article>
          </div>
        </div>
      </div>
    );
  }

  // 記事一覧表示
  return (
    <div className="blog-container">
      <Header />
      <div className="blog-content">
        <div className="blog-heading">
          <hr />
          <h1>Blog</h1>
        </div>

        {blogPosts.length > 0 && (
          <div className="sort-controls">
            <span className="sort-label">並び替え:</span>
            <select
              value={sortOrder}
              onChange={(e) => handleSortChange(e.target.value)}
              className="sort-select"
            >
              <option value="newest">投稿日が新しい順</option>
              <option value="oldest">投稿日が古い順</option>
            </select>
            <button
              onClick={() => setShowFilterModal(true)}
              className="filter-button"
            >
              絞り込み
            </button>
            {isFilterActive() && (
              <button onClick={clearFilters} className="clear-filter-button">
                絞り込み解除
              </button>
            )}
          </div>
        )}

        {blogPosts.length === 0 ? (
          <div className="no-posts">
            <p>まだブログ記事がありません</p>
          </div>
        ) : (
          <div
            className={`blog-posts-grid ${
              isPaginationTransition ? "no-transition" : ""
            }`}
          >
            {currentPosts.map((post) => (
              <article
                key={post.id}
                className={`blog-post-card ${
                  isPaginationTransition ? "no-transition" : ""
                }`}
                onClick={() => handlePostClick(post)}
              >
                {post.featuredImage && (
                  <div className="post-image">
                    <img
                      src={post.featuredImage}
                      alt="アイキャッチ画像"
                      className="post-thumbnail"
                    />
                  </div>
                )}

                <div className="post-info">
                  <h2 className="post-title">{post.title}</h2>

                  <div className="post-meta">
                    <div className="post-date-container">
                      <span className="post-date">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>

                    {post.tags && post.tags.length > 0 && (
                      <div className="post-tags">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="tag">
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="tag-more">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ページネーション */}
        {blogPosts.length > 0 && (
          <div className="pagination">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="pagination-button prev-button"
              title="前のページ"
            >
              ←
            </button>

            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`page-number ${
                      currentPage === page ? "active" : ""
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="pagination-button next-button"
              title="次のページ"
            >
              →
            </button>
          </div>
        )}

        <div className="posts-info">
          <p>
            全 {blogPosts.length} 件中 {indexOfFirstPost + 1} -{" "}
            {Math.min(indexOfLastPost, blogPosts.length)} 件を表示
          </p>
        </div>
      </div>

      {/* 絞り込みモーダル */}
      {showFilterModal && (
        <div
          className="filter-modal-overlay"
          onClick={() => setShowFilterModal(false)}
        >
          <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="filter-modal-header">
              <h3>絞り込み設定</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="close-button"
              >
                ×
              </button>
            </div>

            <div className="filter-modal-content">
              {/* タイトル検索 */}
              <div className="filter-section">
                <label>タイトル検索:</label>
                <input
                  type="text"
                  value={filters.title}
                  onChange={(e) => handleFilterChange("title", e.target.value)}
                  placeholder="タイトルを入力..."
                  className="filter-input"
                />
              </div>

              {/* 日付範囲 */}
              <div className="filter-section">
                <label>投稿日範囲:</label>
                <div className="date-range">
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      handleFilterChange("dateFrom", e.target.value)
                    }
                    className="filter-input"
                  />
                  <span>〜</span>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      handleFilterChange("dateTo", e.target.value)
                    }
                    className="filter-input"
                  />
                </div>
              </div>

              {/* タグ選択 */}
              <div className="filter-section">
                <label>タグ選択:</label>
                <div className="tag-selection">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`tag-button ${
                        filters.tags.includes(tag) ? "selected" : ""
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="filter-modal-footer">
              <button onClick={clearFilters} className="clear-button">
                クリア
              </button>
              <button onClick={applyFilters} className="apply-button">
                適用
              </button>
            </div>
          </div>
        </div>
      )}

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
