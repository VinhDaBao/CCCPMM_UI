import React, { useState } from 'react';
import TopBar from '../components/creator-layout/TopBar';
import Icon from '../components/creator-layout/Icons';

// Dữ liệu mẫu (Mock Data) giả lập các kịch bản của kênh
const initialBoard = [
  {
    id: 'idea',
    title: 'Ý TƯỞNG',
    color: '#3b82f6', 
    cards: [
      { id: '1', title: 'Con Ma Học Đường', tags: ['#kinh_dị', '#học_đường'], attachments: 2, assignees: ['Đ', 'M'] },
      { id: '2', title: 'Ngôi Nhà Số 13', tags: ['#bí_ẩn', '#tâm_lý'], attachments: 0, assignees: ['Đ', 'M'] },
      { id: '3', title: 'Đứa Trẻ Không Tên', tags: ['#kinh_dị', '#gia_đình'], attachments: 1, assignees: ['Đ', 'M'] },
    ]
  },
  {
    id: 'writing',
    title: 'ĐANG VIẾT',
    color: '#d97706',
    cards: [
      { id: '4', title: 'Mắt Âm Dương', tags: ['#kinh_dị', '#tâm_lý', '#ep01'], attachments: 6, assignees: ['Đ', 'M'] },
      { id: '5', title: 'Trùng Tang', tags: ['#ma_quỷ', '#truyền_thống'], attachments: 4, assignees: ['Đ'] },
    ]
  },
  {
    id: 'media',
    title: 'LÀM MEDIA',
    color: '#9333ea', 
    cards: [
      { id: '6', title: 'Bóng Tối Kể Chuyện', tags: ['#hoàn_chỉnh', '#dựng_video'], attachments: 12, assignees: ['Đ'] },
      { id: '7', title: 'Tiếng Kêu Trong Đêm', tags: ['#âm_thanh', '#edit'], attachments: 8, assignees: ['Đ', 'M'] },
    ]
  },
  {
    id: 'done',
    title: 'ĐÃ ĐĂNG',
    color: '#16a34a', 
    cards: [
      { id: '8', title: 'Linh Miêu Thần Tài', tags: ['#youtube', '#short'], attachments: 5, assignees: ['Đ'] },
      { id: '9', title: 'Bàn Thờ Góc Nhà', tags: ['#tiktok', '#viral'], attachments: 3, assignees: ['Đ', 'M'] },
      { id: '10', title: 'Chuyến Xe Buýt Đêm', tags: ['#kinh_dị', '#audio'], attachments: 7, assignees: ['Đ'] },
    ]
  }
];

const KanbanPage = () => {
  const [columns, setColumns] = useState(initialBoard);

  const handleNewScript = () => {
    console.log("Mở modal tạo kịch bản mới!");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f4f5f7'}}>
      {/* 1. Thanh TopBar phía trên cùng */}
      <TopBar 
        title="DashBoard" 
        subtitle="Quản lý tiến độ kịch bản" 
        onNewScript={handleNewScript} 
      />

      {/* 2. Khu vực chứa các Cột Kanban */}
      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', padding: '24px', display: 'flex', gap: '20px' }}>
        
        {columns.map(column => (
          // Cột (Column) - ĐÃ SỬA THÀNH flex: 1 ĐỂ CHIA ĐỀU
          <div key={column.id} style={{
            flex: 1, // <--- Sửa ở đây: Chia đều 100% chiều ngang cho 4 cột
            minWidth: '240px', // Đảm bảo cột không bị bóp méo quá đà nếu thu nhỏ cửa sổ
            display: 'flex', flexDirection: 'column',
            background: '#ffffff', borderRadius: '16px', border: '1px solid var(--border)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}>
            
            {/* Header của Cột */}
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-lit)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: column.color }} />
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>
                  {column.title}
                </div>
              </div>
              <div style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px' }}>
                {column.cards.length}
              </div>
            </div>

            {/* Danh sách Thẻ (Cards) */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {column.cards.map(card => (
                <div key={card.id} style={{
                  background: '#ffffff', border: '1px solid var(--border-lit)', borderRadius: '12px',
                  padding: '16px', cursor: 'grab', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  borderLeft: `4px solid ${column.color}`, 
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'}
                >
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: '19px', color: 'var(--text-primary)', marginBottom: '10px', lineHeight: 1.2 }}>
                    {card.title}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {card.tags.map(tag => (
                      <span key={tag} style={{
                        background: 'var(--bg-raised)', color: 'var(--text-secondary)',
                        fontSize: '11px', fontFamily: "'JetBrains Mono', monospace",
                        padding: '4px 8px', borderRadius: '6px'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      <Icon name="paperclip" size={14} color="var(--text-muted)" />
                      <span>{card.attachments}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {card.assignees.map((user, index) => (
                        <div key={index} style={{
                          width: '24px', height: '24px', borderRadius: '50%',
                          background: user === 'Đ' ? 'linear-gradient(135deg, #4a3f8a, #7a5a9a)' : 'linear-gradient(135deg, #2d5a8b, #4b8cc4)',
                          color: '#fff', fontSize: '10px', fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '2px solid #fff', marginLeft: index > 0 ? '-8px' : '0',
                          position: 'relative', zIndex: card.assignees.length - index
                        }}>
                          {user}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Nút Thêm kịch bản nhanh */}
            <div style={{ padding: '0 16px 16px' }}>
              <button style={{
                width: '100%', padding: '10px', background: 'transparent',
                border: '1px dashed var(--border)', borderRadius: '8px',
                color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <Icon name="plus" size={14} />
                Thêm kịch bản
              </button>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanPage;