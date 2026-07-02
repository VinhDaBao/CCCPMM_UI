import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { getAssetUrl } from '../../util/api'; // Nạp hàm chuẩn hóa url của nhóm

const CharacterNode = ({ data }) => {
  const getInitialLetter = (name) => {
    if (!name) return '?';
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <div className="min-w-[200px] border-2 border-blue-500 rounded-xl p-3 shadow-lg flex items-center gap-3" style={{ background: 'var(--bg-raised)' }}>
      {/* Cổng vật lý bên trái: Tắt ID để mở kết nối tự do 2D */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={true}
        className="w-2.5 h-2.5 !bg-blue-500 hover:scale-125 transition-transform"
      />

      {/* Vòng tròn ảnh đại diện: Đồng bộ hàm xử lý URL của nhóm */}
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-base shadow-inner shrink-0 overflow-hidden">
        {data?.avatarUrl ? (
          <img
            src={getAssetUrl(data.avatarUrl)}
            alt="avatar"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          getInitialLetter(data?.label)
        )}
      </div>

      <div className="flex flex-col overflow-hidden text-left">
        <span className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
          {data?.label || 'Unknown'}
        </span>
        <span className="text-xs font-medium truncate" style={{ color: 'var(--text-muted)' }}>
          {data?.role || 'No Role'}
        </span>
      </div>

      {/* Cổng vật lý bên phải: Tắt ID để mở kết nối tự do 2D */}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={true}
        className="w-2.5 h-2.5 !bg-blue-500 hover:scale-125 transition-transform"
      />
    </div>
  );
};

export default CharacterNode;