import React, { useState } from 'react';
import TopBar from '../components/creator-layout/TopBar';
import Icon from '../components/creator-layout/Icons';

/* ============================================================
   CÁC COMPONENT PHỤ TRỢ
============================================================ */
const ToolbarBtn = ({ icon, label, active, onClick, children }) => (
  <button title={label} onClick={onClick} style={{
    display: "flex", alignItems: "center", justifyContent: "center",
    width: 30, height: 30, borderRadius: 6, border: "none", cursor: "pointer",
    background: active ? "var(--bg-active)" : "transparent",
    color: active ? "var(--accent-amber)" : "var(--text-secondary)",
    transition: "all 0.12s ease", position: "relative",
  }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--bg-hover)"; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? "var(--bg-active)" : "transparent"; }}
  >
    {children || <Icon name={icon} size={14} />}
  </button>
);

const AudioEmbedBlock = ({ filename, duration }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: 10,
    background: "var(--bg-raised)", border: "1px solid var(--border-lit)",
    borderRadius: 8, padding: "8px 14px", margin: "8px 0",
    cursor: "default", maxWidth: 320,
  }}>
    <div style={{
      width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg, var(--accent-ice), #4a90d0)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon name="music" size={13} color="#fff" />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 12, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{filename}</div>
      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{duration} · AUDIO FILE</div>
    </div>
    <button style={{
      width: 24, height: 24, borderRadius: "50%", border: "none", cursor: "pointer", flexShrink: 0,
      background: "var(--accent-ice)", display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon name="play" size={10} color="#fff" />
    </button>
  </div>
);

const ScriptContent = () => (
  <div className="script-editor" contentEditable suppressContentEditableWarning
    style={{ flex: 1, overflowY: "auto", padding: "24px 48px 48px", lineHeight: 1.85, outline: 'none' }}>
    <p style={{ color: "var(--text-secondary)", textTransform: "uppercase", fontSize: 12, letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace", marginBottom: "0.75rem" }}>CẢNH 1 - NỘI - CĂN PHÒNG TỐI - ĐÊM</p>
    
    <p style={{ color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
      Căn phòng chìm trong bóng tối. Ánh nến leo lét từ góc bàn thờ hắt lên khuôn mặt <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>MINH</span> — một người đàn ông trung niên, mặt xanh xao, tay run run.
    </p>
    
    <AudioEmbedBlock filename="tieng_gio_rit.mp3" duration="0:12" />
    <br />
    
    <p style={{ color: "var(--accent-amber)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.1em", textAlign: "center", marginBottom: "0.75rem" }}>MINH</p>
    <p style={{ color: "var(--text-primary)", fontStyle: "italic", paddingLeft: "2rem", borderLeft: "2px solid var(--border-lit)", marginBottom: "0.75rem" }}>
      "Tôi đã nói rồi... đừng mở cái hộp đó ra. Nhưng anh không nghe."
    </p>
    
    <p style={{ color: "var(--text-secondary)", textTransform: "uppercase", fontSize: 12, letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace", marginBottom: "0.75rem" }}>MINH bước chậm về phía cửa sổ. Gió thổi mạnh. Ngọn nến tắt.</p>
    
    <p style={{ color: "var(--accent-amber)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.1em", textAlign: "center", marginBottom: "0.75rem" }}>TIẾNG NÓI (O.S.)</p>
    <p style={{ color: "var(--text-primary)", fontStyle: "italic", paddingLeft: "2rem", borderLeft: "2px solid var(--border-lit)", marginBottom: "0.75rem" }}>
      "Minh... Minh ơi... sao anh bỏ em lại một mình?"
    </p>
    
    <p style={{ color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
      Minh đứng khựng lại. Từng sợi tóc trên gáy anh dựng đứng. Từ phía sau, bóng tối bắt đầu <span style={{ color: "var(--accent-rust)", fontStyle: "italic" }}>chuyển động.</span>
    </p>
    
    <AudioEmbedBlock filename="tieng_go_cua.mp3" duration="0:08" />
    <br />
    
    <p style={{ color: "var(--text-secondary)", textTransform: "uppercase", fontSize: 12, letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace", marginBottom: "0.75rem" }}>CẮT SANG —</p>
    <p style={{ color: "var(--text-secondary)", textTransform: "uppercase", fontSize: 12, letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace", marginBottom: "0.75rem" }}>CẢNH 2 - NỘI - HÀNH LANG - TIẾP THEO</p>
    
    <p style={{ color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
      Hành lang dài hun hút. Ánh đèn neon nhấp nháy. Trên tường, bức ảnh gia đình... nhưng khuôn mặt tất cả đã bị <span style={{ color: "var(--accent-rust)" }}>xóa trắng</span>.
    </p>
  </div>
);

// TAB AI PROMPT 
const AiPromptTab = () => {
  const [promptText, setPromptText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState("");

  const suggestions = [
    { icon: "wand", label: "Viết tiếp đoạn kịch bản", color: "var(--accent-amber)" },
    { icon: "image", label: "Tạo prompt hình ảnh từ cảnh này", color: "var(--accent-ice)" },
    { icon: "sparkles", label: "Gợi ý tên nhân vật phụ", color: "var(--accent-sage)" },
    { icon: "star", label: "Phân tích cấu trúc 3 hồi", color: "var(--accent-rust)" },
  ];

  const handleGenerate = () => {
    if (!promptText.trim()) return;
    setGenerating(true);
    setResult("");
    
    // Giả lập AI
    setTimeout(() => {
      setGenerating(false);
      setResult("Dưới đây là một vài câu thoại gợi ý cho nhân vật MINH:\n\nMINH (nhếch mép cười nhạt)\n'Cô tưởng cái cửa đó cản được nó sao? Nó đã ở trong này từ trước khi chúng ta đến rồi.'\n\nMINH (giọng run rẩy, lùi lại)\n'Đừng nhìn vào mắt nó... Xin cô đấy, nhắm mắt lại đi!'");
    }, 1500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "24px 20px" }}>
      
      {/* Header */}
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-amber)" }} className="pulse" />
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em" }}>AI ASSISTANT — CLAUDE SONNET</span>
      </div>

      {/* Nút gợi ý */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => setPromptText(s.label)}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "var(--bg-raised)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "12px 16px", cursor: "pointer", 
              color: "var(--text-secondary)", fontSize: 13, fontFamily: "'Lato', sans-serif", textAlign: "left",
              transition: "all 0.15s ease", boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.color = s.color; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
          >
            <div style={{ flexShrink: 0, display: "flex" }}>
              <Icon name={s.icon} size={15} color={s.color} />
            </div>
            <span style={{ lineHeight: 1.4 }}>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div style={{ 
        background: "var(--bg-raised)", border: "1px solid var(--border)", 
        borderRadius: 12, padding: "16px", display: "flex", flexDirection: "column", gap: 12, 
        marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" 
      }}>
        <textarea
          value={promptText}
          onChange={e => setPromptText(e.target.value)}
          placeholder="Nhập yêu cầu của bạn... (VD: Viết thêm 3 câu thoại cho nhân vật MINH)"
          style={{ 
            background: "none", border: "none", outline: "none", resize: "none", 
            color: "var(--text-primary)", fontSize: 13, fontFamily: "'Lato', sans-serif", 
            minHeight: 90, lineHeight: 1.5, width: "100%", boxSizing: "border-box" 
          }}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 14 }}>⌘</span> Enter để gửi
          </span>
          <button 
            onClick={handleGenerate}
            disabled={generating}
            style={{
              display: "flex", alignItems: "center", gap: 6, 
              background: generating ? "var(--bg-active)" : "var(--accent-amber)", 
              color: generating ? "var(--text-muted)" : "#0d0d0f",
              border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, 
              cursor: generating ? "not-allowed" : "pointer", flexShrink: 0,
              transition: "all 0.2s ease"
            }}
          >
            <Icon name="send" size={13} color={generating ? "var(--text-muted)" : "#0d0d0f"} /> 
            {generating ? "Đang xử lý..." : "Gửi"}
          </button>
        </div>
      </div>

      {/* Kết quả */}
      {result && (
        <div style={{
          flex: 1, background: "var(--bg-surface)", border: "1px solid var(--border-lit)",
          borderRadius: 12, padding: "16px", overflowY: "auto",
          boxShadow: "0 4px 12px rgba(0,0,0,0.03)", marginTop: 12
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 10, color: "var(--accent-amber)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", fontWeight: 700 }}>
              PHẢN HỒI TỪ AI
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.75, whiteSpace: "pre-wrap", fontFamily: "'Lato', sans-serif" }}>
            {result}
          </p>
        </div>
      )}
    </div>
  );
};

const MediaFileRow = ({ name, type, size, used }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8,
    background: "var(--bg-raised)", border: "1px solid var(--border)", marginBottom: 6, cursor: "grab",
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 7, flexShrink: 0,
      background: type === "audio" ? "linear-gradient(135deg, #3b82c4, var(--accent-ice))" : "linear-gradient(135deg, #3a9e5f, var(--accent-sage))",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon name={type === "audio" ? "music" : "image"} size={14} color="#fff" />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 12, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>{size} · {type.toUpperCase()}</div>
    </div>
    <div style={{
      fontSize: 9, padding: "2px 7px", borderRadius: 4, fontFamily: "'JetBrains Mono', monospace",
      background: used ? "rgba(90,138,106,0.15)" : "rgba(200,82,58,0.1)",
      color: used ? "var(--accent-sage)" : "var(--accent-rust)",
      border: `1px solid ${used ? "rgba(90,138,106,0.3)" : "rgba(200,82,58,0.25)"}`,
      whiteSpace: "nowrap", flexShrink: 0, 
    }}>
      {used ? "ĐÃ DÙNG" : "CHƯA DÙNG"}
    </div>
  </div>
);

const MediaTab = () => {
  const files = [
    { name: "tieng_gio_rit.mp3", type: "audio", size: "1.2MB", used: true },
    { name: "tieng_go_cua.mp3", type: "audio", size: "0.8MB", used: true },
    { name: "nhac_nen_kinh_di.mp3", type: "audio", size: "4.5MB", used: false },
    { name: "ban_tho_co_thu.jpg", type: "image", size: "2.1MB", used: false },
    { name: "cuagothuchua.jpg", type: "image", size: "3.4MB", used: false },
    { name: "hanh_lang_toi.jpg", type: "image", size: "1.8MB", used: false },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "16px" }}>
      <button style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        background: "var(--bg-raised)", border: "1.5px dashed var(--border-lit)",
        borderRadius: 9, padding: "11px", cursor: "pointer", color: "var(--text-secondary)", fontSize: 12, marginBottom: 14,
      }}>
        <Icon name="upload" size={14} /> Upload file mới
      </button>

      <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.12em", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
        <span>FILE TRONG DỰ ÁN</span>
        <span>{files.length} files</span>
      </div>

      <div style={{ overflowY: "auto", flex: 1 }}>
        {files.map((f, i) => <MediaFileRow key={i} {...f} />)}
      </div>

      <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(232,166,66,0.06)", borderRadius: 8, border: "1px solid rgba(232,166,66,0.15)" }}>
        <div style={{ fontSize: 11, color: "var(--accent-amber)", display: "flex", alignItems: "flex-start", gap: 6 }}>
          <span style={{ marginTop: 1 }}>💡</span>
          <span>Kéo file vào khu vực soạn thảo để chèn vào kịch bản.</span>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   TRANG CHÍNH WORKSPACE
============================================================ */
const WorkspacePage = () => {
  const [activeTab, setActiveTab] = useState("ai"); 
  const [boldActive, setBoldActive] = useState(false);
  const [italicActive, setItalicActive] = useState(false);
  const [underlineActive, setUnderlineActive] = useState(false);
  
  const applyFormat = (cmd, val) => { document.execCommand(cmd, false, val); };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: "100vh" }}>
      <TopBar title="Mắt Âm Dương" subtitle="KỊCH BẢN · Đang viết · Chỉnh sửa lần cuối 2 phút trước" />

      {/* Thanh Breadcrumb */}
      <div style={{ padding: "10px 24px", display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid var(--border)", background: "var(--bg-base)" }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>Dự án</span>
        <Icon name="chevronRight" size={12} color="var(--text-muted)" />
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>Mắt Âm Dương</span>
        <Icon name="chevronRight" size={12} color="var(--text-muted)" />
        <span style={{ fontSize: 11, color: "var(--accent-amber)", fontFamily: "'JetBrains Mono', monospace" }}>Workspace</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {["DRAFT", "REV 3"].map(tag => (
            <span key={tag} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: "var(--bg-raised)", color: "var(--text-muted)", border: "1px solid var(--border)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em" }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Khung chia 2 cột */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* CỘT TRÁI — Trình soạn thảo */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", background: "var(--bg-void)" }}>
          
          {/* Thanh Toolbar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 4, padding: "8px 16px",
            borderBottom: "1px solid var(--border)", background: "var(--bg-base)", flexWrap: "wrap", zIndex: 2
          }}>
            <ToolbarBtn icon="bold" label="Bold" active={boldActive} onClick={() => { setBoldActive(!boldActive); applyFormat("bold"); }} />
            <ToolbarBtn icon="italic" label="Italic" active={italicActive} onClick={() => { setItalicActive(!italicActive); applyFormat("italic"); }} />
            <ToolbarBtn icon="underline" label="Underline" active={underlineActive} onClick={() => { setUnderlineActive(!underlineActive); applyFormat("underline"); }} />

            <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
            <ToolbarBtn icon="palette" label="Text Color"><Icon name="palette" size={14} /></ToolbarBtn>
            <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />

            <ToolbarBtn icon="paperclip" label="Gắn file">
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Icon name="paperclip" size={13} />
                <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'Lato', sans-serif", whiteSpace: "nowrap" }}>Gắn file</span>
              </div>
            </ToolbarBtn>

            <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
              {["INT", "EXT", "CHAR", "ACTION", "DIALOGUE"].map(type => (
                <button key={type} style={{
                  fontSize: 9, padding: "3px 8px", borderRadius: 5, background: "var(--bg-raised)",
                  border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em", flexShrink: 0
                }}>{type}</button>
              ))}
            </div>
          </div>

          {/* Vùng nền xám chứa Trang Giấy */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", background: "#f4f5f7", padding: "32px 24px" }}>
            
            {/* ĐÂY LÀ "TỜ GIẤY TRẮNG" (Frame) */}
            <div style={{ 
              maxWidth: 820, margin: "0 auto", width: "100%", background: "#ffffff", 
              border: "1px solid var(--border)", borderRadius: 8, boxShadow: "0 4px 24px rgba(0,0,0,0.03)",
              display: "flex", flexDirection: "column", minHeight: "100%" 
            }}>
              
              {/* Tiêu đề nằm TRONG tờ giấy */}
              <div style={{ padding: "40px 48px 0", borderBottom: "1px solid var(--border-lit)", paddingBottom: 20 }}>
                <div contentEditable suppressContentEditableWarning style={{ fontFamily: "'Lato', sans-serif", fontWeight: 800, fontSize: 32, color: "var(--text-primary)", outline: "none", letterSpacing: "-0.02em" }}>
                  Mắt Âm Dương
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginTop: 8, display: "flex", gap: 14 }}>
                  <span>EP.01 — PHẦN MỞ ĐẦU</span><span>·</span><span>~12 phút đọc</span><span>·</span><span>1,847 từ</span>
                </div>
              </div>
              
              {/* Nội dung kịch bản */}
              <ScriptContent />
              
            </div>
          </div>
        </div>

        {/* CỘT PHẢI — AI & Media */}
        <div style={{ width: 360, flexShrink: 0, display: "flex", flexDirection: "column", background: "var(--bg-base)", overflow: "hidden" }}>
          
          {/* Thanh chuyển Tab */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "var(--bg-base)", padding: "0 16px" }}>
            {[
              { id: "ai", icon: "sparkles", label: "AI Prompt" },
              { id: "media", icon: "image", label: "Media" },
            ].map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: "none",
                    background: active ? "var(--bg-active)" : "transparent",
                    color: active ? "var(--accent-amber)" : "var(--text-muted)",
                    cursor: "pointer", fontSize: 13,
                  }}
                >
                  <Icon name={tab.icon} size={14} color={active ? "var(--accent-amber)" : "var(--text-muted)"} />
                  <span style={{ marginLeft: 8, whiteSpace: "nowrap" }}>{tab.label}</span>
                </button>
            )})}
          </div>

          {/* Nội dung tab */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {activeTab === "ai" ? <AiPromptTab /> : <MediaTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspacePage;