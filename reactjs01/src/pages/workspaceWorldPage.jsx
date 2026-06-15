import React, { useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider, // Cung cấp lớp màng bọc ngữ cảnh cho các Hook bên trong
} from '@xyflow/react';
import '@xyflow/react/dist/style.css'; // File CSS bắt buộc để hiển thị các Node/Edge

import {
  worldActionStart,
  worldActionFail,
  fetchGraphSuccess,
  setNodesAndEdges,
} from '../redux/worldSlice';
import { getWorldGraphApi, saveWorldGraphApi } from '../util/api';
import { notification } from 'antd';

// =========================================================
// COMPONENT 1 (RUỘT): THỰC THI LOGIC KÉO THẢ & MOCK DỮ LIỆU
// =========================================================
const WorldGraphCanvas = () => {
  // Bốc mã ID động từ thanh URL xuống thông qua React Router v6
  const { worldId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Khai báo Local State đặc quyền của ReactFlow để lắng nghe di chuyển tọa độ x,y
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const isLoading = useSelector((state) => state.world.isLoading);

  // ĐỊNH NGHĨA ID THẬT: Đây là ID duy nhất nằm trong DB máy bạn
  const MY_REAL_DB_WORLD_ID = "6a2eeb66af076489f827d9e5";

  // ================= LUỒNG TẢI DỮ LIỆU (FETCH GRAPH) =================
  useEffect(() => {
    const loadGraphData = async () => {
      // CHIẾN LƯỢC MOCK DATA: Nếu ID trên URL không phải ID trong DB của bạn (ví dụ máy thành viên khác)
      if (worldId !== MY_REAL_DB_WORLD_ID) {
        console.log(">>> Đang kích hoạt Chế độ Offline Sandbox Mode để bảo vệ hệ thống!");

        // Nạp ngay 2 Node mẫu Marvel trực quan trên Client, không gọi API để tránh lỗi 404/Crash
        setNodes([
          { id: 'mock_1', type: 'default', position: { x: 150, y: 150 }, data: { label: 'Iron Man (Tony Stark)' } },
          { id: 'mock_2', type: 'output', position: { x: 500, y: 150 }, data: { label: 'Lò Phản Ứng Arc (Vũ khí)' } }
        ]);
        setEdges([
          { id: 'edge_mock', source: 'mock_1', target: 'mock_2', label: 'OWNER', animated: true }
        ]);
        return; // Thoát sớm, chặn không cho gọi API xuống DB
      }

      // LUỒNG CHẠY DATA THẬT (Chỉ kích hoạt trên máy bạn khi ID trùng khớp)
      dispatch(worldActionStart());
      try {
        const res = await getWorldGraphApi(worldId);
        if (res && res.errCode === 0) {
          // Chuẩn hóa dữ liệu thô từ MongoDB sang dạng object hiển thị của ReactFlow
          const formattedNodes = (res.data.nodes || []).map((node) => ({
            id: node._id,
            type: 'default',
            position: node.position || { x: 100, y: 100 },
            data: { label: node.name },
          }));

          const formattedEdges = (res.data.edges || []).map((edge, index) => ({
            id: `edge-${index}-${Date.now()}`,
            source: edge.fromNodeId,
            target: edge.toNodeId,
            label: edge.type,
            animated: true,
          }));

          setNodes(formattedNodes);
          setEdges(formattedEdges);
          dispatch(fetchGraphSuccess({ nodes: res.data.nodes, edges: res.data.edges }));
        }
      } catch (error) {
        dispatch(worldActionFail(error.message));
        notification.error({ title: 'Lỗi', description: 'Không thể tải sơ đồ từ DB!' });
      }
    };

    loadGraphData();
  }, [worldId, setNodes, setEdges, dispatch]);

  // ================= LUỒNG KẾT NỐI VẼ ĐƯỜNG MŨI TÊN =================
  const onConnect = useCallback(
    (params) => {
      // Hàm addEdge của thư viện tự động tính toán tạo đường nối động nét đứt (animated)
      const newEdge = { ...params, animated: true, label: 'RELATION' };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // ================= LUỒNG LƯU DỮ LIỆU XUỐNG MONGO =================
  const handleSaveGraph = async () => {
    // Chặn không cho lưu nếu thành viên khác đang bấm ở chế độ Sandbox
    if (worldId !== MY_REAL_DB_WORLD_ID) {
      notification.warning({
        message: 'Sandbox Mode',
        description: 'Bạn đang ở chế độ vẽ thử nghiệm Offline, chức năng lưu vào DB tạm khóa!'
      });
      return;
    }

    dispatch(worldActionStart());
    try {
      const res = await saveWorldGraphApi(worldId, nodes, edges);
      if (res && res.errCode === 0) {
        notification.success({ message: 'Thành công', description: 'Sơ đồ đã được lưu đè vào MongoDB!' });
        dispatch(setNodesAndEdges({ nodes, edges }));
      }
    } catch (error) {
      dispatch(worldActionFail(error.message));
      notification.error({ message: 'Lỗi', description: 'Gặp sự cố khi lưu sơ đồ!' });
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Thanh Header điều khiển */}
      <div className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Relationship Diagram</h1>
          {worldId !== MY_REAL_DB_WORLD_ID && <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-semibold">Sandbox Mode (Offline)</span>}
        </div>
        <button
          onClick={handleSaveGraph}
          disabled={isLoading}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition-all active:scale-95
            ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isLoading ? 'Storing...' : 'SAVE GRAPH'}
        </button>
      </div>

      {/* Khu vực bảng vẽ Canvas chiếm trọn không gian */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls className="bg-white shadow-md rounded-lg" />
          <MiniMap className="border border-gray-200 rounded-lg bg-white" nodeColor={() => '#1677ff'} />
          <Background variant="dots" gap={16} size={1} color="#cbd5e1" />
        </ReactFlow>
      </div>
    </div>
  );
};

// =========================================================
// COMPONENT 2 (VỎ): CẤP NGỮ CẢNH ĐỂ TRIỆT TIÊU LỖI CRASH HÀM
// =========================================================
const WorkspaceWorldPage = () => {
  return (
    <ReactFlowProvider>
      <WorldGraphCanvas />
    </ReactFlowProvider>
  );
};

export default WorkspaceWorldPage;