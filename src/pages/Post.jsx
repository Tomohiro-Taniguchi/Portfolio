import Header from "../components/header";
import "../css/Post.css";
import { useEffect, useState } from "react";
import { auth, db, storage } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

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
        console.log("CustomMath rendering:", children);

        // KaTeXが読み込まれているかチェック
        if (typeof window.katex === "undefined") {
          console.log("KaTeX not loaded, loading from CDN...");
          // KaTeX CDNを動的に読み込み
          const script = document.createElement("script");
          script.src =
            "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
          script.onload = () => {
            console.log("KaTeX script loaded");
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href =
              "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
            document.head.appendChild(link);

            // 数式をレンダリング
            try {
              console.log("Rendering math:", children);
              const html = window.katex.renderToString(children, {
                throwOnError: false,
                displayMode: className === "math-display",
              });
              console.log("Rendered HTML:", html);
              setRendered(html);
            } catch (err) {
              console.error("KaTeX rendering error:", err);
              setError("数式のレンダリングに失敗しました: " + err.message);
            }
          };
          script.onerror = () => {
            console.error("Failed to load KaTeX script");
            setError("KaTeXの読み込みに失敗しました");
          };
          document.head.appendChild(script);
        } else {
          console.log("KaTeX already loaded, rendering...");
          // KaTeXが既に読み込まれている場合
          const html = window.katex.renderToString(children, {
            throwOnError: false,
            displayMode: className === "math-display",
          });
          console.log("Rendered HTML:", html);
          setRendered(html);
        }
      } catch (err) {
        console.error("CustomMath error:", err);
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
    console.log("CustomLink clicked - href:", href);

    // 目次リンクの場合（#で始まる場合）
    if (href && href.startsWith("#")) {
      e.preventDefault();

      // URLエンコードされた文字をデコード（最初に実行）
      let targetId = decodeURIComponent(href);
      console.log("After URL decode:", targetId);

      // ##で始まる場合は、##を除去してIDを生成
      if (targetId.startsWith("##")) {
        targetId = targetId.substring(2); // ##を除去
        console.log("After removing ##:", targetId);
        // 日本語文字をIDに変換
        targetId = convertToRomanizedId(targetId);
        console.log("Final targetId:", targetId);
      } else if (targetId.startsWith("#")) {
        // 通常の#リンクの場合
        targetId = targetId.substring(1); // #を除去
        console.log("After removing #:", targetId);
      }

      const targetElement = document.getElementById(targetId);
      console.log("Target element found:", targetElement);

      if (targetElement) {
        // スムーズスクロール
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        console.log("Scrolling to element");
      } else {
        console.log(
          "Target element not found. Available IDs:",
          Array.from(document.querySelectorAll("[id]")).map((el) => el.id)
        );
      }
    }
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};

export default function Post() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [blogPost, setBlogPost] = useState({
    title: "",
    content: "",
    tags: "",
    featuredImage: "",
    permalink: "",
    description: "",
    status: "draft",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blogPosts, setBlogPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setIsLoading(false);

        // ログインしていない場合はリダイレクト
        if (!user) {
          navigate("/admin");
          return;
        }
      },
      (error) => {
        // 認証エラーの処理
        setError("認証エラーが発生しました");
        setIsLoading(false);
        navigate("/admin");
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  // 投稿リストを取得
  useEffect(() => {
    if (user) {
      fetchBlogPosts();
    }
  }, [user]);

  const fetchBlogPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const querySnapshot = await getDocs(collection(db, "blogPosts"));
      const posts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBlogPosts(posts);
    } catch (error) {
      console.error("投稿リストの取得に失敗:", error);
      setError("投稿リストの取得に失敗しました");
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate("/admin");
    } catch (error) {
      setError("ログアウトに失敗しました");
      console.error("ログアウトに失敗しました", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBlogPost((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generatePermalink = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-");
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setBlogPost((prev) => ({
      ...prev,
      title,
      permalink: generatePermalink(title),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!blogPost.title.trim() || !blogPost.content.trim()) {
      setError("タイトルと内容を入力してください");
      return;
    }

    setIsSubmitting(true);
    try {
      // 画像をアップロード
      let imageURL = blogPost.featuredImage; // 既存のURLがある場合
      if (imageFile) {
        imageURL = await uploadImage();
        if (!imageURL) {
          setIsSubmitting(false);
          return;
        }
      }

      const postData = {
        ...blogPost,
        featuredImage: imageURL,
        authorId: user.uid,
        authorName: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tags: blogPost.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        status: blogPost.status || "draft",
      };

      const docRef = await addDoc(collection(db, "blogPosts"), postData);
      alert("投稿が完了しました！");

      // フォームをリセット
      setBlogPost({
        title: "",
        content: "",
        tags: "",
        featuredImage: "",
        permalink: "",
        description: "",
        status: "draft",
      });
      setImageFile(null);
      setImagePreview("");

      // 投稿リストを更新
      fetchBlogPosts();
    } catch (error) {
      console.error("詳細な投稿エラー:", error);
      console.error("エラーコード:", error.code);
      console.error("エラーメッセージ:", error.message);

      let errorMessage = "投稿に失敗しました";

      // Firebase特有のエラーコードに基づく詳細メッセージ
      if (error.code === "permission-denied") {
        errorMessage =
          "権限がありません。Firestoreのセキュリティルールを確認してください。";
      } else if (error.code === "unavailable") {
        errorMessage =
          "Firebaseサービスが利用できません。ネットワーク接続を確認してください。";
      } else if (error.code === "unauthenticated") {
        errorMessage = "認証が必要です。再度ログインしてください。";
      } else {
        errorMessage = `投稿に失敗しました: ${error.message}`;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setBlogPost({
      title: post.title,
      content: post.content,
      tags: post.tags.join(", "),
      featuredImage: post.featuredImage || "",
      permalink: post.permalink || "",
      description: post.description || "",
      status: post.status || "draft",
    });
    setImageFile(null);
    setImagePreview(post.featuredImage || "");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingPost) return;

    setIsSubmitting(true);
    try {
      // 画像をアップロード
      let imageURL = blogPost.featuredImage; // 既存のURLがある場合
      if (imageFile) {
        imageURL = await uploadImage();
        if (!imageURL) {
          setIsSubmitting(false);
          return;
        }
      }

      const postData = {
        ...blogPost,
        featuredImage: imageURL,
        tags: blogPost.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, "blogPosts", editingPost.id), postData);
      alert("投稿が更新されました！");

      // フォームと編集状態をリセット
      setBlogPost({
        title: "",
        content: "",
        tags: "",
        featuredImage: "",
        permalink: "",
        description: "",
        status: "draft",
      });
      setEditingPost(null);
      setImageFile(null);
      setImagePreview("");

      // 投稿リストを更新
      fetchBlogPosts();
    } catch (error) {
      console.error("更新エラー:", error);
      setError("投稿の更新に失敗しました: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm("この投稿を削除しますか？この操作は取り消せません。")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "blogPosts", postId));
      alert("投稿が削除されました！");

      // 投稿リストを更新
      fetchBlogPosts();
    } catch (error) {
      console.error("削除エラー:", error);
      setError("投稿の削除に失敗しました: " + error.message);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // ファイルサイズチェック（5MB以下）
      if (file.size > 5 * 1024 * 1024) {
        setError("画像ファイルは5MB以下にしてください");
        return;
      }

      // ファイル形式チェック
      if (!file.type.startsWith("image/")) {
        setError("画像ファイルを選択してください");
        return;
      }

      setImageFile(file);

      // プレビュー表示
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    setIsUploadingImage(true);
    try {
      const timestamp = Date.now();
      const fileName = `blog-images/${timestamp}_${imageFile.name}`;
      const storageRef = ref(storage, fileName);

      const snapshot = await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error) {
      console.error("画像アップロードエラー:", error);
      setError("画像のアップロードに失敗しました");
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setBlogPost({
      title: "",
      content: "",
      tags: "",
      featuredImage: "",
      permalink: "",
      description: "",
      status: "draft",
    });
    setImageFile(null);
    setImagePreview("");
  };

  // ログインしていない場合は適切な案内を表示
  if (!user) {
    return (
      <div className="post-container">
        <Header />
        <div className="post-content">
          <h1>認証が必要です</h1>
          <p>このページにアクセスするにはログインが必要です。</p>
          <button
            onClick={() => navigate("/admin")}
            className="login-redirect-button"
          >
            ログインページへ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="post-container">
      <Header />
      <div className="post-content">
        <h1>Post</h1>
        {error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={() => setError("")} className="error-close-button">
              閉じる
            </button>
          </div>
        )}
        {isLoading ? (
          <div className="loading-container">
            <p>認証状態を確認中...</p>
          </div>
        ) : (
          <>
            <div className="blog-sections">
              {/* ブログ投稿入力フォーム */}
              <div className="blog-form-section">
                <h2>ブログ投稿</h2>
                <form
                  onSubmit={editingPost ? handleUpdate : handleSubmit}
                  className="blog-form"
                >
                  {/* タイトル入力 */}
                  <div className="form-group">
                    <label htmlFor="title">タイトル</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={blogPost.title}
                      onChange={handleTitleChange}
                      placeholder="記事のタイトルを入力してください"
                      required
                    />
                  </div>

                  {/* 説明文 */}
                  <div className="form-group">
                    <label htmlFor="description">説明文（SEO用）</label>
                    <textarea
                      id="description"
                      name="description"
                      value={blogPost.description}
                      onChange={handleInputChange}
                      placeholder="記事の概要を入力してください（検索結果に表示されます）"
                      rows="3"
                    />
                    <small className="form-help">
                      検索結果やSNSシェア時に表示される説明文です。サイト内には表示されません。
                    </small>
                  </div>

                  {/* タグ入力 */}
                  <div className="form-group">
                    <label htmlFor="tags">タグ（カンマ区切り）</label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={blogPost.tags}
                      onChange={handleInputChange}
                      placeholder="例: 技術, React, プログラミング"
                    />
                  </div>

                  {/* トップ画像 */}
                  <div className="form-group">
                    <label htmlFor="featuredImage">トップ画像</label>
                    <input
                      type="file"
                      id="featuredImage"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file-input"
                    />
                    <small className="form-help">
                      画像ファイルを選択してください（5MB以下、JPG、PNG、GIF対応）
                    </small>

                    {/* プレビュー表示 */}
                    {(imagePreview || blogPost.featuredImage) && (
                      <div className="image-preview">
                        <img
                          src={imagePreview || blogPost.featuredImage}
                          alt="プレビュー"
                          className="preview-image"
                        />
                        {isUploadingImage && (
                          <div className="upload-loading">
                            <p>画像をアップロード中...</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 投稿ステータス */}
                  <div className="form-group">
                    <label htmlFor="status">投稿ステータス</label>
                    <select
                      id="status"
                      name="status"
                      value={blogPost.status}
                      onChange={handleInputChange}
                    >
                      <option value="draft">下書き</option>
                      <option value="published">公開</option>
                      <option value="private">非公開</option>
                    </select>
                  </div>

                  {/* 内容入力 */}
                  <div className="form-group">
                    <label htmlFor="content">内容（Markdown記法対応）</label>
                    <textarea
                      id="content"
                      name="content"
                      value={blogPost.content}
                      onChange={handleInputChange}
                      placeholder="Markdown記法で記事を書いてください

## 目次
- [はじめに](#はじめに)
- [1部](#1部)
- [2部](#2部)
- [3部](#3部)
- [4部](#4部)
- [5部](#5部)

---

## はじめに
ここに内容を書きます...

## 1部
1部の内容...

## 2部
2部の内容...

## 3部
3部の内容...

## 4部
4部の内容...

## 5部
5部の内容..."
                      required
                      rows="15"
                    />
                  </div>

                  {/* 投稿・更新ボタン */}
                  <div className="button-group">
                    <button
                      type="submit"
                      className="submit-button"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? editingPost
                          ? "更新中..."
                          : "投稿中..."
                        : editingPost
                        ? "更新する"
                        : "投稿する"}
                    </button>

                    {editingPost && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="cancel-button"
                        disabled={isSubmitting}
                      >
                        キャンセル
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* プレビュー */}
              <div className="blog-preview-section">
                <h2>プレビュー</h2>
                <div className="markdown-preview">
                  {blogPost.title && <h1>{blogPost.title}</h1>}
                  {blogPost.featuredImage && (
                    <img
                      src={blogPost.featuredImage}
                      alt="アイキャッチ画像"
                      className="featured-image"
                    />
                  )}
                  {/* SEO説明文はサイト内表示しない */}
                  {blogPost.tags && (
                    <div className="tags">
                      {blogPost.tags.split(",").map((tag, index) => (
                        <span key={index} className="tag">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
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
                      code: ({
                        node,
                        inline,
                        className,
                        children,
                        ...props
                      }) => {
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
                    {blogPost.content}
                  </ReactMarkdown>
                </div>
              </div>

              {/* ユーザー情報 */}
              <div className="user-info-section">
                <h3>ログイン情報</h3>
                <p>
                  <strong>メールアドレス:</strong> {user?.email}
                </p>
                <p>
                  <strong>ユーザーID:</strong> {user?.uid}
                </p>
                <button onClick={handleLogout} className="logout-button">
                  ログアウト
                </button>
              </div>
            </div>

            {/* 投稿リストセクション - 3列グリッドの外に独立配置 */}
            <div className="blog-posts-section">
              <h2>投稿一覧</h2>
              {isLoadingPosts ? (
                <div className="loading-posts">
                  <p>投稿を読み込み中...</p>
                </div>
              ) : blogPosts.length === 0 ? (
                <div className="no-posts">
                  <p>まだ投稿がありません</p>
                </div>
              ) : (
                <div className="posts-grid">
                  {blogPosts.map((post) => (
                    <div key={post.id} className="post-card">
                      <div className="post-header">
                        <h3>{post.title}</h3>
                        <span className={`status-badge ${post.status}`}>
                          {post.status === "draft"
                            ? "下書き"
                            : post.status === "published"
                            ? "公開"
                            : "非公開"}
                        </span>
                      </div>

                      {post.featuredImage && (
                        <img
                          src={post.featuredImage}
                          alt="アイキャッチ画像"
                          className="post-thumbnail"
                        />
                      )}

                      <p className="post-description">
                        {post.description || "説明文がありません"}
                      </p>

                      <div className="post-tags">
                        {post.tags &&
                          post.tags.map((tag, index) => (
                            <span key={index} className="tag">
                              {tag}
                            </span>
                          ))}
                      </div>

                      <div className="post-meta">
                        <small>
                          作成日:{" "}
                          {post.createdAt
                            ?.toDate?.()
                            ?.toLocaleDateString("ja-JP") || "不明"}
                        </small>
                        {post.updatedAt && (
                          <small>
                            更新日:{" "}
                            {post.updatedAt
                              ?.toDate?.()
                              ?.toLocaleDateString("ja-JP")}
                          </small>
                        )}
                      </div>

                      <div className="post-actions">
                        <button
                          onClick={() => handleEdit(post)}
                          className="edit-button"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="delete-button"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
