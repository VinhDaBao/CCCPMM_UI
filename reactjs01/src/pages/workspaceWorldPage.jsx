import React, { useCallback, useEffect, useState } from 'react';
import { useParams , useOutletContext, useNavigate} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  worldActionStart,
  worldActionFail,
  fetchGraphSuccess,
  setNodesAndEdges,
} from '../redux/worldSlice';
import { getWorldGraphApi, saveWorldGraphApi, getAllAssetsApi, deleteWorldStageApi, createCharacterApi, updateWorldStagesApi} from '../util/api';
import { notification, Button, Tabs, Modal, Input, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CharacterNode from '../components/script-editor/CharacterNode';
import CustomRelationshipEdge from '../components/script-editor/CustomRelationshipEdge';
import WorldConfigDrawer from '../components/script-editor/WorldConfigDrawer';
import TopBar from '../components/creator-layout/topBar';
import useCharacters from '../hooks/useCharacters';

const nodeTypes = { characterNode: CharacterNode };
const edgeTypes = { customEdge: CustomRelationshipEdge };

const WorldGraphCanvas = () => {
  const { worldId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { screenToFlowPosition } = useReactFlow(); //lấy hàm screenToFlowPosition từ hook ra sử dụng

  const { activeWorkspaceId } = useOutletContext(); // Lấy mã Workspace động khi người dùng click đổi trên Sidebar tổng
  const { t } = useTranslation();
  const { data: realCharacters, isLoading: isLoadingChars, refetch: refetchCharacters } = useCharacters(activeWorkspaceId);

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
    { key: 'stage_1', label: t('workspace_world.default_stage') }
  ]);

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [tabToRename, setTabToRename] = useState(null);
  const [newTabName, setNewTabName] = useState('');

  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [newCharRole, setNewCharRole] = useState('');

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

useEffect(() => {
    // Nếu phát hiện activeWorkspaceId từ Sidebar tổng đã đổi sang mã mới,
    if (activeWorkspaceId && worldId && activeWorkspaceId !== worldId) {

      console.log(">>> Phát hiện lệch pha URL! Ép điều hướng sang Workspace mới:", activeWorkspaceId);

      // Tiến hành ép thanh URL nhảy sang tuyến đường mới của Workspace vừa chọn
      navigate(`/workspace/world/${activeWorkspaceId}`);
    }
  }, [activeWorkspaceId, worldId, navigate]);

  // Luồng tải đồ thị và quét khôi phục danh sách Tab động từ DB
  useEffect(() => {
    const loadGraphData = async () => {
      if (!activeWorkspaceId) return;

      dispatch(worldActionStart());
      try {
        const res = await getWorldGraphApi(activeWorkspaceId, activeTab);
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
              characterId: node.avatarUrl ? '' : node._id, // Giữ vết tránh mất
              keyValues: node.keyValues || []
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

          //const savedTabs = localStorage.getItem(`tabs_${activeWorkspaceId}_${worldId}`);
          if (res.data?.stages && res.data.stages.length > 0) {
              setTabsList(res.data.stages);
          } else {
              setTabsList([{ key: 'stage_1', label: t('workspace_world.default_stage') }]);
          }
        }
      } catch (error) {
        //Trả về tham chiếu sạch, triệt tiêu hoàn toàn mảng mock cũ hồi sinh
        setNodes((prev) => prev.length === 0 ? prev : []);
        setEdges((prev) => prev.length === 0 ? prev : []);
        dispatch(fetchGraphSuccess({ nodes: [], edges: [] }));
      }
    };

    loadGraphData();
    // Thêm activeWorkspaceId vào mảng phụ thuộc để kích hoạt re-fetch lập tức khi đổi Workspace
  }, [ activeTab, activeWorkspaceId, dispatch, worldId]);

  const onConnect = useCallback(
    (params) => {
      const isDuplicate = edges.some((e) => (e.source === params.source && e.target === params.target) || (e.source === params.target && e.target === params.source));
      if (isDuplicate) {
        notification.warning({ message: t('workspace_world.connection_restricted_title'), description: t('workspace_world.connection_restricted_desc') });
        return;
      }

      const edgeId = `edge-${Date.now()}`;
      const newEdge = {
        ...params,
        id: edgeId,
        type: 'customEdge',
        label: t('workspace_world.connected_edge_label'),
        style: { stroke: '#3b82f6', strokeWidth: 3 },
        data: { sideA: t('workspace_world.connected_edge_label').split(' --> │ <-- ')[0], sideB: t('workspace_world.connected_edge_label').split(' --> │ <-- ')[1] }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [edges, setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

//tính toán vị trí con trỏ chuột thả
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const rawData = event.dataTransfer.getData('application/reactflow');
      if (!rawData) return;

      const character = JSON.parse(rawData);

      //chặn trùng lặp nhân vật
      const isCharacterAlreadyInStage = nodes.some(
          (node) => String(node.data?.characterId) === String(character._id)
        );

        if (isCharacterAlreadyInStage) {
          notification.warning({
            message: 'Character Duplicate',
            description: `${character.name} is already added to this stage diagram!`
          });
          return; // Thoát hàm, không cho phép chạy xuống logic tạo Node dưới
        }

      // Tính toán vị trí thông minh, thích ứng hoàn hảo với các chế độ Zoom/Pan
      const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
      });

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
          characterId: character._id,
          keyValues: character.attributes || []
        },
      };

      setNodes((nds) => nds.concat(newNode));
      notification.success({ message: 'Success', description: t('workspace_world.load_character_success', { name: character.name }) });
    },
    [screenToFlowPosition, nodes, setNodes]
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
    notification.success({ message: t('workspace_world.remove_character_success_title'), description: t('workspace_world.remove_character_success_desc') });
  };

const handleSaveGraph = async () => {
  if (!activeWorkspaceId) return;
  setIsSaving(true);
  try {
    const payload = { nodes, edges, stageId: activeTab };
    const res = await saveWorldGraphApi(activeWorkspaceId, payload);
    if (res && res.errCode === 0) {
      notification.success({ message: 'Success', description: t('workspace_world.graph_saved_success') });
      dispatch(fetchGraphSuccess({ nodes: res.data?.nodes || nodes, edges: res.data?.edges || edges }));

      // Do mảng danh sách phân cảnh hiện tại đã được đồng bộ thời gian thực ở các hàm nghiệp vụ độc lập
    }
  } catch (error) {
    dispatch(worldActionFail(error.message));
    notification.error({ message: 'Error', description: t('workspace_world.graph_saved_error') });
  } finally {
    setIsSaving(false);
  }
};

  const handleCreateCharacter = async () => {
    if (!newCharName.trim()) return;

    try {
      // 1. Gọi API gửi payload tạo nhân vật lên không gian làm việc tương ứng ở Backend
      const res = await createCharacterApi(activeWorkspaceId, {
        name: newCharName.trim(),
        role: newCharRole.trim() || 'Character',
        description: ''
      });

      if (res && res.errCode === 0) {
        // 2. Thông báo thành công bằng tiếng Anh
        notification.success({
          message: 'Success',
          description: 'New character created successfully!'
        });

        // 3. Reset sạch form nhập liệu và đóng Modal
        setNewCharName('');
        setNewCharRole('');
        setIsCharModalOpen(false);

        // 4. Ép React Query kích hoạt tải lại danh sách nhân vật ngầm để cập nhật ngay lên Sidebar
        if (refetchCharacters) {
          refetchCharacters();
        }
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to create new character!'
      });
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

   //hàm sửa tên stage
const handleRenameTabSubmit = async () => {
  if (!newTabName.trim()) return;
  const updatedTabs = tabsList.map((t) => t.key === tabToRename ? { ...t, label: newTabName.trim() } : t);

  try {
    const res = await updateWorldStagesApi(activeWorkspaceId, updatedTabs);
    if (res && res.errCode === 0) {
      setTabsList(updatedTabs);
      setIsRenameModalOpen(false);
      notification.success({ message: 'Success', description: 'Stage renamed successfully!' });
    }
  } catch (error) {
    notification.error({ message: 'Error', description: 'Failed to sync renamed stage.' });
  }
};

const handleDeleteStage = async () => {
   if (!tabToRename) return;

   // Chốt chặn bảo vệ tuyệt đối không cho phép xóa Tab mặc định (stage_1)
   if (tabToRename === 'stage_1') {
     notification.warning({
       message: 'Restriction',
       description: t('workspace_world.cannot_delete_default_stage')
     });
     return;
   }

   // Hiển thị hộp thoại Modal xác nhận lại một lần nữa trước khi xóa hẳn
   Modal.confirm({
     title: t('workspace_world.delete_stage_confirm_title'),
     content: t('workspace_world.delete_stage_confirm_content'),
     okText: t('workspace_world.confirm'),
     okType: 'danger',
     cancelText: t('workspace_world.cancel'),
     centered: true,
     onOk: async () => {
       try {
         // 1. Gọi API gửi tín hiệu DELETE để dọn sạch Nodes/Edges thuộc stage này dưới MongoDB
         const res = await deleteWorldStageApi(activeWorkspaceId, tabToRename);

         if (res && res.errCode === 0) {
           // 2. Lọc loại bỏ phân đoạn bị xóa ra khỏi mảng danh sách Tab hiện tại
           const updatedTabs = tabsList.filter((tab) => tab.key !== tabToRename);

           // 3. ĐÃ ĐỔI: Gọi API đồng bộ mảng danh sách Tab rút gọn mới lên Server World Doc thay vì localStorage
           await updateWorldStagesApi(activeWorkspaceId, updatedTabs);

           // 4. Cập nhật State cục bộ để cập nhật UI hiển thị thanh Tabs
           setTabsList(updatedTabs);

           // 5. Kiểm tra: Nếu người dùng đang đứng ở đúng Tab vừa bị xóa, tự động chuyển vùng nhìn về stage_1
           if (activeTab === tabToRename) {
             setActiveTab('stage_1');
           }

           // Đóng Modal chỉnh sửa và thông báo thành công bằng tiếng Anh
           setIsRenameModalOpen(false);
           notification.success({
             message: 'Success',
             description: t('workspace_world.delete_stage_success')
           });
         }
       } catch (error) {
         notification.error({
           message: 'Error',
           description: t('workspace_world.delete_stage_error')
         });
       }
     }
   });
 };

  const handleAddNewNode = () => {
    const newNode = { id: `node-${Date.now()}`, type: 'characterNode', position: { x: 250, y: 200 }, data: { label: t('workspace_world.new_character_label'), role: t('workspace_world.character_role'), description: '', avatarUrl: '' } };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleDeleteNode = () => {
    if (!selectedElement || elementType !== 'node') return;
    const targetId = selectedElement.id;
    setNodes((nds) => nds.filter((n) => n.id !== targetId));
    setEdges((eds) => eds.filter((e) => e.source !== targetId && e.target !== targetId));
    setDrawerOpen(false);
    notification.success({ message: t('workspace_world.remove_character_success_title'), description: t('workspace_world.remove_character_success_desc') });
  };

  const sourceNodeName = nodes.find(n => n.id === selectedElement?.source)?.data?.label || t('workspace_world.node_a');
  const targetNodeName = nodes.find(n => n.id === selectedElement?.target)?.data?.label || t('workspace_world.node_b');

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden font-sans" style={{ background: 'var(--bg-void)' }}>
      <TopBar title={t('workspace_world.title')} subtitle={t('workspace_world.default_stage')} />

      <div className="px-6 pt-2 flex items-center justify-between shrink-0 font-sans" style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)} className="mb-[-1px] font-sans" items={tabsList.map(tab => ({
          key: tab.key, label: <span className="flex items-center gap-2 group font-sans font-medium text-sm">{tab.label}<span className="text-xs text-gray-400 hover:text-blue-500 cursor-pointer hidden group-hover:inline" onClick={(e) => { e.stopPropagation(); handleOpenRenameModal(tab.key); }}>✏️</span></span>
        }))} />
        <Button
          type="dashed"
          size="small"
          className="font-sans"
          onClick={async () => {
            const newKey = `stage_${Date.now()}`;
            const updatedTabs = [...tabsList, { key: newKey, label: t('workspace_world.stage') + ' ' + (tabsList.length + 1) }];

            try {
              // Gọi API cập nhật danh sách Tab tập trung dưới MongoDB Backend
              const res = await updateWorldStagesApi(activeWorkspaceId, updatedTabs);
              if (res && res.errCode === 0) {
                setTabsList(updatedTabs);
                setActiveTab(newKey);
                notification.success({
                  message: 'Success',
                  description: 'New stage tab added and synchronized!'
                });
              }
            } catch (err) {
              notification.error({
                message: 'Error',
                description: 'Failed to synchronize new stage tab with server.'
              });
            }
          }}
        >
          {t('workspace_world.add_stage_tab')}
        </Button>
      </div>

      <div className="h-16 px-6 flex items-center justify-between shadow-sm shrink-0 font-sans" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <h1 className="text-lg font-bold text-gray-800 font-sans tracking-tight">{t('workspace_world.title')}</h1>
        <button onClick={handleSaveGraph} disabled={isSaving} className={`px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-md font-sans tracking-wide transition-all ${isSaving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {isSaving ? t('workspace_world.storing') : t('workspace_world.save_graph')}
        </button>
      </div>

      <div className="flex-1 flex w-full h-full overflow-hidden font-sans">
        <div className="w-72 p-4 flex flex-col gap-3 overflow-y-auto shrink-0 select-none text-left font-sans" style={{ background: 'var(--bg-raised)', borderRight: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-2 select-none shrink-0">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0 font-sans">
              {t('workspace_world.workspace_characters')}
            </h3>
            <Button
              type="text"
              size="small"
              shape="circle"
              icon={<PlusOutlined />}
              title={t('workspace_world.add_character_tooltip')}
              onClick={() => setIsCharModalOpen(true)}
              className="text-gray-400 hover:text-blue-500 flex items-center justify-center transition-all"
            />
          </div>
          {isLoadingChars ? (
            <div className="text-center py-6 font-sans"><Spin size="small" /></div>
          ) : realCharacters?.length > 0 ? (
            realCharacters.map((char) => (
              <div
                key={char._id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('application/reactflow', JSON.stringify(char))}
                className="p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all flex flex-col gap-0.5 shadow-sm font-sans"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-raised)'}
              >
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{char.name}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{char.role || 'Character'}</span>
              </div>
            ))
          ) : (
            <span className="text-xs text-gray-400 italic font-sans">{t('workspace_world.no_characters')}</span>
          )}
        </div>

        <div className="flex-1 h-full relative font-sans" onDrop={onDrop} onDragOver={onDragOver} style={{ background: 'var(--bg-void)' }}>
          <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={onNodeClick} onEdgeClick={onEdgeClick} fitView>
            <Controls />
            <MiniMap nodeColor={() => '#1677ff'} />
            <Background variant="dots" gap={16} size={1} color="var(--border-lit)" />
          </ReactFlow>
        </div>
      </div>

      <WorldConfigDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} elementType={elementType} selectedElement={selectedElement} assetImages={assetImages} relationSideA={relationSideA} relationSideB={relationSideB} handleUpdateNodeField={handleUpdateNodeField} handleUpdateBidirectionalEdge={handleUpdateBidirectionalEdge} handleUpdateEdgeColor={handleUpdateEdgeColor} handleDeleteNode={handleDeleteNode} handleDeleteEdge={handleDeleteEdge} sourceNodeName={sourceNodeName} targetNodeName={targetNodeName} />
      <Modal
        title={<span className="font-sans font-bold text-base">{t('workspace_world.rename_stage_title')}</span>}
        open={isRenameModalOpen}
        onCancel={() => setIsRenameModalOpen(false)}
        centered
        className="font-sans"
        footer={[
          // Nếu không phải là Tab mặc định (stage_1) thì mới hiển thị nút bấm xóa phân đoạn này ra ngoài
          tabToRename !== 'stage_1' && (
            <Button
              key="delete"
              type="primary"
              danger
              onClick={handleDeleteStage}
              style={{ float: 'left' }}
              className="font-sans font-medium rounded-lg"
            >
              {t('workspace_world.delete_stage')}
            </Button>
          ),
          <Button key="cancel" className="font-sans rounded-lg" onClick={() => setIsRenameModalOpen(false)}>
            {t('workspace_world.cancel')}
          </Button>,
          <Button key="submit" type="primary" className="font-sans rounded-lg" onClick={handleRenameTabSubmit}>
            {t('workspace_world.confirm')}
          </Button>
        ].filter(Boolean)} // Loại bỏ giá trị false của mảng khi đứng ở stage_1 để Ant Design không lỗi render
      >
        <div className="pt-3 font-sans">
          <label className="text-xs font-bold text-gray-400 block mb-1 font-sans">
            {t('workspace_world.stage_name')}
          </label>
          <Input
            className="font-sans h-10 rounded-lg"
            value={newTabName}
            onChange={(e) => setNewTabName(e.target.value)}
            placeholder={t('workspace_world.stage_name_placeholder')}
          />
        </div>
      </Modal>

      <Modal
              title={<span className="font-sans font-bold text-base">{t('workspace_world.add_character_tooltip')}</span>}
              open={isCharModalOpen}
              onOk={handleCreateCharacter}
              onCancel={() => setIsCharModalOpen(false)}
              okText={t('workspace_world.confirm')}
              cancelText={t('workspace_world.cancel')}
              centered
              className="font-sans"
            >
              <div className="pt-3 flex flex-col gap-4 font-sans">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1 font-sans">CHARACTER NAME</label>
                  <Input
                    className="font-sans h-10 rounded-lg"
                    value={newCharName}
                    onChange={(e) => setNewCharName(e.target.value)}
                    placeholder="Enter character name..."
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1 font-sans">ROLE / TAG</label>
                  <Input
                    className="font-sans h-10 rounded-lg"
                    value={newCharRole}
                    onChange={(e) => setNewCharRole(e.target.value)}
                    placeholder="e.g. Protagonist, Antagonist, Side Character..."
                  />
                </div>
              </div>
            </Modal>
    </div>
  );
};

const WorkspaceWorldPage = () => {
    //activeWorkspaceId từ Context ở cấp màng bọc Provider để làm chìa khóa định danh (Key)
  const { activeWorkspaceId } = useOutletContext();
  return (
      <ReactFlowProvider>
          <WorldGraphCanvas key={activeWorkspaceId} />
      </ReactFlowProvider>
  )
};

export default WorkspaceWorldPage;