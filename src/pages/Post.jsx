import Header from "../components/header";
import "../css/Post.css";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
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
import { useNavigate } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
      // デバッグ用：投稿データの確認
      console.log("投稿しようとしているデータ:", blogPost);
      console.log("現在のユーザー:", user);

      const postData = {
        ...blogPost,
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

      console.log("Firestoreに送信するデータ:", postData);

      const docRef = await addDoc(collection(db, "blogPosts"), postData);
      console.log("投稿が完了しました。ドキュメントID:", docRef.id);
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
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingPost) return;

    setIsSubmitting(true);
    try {
      const postData = {
        ...blogPost,
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

                  {/* アイキャッチ画像 */}
                  <div className="form-group">
                    <label htmlFor="featuredImage">アイキャッチ画像URL</label>
                    <input
                      type="url"
                      id="featuredImage"
                      name="featuredImage"
                      value={blogPost.featuredImage}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                    />
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
                    <label htmlFor="content">内容（Markdown記法対応） *</label>
                    <textarea
                      id="content"
                      name="content"
                      value={blogPost.content}
                      onChange={handleInputChange}
                      placeholder="Markdown記法で記事を書いてください

# 見出し1
## 見出し2

**太字**や*斜体*も使えます

- リスト項目1
- リスト項目2

```javascript
console.log('コードブロック');
```"
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
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
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
