import React, { useCallback, useEffect, useState } from 'react';
import { useParams , useOutletContext} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  worldActionStart,
  worldActionFail,
  fetchGraphSuccess,
  setNodesAndEdges,
} from '../redux/worldSlice';
import { getWorldGraphApi, saveWorldGraphApi, getAllAssetsApi } from '../util/api';
import { notification, Button, Tabs, Modal, Input, Spin } from 'antd';
import CharacterNode from '../components/script-editor/CharacterNode';
import CustomRelationshipEdge from '../components/script-editor/CustomRelationshipEdge';
import WorldConfigDrawer from '../components/script-editor/WorldConfigDrawer';
import useCharacters from '../hooks/useCharacters';

const nodeTypes = { characterNode: CharacterNode };
const edgeTypes = { customEdge: CustomRelationshipEdge };

const WorldGraphCanvas = () => {
  const { worldId } = useParams();
  const dispatch = useDispatch();

  const { activeWorkspaceId } = useOutletContext(); // Lấy mã Workspace động khi người dùng click đổi trên Sidebar tổng
  const { data: realCharacters, isLoading: isLoadingChars } = useCharacters(activeWorkspaceId);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSaving, setIsSaving] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [elementType, setElementType] = useState('');

  const [assetImages, setAssetImages] = useState([]);
  const [relationSideA, setRelationSideA] = useState('');
  const [relationSideB, setRelationSideB] = useState('');

  const [activeTab, setActiveTab] = useState('stage_1');

  const [tabsList, setTabsList] = useState([
    { key: 'stage_1', label: 'Main Stage' }
  ]);

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [tabToRename, setTabToRename] = useState(null);
  const [newTabName, setNewTabName] = useState('');

  // Luồng nạp kho ảnh Asset
  useEffect(() => {
    const loadWorkspaceAssets = async () => {
      if (!worldId || !activeWorkspaceId) return;
      try {
        const res = await getAllAssetsApi(worldId, { type: 'image' });
        if (res && res.data) setAssetImages(res.data);
        else if (Array.isArray(res)) setAssetImages(res);
      } catch (err) {
        setAssetImages([
          { _id: 'a1', fileName: 'Hero_Avatar.png', url: 'uploads/hero.png' },
          { _id: 'a2', fileName: 'Villain_Profile.jpg', url: 'uploads/villain.jpg' }
        ]);
      }
    };
    loadWorkspaceAssets();
  }, [worldId, activeWorkspaceId]);

  // Luồng tải đồ thị và quét khôi phục danh sách Tab động từ DB
  useEffect(() => {
    const loadGraphData = async () => {
      if (!worldId) return;

      dispatch(worldActionStart());
      try {
        const res = await getWorldGraphApi(worldId, activeTab);
        if (res && res.errCode === 0) {
          const nodesData = res.data?.nodes || [];
          const edgesData = res.data?.edges || [];

          // Chỉ định dạng hiển thị cho các Node nhân vật kéo từ Sidebar thực tế
          const formattedNodes = nodesData.map((node) => ({
            id: node._id,
            type: 'characterNode',
            position: node.position || { x: 100, y: 100 },
            data: {
              label: node.name,
              role: node.tags?.[0] || 'Character',
              description: node.description || '',
              avatarUrl: node.avatarUrl || '',
              characterId: node.avatarUrl ? '' : node._id // Giữ vết tránh mất
            },
          }));

          const formattedEdges = edgesData.map((edge, index) => ({
              id: edge._id || `edge-${index}-${Date.now()}`,
              source: edge.fromNodeId,
              target: edge.toNodeId,
              type: 'customEdge',
              label: edge.type || 'Connected',
              style: { stroke: edge.color || '#3b82f6', strokeWidth: 3 },
              data: {
                sideA: edge.type?.split('-->')[0]?.trim() || 'Connected',
                sideB: edge.type?.split('<--')[1]?.trim() || 'Connected'
              }
          }));

          setNodes(formattedNodes);
          setEdges(formattedEdges);
          dispatch(fetchGraphSuccess({ nodes: nodesData, edges: edgesData }));

          // Khôi phục mảng Tab lưu tạm theo World và Workspace tương ứng
          const savedTabs = localStorage.getItem(`tabs_${activeWorkspaceId}_${worldId}`);
          if (savedTabs) {
            setTabsList(JSON.parse(savedTabs));
          } else {
            setTabsList([{ key: 'stage_1', label: 'Main Stage' }]);
          }
        }
      } catch (error) {
        // FIX VẤN ĐỀ 1: Trả về tham chiếu sạch, triệt tiêu hoàn toàn mảng mock cũ hồi sinh
        setNodes((prev) => prev.length === 0 ? prev : []);
        setEdges((prev) => prev.length === 0 ? prev : []);
        dispatch(fetchGraphSuccess({ nodes: [], edges: [] }));
      }
    };

    loadGraphData();
    // Thêm activeWorkspaceId vào mảng phụ thuộc để kích hoạt re-fetch lập tức khi đổi Workspace
  }, [worldId, activeTab, activeWorkspaceId, dispatch, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => {
      const isDuplicate = edges.some((e) => (e.source === params.source && e.target === params.target) || (e.source === params.target && e.target === params.source));
      if (isDuplicate) {
        notification.warning({ message: 'Ràng buộc kết nối', description: 'Giữa hai nhân vật đã có đường quan hệ!' });
        return;
      }

      const edgeId = `edge-${Date.now()}`;
      const newEdge = {
        ...params,
        id: edgeId,
        type: 'customEdge',
        label: 'Connected --> │ <-- Connected',
        style: { stroke: '#3b82f6', strokeWidth: 3 },
        data: { sideA: 'Connected', sideB: 'Connected' }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [edges, setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const rawData = event.dataTransfer.getData('application/reactflow');
      if (!rawData) return;

      const character = JSON.parse(rawData);
      const position = { x: event.clientX - 350, y: event.clientY - 150 };
      const newNodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

      const newNode = {
        id: newNodeId,
        type: 'characterNode',
        position,
        data: {
          label: character.name,
          role: character.role || 'Character',
          description: character.description || '',
          avatarUrl: character.avatarUrl || '',
          characterId: character._id
        },
      };

      setNodes((nds) => nds.concat(newNode));
      notification.success({ message: 'Thành công', description: `Đã nạp nhân vật ${character.name} vào sơ đồ!` });
    },
    [setNodes]
  );

  const onNodeClick = useCallback((event, node) => {
      setElementType('node');
      setSelectedElement(node);
      setDrawerOpen(true);
  }, []);

  const onEdgeClick = useCallback((event, edge) => {
      setElementType('edge');
      setSelectedElement(edge);
      setRelationSideA(edge.data?.sideA || 'Connected');
      setRelationSideB(edge.data?.sideB || 'Connected');
      setDrawerOpen(true);
  }, []);

  const handleUpdateNodeField = (field, value) => {
    if (!selectedElement || elementType !== 'node') return;
    setNodes((nds) => nds.map((n) => n.id === selectedElement.id ? { ...n, data: { ...n.data, [field]: value } } : n));
    setSelectedElement((prev) => ({ ...prev, data: { ...prev.data, [field]: value } }));
  };

  const handleUpdateBidirectionalEdge = (side, value) => {
    if (!selectedElement || elementType !== 'edge') return;
    let nextSideA = side === 'A' ? value : relationSideA;
    let nextSideB = side === 'B' ? value : relationSideB;
    if (side === 'A') setRelationSideA(value); else setRelationSideB(value);

    const compiledLabel = `${nextSideA} --> │ <-- ${nextSideB}`;
    setEdges((eds) => eds.map((e) => e.id === selectedElement.id ? { ...e, label: compiledLabel, data: { sideA: nextSideA, sideB: nextSideB } } : e));
    setSelectedElement((prev) => ({ ...prev, label: compiledLabel, data: { sideA: nextSideA, sideB: nextSideB } }));
  };

  const handleUpdateEdgeColor = (colorValue) => {
    if (!selectedElement || elementType !== 'edge') return;
    setEdges((eds) => eds.map((e) => e.id === selectedElement.id ? { ...e, style: { stroke: colorValue, strokeWidth: 3 } } : e));
    setSelectedElement((prev) => ({ ...prev, style: { stroke: colorValue, strokeWidth: 3 } }));
  };

  const handleDeleteEdge = () => {
    if (!selectedElement || elementType !== 'edge') return;
    setEdges((eds) => eds.filter((e) => e.id !== selectedElement.id));
    setDrawerOpen(false);
    notification.success({ message: 'Thông báo', description: 'Đã gỡ bỏ đường quan hệ này!' });
  };

  const handleSaveGraph = async () => {
    if (!worldId) return;
    setIsSaving(true);
    try {
        const payload = { nodes, edges, stageId: activeTab };
        const res = await saveWorldGraphApi(worldId, payload);
        if (res && res.errCode === 0) {
          notification.success({ message: 'Thành công', description: 'Sơ đồ đã được lưu đè vào MongoDB!' });
          dispatch(fetchGraphSuccess({ nodes: res.data?.nodes || nodes, edges: res.data?.edges || edges }));
          localStorage.setItem(`tabs_${activeWorkspaceId}_${worldId}`, JSON.stringify(tabsList));
        }
      } catch (error) {
        dispatch(worldActionFail(error.message));
        notification.error({ message: 'Lỗi', description: 'Gặp sự cố khi kết nối lưu sơ đồ!' });
      } finally {
        setIsSaving(false);
      }
    };

  const handleOpenRenameModal = (tabKey) => {
    const targetTab = tabsList.find(t => t.key === tabKey);
    if (targetTab) {
      setTabToRename(tabKey);
      setNewTabName(targetTab.label);
      setIsRenameModalOpen(true);
    }
  };

  const handleRenameTabSubmit = () => {
    if (!newTabName.trim()) return;
    const updatedTabs = tabsList.map((t) => t.key === tabToRename ? { ...t, label: newTabName.trim() } : t);
    setTabsList(updatedTabs);
    localStorage.setItem(`tabs_${activeWorkspaceId}_${worldId}`, JSON.stringify(updatedTabs));
    setIsRenameModalOpen(false);
  };

  const handleAddNewNode = () => {
    const newNode = { id: `node-${Date.now()}`, type: 'characterNode', position: { x: 250, y: 200 }, data: { label: 'New Character', role: 'Character', description: '', avatarUrl: '' } };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleDeleteNode = () => {
    if (!selectedElement || elementType !== 'node') return;
    const targetId = selectedElement.id;
    setNodes((nds) => nds.filter((n) => n.id !== targetId));
    setEdges((eds) => eds.filter((e) => e.source !== targetId && e.target !== targetId));
    setDrawerOpen(false);
    notification.success({ message: 'Thông báo', description: 'Đã xóa nhân vật khỏi sơ đồ!' });
  };

  const sourceNodeName = nodes.find(n => n.id === selectedElement?.source)?.data?.label || 'Node A';
  const targetNodeName = nodes.find(n => n.id === selectedElement?.target)?.data?.label || 'Node B';

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 overflow-hidden">
      <div className="bg-white px-6 pt-2 border-b border-gray-100 flex items-center justify-between shrink-0">
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)} className="mb-[-1px]" items={tabsList.map(tab => ({
          key: tab.key, label: <span className="flex items-center gap-2 group">{tab.label}<span className="text-xs text-gray-400 hover:text-blue-500 cursor-pointer hidden group-hover:inline" onClick={(e) => { e.stopPropagation(); handleOpenRenameModal(tab.key); }}>✏️</span></span>
        }))} />
        <Button type="dashed" size="small" onClick={() => {
          const newKey = `stage_${Date.now()}`;
          const updatedTabs = [...tabsList, { key: newKey, label: `Stage ${tabsList.length + 1}` }];
          setTabsList(updatedTabs);
          setActiveTab(newKey);
          localStorage.setItem(`tabs_${activeWorkspaceId}_${worldId}`, JSON.stringify(updatedTabs));
        }}>+ Add Stage Tab</Button>
      </div>

      <div className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between shadow-sm shrink-0">
        <h1 className="text-lg font-bold text-gray-800">Relationship Diagram</h1>
        <button onClick={handleSaveGraph} disabled={isSaving} className={`px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-md ${isSaving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {isSaving ? 'Storing...' : 'SAVE GRAPH'}
        </button>
      </div>

      <div className="flex-1 flex w-full h-full overflow-hidden">
        <div className="w-72 bg-white border-r border-gray-200 p-4 flex flex-col gap-3 overflow-y-auto shrink-0 select-none text-left">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Workspace Characters</h3>
          {isLoadingChars ? (
            <div className="text-center py-6"><Spin size="small" /></div>
          ) : realCharacters?.length > 0 ? (
            realCharacters.map((char) => (
              <div
                key={char._id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('application/reactflow', JSON.stringify(char))}
                className="p-3 border border-gray-100 rounded-xl bg-gray-50 hover:bg-blue-50 hover:border-blue-200 cursor-grab active:cursor-grabbing transition-all flex flex-col gap-0.5 shadow-sm"
              >
                <span className="text-sm font-bold text-gray-700">{char.name}</span>
                <span className="text-xs text-gray-400 font-medium">{char.role || 'Character'}</span>
              </div>
            ))
          ) : (
            <span className="text-xs text-gray-400 italic">Chưa có nhân vật nào trong kịch bản.</span>
          )}
        </div>

        <div className="flex-1 h-full relative" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={onNodeClick} onEdgeClick={onEdgeClick} fitView>
            <Controls />
            <MiniMap nodeColor={() => '#1677ff'} />
            <Background variant="dots" gap={16} size={1} color="#cbd5e1" />
          </ReactFlow>
        </div>
      </div>

      <WorldConfigDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} elementType={elementType} selectedElement={selectedElement} assetImages={assetImages} relationSideA={relationSideA} relationSideB={relationSideB} handleUpdateNodeField={handleUpdateNodeField} handleUpdateBidirectionalEdge={handleUpdateBidirectionalEdge} handleUpdateEdgeColor={handleUpdateEdgeColor} handleDeleteNode={handleDeleteNode} handleDeleteEdge={handleDeleteEdge} sourceNodeName={sourceNodeName} targetNodeName={targetNodeName} />
      <Modal title="Đổi Tên Giai Đoạn Sơ Đồ" open={isRenameModalOpen} onOk={handleRenameTabSubmit} onCancel={() => setIsRenameModalOpen(false)} okText="Xác nhận" cancelText="Hủy" centered><div className="pt-3"><label className="text-xs font-bold text-gray-400 block mb-1">Stage name</label><Input value={newTabName} onChange={(e) => setNewTabName(e.target.value)} placeholder="Ví dụ: Hồi 1: Gặp gỡ..." /></div></Modal>
    </div>
  );
};

const WorkspaceWorldPage = () => {
  return <ReactFlowProvider><WorldGraphCanvas /></ReactFlowProvider>;
};

export default WorkspaceWorldPage;