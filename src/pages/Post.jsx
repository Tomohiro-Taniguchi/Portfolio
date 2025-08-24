import Header from "../components/header";
import "../css/Post.css";
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router";

export default function Post() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
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
          <div className="user-info">
            <h2>ログイン情報</h2>
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
        )}
      </div>
    </div>
  );
}
