import Header from "../components/header";
import "../css/Gallery.css";
import { useEffect, useState } from "react";
import { storage } from "../firebase";
import { ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";

export default function Gallery() {
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // ページが読み込まれた時に上部にスクロール
    window.scrollTo(0, 0);
    fetchGalleryImages();
  }, []);

  // ギャラリー画像を取得
  const fetchGalleryImages = async () => {
    try {
      setIsLoading(true);

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
              : "image", // ファイル拡張子で判定
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
      console.error("ギャラリー画像の取得に失敗:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 画像をクリックした時の処理
  const handleImageClick = (image, index) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
  };

  // モーダルを閉じる
  const closeModal = () => {
    setSelectedImage(null);
  };

  // 前の画像に移動
  const goToPrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      setSelectedImage(galleryImages[currentImageIndex - 1]);
    }
  };

  // 次の画像に移動
  const goToNext = () => {
    if (currentImageIndex < galleryImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setSelectedImage(galleryImages[currentImageIndex + 1]);
    }
  };

  // キーボードイベントの処理
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImage) {
        if (e.key === "Escape") {
          closeModal();
        } else if (e.key === "ArrowLeft") {
          goToPrevious();
        } else if (e.key === "ArrowRight") {
          goToNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, currentImageIndex, galleryImages]);

  return (
    <div className="gallery-container">
      <Header />
      <div className="gallery-content">
        <div className="gallery-heading">
          <hr />
          <h1>Gallery</h1>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>画像を読み込み中...</p>
          </div>
        ) : galleryImages.length === 0 ? (
          <div className="no-images">
            <p>まだギャラリー画像がありません</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {galleryImages.map((image, index) => (
              <div
                key={image.id}
                className="gallery-item"
                onClick={() => handleImageClick(image, index)}
              >
                <div className="image-wrapper">
                  {image.type === "video" ? (
                    <video
                      src={image.url}
                      className="gallery-image"
                      preload="metadata"
                      muted
                      loop
                    />
                  ) : (
                    <img
                      src={image.url}
                      alt={image.name}
                      loading="lazy"
                      className="gallery-image"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 画像プレビューモーダル */}
      {selectedImage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>

            <div className="modal-image-container">
              {currentImageIndex > 0 && (
                <button className="modal-nav modal-prev" onClick={goToPrevious}>
                  ‹
                </button>
              )}

              {selectedImage.type === "video" ? (
                <video
                  src={selectedImage.url}
                  className="modal-image"
                  controls
                  autoPlay
                  muted
                />
              ) : (
                <img
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  className="modal-image"
                />
              )}

              {currentImageIndex < galleryImages.length - 1 && (
                <button className="modal-nav modal-next" onClick={goToNext}>
                  ›
                </button>
              )}
            </div>

            <div className="modal-info">
              <div className="modal-counter">
                {currentImageIndex + 1} / {galleryImages.length}
              </div>
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
    </div>
  );
}
