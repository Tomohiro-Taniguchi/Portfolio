import Header from "../components/header";
import "../css/Admin.css";
import { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router";

export default function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // ページが読み込まれた時に上部にスクロール
    window.scrollTo(0, 0);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError("");
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin/:id/b203357m241731");
    } catch (error) {
      setError("ログインに失敗しました");
      console.error("ログインに失敗しました", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="admin-container">
      {/* 降る雪 */}
      <div className="snowflake-container">
        {[...Array(45)].map((_, i) => (
          <div
            key={i}
            className="snowflake"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${(i * 0.1) % 2}s`,
              animationDuration: `${5 + Math.random() * 12}s`,
            }}
          >
            {["❄", "❅", "❆"][i % 3]}
          </div>
        ))}
      </div>

      <Header />
      <div className="login-content">
        <h1>管理者専用</h1>
        <div className="login-form">
          <form onSubmit={handleLogin}>
            {error && <p className="error-message">{error}</p>}
            {isLoading && <p className="loading-message">ログイン中...</p>}
            {/* メールアドレス */}
            <div className="form-group">
              <label htmlFor="email">メールアドレス</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {/* パスワード */}
            <div className="form-group">
              <label htmlFor="password">パスワード</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {/* ログインボタン */}
            <button type="submit" className="login-button" disabled={isLoading}>
              ログイン
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
