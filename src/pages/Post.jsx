import Header from "../components/header";
import Footer from "../components/footer";
import ScrollMenu from "../components/ScrollMenu";
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
  setDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata,
} from "firebase/storage";
import { useNavigate, useParams } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import AddIcon from "@mui/icons-material/Add";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import LogoutIcon from "@mui/icons-material/Logout";

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

export default function Post() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [userUrl, setUserUrl] = useState("");
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const { userId: urlUserId } = useParams();
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
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(5);
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" or "oldest"
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    title: "",
    dateFrom: "",
    dateTo: "",
    tags: [],
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  // ギャラリー用の状態変数
  const [galleryImages, setGalleryImages] = useState([]);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [galleryImageVisibility, setGalleryImageVisibility] = useState({});
  // 画像詳細モーダル用の状態変数
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
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

        // URLのユーザーIDとログインユーザーのIDが一致しない場合はリダイレクト
        if (urlUserId && urlUserId !== user.uid) {
          navigate(`/admin/${user.uid}`);
          return;
        }

        // ユーザーIDを含むURLを生成
        const userId = user.uid;
        const currentPath = window.location.pathname;
        const expectedPath = `/admin/${userId}`;
        setUserUrl(window.location.origin + expectedPath);

        // URLパスが期待されるパスと異なる場合はリダイレクト
        if (currentPath !== expectedPath) {
          navigate(expectedPath);
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

  // 投稿リストを取得
  useEffect(() => {
    if (user) {
      fetchBlogPosts();
      fetchExistingImages(); // 既存の画像も取得
      fetchExistingGalleryImages(); // ギャラリー画像も取得
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
      console.error("投稿リストの取得に失敗:", error);
      setError("投稿リストの取得に失敗しました");
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // 既存の画像を取得する関数
  const fetchExistingImages = async () => {
    try {
      // Firebase Storageのblog-imagesフォルダから画像を取得
      const storageRef = ref(storage, "blog-images");
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
          };
        } catch (error) {
          console.error(`画像情報の取得に失敗 (${itemRef.name}):`, error);
          return null;
        }
      });

      const images = (await Promise.all(imagePromises)).filter(
        (img) => img !== null
      );

      // アップロード日時でソート（新しい順）
      const sortedImages = images.sort((a, b) => b.uploadedAt - a.uploadedAt);

      setUploadedImages(sortedImages);
    } catch (error) {
      console.error("既存画像の取得に失敗:", error);
      // エラーが発生しても処理を継続
    }
  };

  // ギャラリー用の既存画像を取得する関数
  const fetchExistingGalleryImages = async () => {
    try {
      // Firebase Storageのgallery-imagesフォルダから画像を取得
      const storageRef = ref(storage, "gallery-images");
      const listResult = await listAll(storageRef);

      const imagePromises = listResult.items.map(async (itemRef) => {
        try {
          const url = await getDownloadURL(itemRef);
          const metadata = await getMetadata(itemRef);

          // メタデータから公開設定を取得（デフォルトは公開）
          const isPublic =
            metadata.customMetadata?.isPublic === "true" ||
            metadata.customMetadata?.isPublic === undefined;

          return {
            id: itemRef.name,
            name: itemRef.name.replace(/^\d+_/, ""), // タイムスタンププレフィックスを除去
            url: url,
            size: metadata.size,
            uploadedAt: new Date(metadata.timeCreated),
            path: itemRef.fullPath,
            isPublic: isPublic,
            type: itemRef.name.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i)
              ? "video"
              : "image",
          };
        } catch (error) {
          console.error(
            `ギャラリー画像情報の取得に失敗 (${itemRef.name}):`,
            error
          );
          return null;
        }
      });

      const images = (await Promise.all(imagePromises)).filter(
        (img) => img !== null
      );

      // アップロード日時でソート（新しい順）
      const sortedImages = images.sort((a, b) => b.uploadedAt - a.uploadedAt);

      setGalleryImages(sortedImages);
    } catch (error) {
      console.error("ギャラリー既存画像の取得に失敗:", error);
      // エラーが発生しても処理を継続
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
      processImageFile(file);
    }
  };

  const processImageFile = (file) => {
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
  };

  // ドラッグ&ドロップ機能
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      processImageFile(imageFile);
    } else {
      setError("画像ファイルを選択してください");
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

  // ページネーション用の関数
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = blogPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(blogPosts.length / postsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
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

  // 並び替え機能
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

  // 絞り込み機能
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

  // 画像アップロード機能
  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    const newImages = [];

    for (const file of files) {
      try {
        // ファイルサイズチェック（5MB以下）
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} のサイズが5MBを超えています`);
          continue;
        }

        // ファイル形式チェック
        if (!file.type.startsWith("image/")) {
          alert(`${file.name} は画像ファイルではありません`);
          continue;
        }

        // ファイル名を生成（重複を避ける）
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const storageRef = ref(storage, `blog-images/${fileName}`);

        // アップロード
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        // 画像情報を保存
        const imageInfo = {
          id: `${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          url: downloadURL,
          size: file.size,
          uploadedAt: new Date(),
          path: `blog-images/${fileName}`,
        };

        newImages.push(imageInfo);
      } catch (error) {
        console.error(`画像アップロードエラー (${file.name}):`, error);
        alert(`${file.name} のアップロードに失敗しました`);
      }
    }

    if (newImages.length > 0) {
      setUploadedImages((prev) => [...prev, ...newImages]);
    }

    setIsUploading(false);
    event.target.value = ""; // ファイル入力をリセット
  };

  // ギャラリー用画像アップロード機能
  const handleGalleryImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploadingGallery(true);
    const newImages = [];

    for (const file of files) {
      try {
        // ファイルサイズチェック（50MB以下）
        if (file.size > 50 * 1024 * 1024) {
          alert(`${file.name} のサイズが50MBを超えています`);
          continue;
        }

        // ファイル形式チェック（画像と動画）
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (!isImage && !isVideo) {
          alert(`${file.name} は画像または動画ファイルではありません`);
          continue;
        }

        // ファイル名を生成（重複を避ける）
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const storageRef = ref(storage, `gallery-images/${fileName}`);

        // メタデータを設定（公開設定を含む）
        const metadata = {
          customMetadata: {
            isPublic: "true", // デフォルトは公開
            uploadedBy: user?.uid || "unknown",
          },
        };

        // アップロード（メタデータ付き）
        const snapshot = await uploadBytes(storageRef, file, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);

        // 画像情報を保存
        const imageInfo = {
          id: fileName, // ファイル名をIDとして使用
          name: file.name,
          url: downloadURL,
          size: file.size,
          uploadedAt: new Date(),
          path: `gallery-images/${fileName}`,
          isPublic: true, // デフォルトは公開
          type: isImage ? "image" : "video", // ファイルタイプを追加
        };

        newImages.push(imageInfo);
      } catch (error) {
        console.error(
          `ギャラリー画像アップロードエラー (${file.name}):`,
          error
        );
        alert(`${file.name} のアップロードに失敗しました`);
      }
    }

    if (newImages.length > 0) {
      setGalleryImages((prev) => [...prev, ...newImages]);
    }

    setIsUploadingGallery(false);
    event.target.value = ""; // ファイル入力をリセット
  };

  const copyImageUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      console.error("URLコピーエラー:", error);
      alert("URLのコピーに失敗しました");
    }
  };

  const deleteImage = async (imageId) => {
    if (!window.confirm("この画像を削除しますか？")) return;

    try {
      const imageToDelete = uploadedImages.find((img) => img.id === imageId);
      if (!imageToDelete) return;

      // Firebase Storageから削除
      const storageRef = ref(storage, imageToDelete.path);
      await deleteObject(storageRef);

      // 状態から削除
      setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
      alert("画像を削除しました");
    } catch (error) {
      console.error("画像削除エラー:", error);
      alert("画像の削除に失敗しました");
    }
  };

  // ギャラリー画像削除機能
  const deleteGalleryImage = async (imageId) => {
    if (!window.confirm("この画像を削除しますか？")) return;

    try {
      const imageToDelete = galleryImages.find((img) => img.id === imageId);
      if (!imageToDelete) return;

      // Firebase Storageから削除
      const storageRef = ref(storage, imageToDelete.path);
      await deleteObject(storageRef);

      // 状態から削除
      setGalleryImages((prev) => prev.filter((img) => img.id !== imageId));
      alert("画像を削除しました");
    } catch (error) {
      console.error("ギャラリー画像削除エラー:", error);
      alert("画像の削除に失敗しました");
    }
  };

  // ギャラリー画像の公開/非公開トグル機能
  const toggleGalleryImageVisibility = async (imageId) => {
    try {
      const currentImage = galleryImages.find((img) => img.id === imageId);
      if (!currentImage) return;

      const newPublicStatus = !currentImage.isPublic;

      // Firebase Storageのファイル参照を取得
      const storageRef = ref(storage, currentImage.path);

      // 現在のメタデータを取得
      const metadata = await getMetadata(storageRef);

      // メタデータを更新（公開設定をカスタムメタデータとして保存）
      const updatedMetadata = {
        ...metadata,
        customMetadata: {
          ...metadata.customMetadata,
          isPublic: newPublicStatus.toString(),
        },
      };

      await updateMetadata(storageRef, updatedMetadata);

      // ローカル状態を更新
      setGalleryImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, isPublic: newPublicStatus } : img
        )
      );

      alert(newPublicStatus ? "画像を公開しました" : "画像を非公開にしました");
    } catch (error) {
      console.error("公開設定の更新に失敗:", error);
      alert("公開設定の更新に失敗しました");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 画像詳細モーダルを開く関数
  const openImageModal = (image, type = "blog") => {
    setSelectedImage({ ...image, type });
    setShowImageModal(true);
  };

  // 画像詳細モーダルを閉じる関数
  const closeImageModal = () => {
    setSelectedImage(null);
    setShowImageModal(false);
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
        <div className="post-heading">
          <hr />
          <div className="post-title-section">
            <h1>Post</h1>
          </div>
          <div className="post-logout-section">
            <button onClick={handleLogout} className="logout-button-top-right">
              <LogoutIcon className="logout-icon" />
              ログアウト
            </button>
          </div>
        </div>
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
                      autoComplete="off"
                      required
                    />
                  </div>

                  {/* 概要文 */}
                  <div className="form-group">
                    <label htmlFor="description">ブログ概要</label>
                    <textarea
                      id="description"
                      name="description"
                      value={blogPost.description}
                      onChange={handleInputChange}
                      placeholder="ブログ記事の概要文を入力してください。（ホームページに表示されます）"
                      autoComplete="off"
                      rows="3"
                    />
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
                      autoComplete="off"
                    />
                  </div>

                  {/* トップ画像 */}
                  <div className="form-group">
                    <label htmlFor="featuredImage">トップ画像</label>

                    {/* カスタムファイル選択UI */}
                    <div className="custom-file-input-container">
                      <input
                        type="file"
                        id="featuredImage"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden-file-input"
                      />
                      <label
                        htmlFor="featuredImage"
                        className="custom-file-label"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <div className="file-input-content">
                          <div className="file-input-text">
                            <div className="file-input-title">画像を選択</div>
                            <div className="file-input-subtitle">
                              クリックしてファイルを選択するか、ここにドラッグ&ドロップ
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>

                    <small className="form-help">
                      対応形式: JPG、PNG、GIF / 最大サイズ: 5MB
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
                      placeholder="Markdown記法で記事を書いてください"
                      autoComplete="off"
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
                      img: (props) => <CustomImage {...props} />,
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
            </div>

            {/* 画像アップロードセクション - 左右分割 */}
            <div className="image-upload-sections">
              {/* 左側: ブログ用画像アップロード */}
              <div className="image-upload-section blog-images">
                <h3>ブログ用画像アップロード</h3>

                {/* アップロードエリア */}
                <div className="upload-area">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="file-input"
                    id="imageUpload"
                    name="imageUpload"
                    disabled={isUploading}
                  />
                  <label htmlFor="imageUpload" className="upload-label">
                    {isUploading ? (
                      <div className="upload-loading">
                        <p>アップロード中...</p>
                      </div>
                    ) : (
                      <>
                        <AddIcon className="upload-icon" />
                      </>
                    )}
                  </label>
                </div>

                {/* 画像一覧 */}
                <div className="image-gallery">
                  <h4>アップロード済みブログ用画像一覧</h4>
                  {uploadedImages.length === 0 ? (
                    <div className="no-images">
                      <p>まだ画像がアップロードされていません</p>
                    </div>
                  ) : (
                    <div className="image-list">
                      {uploadedImages.map((image) => (
                        <div
                          key={image.id}
                          className="image-item"
                          onClick={() => openImageModal(image, "blog")}
                        >
                          <div className="image-preview">
                            <img src={image.url} alt={image.name} />
                          </div>
                          <div className="image-info">
                            <div className="image-name">
                              <ImageIcon className="folder-icon" />
                              {image.name}
                            </div>
                            <div className="image-details">
                              <span className="file-size">
                                {formatFileSize(image.size)}
                              </span>
                              <span className="upload-date">
                                {formatDate(image.uploadedAt)}
                              </span>
                              <div className="image-actions">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyImageUrl(image.url);
                                  }}
                                  className="copy-url-button"
                                  title="URLをコピー"
                                >
                                  <FileCopyIcon className="button-icon" />
                                  コピー
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteImage(image.id);
                                  }}
                                  className="delete-image-button"
                                  title="画像を削除"
                                >
                                  <DeleteIcon className="button-icon" />
                                  削除
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 右側: ギャラリー用画像アップロード */}
              <div className="image-upload-section gallery-images">
                <h3>ギャラリー用メディアアップロード</h3>

                {/* アップロードエリア */}
                <div className="upload-area">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleGalleryImageUpload}
                    className="file-input"
                    id="galleryImageUpload"
                    name="galleryImageUpload"
                    disabled={isUploadingGallery}
                  />
                  <label htmlFor="galleryImageUpload" className="upload-label">
                    {isUploadingGallery ? (
                      <div className="upload-loading">
                        <p>アップロード中...</p>
                      </div>
                    ) : (
                      <>
                        <AddIcon className="upload-icon" />
                      </>
                    )}
                  </label>
                </div>

                {/* 画像一覧 */}
                <div className="image-gallery">
                  <h4>アップロード済みギャラリー用メディア一覧</h4>
                  {galleryImages.length === 0 ? (
                    <div className="no-images">
                      <p>まだ画像がアップロードされていません</p>
                    </div>
                  ) : (
                    <div className="image-list">
                      {galleryImages.map((image) => (
                        <div
                          key={image.id}
                          className="image-item"
                          onClick={() => openImageModal(image, "gallery")}
                        >
                          <div className="image-preview">
                            <img src={image.url} alt={image.name} />
                          </div>
                          <div className="image-info">
                            <div className="image-name">
                              <ImageIcon className="folder-icon" />
                              {image.name}
                            </div>
                            <div className="image-details">
                              <span className="file-size">
                                {formatFileSize(image.size)}
                              </span>
                              <span className="upload-date">
                                {formatDate(image.uploadedAt)}
                              </span>
                              <div className="image-actions">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyImageUrl(image.url);
                                  }}
                                  className="copy-url-button"
                                  title="URLをコピー"
                                >
                                  <FileCopyIcon className="button-icon" />
                                  コピー
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleGalleryImageVisibility(image.id);
                                  }}
                                  className={`visibility-toggle-button ${
                                    image.isPublic ? "public" : "private"
                                  }`}
                                  title={
                                    image.isPublic ? "非公開にする" : "公開する"
                                  }
                                >
                                  {image.isPublic ? "公開中" : "非公開"}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteGalleryImage(image.id);
                                  }}
                                  className="delete-image-button"
                                  title="画像を削除"
                                >
                                  <DeleteIcon className="button-icon" />
                                  削除
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                <>
                  {/* 並び替え・絞り込みコントロール */}
                  <div className="admin-sort-controls">
                    <span className="admin-sort-label">並び替え:</span>
                    <select
                      value={sortOrder}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="admin-sort-select"
                      id="sortOrder"
                      name="sortOrder"
                      autoComplete="off"
                    >
                      <option value="newest">投稿日が新しい順</option>
                      <option value="oldest">投稿日が古い順</option>
                    </select>
                    <button
                      onClick={() => setShowFilterModal(true)}
                      className="admin-filter-button"
                    >
                      絞り込み
                    </button>
                    {isFilterActive() && (
                      <button
                        onClick={clearFilters}
                        className="admin-clear-filter-button"
                      >
                        絞り込み解除
                      </button>
                    )}
                  </div>

                  <div className="admin-posts-grid">
                    {currentPosts.map((post) => (
                      <div key={post.id} className="admin-post-card">
                        <div className="admin-post-header">
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
                            className="admin-post-thumbnail"
                          />
                        )}

                        <p className="admin-post-description">
                          {post.description || "説明文がありません"}
                        </p>

                        <div className="admin-post-tags">
                          {post.tags &&
                            post.tags.map((tag, index) => (
                              <span key={index} className="admin-tag">
                                {tag}
                              </span>
                            ))}
                        </div>

                        <div className="admin-post-meta">
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

                        <div className="admin-post-actions">
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

                  {/* ページネーション */}
                  {totalPages > 1 && (
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
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`page-number ${
                              currentPage === page ? "active" : ""
                            }`}
                          >
                            {page}
                          </button>
                        ))}
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
                </>
              )}
            </div>
          </>
        )}
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
                <label htmlFor="filter-title">タイトル検索:</label>
                <input
                  type="text"
                  id="filter-title"
                  name="filter-title"
                  value={filters.title}
                  onChange={(e) => handleFilterChange("title", e.target.value)}
                  placeholder="タイトルを入力..."
                  className="filter-input"
                  autoComplete="off"
                />
              </div>

              {/* 日付範囲 */}
              <div className="filter-section">
                <label htmlFor="filter-date-from">投稿日範囲:</label>
                <div className="date-range">
                  <input
                    type="date"
                    id="filter-date-from"
                    name="filter-date-from"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      handleFilterChange("dateFrom", e.target.value)
                    }
                    className="filter-input"
                    autoComplete="off"
                  />
                  <span>〜</span>
                  <input
                    type="date"
                    id="filter-date-to"
                    name="filter-date-to"
                    value={filters.dateTo}
                    onChange={(e) =>
                      handleFilterChange("dateTo", e.target.value)
                    }
                    className="filter-input"
                    autoComplete="off"
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

      {/* 画像詳細モーダル */}
      {showImageModal && selectedImage && (
        <div className="image-detail-modal-overlay" onClick={closeImageModal}>
          <div
            className="image-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="image-detail-header">
              <h3>画像詳細</h3>
              <button onClick={closeImageModal} className="close-button">
                ×
              </button>
            </div>

            <div className="image-detail-content">
              <div className="image-detail-preview">
                <img src={selectedImage.url} alt={selectedImage.name} />
              </div>

              <div className="image-detail-info">
                <div className="image-detail-name">
                  <ImageIcon className="folder-icon" />
                  {selectedImage.name}
                </div>

                <div className="image-detail-meta">
                  <div className="meta-item">
                    <span className="meta-label">ファイルサイズ:</span>
                    <span className="meta-value">
                      {formatFileSize(selectedImage.size)}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">アップロード日時:</span>
                    <span className="meta-value">
                      {formatDate(selectedImage.uploadedAt)}
                    </span>
                  </div>
                  {selectedImage.type === "gallery" && (
                    <div className="meta-item">
                      <span className="meta-label">公開状態:</span>
                      <span
                        className={`meta-value ${
                          selectedImage.isPublic ? "public" : "private"
                        }`}
                      >
                        {selectedImage.isPublic ? "公開中" : "非公開"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="image-detail-actions">
                  <button
                    onClick={() => copyImageUrl(selectedImage.url)}
                    className="copy-url-button"
                  >
                    <FileCopyIcon className="button-icon" />
                    URLをコピー
                  </button>

                  {selectedImage.type === "gallery" && (
                    <button
                      onClick={() => {
                        toggleGalleryImageVisibility(selectedImage.id);
                        closeImageModal();
                      }}
                      className={`visibility-toggle-button ${
                        selectedImage.isPublic ? "public" : "private"
                      }`}
                    >
                      {selectedImage.isPublic ? "非公開にする" : "公開する"}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (selectedImage.type === "gallery") {
                        deleteGalleryImage(selectedImage.id);
                      } else {
                        deleteImage(selectedImage.id);
                      }
                      closeImageModal();
                    }}
                    className="delete-image-button"
                  >
                    <DeleteIcon className="button-icon" />
                    削除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
