import React, { useState } from 'react';
import { EdgeLabelRenderer } from '@xyflow/react';

const CustomRelationshipEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  label,
}) => {
  const [labelOffset, setLabelOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Thuật toán đường thẳng phẳng 2D tuyệt đối giữa hai điểm neo
  const edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;

  // Tọa độ trung tâm hình học chính xác để đặt nhãn chữ
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;

  const handleMouseDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setLabelOffset((prev) => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX + labelOffset.x}px, ${labelY + labelOffset.y}px)`,
            background: 'white',
            padding: '4px 8px',
            border: `2px solid ${style.stroke || '#3b82f6'}`,
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#1f2937',
            cursor: 'move',
            pointerEvents: 'all',
          }}
          className="shadow-md select-none whitespace-nowrap"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomRelationshipEdge;