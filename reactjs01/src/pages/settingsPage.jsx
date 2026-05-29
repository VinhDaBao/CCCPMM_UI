import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import TopBar from '../components/creator-layout/TopBar';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const SettingsPage = () => {
  const [tab, setTab] = useState("account");
  const [displayMode, setDisplayMode] = useState("light");
  
  // Lấy dữ liệu User thực tế từ Redux
  const auth = useSelector(state => state.auth);
  const user = auth?.user || {};

  const avatarUrl = user.avatar ? (user.avatar.startsWith("data:") ? user.avatar : `${BACKEND_URL}${user.avatar}`) : null;
  const initial = user.fullName ? user.fullName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U');
  const displayName = user.fullName && user.fullName !== "undefined" ? user.fullName : (user.email ? user.email.split('@')[0] : "Creator");
  const displayEmail = user.email || "creator@studio.com";

  // Dữ liệu mô phỏng thanh dung lượng
  const storageUsed = 230;
  const storageTotal = 512;
  const pct = (storageUsed / storageTotal) * 100;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "var(--bg-void)" }}>
      <TopBar title="Cài đặt" subtitle="Tài khoản & Gói dịch vụ" />
      
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 700 }}>
          
          {/* Tabs chuyển đổi */}
          <div style={{ display: "flex", gap: 8, marginBottom: 32, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
            {[["account", "Tài khoản"], ["package", "Gói & Dung lượng"]].map(([v, l]) => (
              <button key={v} onClick={() => setTab(v)}
                style={{
                  padding: "10px 20px", border: "none", cursor: "pointer",
                  background: "transparent", fontSize: 14, fontFamily: "'Lato', sans-serif",
                  fontWeight: tab === v ? 700 : 500,
                  color: tab === v ? "var(--accent-amber)" : "var(--text-secondary)",
                  borderBottom: tab === v ? "2px solid var(--accent-amber)" : "2px solid transparent",
                  marginBottom: -1, transition: "all 0.2s"
                }}>{l}</button>
            ))}
          </div>

          {/* TAB 1: TÀI KHOẢN */}
          {tab === "account" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }} className="fade-up">
              
              {/* Avatar Info */}
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--border-lit)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} />
                ) : (
                  <div style={{ 
                    width: 72, height: 72, borderRadius: "50%", 
                    background: "linear-gradient(135deg, #4a3f8a, #7a5a9a)", 
                    display: "flex", alignItems: "center", justifyContent: "center", 
                    fontSize: 26, fontWeight: 700, color: "#e0d0f0", border: "3px solid var(--border-lit)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }}>{initial}</div>
                )}
                
                <div>
                  <div style={{ fontSize: 18, fontFamily: "'Instrument Serif', serif", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{displayName}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>{displayEmail}</div>
                  <button style={{ marginTop: 10, fontSize: 12, color: "var(--accent-amber)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Lato', sans-serif", fontWeight: 600 }}>Đổi ảnh đại diện →</button>
                </div>
              </div>

              {/* Form fields */}
              <div style={{ display: "flex", gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", marginBottom: 8, textTransform: "uppercase" }}>Họ và tên</div>
                  <input defaultValue={displayName} style={{
                    width: "100%", background: "var(--bg-raised)", border: "1px solid var(--border)",
                    borderRadius: 9, padding: "10px 14px", color: "var(--text-primary)",
                    fontSize: 14, fontFamily: "'Lato', sans-serif", outline: "none",
                  }}
                    onFocus={e => e.target.style.borderColor = "var(--accent-amber)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", marginBottom: 8, textTransform: "uppercase" }}>Email</div>
                  <input defaultValue={displayEmail} disabled style={{
                    width: "100%", background: "var(--bg-raised)", border: "1px solid var(--border)", opacity: 0.7,
                    borderRadius: 9, padding: "10px 14px", color: "var(--text-primary)",
                    fontSize: 14, fontFamily: "'Lato', sans-serif", outline: "none", cursor: "not-allowed"
                  }} />
                </div>
              </div>

              {/* Display mode */}
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", marginBottom: 12, textTransform: "uppercase" }}>GIAO DIỆN MÀN HÌNH</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[["light", "Light Mode"], ["dark", "Dark Mode"], ["system", "Theo hệ thống"]].map(([v, l]) => (
                    <button key={v} onClick={() => setDisplayMode(v)}
                      style={{
                        padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13,
                        fontFamily: "'Lato', sans-serif", border: "1px solid", fontWeight: displayMode === v ? 700 : 400,
                        borderColor: displayMode === v ? "var(--accent-amber)" : "var(--border)",
                        background: displayMode === v ? "rgba(232,166,66,0.1)" : "var(--bg-raised)",
                        color: displayMode === v ? "var(--accent-amber)" : "var(--text-secondary)",
                        transition: "all 0.2s"
                      }}>{l}</button>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, marginTop: 10 }}>
                <button style={{ 
                  background: "linear-gradient(135deg, var(--accent-amber), var(--accent-rust))", 
                  color: "#fff", border: "none", borderRadius: 9, padding: "12px 28px", 
                  fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Lato', sans-serif",
                  boxShadow: "0 4px 12px rgba(176, 58, 34, 0.2)", transition: "opacity 0.2s"
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 0.85}
                  onMouseLeave={e => e.currentTarget.style.opacity = 1}
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: GÓI & DUNG LƯỢNG */}
          {tab === "package" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }} className="fade-up">
              
              {/* Current plan */}
              <div style={{ background: "var(--bg-raised)", borderRadius: 12, padding: "20px 24px", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em" }}>GÓI HIỆN TẠI CỦA BẠN</div>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: "var(--text-primary)", marginTop: 4 }}>FREE PLAN</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>512 MB dung lượng · Giới hạn 3 Project</div>
                </div>
                <button style={{ background: "linear-gradient(135deg, var(--accent-amber), var(--accent-rust))", color: "#fff", border: "none", borderRadius: 9, padding: "12px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Lato', sans-serif", boxShadow: "0 4px 12px rgba(176, 58, 34, 0.2)" }}>
                  Nâng cấp PRO ✦
                </button>
              </div>

              {/* Storage */}
              <div style={{ background: "var(--bg-raised)", borderRadius: 12, padding: "24px", border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", marginBottom: 16 }}>DUNG LƯỢNG LƯU TRỮ TỔNG</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 14, color: "var(--text-primary)" }}>Đã dùng: <strong>{storageUsed} MB</strong></span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>{storageTotal} MB tổng</span>
                </div>
                
                {/* Main progress bar */}
                <div style={{ height: 10, background: "var(--bg-active)", borderRadius: 5, overflow: "hidden", marginBottom: 20 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: pct > 80 ? "var(--accent-rust)" : "linear-gradient(90deg, var(--accent-amber), var(--accent-rust))", borderRadius: 5, transition: "width 0.6s ease" }} />
                </div>
                
                {/* Breakdown */}
                <div style={{ display: "flex", gap: 20 }}>
                  {[["Âm thanh & Nhạc", 150, "var(--accent-ice)"], ["Hình ảnh", 80, "var(--accent-sage)"]].map(([label, mb, color]) => (
                    <div key={label} style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                          {label}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>{mb} MB</span>
                      </div>
                      <div style={{ height: 4, background: "var(--bg-active)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(mb / storageTotal) * 100}%`, background: color, borderRadius: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing history */}
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", marginBottom: 12, marginTop: 8 }}>LỊCH SỬ THANH TOÁN</div>
                <div style={{ background: "var(--bg-raised)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>Gói FREE — Đăng ký lần đầu</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>15/01/2025</div>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--accent-sage)", background: "rgba(90,138,106,0.1)", padding: "4px 10px", borderRadius: 6, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>ACTIVE</span>
                  </div>
                  <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                    Chưa có giao dịch nâng cấp nào. <button style={{ background: "none", border: "none", color: "var(--accent-amber)", cursor: "pointer", fontSize: 13, fontFamily: "'Lato', sans-serif", fontWeight: 600 }}>Tìm hiểu thêm gói PRO →</button>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;