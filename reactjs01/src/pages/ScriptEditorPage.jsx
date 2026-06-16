import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, Button, Select, Space, Tooltip, notification, Spin, Modal, Input, List, Checkbox, Avatar, Badge, Popover } from 'antd';

import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  HistoryOutlined,
  CameraOutlined,
  ProfileOutlined,
  CopyOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  SendOutlined,
  CloudUploadOutlined,
  LoadingOutlined,
  DeleteOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import dayjs from 'dayjs';

// Hooks
import useProjects from '../hooks/useProjects';
import useBlocks from '../hooks/useBlocks';
import useCharacters from '../hooks/useCharacters';
import useProjectAssets from '../hooks/useProjectAssets';
import useProjectSnapshots from '../hooks/useProjectSnapshots';
import useSnippets from '../hooks/useSnippets';
import useWorkspaces from '../hooks/useWorkspaces';
import useWorkspaceMembers from '../hooks/useWorkspaceMember';

// Components
import BlockItem from '../components/script-editor/BlockItem';
import CharacterModal from '../components/script-editor/CharacterModal';
import ActivityLogModal from '../components/script-editor/ActivityLogModal';
import SnapshotHistoryModal from '../components/script-editor/SnapshotHistoryModal';

// API helpers
import { getAllAssetsApi, getAssetUrl } from '../util/api';

const roleLabels = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  VIEWER: 'Viewer'
};

const ScriptEditorPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const auth = useSelector((state) => state.auth);
  const user = auth?.user || {};

  const { activeWorkspaceId } = useOutletContext();

  // Lấy role hiện tại của user trong workspace
  const { data: workspaces = [] } = useWorkspaces();
  const activeWorkspace = workspaces.find(ws => String(ws._id || ws.id) === String(activeWorkspaceId));
  const memberRole = activeWorkspace?.memberRole || 'VIEWER';
  const isViewer = memberRole === 'VIEWER';

  // Lấy danh sách thành viên workspace để xác định online/offline status
  const { data: members = [] } = useWorkspaceMembers(activeWorkspaceId);

  // Lấy chi tiết project
  const { data: projects = [], duplicateProject } = useProjects(activeWorkspaceId);
  const currentProject = useMemo(() => projects.find((p) => String(p._id || p.id) === String(projectId)), [projects, projectId]);

  // Các hooks React Query
  const { data: blocks = [], createBlock, updateBlock, deleteBlock, isLoading: isBlocksLoading } = useBlocks(activeWorkspaceId, projectId);
  const { data: characters = [], createCharacter } = useCharacters(activeWorkspaceId);
  const { data: projectAssets = [], attachAssets, deleteProjectAsset } = useProjectAssets(activeWorkspaceId, projectId);
  const { data: snippets = [], createSnippet } = useSnippets(activeWorkspaceId);
  const { createSnapshot } = useProjectSnapshots(activeWorkspaceId, projectId);

  // States
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voiceEngine, setVoiceEngine] = useState('BROWSER');
  const [readingBlockId, setReadingBlockId] = useState(null);
  const [highlightRange, setHighlightRange] = useState(null);
  const [isVoicePaused, setIsVoicePaused] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'AI', text: 'Hi! I am your collaborative Script Assistant. Need help writing or reviewing a dialogue block?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Modals
  const [charModalOpen, setCharModalOpen] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [attachModalOpen, setAttachModalOpen] = useState(false);
  const [snippetModalOpen, setSnippetModalOpen] = useState(false);
  const [blockTypeModalOpen, setBlockTypeModalOpen] = useState(false);
  const [addBlockPosition, setAddBlockPosition] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [snippetSourceBlock, setSnippetSourceBlock] = useState(null);
  const [snippetContentHtml, setSnippetContentHtml] = useState('');
  const [snippetTitle, setSnippetTitle] = useState('');
  const [snippetTags, setSnippetTags] = useState([]);

  // Workspace Assets list (for attaching)
  const [workspaceAssets, setWorkspaceAssets] = useState([]);
  const [searchAsset, setSearchAsset] = useState('');
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [isAssetsLoading, setIsAssetsLoading] = useState(false);

  // Collaboration Cursors / Presence list
  const [presenceUsers, setPresenceUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Autosave tracking
  const pendingUpdatesRef = useRef({});
  const saveTimeoutRef = useRef(null);

  // Yjs doc và Hocuspocus provider lifecycle management
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const prevProjectIdRef = useRef(null);
  const prevUserIdRef = useRef(null);
  const currentUserId = user._id || user.id;

  // Synchronous recreation on render if projectId or userId changes, with immediate destruction of old instances
  if (!ydocRef.current || prevProjectIdRef.current !== projectId) {
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
      setConnectionStatus('disconnected');
    }
    if (ydocRef.current) {
      ydocRef.current.destroy();
      ydocRef.current = null;
    }
    ydocRef.current = new Y.Doc();
    prevProjectIdRef.current = projectId;
  }

  if (!providerRef.current || prevUserIdRef.current !== currentUserId) {
    if (providerRef.current) {
      providerRef.current.destroy();
    }
    providerRef.current = new HocuspocusProvider({
      url: 'ws://localhost:1234',
      name: `project-${projectId}`,
      document: ydocRef.current,
      userData: {
        userId: currentUserId,
        email: user.email,
        name: user.fullName || 'Collaborator',
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      },
    });

    // Explicitly initialize local awareness user details
    providerRef.current.awareness.setLocalStateField('user', {
      userId: currentUserId,
      email: user.email,
      name: user.fullName || 'Collaborator',
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
    });

    prevUserIdRef.current = currentUserId;

    providerRef.current.on('awarenessUpdate', ({ states }) => {
      const users = states
        .map((state) => state.user)
        .filter(Boolean);
      setPresenceUsers(users);
    });

    providerRef.current.on('status', ({ status }) => {
      console.log('STATUS:', status, Date.now());
      setConnectionStatus(status);
    });

    providerRef.current.on('synced', () => {
      console.log('SYNCED:', Date.now());
    });
  }

  const ydoc = ydocRef.current;
  const provider = providerRef.current;

  const updateBlockRef = useRef(updateBlock);
  useEffect(() => {
    updateBlockRef.current = updateBlock;
  }, [updateBlock]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      // Flush pending updates
      const updates = pendingUpdatesRef.current;
      if (updates && Object.keys(updates).length > 0) {
        pendingUpdatesRef.current = {};
        Promise.all(
          Object.entries(updates).map(([id, updateData]) =>
            updateBlockRef.current({ id, data: updateData })
          )
        ).catch((err) => console.error('Failed to flush updates on unmount:', err));
      }

      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
        setConnectionStatus('disconnected');
      }
      if (ydocRef.current) {
        ydocRef.current.destroy();
        ydocRef.current = null;
      }
    };
  }, []);

  // 1. Browser Voice List Initialization
  useEffect(() => {
    const loadVoices = () => {
      const vList = window.speechSynthesis.getVoices();
      setVoices(vList);
      if (vList.length > 0 && !selectedVoice) {
        setSelectedVoice(vList.find(v => v.lang.startsWith('en')) || vList[0]);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.cancel();
      setIsVoiceActive(false);
      setIsVoicePaused(false);
    };
  }, [selectedVoice]);

  const handleAddSnippet = (block, currentHtml) => {
    setSnippetSourceBlock(block);
    setSnippetContentHtml(currentHtml || '');
    setSnippetTitle('');
    setSnippetTags([]);
    setSnippetModalOpen(true);
  };

  // Autosave timeout is cleaned up in consolidated unmount effect

  // 2. Speech synthesis engine
  const playBlock = (block) => {
    // If clicking the currently reading block AND voice is active, toggle play/pause!
    if ((block._id || block.id) === readingBlockId && isVoiceActive) {
      handleTogglePauseVoice();
      return;
    }

    playBlockDirectly(block);
  };

  const playBlockDirectly = (block) => {
    window.speechSynthesis.cancel();
    setIsVoiceActive(true);
    setIsVoicePaused(false);
    setReadingBlockId(block._id || block.id);

    const text = block.type === 'DIALOGUE' ? (block.content?.text || '') : (block.content || '');
    const plainText = text.replace(/<[^>]*>/g, '');

    if (!plainText.trim()) {
      playNextReadableBlock(block._id || block.id);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(plainText);
    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        const remainingText = plainText.slice(charIndex);
        const nextSpace = remainingText.search(/\s/);
        const wordLength = nextSpace === -1 ? remainingText.length : nextSpace;

        setHighlightRange({
          blockId: block._id || block.id,
          start: charIndex,
          end: charIndex + wordLength
        });
      }
    };

    utterance.onend = () => {
      playNextReadableBlock(block._id || block.id);
    };

    utterance.onerror = () => {
      setReadingBlockId(null);
      setHighlightRange(null);
      setIsVoiceActive(false);
      setIsVoicePaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const playNextReadableBlock = (currentBlockId) => {
    const currentIndex = blocks.findIndex(b => (b._id || b.id) === currentBlockId);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex + 1;
    while (nextIndex < blocks.length) {
      const nextBlock = blocks[nextIndex];
      if (nextBlock.type === 'TEXT' || nextBlock.type === 'DIALOGUE') {
        playBlockDirectly(nextBlock);
        return;
      }
      nextIndex++;
    }

    // Finished sequential reading
    setReadingBlockId(null);
    setHighlightRange(null);
    setIsVoiceActive(false);
    setIsVoicePaused(false);
    notification.info({ message: 'Reading Finished' });
  };

  const handleResetReading = () => {
    window.speechSynthesis.cancel();
    setIsVoiceActive(false);
    setIsVoicePaused(false);
    setHighlightRange(null);
    const firstReadable = blocks.find(b => b.type === 'TEXT' || b.type === 'DIALOGUE');
    if (firstReadable) {
      setReadingBlockId(firstReadable._id || firstReadable.id);
      notification.info({ message: 'Reading pointer reset to first block' });
    } else {
      setReadingBlockId(null);
      notification.warning({ message: 'No readable blocks found' });
    }
  };

  const handleTogglePauseVoice = () => {
    if (isVoiceActive) {
      if (isVoicePaused) {
        window.speechSynthesis.resume();
        setIsVoicePaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsVoicePaused(true);
      }
    } else {
      // Speech has not started yet. Play from current readingBlockId or first readable block.
      const targetBlock = blocks.find(b => (b._id || b.id) === readingBlockId);
      if (targetBlock) {
        playBlockDirectly(targetBlock);
      } else {
        const firstReadable = blocks.find(b => b.type === 'TEXT' || b.type === 'DIALOGUE');
        if (firstReadable) {
          playBlockDirectly(firstReadable);
        } else {
          notification.warning({ message: 'No readable blocks found' });
        }
      }
    }
  };

  // 3. Autosave with Debounce
  const handleUpdateBlock = (blockId, data) => {
    // 1. Instantly update UI cache
    queryClient.setQueryData(['blocks', activeWorkspaceId, projectId], (old) => {
      if (!old) return [];
      return old.map(b => (b._id || b.id) === blockId ? { ...b, ...data } : b);
    });

    // 2. Queue updates
    pendingUpdatesRef.current[blockId] = {
      ...pendingUpdatesRef.current[blockId],
      ...data
    };

    // 3. Debounce save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      const updates = pendingUpdatesRef.current;
      pendingUpdatesRef.current = {};

      try {
        await Promise.all(
          Object.entries(updates).map(([id, updateData]) =>
            updateBlock({ id, data: updateData })
          )
        );
      } catch (err) {
        console.error('Failed to autosave blocks:', err);
      }
    }, 3000);
  };

  // Delete block
  const handleDeleteBlock = async (blockId) => {
    try {
      await deleteBlock(blockId);
      notification.success({ message: 'Block deleted' });
    } catch (error) {
      notification.error({ message: 'Failed to delete block' });
    }
  };

  // Add block from modal/button
  const handleAddBlockClick = (position) => {
    setAddBlockPosition(position);
    setBlockTypeModalOpen(true);
  };

  // 4. Drag and Drop Block Reordering
  const handleBlockDragStart = (e, blockId) => {
    e.dataTransfer.setData('blockId', blockId);
  };

  const handleBlockDrop = async (e, targetBlockId) => {
    e.preventDefault();
    if (isViewer) return;

    const draggedBlockId = e.dataTransfer.getData('blockId');
    if (!draggedBlockId || draggedBlockId === targetBlockId) return;

    const draggedIndex = blocks.findIndex(b => (b._id || b.id) === draggedBlockId);
    const targetIndex = blocks.findIndex(b => (b._id || b.id) === targetBlockId);
    if (draggedIndex === -1 || targetIndex === -1) return;

    const targetBlock = blocks[targetIndex];
    let newPosition = 1000;

    const prevBlock = blocks[targetIndex - 1];
    if (prevBlock) {
      if ((prevBlock._id || prevBlock.id) === draggedBlockId) return;
      newPosition = (prevBlock.position + targetBlock.position) / 2;
    } else {
      newPosition = targetBlock.position / 2;
    }

    // Instantly update UI cache
    queryClient.setQueryData(['blocks', activeWorkspaceId, projectId], (old) => {
      if (!old) return [];
      return old.map(b => (b._id || b.id) === draggedBlockId ? { ...b, position: newPosition } : b)
        .sort((a, b) => a.position - b.position);
    });

    await updateBlock({ id: draggedBlockId, data: { position: newPosition } });
  };

  // Drop project asset to create media block
  const handleAssetDropOnBlock = async (e, targetBlockId) => {
    e.preventDefault();
    if (isViewer) return;

    const dragData = e.dataTransfer.getData('text/plain');
    if (!dragData) return;

    try {
      const assetInfo = JSON.parse(dragData);
      if (!assetInfo.assetId) return;

      const targetIndex = blocks.findIndex(b => (b._id || b.id) === targetBlockId);
      if (targetIndex === -1) return;

      const targetBlock = blocks[targetIndex];

      let blockType = 'TEXT';
      if (assetInfo.type.toUpperCase() === 'IMAGE') blockType = 'IMAGE';
      else if (assetInfo.type.toUpperCase() === 'VIDEO') blockType = 'VIDEO';
      else if (assetInfo.type.toUpperCase() === 'AUDIO') blockType = 'AUDIO';

      // If target block is a media block, update it instead of creating a new one
      if (['IMAGE', 'VIDEO', 'AUDIO'].includes(targetBlock.type)) {
        await updateBlock({
          id: targetBlockId,
          data: {
            type: blockType,
            content: {
              assetId: assetInfo.assetId,
              url: assetInfo.url,
              name: assetInfo.name
            }
          }
        });
        notification.success({ message: `${targetBlock.type} block updated with new media` });
        return;
      }

      const prevBlock = blocks[targetIndex - 1];
      const nextPosition = prevBlock
        ? (prevBlock.position + targetBlock.position) / 2
        : targetBlock.position / 2;

      await createBlock({
        type: blockType,
        position: nextPosition,
        content: {
          assetId: assetInfo.assetId,
          url: assetInfo.url,
          name: assetInfo.name
        }
      });
      notification.success({ message: 'Media block created' });
    } catch (err) { }
  };

  const handleAppendMediaBlock = async (e) => {
    e.preventDefault();
    if (isViewer) return;

    const dragData = e.dataTransfer.getData('text/plain');
    if (!dragData) return;

    try {
      const assetInfo = JSON.parse(dragData);
      if (!assetInfo.assetId) return;

      const lastBlock = blocks[blocks.length - 1];
      const nextPosition = lastBlock ? lastBlock.position + 1000 : 1000;

      let blockType = 'TEXT';
      if (assetInfo.type.toUpperCase() === 'IMAGE') blockType = 'IMAGE';
      else if (assetInfo.type.toUpperCase() === 'VIDEO') blockType = 'VIDEO';
      else if (assetInfo.type.toUpperCase() === 'AUDIO') blockType = 'AUDIO';

      await createBlock({
        type: blockType,
        position: nextPosition,
        content: {
          assetId: assetInfo.assetId,
          url: assetInfo.url,
          name: assetInfo.name
        }
      });
      notification.success({ message: 'Media block appended' });
    } catch (err) { }
  };

  // 5. Snippet Click Insertion
  const handleSnippetClick = async (snippet) => {
    if (isViewer) return;
    const lastBlock = blocks[blocks.length - 1];
    const nextPosition = lastBlock ? lastBlock.position + 1000 : 1000;

    try {
      if (Array.isArray(snippet.content) && snippet.content.length > 0) {
        let currentPos = nextPosition;
        for (const item of snippet.content) {
          await createBlock({
            type: item.type || 'TEXT',
            position: currentPos,
            content: item.data || ''
          });
          currentPos += 1000;
        }
      } else {
        // Fallback for older string content snippets
        await createBlock({
          type: 'TEXT',
          position: nextPosition,
          content: typeof snippet.content === 'string' ? snippet.content : ''
        });
      }
      notification.success({ message: 'Snippet inserted successfully' });
    } catch (err) {
      notification.error({ message: 'Failed to insert snippet' });
    }
  };

  // 6. Manage Workspace Assets fetching for Attach Modal
  const handleOpenAttachModal = async () => {
    setIsAssetsLoading(true);
    setAttachModalOpen(true);
    try {
      const res = await getAllAssetsApi(activeWorkspaceId);
      setWorkspaceAssets(res?.data?.data ?? res?.data ?? []);
    } catch (err) {
      notification.error({ message: 'Failed to load workspace assets' });
    } finally {
      setIsAssetsLoading(false);
    }
  };

  const handleAttachAssets = async () => {
    if (selectedAssetIds.length === 0) return;
    try {
      await attachAssets(selectedAssetIds);
      notification.success({ message: 'Assets attached successfully' });
      setAttachModalOpen(false);
      setSelectedAssetIds([]);
    } catch (err) {
      notification.error({ message: 'Failed to attach assets' });
    }
  };

  const handleSaveSnapshot = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    const updates = pendingUpdatesRef.current;
    if (updates && Object.keys(updates).length > 0) {
      pendingUpdatesRef.current = {};
      try {
        await Promise.all(
          Object.entries(updates).map(([id, updateData]) =>
            updateBlock({ id, data: updateData })
          )
        );
      } catch (err) {
        console.error('Failed to flush updates before snapshot:', err);
      }
    }

    try {
      console.log('Creating manual snapshot for workspace:', activeWorkspaceId, 'project:', projectId);
      await createSnapshot({ workspaceId: activeWorkspaceId, projectId });
      notification.success({ message: 'Manual snapshot saved' });
    } catch (err) {
      console.error('Snapshot creation failed:', err);
      notification.error({
        message: 'Failed to create snapshot',
        description: err?.message || String(err)
      });
    }
  };

  const handleDuplicateProject = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    const updates = pendingUpdatesRef.current;
    if (updates && Object.keys(updates).length > 0) {
      pendingUpdatesRef.current = {};
      try {
        await Promise.all(
          Object.entries(updates).map(([id, updateData]) =>
            updateBlock({ id, data: updateData })
          )
        );
      } catch (err) {
        console.error('Failed to flush updates before duplicate:', err);
      }
    }

    try {
      await duplicateProject(projectId);
      notification.success({ message: 'Project duplicated successfully' });
    } catch (err) {
      notification.error({ message: 'Failed to duplicate project' });
    }
  };

  // 7. Interactive Mock AI Chat Logic
  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg = { sender: 'User', text: chatInput };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
    setIsAiTyping(true);

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'AI', text: `I am currently in mock UI mode, but when the AI model is connected, I will assist with writing and formatting for your block: "${chatInput}".` }
      ]);
      setIsAiTyping(false);
    }, 1500);
  };

  const handleExit = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    const updates = pendingUpdatesRef.current;
    if (updates && Object.keys(updates).length > 0) {
      pendingUpdatesRef.current = {};
      try {
        await Promise.all(
          Object.entries(updates).map(([id, updateData]) =>
            updateBlock({ id, data: updateData })
          )
        );
      } catch (err) {
        console.error('Failed to flush updates on exit:', err);
      }
    }
    navigate('/workspace/projects');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', background: 'var(--bg-void)' }}>
      {/* LEFT AREA: Editor & Main Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 20 }}>
        {/* Navigation & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={handleExit} />
          <div>
            <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>{currentProject?.title || 'Script Editor'}</h2>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Collaborative Script Editor</div>
          </div>
          {/* Online Presence Indicator */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            {(() => {
              const maxVisible = 5;
              const visibleMembers = members.slice(0, maxVisible);
              const remainingMembers = members.slice(maxVisible);

              const renderMemberAvatar = (m, size = 'default') => {
                const mUserId = m.userId?._id || m.userId?.id;
                const mEmail = m.userId?.email;
                const mName = m.userId?.fullName;

                const presenceUser = presenceUsers.find((p) => {
                  const pUserId = p.userId;
                  const pEmail = p.email;
                  const pName = p.name;

                  return (
                    (pUserId && mUserId && String(pUserId) === String(mUserId)) ||
                    (pEmail && mEmail && String(pEmail).toLowerCase() === String(mEmail).toLowerCase()) ||
                    (pName && mName && String(pName).toLowerCase() === String(mName).toLowerCase())
                  );
                });

                const isSelf = String(mUserId) === String(user?._id || user?.id);
                const isOnline = !!presenceUser || (isSelf && connectionStatus === 'connected');
                const name = mName || mEmail || 'Collaborator';

                // Stable custom color for each member's avatar border
                const colors = ['#f783ac', '#da77f2', '#9775fa', '#748ffc', '#3bc9db', '#38d9a9', '#69db7c', '#ffd43b', '#ff922b'];
                const idStr = String(mUserId || 'guest');
                let hash = 0;
                for (let i = 0; i < idStr.length; i++) {
                  hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
                }
                const stableColor = colors[Math.abs(hash) % colors.length];
                const avatarColor = presenceUser?.color || stableColor;

                const tooltipTitle = (
                  <div style={{ padding: '4px 8px' }}>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.65)' }}>{roleLabels[m.role] || m.role}</div>
                    <div style={{ fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: isOnline ? '#52c41a' : '#bfbfbf',
                        display: 'inline-block',
                        boxShadow: isOnline ? '0 0 8px #52c41a' : 'none'
                      }} />
                      <span style={{ color: isOnline ? '#52c41a' : '#bfbfbf', fontWeight: 500 }}>
                        {isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                );

                if (size === 'list') {
                  return (
                    <div key={m._id || m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <Badge
                        dot
                        status={isOnline ? 'success' : 'default'}
                        offset={[-2, 24]}
                        style={isOnline ? { boxShadow: '0 0 6px #52c41a' } : undefined}
                      >
                        <Avatar
                          size="small"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            color: 'var(--text-primary)',
                            border: `2px solid ${isOnline ? avatarColor : 'rgba(255,255,255,0.15)'}`,
                            opacity: isOnline ? 1 : 0.6,
                          }}
                        >
                          {name.charAt(0).toUpperCase()}
                        </Avatar>
                      </Badge>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {name}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                          {roleLabels[m.role] || m.role} • {isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <Tooltip key={m._id || m.id} title={tooltipTitle} placement="bottom">
                    <Badge
                      dot
                      status={isOnline ? 'success' : 'default'}
                      offset={[-2, 28]}
                      style={isOnline ? { boxShadow: '0 0 6px #52c41a' } : undefined}
                    >
                      <Avatar
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          color: 'var(--text-primary)',
                          border: `2px solid ${isOnline ? avatarColor : 'rgba(255,255,255,0.15)'}`,
                          opacity: isOnline ? 1 : 0.45,
                          transition: 'all 0.2s',
                          cursor: 'pointer'
                        }}
                      >
                        {name.charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>
                  </Tooltip>
                );
              };

              return (
                <>
                  {visibleMembers.map((m) => renderMemberAvatar(m))}
                  {remainingMembers.length > 0 && (
                    <Popover
                      content={
                        <div style={{ maxHeight: 240, overflowY: 'auto', width: 220, padding: '4px 8px' }}>
                          {remainingMembers.map((m) => renderMemberAvatar(m, 'list'))}
                        </div>
                      }
                      title={<div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>More Members</div>}
                      trigger="click"
                      placement="bottomRight"
                      overlayStyle={{ zIndex: 1050 }}
                    >
                      <Avatar
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid var(--border)',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          fontSize: 12,
                          fontWeight: 600
                        }}
                      >
                        +{remainingMembers.length}
                      </Avatar>
                    </Popover>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* Project Toolbar */}
        <div style={{
          padding: '10px 14px',
          background: 'var(--bg-base)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10
        }}>
          <Space size="middle">
            <Select
              value={voiceEngine}
              onChange={(val) => {
                if (val === 'AZURE') {
                  notification.info({ message: 'Azure Speech is placeholder and will be active in later releases.' });
                } else {
                  setVoiceEngine('BROWSER');
                }
              }}
              options={[
                { value: 'BROWSER', label: 'Browser Speech' },
                { value: 'AZURE', label: 'Azure Speech (Placeholder)' }
              ]}
              style={{ width: 200 }}
            />

            {voiceEngine === 'BROWSER' && (
              <Select
                value={selectedVoice?.name || undefined}
                onChange={(val) => setSelectedVoice(voices.find(v => v.name === val))}
                options={voices.map(v => ({ value: v.name, label: `${v.name} (${v.lang})` }))}
                placeholder="Choose browser voice"
                style={{ width: 220 }}
              />
            )}

            <Button icon={<HistoryOutlined />} onClick={handleResetReading}>
              Reset Reading
            </Button>

            <Button
              icon={(!isVoiceActive || isVoicePaused) ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
              onClick={handleTogglePauseVoice}
            >
              {!isVoiceActive ? 'Play Voice' : (isVoicePaused ? 'Resume Voice' : 'Pause Voice')}
            </Button>
          </Space>

          <Space size="middle">
            <Button icon={<CameraOutlined />} disabled={isViewer} onClick={handleSaveSnapshot}>
              Save Snapshot
            </Button>
            <Button icon={<HistoryOutlined />} onClick={() => setSnapshotModalOpen(true)}>
              History
            </Button>
            <Button icon={<ProfileOutlined />} onClick={() => setLogModalOpen(true)}>
              Timeline Log
            </Button>
            <Button icon={<CopyOutlined />} disabled={isViewer} onClick={handleDuplicateProject}>
              Duplicate
            </Button>
            <Button
              icon={sidebarVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
              onClick={() => setSidebarVisible(!sidebarVisible)}
            >
              {sidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
            </Button>
          </Space>
        </div>

        {/* Blocks Editor container */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleAppendMediaBlock}
          style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}
        >
          {isBlocksLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
              <Spin indicator={<LoadingOutlined spin />} size="large" />
            </div>
          ) : blocks.length === 0 ? (
            <div
              style={{
                height: '70%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                border: '2px dashed var(--border)',
                borderRadius: 12
              }}
            >
              <h3 style={{ color: 'var(--text-muted)' }}>No blocks inside this script</h3>
              {!isViewer && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleAddBlockClick(0)}
                  style={{ background: 'var(--accent-amber)', borderColor: 'var(--accent-amber)', color: '#000', fontWeight: 600 }}
                >
                  Create First Block
                </Button>
              )}
            </div>
          ) : (
            <div>
              {blocks.map((block) => (
                <BlockItem
                  key={block._id || block.id}
                  block={block}
                  ydoc={ydoc}
                  provider={provider}
                  user={user}
                  characters={characters}
                  isViewer={isViewer}
                  isCurrentlyReading={readingBlockId === (block._id || block.id)}
                  isVoiceActive={isVoiceActive}
                  isVoicePaused={isVoicePaused}
                  highlightRange={highlightRange}
                  onUpdateBlock={handleUpdateBlock}
                  onDeleteBlock={handleDeleteBlock}
                  onPlayBlock={playBlock}
                  onAddBlockClick={handleAddBlockClick}
                  onResetReading={(id) => {
                    window.speechSynthesis.cancel();
                    setIsVoiceActive(false);
                    setIsVoicePaused(false);
                    setHighlightRange(null);
                    setReadingBlockId(id);
                    notification.info({ message: 'Reading pointer moved to this block' });
                  }}
                  onCreateCharacterClick={() => setCharModalOpen(true)}
                  onDragStart={handleBlockDragStart}
                  onAddSnippet={handleAddSnippet}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e, targetId) => {
                    // Detect if dragging media asset or sorting block
                    if (e.dataTransfer.getData('blockId')) {
                      handleBlockDrop(e, targetId);
                    } else {
                      handleAssetDropOnBlock(e, targetId);
                    }
                  }}
                />
              ))}

              {/* Append block drop target helper */}
              {!isViewer && (
                <div style={{
                  padding: 16,
                  border: '1px dashed var(--border)',
                  borderRadius: 10,
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.01)',
                  color: 'var(--text-muted)',
                  fontSize: 12,
                  marginTop: 20
                }}>
                  Drag & drop media assets here to append at the end of the script
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR: Tabs Pane (AI Chat, Snippets, Assets) */}
      {sidebarVisible && (
        <div style={{ width: 340, minWidth: 340, background: 'var(--bg-base)', borderLeft: '1px solid var(--border)', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ padding: '0 16px' }}
          items={[
            {
              key: 'chat',
              label: 'AI Chat',
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 110px)', padding: '10px 0' }}>
                  <div style={{ flex: 1, overflowY: 'auto', marginBottom: 12, paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} style={{ alignSelf: msg.sender === 'AI' ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                        <div style={{
                          padding: '8px 12px',
                          borderRadius: msg.sender === 'AI' ? '12px 12px 12px 0' : '12px 12px 0 12px',
                          background: msg.sender === 'AI' ? 'var(--bg-hover)' : 'var(--accent-amber)',
                          color: msg.sender === 'AI' ? 'var(--text-primary)' : '#000',
                          fontSize: 13,
                        }}>
                          {msg.text}
                        </div>
                        <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2, textAlign: msg.sender === 'AI' ? 'left' : 'right' }}>
                          {msg.sender}
                        </div>
                      </div>
                    ))}
                    {isAiTyping && (
                      <div style={{ padding: '8px 12px', background: 'var(--bg-hover)', borderRadius: 12, width: 60, textAlign: 'center' }}>
                        <Spin indicator={<LoadingOutlined spin />} size="small" />
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Input
                      placeholder="Type a query for the script AI..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onPressEnter={handleSendChatMessage}
                    />
                    <Button type="primary" icon={<SendOutlined />} onClick={handleSendChatMessage} style={{ background: 'var(--accent-amber)', borderColor: 'var(--accent-amber)', color: '#000' }} />
                  </div>
                </div>
              )
            },
            {
              key: 'assets',
              label: 'Assets',
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 110px)', padding: '10px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Attached Media</h4>
                    {!isViewer && (
                      <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleOpenAttachModal} style={{ background: 'var(--accent-amber)', borderColor: 'var(--accent-amber)', color: '#000', fontWeight: 600 }}>
                        Add Asset
                      </Button>
                    )}
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
                    {projectAssets.length === 0 ? (
                      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                        No assets attached yet. Drag-and-drop assets into the script.
                      </div>
                    ) : (
                      projectAssets.map((assetItem) => {
                        const originalAsset = assetItem.assetId;
                        if (!originalAsset) return null;
                        const isUsed = assetItem.status === 'USED';

                        return (
                          <Tooltip
                            key={assetItem._id || assetItem.id}
                            title={
                              originalAsset.tags && originalAsset.tags.length > 0
                                ? `Tags: ${originalAsset.tags.join(', ')}`
                                : 'No tags'
                            }
                            placement="left"
                          >
                            <div
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', JSON.stringify({
                                  assetId: originalAsset._id || originalAsset.id,
                                  url: originalAsset.url,
                                  name: originalAsset.fileName,
                                  type: originalAsset.type
                                }));
                              }}
                              style={{
                                padding: '10px 12px',
                                background: 'rgba(255,255,255,0.01)',
                                border: '1px solid var(--border)',
                                borderRadius: 8,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                marginBottom: 8,
                                cursor: 'grab',
                                position: 'relative'
                              }}
                            >
                              {/* Asset Preview Thumbnail */}
                              <div style={{
                                width: 40,
                                height: 40,
                                background: 'var(--bg-hover)',
                                borderRadius: 6,
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {originalAsset.type?.toUpperCase() === 'IMAGE' && originalAsset.url ? (
                                  <img src={getAssetUrl(originalAsset.url)} alt={originalAsset.fileName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <CloudUploadOutlined style={{ fontSize: 18 }} />
                                )}
                              </div>

                              <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {originalAsset.fileName}
                                </div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', gap: 6, alignItems: 'center' }}>
                                  <span>{originalAsset.type}</span>
                                  <Badge status={isUsed ? 'success' : 'default'} text={isUsed ? `USED (${assetItem.usageCount || 0})` : 'UNUSED'} />
                                </div>
                              </div>

                              {!isViewer && (
                                <Tooltip title={isUsed ? "Cannot delete asset in use" : "Remove asset from project"}>
                                  <Button
                                    type="text"
                                    danger
                                    disabled={isUsed}
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => deleteProjectAsset(assetItem._id || assetItem.id)}
                                  />
                                </Tooltip>
                              )}
                            </div>
                          </Tooltip>
                        );
                      })
                    )}
                  </div>
                </div>
              )
            },
            {
              key: 'snippets',
              label: 'Snippets',
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 110px)', padding: '10px 0' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)' }}>Workspace Snippets</h4>
                  <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
                    {snippets.length === 0 ? (
                      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                        No snippets created yet.
                      </div>
                    ) : (
                      snippets.map((snip) => (
                        <div
                          key={snip._id || snip.id}
                          onClick={() => handleSnippetClick(snip)}
                          style={{
                            padding: '10px 12px',
                            background: 'rgba(255,255,255,0.01)',
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            marginBottom: 8,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-hover)';
                            e.currentTarget.style.borderColor = 'var(--border-lit)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                            e.currentTarget.style.borderColor = 'var(--border)';
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{snip.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {Array.isArray(snip.content) && snip.content[0]
                              ? (snip.content[0].type === 'DIALOGUE' ? snip.content[0].data?.text : snip.content[0].data)?.replace(/<[^>]*>/g, '')
                              : typeof snip.content === 'string' ? snip.content?.replace(/<[^>]*>/g, '') : ''}
                          </div>
                          {snip.tags && snip.tags.length > 0 && (
                            <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                              {snip.tags.map((tag, i) => (
                                <span key={i} style={{ fontSize: 9, background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 4, color: 'var(--text-muted)' }}>{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            }
          ]}
        />
      </div>
      )}

      {/* Attachable Workspace Assets Modal */}
      <Modal
        title="Attach Workspace Assets"
        open={attachModalOpen}
        onCancel={() => setAttachModalOpen(false)}
        onOk={handleAttachAssets}
        okButtonProps={{ style: { background: 'var(--accent-amber)', borderColor: 'var(--accent-amber)', color: '#000', fontWeight: 600 } }}
        centered
        width={650}
        destroyOnClose
      >
        <Input
          placeholder="Search workspace assets by tags..."
          value={searchAsset}
          onChange={(e) => setSearchAsset(e.target.value)}
          style={{ marginBottom: 16, marginTop: 12 }}
        />

        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {isAssetsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
              <Spin indicator={<LoadingOutlined spin />} />
            </div>
          ) : (
            <List
              dataSource={workspaceAssets.filter(asset => {
                if (!searchAsset.trim()) return true;
                return asset.tags?.some(tag => tag.toLowerCase().includes(searchAsset.toLowerCase()));
              })}
              renderItem={(asset) => {
                // Filter out already attached assets
                const isAlreadyAttached = projectAssets.some(pa => String(pa.assetId?._id || pa.assetId?.id) === String(asset._id || asset.id));
                if (isAlreadyAttached) return null;

                return (
                  <List.Item
                    actions={[
                      <Checkbox
                        checked={selectedAssetIds.includes(asset._id || asset.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAssetIds(prev => [...prev, asset._id || asset.id]);
                          } else {
                            setSelectedAssetIds(prev => prev.filter(id => id !== (asset._id || asset.id)));
                          }
                        }}
                      />
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <div style={{ width: 36, height: 36, background: 'var(--bg-hover)', borderRadius: 4, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {asset.type?.toUpperCase() === 'IMAGE' && asset.url ? (
                            <img src={getAssetUrl(asset.url)} alt={asset.fileName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <CloudUploadOutlined style={{ fontSize: 16 }} />
                          )}
                        </div>
                      }
                      title={asset.fileName}
                      description={
                        <Space>
                          <span>{asset.type}</span>
                          {asset.tags?.map((t, idx) => (
                            <span key={idx} style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 4, fontSize: 10 }}>{t}</span>
                          ))}
                        </Space>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </div>
      </Modal>

      {/* Choose Block Type Modal */}
      <Modal
        title="Choose Block Type"
        open={blockTypeModalOpen}
        onCancel={() => setBlockTypeModalOpen(false)}
        footer={null}
        centered
        destroyOnClose
      >
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          Choose between Text or Dialogue block to insert.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button
            type="primary"
            onClick={async () => {
              setBlockTypeModalOpen(false);
              await createBlock({ type: 'TEXT', position: addBlockPosition + 1, content: '<p></p>' });
            }}
            style={{ background: 'var(--accent-amber)', borderColor: 'var(--accent-amber)', color: '#000', fontWeight: 600 }}
          >
            Text Block
          </Button>
          <Button
            type="primary"
            onClick={async () => {
              setBlockTypeModalOpen(false);
              await createBlock({ type: 'DIALOGUE', position: addBlockPosition + 1, content: { characterId: '', text: '<p></p>' } });
            }}
            style={{ background: 'var(--accent-amber)', borderColor: 'var(--accent-amber)', color: '#000', fontWeight: 600 }}
          >
            Dialogue Block
          </Button>
        </div>
      </Modal>

      {/* Sub modals */}
      <CharacterModal
        open={charModalOpen}
        onCancel={() => setCharModalOpen(false)}
        onSave={async (data) => {
          try {
            await createCharacter(data);
            notification.success({ message: 'Character created successfully' });
            setCharModalOpen(false);
          } catch (error) {
            notification.error({ message: 'Failed to create character' });
          }
        }}
      />

      <ActivityLogModal
        open={logModalOpen}
        onCancel={() => setLogModalOpen(false)}
        workspaceId={activeWorkspaceId}
      />

      <SnapshotHistoryModal
        open={snapshotModalOpen}
        onCancel={() => setSnapshotModalOpen(false)}
        workspaceId={activeWorkspaceId}
        projectId={projectId}
        canRestore={!isViewer}
      />

      <Modal
        title="Save as Snippet"
        open={snippetModalOpen}
        onCancel={() => setSnippetModalOpen(false)}
        onOk={async () => {
          if (!snippetTitle.trim()) {
            notification.warning({ message: 'Title is required' });
            return;
          }
          try {
            let contentData = [];
            if (snippetSourceBlock.type === 'DIALOGUE') {
              contentData = [{
                type: 'DIALOGUE',
                data: {
                  characterId: snippetSourceBlock.content?.characterId || '',
                  text: snippetContentHtml
                }
              }];
            } else {
              contentData = [{
                type: 'TEXT',
                data: snippetContentHtml
              }];
            }

            await createSnippet({
              title: snippetTitle,
              tags: snippetTags,
              content: contentData
            });
            notification.success({ message: 'Snippet created successfully' });
            setSnippetModalOpen(false);
          } catch (err) {
            notification.error({ message: 'Failed to create snippet', description: err.message });
          }
        }}
        okButtonProps={{ style: { background: 'var(--accent-amber)', borderColor: 'var(--accent-amber)', color: '#000', fontWeight: 600 } }}
        centered
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 10 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Snippet Title</label>
            <Input
              value={snippetTitle}
              onChange={(e) => setSnippetTitle(e.target.value)}
              placeholder="Enter snippet title..."
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Tags</label>
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Type tag and press Enter..."
              value={snippetTags}
              onChange={(value) => setSnippetTags(value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Content Preview</label>
            <div style={{
              padding: 10,
              background: 'var(--bg-hover)',
              borderRadius: 6,
              border: '1px solid var(--border)',
              maxHeight: 120,
              overflowY: 'auto',
              fontSize: 13,
              color: 'var(--text-primary)'
            }}>
              {snippetSourceBlock ? (
                snippetSourceBlock.type === 'DIALOGUE' ? (
                  <div>
                    <strong style={{ color: 'var(--accent-amber)' }}>DIALOGUE:</strong>
                    <div dangerouslySetInnerHTML={{ __html: snippetContentHtml || '' }} />
                  </div>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: snippetContentHtml || '' }} />
                )
              ) : 'No block selected'}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ScriptEditorPage;
