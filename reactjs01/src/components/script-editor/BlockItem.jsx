import { useEffect, useState, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Underline from '@tiptap/extension-underline';
import { Popover, Select, Button, Space, Tooltip, Avatar, Modal } from 'antd';
import { DeleteOutlined, EditOutlined, PlayCircleOutlined, PauseCircleOutlined, PlusOutlined, HistoryOutlined, PlusCircleOutlined, SnippetsOutlined, BoldOutlined, ItalicOutlined, UnderlineOutlined } from '@ant-design/icons';
import { getAssetUrl } from '../../util/api';

const isHtmlEmpty = (html) => {
  if (!html) return true;
  const clean = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
  return clean === '';
};

const BlockItem = ({
  block,
  ydoc,
  provider,
  user,
  characters = [],
  isViewer,
  isCurrentlyReading,
  isVoiceActive,
  isVoicePaused,
  onUpdateBlock,
  onDeleteBlock,
  onPlayBlock,
  onAddBlockClick,
  onResetReading,
  onCreateCharacterClick,
  onDragStart,
  onDragOver,
  onDrop,
  onAddSnippet,
  onDeleteCharacter,
  onEditCharacterClick,
}) => {
  const blockContent = useMemo(() => {
    if (typeof block.content === 'string') {
      try {
        return JSON.parse(block.content);
      } catch (e) {
        return block.content;
      }
    }
    return block.content;
  }, [block.content]);

  const selectedCharacter = useMemo(() => {
    if (block.type !== 'DIALOGUE') return null;
    const charId = blockContent?.characterId;
    return characters.find((c) => String(c._id || c.id) === String(charId));
  }, [block.type, blockContent, characters]);

  const initialHtml = useMemo(() => {
    if (block.type === 'DIALOGUE') {
      return blockContent?.text || '';
    }
    return typeof blockContent === 'string' ? blockContent : '';
  }, [block.type, blockContent]);

  // Unique cursor color for each user
  const cursorColor = useMemo(() => {
    const colors = ['#f783ac', '#da77f2', '#9775fa', '#748ffc', '#3bc9db', '#38d9a9', '#69db7c', '#ffd43b', '#ff922b'];
    const idStr = user?._id || user?.id || 'guest';
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
      hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }, [user]);

  // 1. Tiptap Editor for Text & Dialogue
  const editorField = `block-${block._id || block.id}`;
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Collaboration.configure({
        document: ydoc,
        field: editorField,
      }),
      // CollaborationCursor.configure({
      //   provider: provider,
      //   user: {
      //     name: user?.fullName || 'Collaborator',
      //     color: cursorColor,
      //   },
      // }),
    ],
    editable: !isViewer,
    onUpdate({ editor }) {
      console.log(Date.now());

      const html = editor.getHTML();
      if (block.type === 'DIALOGUE') {
        onUpdateBlock(block._id || block.id, {
          content: {
            characterId: blockContent?.characterId || '',
            text: html,
          },
        });
      } else if (block.type === 'TEXT') {
        onUpdateBlock(block._id || block.id, { content: html });
      }
    },
  }, [block._id || block.id, ydoc]);

  // Force a component update whenever the editor's cursor position or selection changes.
  // This ensures the Bold, Italic, and Underline buttons instantly reflect the active formatting states.
  const [, setEditorStateVersion] = useState(0);

  useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => {
      setEditorStateVersion((v) => v + 1);
    };
    editor.on('selectionUpdate', handleUpdate);
    editor.on('transaction', handleUpdate);
    return () => {
      editor.off('selectionUpdate', handleUpdate);
      editor.off('transaction', handleUpdate);
    };
  }, [editor]);

  // Keep editor read-only status in sync with viewer role
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isViewer);
    }
  }, [editor, isViewer]);

  // Initialize Yjs shared XML fragment from database content when synced
  useEffect(() => {
    if (!editor || !provider || !ydoc) return;
    if (block.type !== 'TEXT' && block.type !== 'DIALOGUE') return; // Only sync text/dialogue blocks in Yjs!

    let isCleanedUp = false;

    const initializeContent = () => {
      if (isCleanedUp) return;
      const fragment = ydoc.getXmlFragment(editorField);
      if (fragment.length === 0 && !isHtmlEmpty(initialHtml)) {
        editor.commands.setContent(initialHtml);
      }
    };

    if (provider.isSynced) {
      initializeContent();
    } else {
      provider.on('synced', initializeContent);
    }

    return () => {
      isCleanedUp = true;
      provider.off('synced', initializeContent);
    };
  }, [editor, provider, ydoc, initialHtml, editorField, block.type]);

  // 2. Character Details Popover Content
  const renderCharacterPopover = () => {
    if (!selectedCharacter) return <span>No character selected</span>;
    return (
      <div style={{ width: 260, padding: '4px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Avatar style={{ background: 'var(--accent-amber)', color: '#000', fontWeight: 600 }}>
            {selectedCharacter.name.charAt(0).toUpperCase()}
          </Avatar>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 14 }}>{selectedCharacter.name}</h4>
              {!isViewer && (
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined style={{ fontSize: 12 }} />}
                  style={{ padding: 0, height: 'auto', color: 'var(--accent-amber)' }}
                  onClick={() => {
                    if (onEditCharacterClick) {
                      onEditCharacterClick(selectedCharacter);
                    }
                  }}
                >
                  Edit
                </Button>
              )}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Character Info</div>
          </div>
        </div>

        {selectedCharacter.description && (
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 8px 0', lineHeight: 1.4 }}>
            {selectedCharacter.description}
          </p>
        )}

        {selectedCharacter.tags && selectedCharacter.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {selectedCharacter.tags.map((t, idx) => (
              <span key={idx} style={{ fontSize: 10, background: 'var(--bg-hover)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-secondary)' }}>
                {t}
              </span>
            ))}
          </div>
        )}

        {selectedCharacter.attributes && selectedCharacter.attributes.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 6, marginTop: 6 }}>
            {selectedCharacter.attributes.map((attr, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: 'var(--text-muted)' }}>{attr.key}:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{attr.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render main block contents
  const renderBlockContent = () => {

    switch (block.type) {
      case 'TEXT':
        return (
          <div className="tiptap-wrapper" style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12, background: 'var(--bg-hover)' }}>
            <EditorContent editor={editor} />
          </div>
        );

      case 'DIALOGUE':
      return (
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14, background: 'var(--bg-hover)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Character:</span>

            {/* SỬA LẠI CÚ PHÁP THẺ MỞ VÀ THẺ ĐÓNG TẠI ĐÂY */}
            <Select
              disabled={isViewer}
              value={selectedCharacter ? (blockContent?.characterId || undefined) : undefined} // Nếu selectedCharacter tìm thấy thì mới hiện ID, nếu không tìm thấy (do đã bị xóa ở tương lai) thì ép về undefined để hiện chữ Select Character
              onChange={(val) => {
                if (val === 'create-new') {
                  onCreateCharacterClick();
                } else {
                  onUpdateBlock(block._id || block.id, {
                    content: {
                      characterId: val,
                      text: blockContent?.text || '',
                    },
                  });
                }
              }}
              placeholder="Select Character"
              style={{ width: 180 }}
              optionLabelProp="label"
              dropdownRender={(menu) => (
                <div>
                  {menu}
                  <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', cursor: 'pointer', color: 'var(--accent-amber)' }} onClick={onCreateCharacterClick}>
                    <PlusOutlined style={{ marginRight: 6 }} /> Create Character
                  </div>
                </div>
              )}
            >
              {/* THÀNH PHẦN CON ĐÃ ĐƯỢC ĐƯA VÀO ĐÚNG GIỮA CẶP THẺ SELECT */}
              {characters.map((char) => (
                <Select.Option key={char._id || char.id} value={char._id || char.id} label={char.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
                    <span style={{ 
                      color: 'var(--text-primary)', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap', 
                      marginRight: 8,
                      flex: 1
                    }}>
                      {char.name}
                    </span>

                    {!isViewer && (
                      <Space size={4} style={{ flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onEditCharacterClick) {
                              onEditCharacterClick(char);
                            }
                          }}
                        />
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation(); // Ngăn chặn Ant Design tự kích hoạt chọn dòng

                            Modal.confirm({
                              title: 'Delete Character?',
                              content: `Are you sure you want to permanently delete "${char.name}" from this workspace? This action cannot be undone.`,
                              okText: 'Yes, Delete',
                              okType: 'danger',
                              cancelText: 'Cancel',
                              centered: true,
                              onOk: () => {
                                if (onDeleteCharacter) {
                                  onDeleteCharacter(char._id || char.id);
                                }
                              },
                            });
                          }}
                        />
                      </Space>
                    )}
                  </div>
                </Select.Option>
              ))}
            </Select> {/* THẺ ĐÓNG SELECT CHUẨN */}

            {selectedCharacter && (
              <Popover content={renderCharacterPopover()} title={null} trigger="hover" placement="right">
                <span style={{ cursor: 'pointer', background: 'rgba(232, 166, 66, 0.1)', color: 'var(--accent-amber)', fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
                  {selectedCharacter.name} (Hover Info)
                </span>
              </Popover>
            )}
          </div>
          <div className="tiptap-wrapper" style={{ borderTop: '1px dashed var(--border)', paddingTop: 10 }}>
            <EditorContent editor={editor} />
          </div>
        </div>
      );

      case 'IMAGE':
        return (
          <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12, background: 'var(--bg-hover)', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textAlign: 'left', textTransform: 'uppercase', fontWeight: 600 }}>
              IMAGE BLOCK ({blockContent?.name || 'Attached Image'})
            </div>
            <img src={getAssetUrl(blockContent?.url) || '/placeholder.png'} alt={blockContent?.name} style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 6, objectFit: 'contain' }} />
          </div>
        );

      case 'VIDEO':
        return (
          <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12, background: 'var(--bg-hover)', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textAlign: 'left', textTransform: 'uppercase', fontWeight: 600 }}>
              VIDEO BLOCK ({blockContent?.name || 'Attached Video'})
            </div>
            <video src={getAssetUrl(blockContent?.url)} controls style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 6 }} />
          </div>
        );

      case 'AUDIO':
        return (
          <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, background: 'var(--bg-hover)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', fontWeight: 600 }}>
              AUDIO BLOCK ({blockContent?.name || 'Attached Audio'})
            </div>
            <audio src={getAssetUrl(blockContent?.url)} controls style={{ width: '100%' }} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      draggable={!isViewer}
      onDragStart={(e) => onDragStart(e, block._id || block.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, block._id || block.id)}
      style={{
        padding: '16px 20px',
        borderRadius: 12,
        background: isCurrentlyReading ? 'rgba(232, 166, 66, 0.01)' : 'var(--bg-base)',
        border: `1px solid ${isCurrentlyReading ? 'var(--accent-amber)' : 'var(--border)'}`,
        position: 'relative',
        transition: 'all 0.2s',
      }}
    >
      {/* Draggable Handle */}
      {!isViewer && (
        <div style={{
          position: 'absolute', top: 16, left: 6, cursor: 'grab', display: 'flex', flexDirection: 'column', gap: 2
        }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-muted)' }} />
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-muted)' }} />
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-muted)' }} />
        </div>
      )}

      {/* Block Main Display */}
      <div style={{ paddingLeft: !isViewer ? 8 : 0 }}>
        {renderBlockContent()}
      </div>

      {/* Jupyter-like block toolbar below each block */}
      <div style={{
        marginTop: 10,
        paddingTop: 10,
        borderTop: '1px solid var(--border-lit)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
          TYPE: {block.type} | POS: {block.position}
        </span>
        <Space size="middle">
          {!isViewer && (block.type === 'TEXT' || block.type === 'DIALOGUE') && editor && (
            <Space size="small" style={{ marginRight: 8, borderRight: '1px solid var(--border-lit)', paddingRight: 8 }}>
              <Tooltip title="Bold (Ctrl+B)">
                <Button
                  type={editor.isActive('bold') ? 'primary' : 'text'}
                  size="small"
                  shape="circle"
                  icon={<BoldOutlined />}
                  disabled={!editor.can().toggleBold()}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  style={{
                    background: editor.isActive('bold') ? 'var(--accent-amber)' : 'transparent',
                    color: editor.isActive('bold') ? '#000' : 'var(--text-primary)',
                  }}
                />
              </Tooltip>
              <Tooltip title="Italic (Ctrl+I)">
                <Button
                  type={editor.isActive('italic') ? 'primary' : 'text'}
                  size="small"
                  shape="circle"
                  icon={<ItalicOutlined />}
                  disabled={!editor.can().toggleItalic()}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  style={{
                    background: editor.isActive('italic') ? 'var(--accent-amber)' : 'transparent',
                    color: editor.isActive('italic') ? '#000' : 'var(--text-primary)',
                  }}
                />
              </Tooltip>
              <Tooltip title="Underline (Ctrl+U)">
                <Button
                  type={editor.isActive('underline') ? 'primary' : 'text'}
                  size="small"
                  shape="circle"
                  icon={<UnderlineOutlined />}
                  disabled={!editor.can().toggleUnderline()}
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  style={{
                    background: editor.isActive('underline') ? 'var(--accent-amber)' : 'transparent',
                    color: editor.isActive('underline') ? '#000' : 'var(--text-primary)',
                  }}
                />
              </Tooltip>
            </Space>
          )}

          {(block.type === 'TEXT' || block.type === 'DIALOGUE') && (
            <Tooltip title={isCurrentlyReading && isVoiceActive && !isVoicePaused ? "Pause block voice synthesis" : "Play block voice synthesis"}>
              <Button
                type="text"
                shape="circle"
                icon={isCurrentlyReading && isVoiceActive && !isVoicePaused ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={() => onPlayBlock(block)}
              />
            </Tooltip>
          )}

          <Tooltip title="Reset reading pointer to here">
            <Button type="text" shape="circle" icon={<HistoryOutlined />} onClick={() => onResetReading(block._id || block.id)} />
          </Tooltip>

          {!isViewer && (
            <>
              {(block.type === 'TEXT' || block.type === 'DIALOGUE') && (
                <Tooltip title="Save as Snippet">
                  <Button type="text" shape="circle" icon={<SnippetsOutlined />} onClick={() => {
                    const currentHtml = editor ? editor.getHTML() : '';
                    onAddSnippet(block, currentHtml);
                  }} />
                </Tooltip>
              )}
              <Tooltip title="Add new block below">
                <Button type="text" shape="circle" icon={<PlusCircleOutlined />} onClick={() => onAddBlockClick(block._id || block.id)} />
              </Tooltip>
              <Tooltip title="Delete block">
                <Button type="text" shape="circle" danger icon={<DeleteOutlined />} onClick={() => onDeleteBlock(block._id || block.id)} />
              </Tooltip>
            </>
          )}
        </Space>
      </div>
    </div>
  );
};

export default BlockItem;
