import React, { useState } from 'react';
import TopBar from '../components/creator-layout/TopBar';
import Icon from '../components/creator-layout/Icons';

/* ============================================================
   COMPONENT: Thẻ hiển thị từng File (Asset Card)
============================================================ */
const AssetCard = ({ name, type, tags, size, used }) => (
  <div style={{
    background: "var(--bg-raised)", border: "1px solid var(--border)",
    borderRadius: 12, overflow: "hidden", cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-lit)"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.05)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)"; }}
  >
    {/* Khu vực Thumbnail (Xanh biển cho Audio, Xanh lá cho Image) */}
    <div style={{
      height: 120, 
      background: type === "audio"
        ? "linear-gradient(135deg, #d3e4f6, #b8d4f0)"
        : "linear-gradient(135deg, #d1efe0, #b4ddc8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative",
    }}>
      <Icon name={type === "audio" ? "music" : "image"} size={36} color={type === "audio" ? "rgba(34,96,160,0.4)" : "rgba(46,122,72,0.4)"} />
      
      {/* Label loại file góc phải */}
      <div style={{
        position: "absolute", top: 10, right: 10,
        fontSize: 10, padding: "3px 8px", borderRadius: 4,
        background: "rgba(255,255,255,0.85)", color: type === "audio" ? "var(--accent-ice)" : "var(--accent-sage)",
        fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em", fontWeight: 700,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}>
        {type.toUpperCase()}
      </div>
      
      {/* Dấu chấm xanh lục (Chỉ báo file đang được dùng) */}
      {used && (
        <div style={{
          position: "absolute", top: 12, left: 12,
          width: 8, height: 8, borderRadius: "50%",
          background: "var(--accent-sage)",
          boxShadow: "0 0 0 2px rgba(255,255,255,0.8)"
        }} title="Đang được sử dụng" />
      )}
    </div>
    
    {/* Khu vực Thông tin chi tiết */}
    <div style={{ padding: "14px" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {name}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {tags.map(t => (
          <span key={t} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "var(--bg-active)", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
            #{t}
          </span>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
        {size}
      </div>
    </div>
  </div>
);

/* ============================================================
   TRANG CHÍNH: ASSET LIBRARY
============================================================ */
const AssetLibraryPage = () => {
  const [filter, setFilter] = useState("all");
  
  // Dữ liệu mẫu (Giống hệt hình chụp của bạn)
  const assets = [
    { name: "ban_tho_co_thu.jpg", type: "image", tags: ["bối_cảnh", "kinh_dị"], size: "2.1 MB", used: false },
    { name: "cua_go_thuc_hua.jpg", type: "image", tags: ["bối_cảnh", "nội_thất"], size: "3.4 MB", used: true },
    { name: "tieng_go_cua.mp3", type: "audio", tags: ["âm_thanh", "hiệu_ứng"], size: "0.8 MB", used: true },
    { name: "gio_rit_dem_khuya.mp3", type: "audio", tags: ["kinh_dị", "nền"], size: "1.2 MB", used: false },
    { name: "nhan_vat_co_lai.jpg", type: "image", tags: ["nhân_vật", "kinh_dị"], size: "1.6 MB", used: false },
    { name: "hanh_lang_toi.jpg", type: "image", tags: ["bối_cảnh", "hành_lang"], size: "1.8 MB", used: false },
    { name: "tieng_khoc_dem.mp3", type: "audio", tags: ["âm_thanh", "cảm_xúc"], size: "2.3 MB", used: false },
    { name: "nha_bo_hoang.jpg", type: "image", tags: ["bối_cảnh", "bí_ẩn"], size: "4.1 MB", used: true },
  ];

  // Xử lý Lọc dữ liệu theo tab
  const filtered = filter === "all" ? assets : assets.filter(a => a.type === filter);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "var(--bg-void)" }}>
      
      {/* TopBar */}
      <TopBar title="Kho Tài Nguyên" subtitle="Asset Library · 8 files · 17.3 MB" />
      
      {/* Thanh Công Cụ (Bộ Lọc & Tìm kiếm & Upload) */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "var(--bg-base)", flexWrap: "wrap" }}>
        
        {/* Nhóm Filter */}
        <div style={{ display: "flex", background: "var(--bg-raised)", borderRadius: 8, padding: 4, border: "1px solid var(--border)" }}>
          {[["all", "Tất cả"], ["image", "Hình ảnh"], ["audio", "Âm thanh"]].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              style={{
                padding: "8px 16px", borderRadius: 6, border: "none",
                background: filter === v ? "var(--bg-active)" : "transparent",
                color: filter === v ? "var(--accent-amber)" : "var(--text-secondary)",
                fontSize: 13, fontFamily: "'Lato', sans-serif", fontWeight: filter === v ? 700 : 500,
                cursor: "pointer", transition: "all 0.2s"
              }}>{l}</button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          {/* Ô tìm kiếm */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 14px" }}>
            <Icon name="search" size={14} color="var(--text-muted)" />
            <input placeholder="Tìm asset..." style={{ background: "none", border: "none", outline: "none", color: "var(--text-primary)", fontSize: 13, width: 180, fontFamily: "'Lato', sans-serif" }} />
          </div>

          {/* Nút Upload Media */}
          <button style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--accent-amber)", color: "#0d0d0f", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Lato', sans-serif", transition: "opacity 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.85}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}
          >
            <Icon name="upload" size={14} color="#0d0d0f" />
            Upload Media
          </button>
        </div>
      </div>

      {/* Khu vực Lưới (Grid) chứa nội dung */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "var(--bg-void)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
          {filtered.map((a, i) => <AssetCard key={i} {...a} />)}
        </div>
        
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", marginTop: 40, fontFamily: "'Lato', sans-serif", fontSize: 14 }}>
            Không tìm thấy file nào phù hợp.
          </div>
        )}
      </div>

    </div>
  );
};

export default AssetLibraryPage;