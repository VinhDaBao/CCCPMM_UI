import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, Button, Select, Space, Tooltip, notification, Spin, Modal, Input, List, Checkbox, Avatar, Badge, Popover } from 'antd';

import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
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
import TopBar from '../components/creator-layout/topBar';

// API helpers
import { getAllAssetsApi, getAssetUrl, synthesizeTtsApi, getTtsVoicesApi } from '../util/api';

const roleLabels = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  VIEWER: 'Viewer'
};

const getRoleLabel = (role, t) => {
  switch (role) {
    case 'OWNER': return t('script_editor.role_owner');
    case 'ADMIN': return t('script_editor.role_admin');
    case 'EDITOR': return t('script_editor.role_editor');
    case 'VIEWER': return t('script_editor.role_viewer');
    default: return role;
  }
};

const ScriptEditorPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const auth = useSelector((state) => state.auth);
  const user = auth?.user || {};
  const { t } = useTranslation();

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
  const { data: characters = [], createCharacter, updateCharacter, deleteCharacter, isDeleting } = useCharacters(activeWorkspaceId);
  const { data: projectAssets = [], attachAssets, deleteProjectAsset } = useProjectAssets(activeWorkspaceId, projectId);
  const { data: snippets = [], createSnippet } = useSnippets(activeWorkspaceId);
  const { createSnapshot } = useProjectSnapshots(activeWorkspaceId, projectId);

  // States
  const [voiceEngine, setVoiceEngine] = useState('WEB_SPEECH');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [readingBlockId, setReadingBlockId] = useState(null);
  const [isVoicePaused, setIsVoicePaused] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // Audio Playback & Cache Refs
  const audioRef = useRef(null);
  const audioCacheRef = useRef(new Map());

  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessages, setChatMessages] = useState(() => {
    const savedChat = localStorage.getItem(`ai_chat_${projectId}`);
    if (savedChat) {
      try {
        return JSON.parse(savedChat);
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
    return [
      { sender: 'AI', text: t('script_editor.chat_welcome') }
    ];
  });
  useEffect(() => {
    if (chatMessages && chatMessages.length > 0) {
      localStorage.setItem(`ai_chat_${projectId}`, JSON.stringify(chatMessages));
    }
  }, [chatMessages, projectId]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Modals
  const [charModalOpen, setCharModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
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

  // 1. Audio Cleanup Effect on Unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioCacheRef.current) {
        audioCacheRef.current.clear();
      }
      setIsVoiceActive(false);
      setIsVoicePaused(false);
    };
  }, []);

  // Clear cache and reset states when project changes
  useEffect(() => {
    if (audioCacheRef.current) {
      audioCacheRef.current.clear();
    }
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setReadingBlockId(null);
    setIsVoiceActive(false);
    setIsVoicePaused(false);
  }, [projectId]);

  // Load voices dynamically when voiceEngine changes
  useEffect(() => {
    if (voiceEngine === 'WEB_SPEECH') {
      const loadBrowserVoices = () => {
        const vList = window.speechSynthesis.getVoices();
        setVoices(vList);
        if (vList.length > 0) {
          const defaultVoice = vList.find(v => v.lang.startsWith('en')) || vList[0];
          setSelectedVoice(defaultVoice.name);
        }
      };
      loadBrowserVoices();
      window.speechSynthesis.onvoiceschanged = loadBrowserVoices;
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    } else if (voiceEngine === 'GOOGLE_CLOUD') {
      const loadGoogleVoices = async () => {
        try {
          const res = await getTtsVoicesApi();
          if (res && res.data) {
            setVoices(res.data);
            if (res.data.length > 0) {
              const defaultVoice = res.data.find(v => v.name.includes('Neural2-F') || v.name.includes('Neural2')) || res.data[0];
              setSelectedVoice(defaultVoice.name);
            }
          }
        } catch (err) {
          console.error('Failed to load Google voices:', err);
          notification.error({ message: t('script_editor.premium_voices_failed') });
        }
      };
      loadGoogleVoices();
    }
  }, [voiceEngine]);

  const isFirstMount = useRef(true);

  // Reset reading pointer and stop playback when voiceEngine or selectedVoice changes
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsVoiceActive(false);
    setIsVoicePaused(false);

    const firstReadable = blocks.find(b => b.type === 'TEXT' || b.type === 'DIALOGUE');
    if (firstReadable) {
      setReadingBlockId(firstReadable._id || firstReadable.id);
    } else {
      setReadingBlockId(null);
    }
  }, [voiceEngine, selectedVoice]);

  const handleAddSnippet = (block, currentHtml) => {
    setSnippetSourceBlock(block);
    setSnippetContentHtml(currentHtml || '');
    setSnippetTitle('');
    setSnippetTags([]);
    setSnippetModalOpen(true);
  };

  // Autosave timeout is cleaned up in consolidated unmount effect

  // 2. Speech synthesis engine using Google Cloud TTS or Browser Web Speech API
  const playBlock = (block) => {
    // If clicking the currently reading block AND voice is active, toggle play/pause!
    if ((block._id || block.id) === readingBlockId && isVoiceActive) {
      handleTogglePauseVoice();
      return;
    }

    playBlockDirectly(block);
  };

  const playBlockDirectly = async (block) => {
    // Pause and clean up any playing audio
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsVoiceActive(true);
    setIsVoicePaused(false);
    const blockId = block._id || block.id;
    setReadingBlockId(blockId);

    const text = block.type === 'DIALOGUE' ? (block.content?.text || '') : (block.content || '');
    const plainText = text.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

    if (!plainText) {
      playNextReadableBlock(blockId);
      return;
    }

    if (voiceEngine === 'GOOGLE_CLOUD') {
      const cacheKey = `${blockId}-${voiceEngine}-${selectedVoice}`;
      let audioSrc = audioCacheRef.current.get(cacheKey);
      if (!audioSrc) {
        try {
          const res = await synthesizeTtsApi(plainText, selectedVoice);
          if (res && res.audioBase64) {
            audioSrc = `data:audio/mp3;base64,${res.audioBase64}`;
            audioCacheRef.current.set(cacheKey, audioSrc);
          } else {
            throw new Error('No audio content returned from TTS service');
          }
        } catch (err) {
          console.error('TTS synthesis failed:', err);
          notification.error({
            message: t('script_editor.synthesis_failed'),
            description: err.message || 'Could not synthesize voice.'
          });
          setReadingBlockId(null);
          setIsVoiceActive(false);
          setIsVoicePaused(false);
          return;
        }
      }

      // Double check that we are still supposed to be reading this block
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioSrc);
      audioRef.current = audio;

      audio.onended = () => {
        playNextReadableBlock(blockId);
      };

      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setReadingBlockId(null);
        setIsVoiceActive(false);
        setIsVoicePaused(false);
        audioRef.current = null;
      };

      audio.play().catch(err => {
        console.error('Failed to play audio:', err);
        notification.warning({ message: t('script_editor.playback_issue') });
        setReadingBlockId(null);
        setIsVoiceActive(false);
        setIsVoicePaused(false);
        audioRef.current = null;
      });
    } else {
      // WEB_SPEECH
      const utterance = new SpeechSynthesisUtterance(plainText);
      const rawVoices = window.speechSynthesis.getVoices();
      const browserVoiceObj = rawVoices.find(v => v.name === selectedVoice);
      if (browserVoiceObj) {
        utterance.voice = browserVoiceObj;
      }

      utterance.onend = () => {
        playNextReadableBlock(blockId);
      };

      utterance.onerror = (e) => {
        console.error('SpeechSynthesis error:', e);
        setReadingBlockId(null);
        setIsVoiceActive(false);
        setIsVoicePaused(false);
      };

      window.speechSynthesis.speak(utterance);
    }
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
    setIsVoiceActive(false);
    setIsVoicePaused(false);
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    notification.info({ message: t('script_editor.reading_finished') });
  };

  const handleTogglePauseVoice = () => {
    if (isVoiceActive) {
      if (isVoicePaused) {
        if (voiceEngine === 'GOOGLE_CLOUD') {
          if (audioRef.current) {
            audioRef.current.play().catch(err => console.error('Failed to resume:', err));
          }
        } else {
          window.speechSynthesis.resume();
        }
        setIsVoicePaused(false);
      } else {
        if (voiceEngine === 'GOOGLE_CLOUD') {
          if (audioRef.current) {
            audioRef.current.pause();
          }
        } else {
          window.speechSynthesis.pause();
        }
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

  const handleStopReading = () => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setReadingBlockId(null);
    setIsVoiceActive(false);
    setIsVoicePaused(false);
  };

  // 3. Autosave with Debounce
  const handleUpdateBlock = (blockId, data) => {
    // Invalidate audio cache for this block if text/content changes
    if (data.content !== undefined) {
      for (const key of audioCacheRef.current.keys()) {
        if (key.startsWith(`${blockId}-`)) {
          audioCacheRef.current.delete(key);
        }
      }
    }

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
  const handleSendChatMessage = async (presetMessage = null) => {
    // Prefer the clicked suggestion (presetMessage); otherwise use the chat input text
    const userMessage = typeof presetMessage === 'string' ? presetMessage : chatInput;
    
    if (!userMessage.trim()) return;

    setChatMessages((prev) => [...prev, { sender: 'User', text: userMessage }]);
    setChatInput(''); // Clear the input field
    setIsAiTyping(true);

    try {
      const response = await fetch('http://localhost:8088/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          scriptContext: blocks 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setChatMessages((prev) => [...prev, { sender: 'AI', text: data.reply }]);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      notification.error({ message: t('script_editor.ai_error'), description: t('script_editor.ai_connection_error') });
      setChatMessages((prev) => [
        ...prev, 
        { sender: 'AI', text: t('script_editor.ai_busy') }
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleClearChat = () => {
    const defaultMsg = [{ sender: 'AI', text: t('script_editor.chat_memory_cleared') }];
    setChatMessages(defaultMsg);
    localStorage.setItem(`ai_chat_${projectId}`, JSON.stringify(defaultMsg));
    notification.success({ message: 'Chat history cleared' });
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', overflow: 'hidden', background: 'var(--bg-void)' }}>
      {/* TOP BAR */}
      <div style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
        <TopBar title={currentProject?.title || t('script_editor.script_editor_title')} />
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT AREA: Editor & Main Workspace */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 20 }}>
          {/* Navigation & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={handleExit} />
          <div>
            <h2 style={{ margin: 0, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {currentProject?.title || t('script_editor.script_editor_title')}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {t('script_editor.collaborative_editor')}
              </div>

              {/* Hiển thị danh sách Tags của Project */}
              {currentProject?.tags && currentProject.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Dấu chấm phân cách UI cho đẹp */}
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border-lit)' }} />
                  
                  {currentProject.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      style={{ 
                        background: 'var(--bg-hover)', 
                        border: '1px solid var(--border-lit)',
                        color: 'var(--text-secondary)', 
                        fontSize: '11px', 
                        padding: '2px 8px', 
                        borderRadius: '12px' 
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
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
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{getRoleLabel(m.role, t) || m.role}</div>
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
                        {isOnline ? t('script_editor.online') : t('script_editor.offline')}
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
                            background: 'var(--badge-bg)',
                            color: 'var(--text-primary)',
                            border: `2px solid ${isOnline ? avatarColor : 'var(--border-lit)'}`,
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
                          {getRoleLabel(m.role, t) || m.role} • {isOnline ? t('script_editor.online') : t('script_editor.offline')}
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
                          background: 'var(--badge-bg)',
                          color: 'var(--text-primary)',
                          border: `2px solid ${isOnline ? avatarColor : 'var(--border-lit)'}`,
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
                      title={<div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>{t('script_editor.more_members')}</div>}
                      trigger="click"
                      placement="bottomRight"
                      overlayStyle={{ zIndex: 1050 }}
                    >
                      <Avatar
                        style={{
                          background: 'var(--bg-hover)',
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
                setVoiceEngine(val);
              }}
              options={[
                { value: 'WEB_SPEECH', label: t('script_editor.voice_browser') },
                { value: 'GOOGLE_CLOUD', label: t('script_editor.voice_google') }
              ]}
              style={{ width: 200 }}
            />

            {voices.length > 0 && (
              <Select
                showSearch
                value={selectedVoice || undefined}
                onChange={(val) => setSelectedVoice(val)}
                options={voices.map(v => ({
                  value: v.name,
                  label: voiceEngine === 'GOOGLE_CLOUD'
                    ? `${v.name} (${v.ssmlGender || 'NEUTRAL'})`
                    : `${v.name} (${v.lang || v.languageCodes?.join(', ')})`
                }))}
                placeholder={t('script_editor.choose_voice')}
                style={{ width: 220 }}
              />
            )}

            <Button
              icon={(!isVoiceActive || isVoicePaused) ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
              onClick={handleTogglePauseVoice}
            >
              {!isVoiceActive ? t('script_editor.play_voice') : (isVoicePaused ? t('script_editor.resume_voice') : t('script_editor.pause_voice'))}
            </Button>

            {isVoiceActive && (
              <Button
                icon={<StopOutlined />}
                onClick={handleStopReading}
                danger
              >
                {t('script_editor.stop')}
              </Button>
            )}
          </Space>

          <Space size="middle">
            <Button icon={<CameraOutlined />} disabled={isViewer} onClick={handleSaveSnapshot}>
              {t('script_editor.save_snapshot')}
            </Button>
            <Button icon={<HistoryOutlined />} onClick={() => setSnapshotModalOpen(true)}>
              {t('script_editor.history')}
            </Button>
            <Button icon={<ProfileOutlined />} onClick={() => setLogModalOpen(true)}>
              {t('script_editor.timeline_log')}
            </Button>
            <Button icon={<CopyOutlined />} disabled={isViewer} onClick={handleDuplicateProject}>
              {t('script_editor.duplicate')}
            </Button>
            <Button
              icon={sidebarVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
              onClick={() => setSidebarVisible(!sidebarVisible)}
            >
              {sidebarVisible ? t('script_editor.hide_sidebar') : t('script_editor.show_sidebar')}
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
              <h3 style={{ color: 'var(--text-muted)' }}>{t('script_editor.no_blocks')}</h3>
              {!isViewer && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleAddBlockClick(0)}
                  style={{ background: 'var(--accent-amber)', borderColor: 'var(--accent-amber)', color: '#000', fontWeight: 600 }}
                >
                  {t('script_editor.create_first_block')}
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
                  onUpdateBlock={handleUpdateBlock}
                  onDeleteBlock={handleDeleteBlock}
                  onPlayBlock={playBlock}
                  onAddBlockClick={handleAddBlockClick}
                  onResetReading={(id) => {
                    window.speechSynthesis.cancel();
                    if (audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current = null;
                    }
                    setIsVoiceActive(false);
                    setIsVoicePaused(false);
                    setReadingBlockId(id);
                    notification.info({ message: t('script_editor.reading_pointer_moved') });
                  }}
                  onCreateCharacterClick={() => {
                    setEditingCharacter(null);
                    setCharModalOpen(true);
                  }}
                  onEditCharacterClick={(char) => {
                    setEditingCharacter(char);
                    setCharModalOpen(true);
                  }}
                  onDeleteCharacter={async (id) => {
                    try {
                      await deleteCharacter(id);
                      notification.success({ message: t('script_editor.delete_character_success') });
                    } catch (error) {
                      notification.error({ message: t('script_editor.delete_character_error') });
                    }
                  }}
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
                  background: 'var(--bg-hover)',
                  color: 'var(--text-muted)',
                  fontSize: 12,
                  marginTop: 20
                }}>
                  {t('script_editor.append_media_hint')}
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
                label: t('script_editor.ai_chat'),
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
                    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 12, paddingBottom: 4 }}>
                      {[
                        "Summarize the script", 
                        "Suggest a suspenseful, eerie plot twist", 
                        "Fix spelling and grammar", 
                        "Continue a line of dialogue"
                      ].map((suggestion, index) => (
                        <Button 
                          key={index} 
                          size="small" 
                          onClick={() => handleSendChatMessage(suggestion)}
                          style={{ 
                            borderRadius: 12, 
                            fontSize: 12, 
                            background: 'var(--bg-hover)', 
                            color: 'var(--text-secondary)', 
                            border: '1px solid var(--border)' 
                          }}
                        >
                          {suggestion}
                        </Button>
                      ))}
                      
                      {/* Nút Xóa lịch sử nằm cuối thanh gợi ý */}
                      <Tooltip title={t('script_editor.clear_ai_memory_title')}>
                        <Button 
                          size="small" 
                          icon={<DeleteOutlined />} 
                          danger
                          onClick={handleClearChat}
                          style={{ borderRadius: 12 }}
                        />
                      </Tooltip>
                    </div>

                    {/* Khối Input cũ của ông giữ nguyên */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Input
                        placeholder={t('script_editor.ai_input_placeholder')}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onPressEnter={() => handleSendChatMessage()}
                      />
                      <Button 
                        type="primary" 
                        icon={<SendOutlined />} 
                        onClick={() => handleSendChatMessage()} 
                        style={{ background: 'var(--accent-amber)', borderColor: 'var(--accent-amber)', color: '#000' }} 
                      />
                    </div>
                  </div>
                )
              },
              {
                key: 'assets',
                label: t('script_editor.assets_tab'),
                children: (
                  <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 110px)', padding: '10px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{t('script_editor.attached_media')}</h4>
                      {!isViewer && (
                        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleOpenAttachModal} style={{ background: 'var(--accent-amber)', borderColor: 'var(--accent-amber)', color: '#000', fontWeight: 600 }}>
                          {t('script_editor.add_asset')}
                        </Button>
                      )}
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
                      {projectAssets.length === 0 ? (
                        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                          {t('script_editor.no_assets_attached')}
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
                                  ? `${t('script_editor.tags_prefix')} ${originalAsset.tags.join(', ')}`
                                  : t('script_editor.no_tags')
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
                                    <Badge status={isUsed ? 'success' : 'default'} text={isUsed ? `${t('script_editor.used')} (${assetItem.usageCount || 0})` : t('script_editor.unused')} />
                                  </div>
                                </div>

                                {!isViewer && (
                                  <Tooltip title={isUsed ? t('script_editor.cannot_delete_used') : t('script_editor.remove_asset')}>
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
                label: t('script_editor.snippets_tab'),
                children: (
                  <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 110px)', padding: '10px 0' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)' }}>{t('script_editor.workspace_snippets')}</h4>
                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
                      {snippets.length === 0 ? (
                        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                          {t('script_editor.no_snippets')}
                        </div>
                      ) : (
                        snippets.map((snip) => (
                          <div
                            key={snip._id || snip.id}
                            onClick={() => handleSnippetClick(snip)}
                            style={{
                              padding: '10px 12px',
                              background: 'var(--bg-hover)',
                              border: '1px solid var(--border)',
                              borderRadius: 8,
                              marginBottom: 8,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--bg-base)';
                              e.currentTarget.style.borderColor = 'var(--border-lit)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'var(--bg-hover)';
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
                                  <span key={i} style={{ fontSize: 9, background: 'var(--bg-base)', padding: '1px 5px', borderRadius: 4, color: 'var(--text-muted)' }}>{tag}</span>
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

      </div>

      {/* Attachable Workspace Assets Modal */}
      <Modal
        title={t('script_editor.attach_workspace_assets')}
        open={attachModalOpen}
        onCancel={() => setAttachModalOpen(false)}
        onOk={handleAttachAssets}
        okButtonProps={{ style: { background: 'var(--accent-amber)', borderColor: 'var(--accent-amber)', color: '#000', fontWeight: 600 } }}
        centered
        width={650}
        destroyOnClose
      >
        <Input
          placeholder={t('script_editor.search_assets_placeholder')}
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
                            <span key={idx} style={{ background: 'var(--bg-hover)', padding: '1px 5px', borderRadius: 4, fontSize: 10 }}>{t}</span>
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
        title={t('script_editor.choose_block_type')}
        open={blockTypeModalOpen}
        onCancel={() => setBlockTypeModalOpen(false)}
        footer={null}
        centered
        destroyOnClose
      >
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          {t('script_editor.choose_block_desc')}
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
            {t('script_editor.text_block')}
          </Button>
          <Button
            type="primary"
            onClick={async () => {
              setBlockTypeModalOpen(false);
              await createBlock({ type: 'DIALOGUE', position: addBlockPosition + 1, content: { characterId: '', text: '<p></p>' } });
            }}
            style={{ background: 'var(--accent-amber)', borderColor: 'var(--accent-amber)', color: '#000', fontWeight: 600 }}
          >
            {t('script_editor.dialogue_block')}
          </Button>
        </div>
      </Modal>

      {/* Sub modals */}
      <CharacterModal
        open={charModalOpen}
        onCancel={() => {
          setCharModalOpen(false);
          setEditingCharacter(null);
        }}
        // component cha có state quản lý nhân vật đang chọn để sửa (nếu có)
        character={editingCharacter}
        onSave={async (data) => {
          try {
            if (editingCharacter) {
              await updateCharacter({ id: editingCharacter._id || editingCharacter.id, data });
              notification.success({ message: t('script_editor.character_updated') || 'Character updated successfully' });
            } else {
              await createCharacter(data);
              notification.success({ message: t('script_editor.character_created') });
            }
            setCharModalOpen(false);
            setEditingCharacter(null);
          } catch (error) {
            notification.error({
              message: editingCharacter
                ? (t('script_editor.character_update_failed') || 'Failed to update character')
                : t('script_editor.character_create_failed')
            });
          }
        }}
        //  Luồng tiếp nhận sự kiện xóa từ Modal con gửi lên
        onDelete={async (id) => {
          try {
            await deleteCharacter(id);
            notification.success({ message: t('script_editor.delete_character_success') });
            setCharModalOpen(false);
            setEditingCharacter(null);
          } catch (error) {
            notification.error({ message: t('script_editor.delete_character_error') });
          }
        }}
        // Cập nhật cờ hiệu loading khi đang xử lý xóa ngầm
        loading={isDeleting}
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
        title={t('script_editor.save_as_snippet')}
        open={snippetModalOpen}
        onCancel={() => setSnippetModalOpen(false)}
        onOk={async () => {
          if (!snippetTitle.trim()) {
            notification.warning({ message: t('script_editor.snippet_title_required') });
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
            notification.success({ message: t('script_editor.snippet_created') });
            setSnippetModalOpen(false);
          } catch (err) {
            notification.error({ message: t('script_editor.snippet_create_failed'), description: err.message });
          }
        }}
        okButtonProps={{ style: { background: 'var(--accent-amber)', borderColor: 'var(--accent-amber)', color: '#000', fontWeight: 600 } }}
        centered
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 10 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>{t('script_editor.snippet_title_label')}</label>
            <Input
              value={snippetTitle}
              onChange={(e) => setSnippetTitle(e.target.value)}
              placeholder={t('script_editor.snippet_title_placeholder')}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>{t('script_editor.tags_label')}</label>
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder={t('script_editor.tags_placeholder')}
              value={snippetTags}
              onChange={(value) => setSnippetTags(value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>{t('script_editor.content_preview')}</label>
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
                    <strong style={{ color: 'var(--accent-amber)' }}>{t('script_editor.dialogue_label')}</strong>
                    <div dangerouslySetInnerHTML={{ __html: snippetContentHtml || '' }} />
                  </div>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: snippetContentHtml || '' }} />
                )
              ) : t('script_editor.no_block_selected')}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ScriptEditorPage;
