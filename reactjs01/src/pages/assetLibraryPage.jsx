import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { notification, Spin, Modal, Input, Select, Button, Dropdown, Progress } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import TopBar from '../components/creator-layout/topBar';
import Icon from '../components/creator-layout/Icons';
// ĐÃ THÊM getBillingInfoApi VÀO ĐÂY:
import { getAllAssetsApi, uploadAssetApi, getWorkspaceTagsApi, updateAssetApi, deleteAssetApi, getAssetUrl, getBillingInfoApi } from '../util/api';

const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

/* ============================================================
   COMPONENT: Thẻ hiển thị từng File (Asset Card)
============================================================ */
const AssetCard = ({ data, onClickCard, onEdit, onDelete }) => {
  const uiType = data.type.toLowerCase();

  const menuItems = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Chỉnh sửa tài nguyên',
      onClick: (e) => { e.domEvent.stopPropagation(); onEdit(data); }
    },
    {
      key: 'delete',
      danger: true,
      icon: <DeleteOutlined />,
      label: 'Xóa tài nguyên',
      onClick: (e) => { e.domEvent.stopPropagation(); onDelete(data); }
    }
  ];

  return (
    <div style={{
      background: "var(--bg-raised)", border: "1px solid var(--border)",
      borderRadius: 12, overflow: "hidden", cursor: "pointer", position: "relative",
      transition: "all 0.2s ease", boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-lit)"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.05)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)"; }}
      onClick={() => onClickCard(data)}
    >
      <div style={{
        height: 120, position: "relative",
        background: uiType === "audio" ? "linear-gradient(135deg, #d3e4f6, #b8d4f0)" : "linear-gradient(135deg, #d1efe0, #b4ddc8)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {uiType === "image" ? (
          <img src={getAssetUrl(data.url)} alt={data.fileName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Icon name="music" size={36} color="rgba(34,96,160,0.4)" />
        )}

        <div style={{
          position: "absolute", top: 10, right: 10, fontSize: 10, padding: "3px 8px", borderRadius: 4,
          background: "rgba(255,255,255,0.85)", color: uiType === "audio" ? "var(--accent-ice)" : "var(--accent-sage)",
          fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}>
          {data.type.toUpperCase()}
        </div>
      </div>

      <div style={{ padding: "14px", paddingBottom: "40px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={data.fileName}>
          {data.fileName}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {data.tags && data.tags.length > 0 ? data.tags.map(t => (
            <span key={t} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "var(--bg-active)", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
              #{t}
            </span>
          )) : <span style={{ fontSize: 10, color: "var(--text-muted)" }}>#no_tag</span>}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 10, right: 10 }}>
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
          <div onClick={(e) => e.stopPropagation()} style={{ display: 'inline-block' }}>
            <Button
              type="text"
              icon={<MoreOutlined style={{ fontSize: 18, color: "var(--text-secondary)" }} />}
              style={{ padding: '4px 8px' }}
            />
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

/* ============================================================
   TRANG CHÍNH: ASSET LIBRARY
============================================================ */
const AssetLibraryPage = () => {
  const user = useSelector(state => state.auth.user);
  const { activeWorkspaceId } = useOutletContext();
  const CURRENT_WORKSPACE_ID = activeWorkspaceId;
  const [assets, setAssets] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  // THÊM STATE ĐỂ LƯU THÔNG TIN GÓI HIỆN TẠI
  const [billingInfo, setBillingInfo] = useState(null);

  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [searchText, setSearchText] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editFileName, setEditFileName] = useState("");
  const [editTags, setEditTags] = useState([]);
  const [editingAssetId, setEditingAssetId] = useState(null);

  const fileInputRef = useRef(null);

  // GỌI API LẤY THÔNG TIN GÓI (Để biết dung lượng tổng là bao nhiêu)
  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const res = await getBillingInfoApi();
        setBillingInfo(res.data?.data || res.data);
      } catch (error) {
        console.error("Lỗi lấy thông tin gói cước:", error);
      }
    };
    fetchBilling();
  }, []);

  // TÍNH TOÁN DUNG LƯỢNG ĐỘNG
  const totalUsedBytes = assets.reduce((sum, asset) => sum + (asset.fileSize || 0), 0);
  
  // Lấy mức giới hạn từ gói hiện tại (mặc định 500MB nếu chưa load xong)
  const dynamicLimitMB = billingInfo?.plan?.storageLimitMB || 500;
  const limitBytes = dynamicLimitMB * 1024 * 1024;

  const percentUsed = Math.min(100, Math.round((totalUsedBytes / limitBytes) * 100));

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 MB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fetchAssets = async (searchQuery = searchText) => {
    if (!CURRENT_WORKSPACE_ID) return;
    setIsLoading(true);
    try {
      const assets = await getAllAssetsApi(CURRENT_WORKSPACE_ID, {
        type: filter === "all" ? "" : filter,
        search: searchQuery,
        sort: sortOrder,
      });
      setAssets(assets?.data || assets);
    } catch (error) {
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: error?.response?.data?.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableTags = async () => {
    if (!CURRENT_WORKSPACE_ID) return;
    try {
      const tags = await getWorkspaceTagsApi(CURRENT_WORKSPACE_ID);
      setAvailableTags(tags?.data || tags);
    } catch (error) {
      notification.error({
        message: "Lỗi tải tags",
        description: error?.response?.data?.message,
      });
    }
  };

  useEffect(() => {
    fetchAssets();
    fetchAvailableTags();
  }, [filter, sortOrder, CURRENT_WORKSPACE_ID]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !CURRENT_WORKSPACE_ID) return;
    setIsUploading(true);
    try {
      let safeFileName = file.name;
      safeFileName = safeFileName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d").replace(/Đ/g, "D")
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9.\-_]/g, "");

      const safeFile = new File([file], safeFileName, { type: file.type });
      await uploadAssetApi(CURRENT_WORKSPACE_ID, safeFile, "new_upload");

      notification.success({ message: "Upload thành công!" });
      fetchAssets();
      fetchAvailableTags();
    } catch (error) {
      notification.error({
        message: "Lỗi upload",
        description: error?.response?.data?.message,
      });
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  const handleOpenEdit = (asset) => {
    setEditingAssetId(asset._id);
    setEditFileName(asset.fileName);
    setEditTags(asset.tags || []);
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editFileName.trim()) {
      return notification.warning({ message: "Tên file không được để trống!" });
    }
    try {
      await updateAssetApi(editingAssetId, { fileName: editFileName, tags: editTags });
      notification.success({ message: "Đã cập nhật tài nguyên!" });
      setIsEditModalVisible(false);
      fetchAssets();
      fetchAvailableTags();
    } catch (error) {
      notification.error({
        message: "Lỗi cập nhật",
        description: error?.response?.data?.message,
      });
    }
  };

  const handleDelete = (asset) => {
    confirm({
      title: "Bạn có chắc chắn muốn xóa file này?",
      icon: <ExclamationCircleOutlined />,
      content: `File "${asset.fileName}" sẽ bị xóa vĩnh viễn.`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteAssetApi(asset._id);
          notification.success({ message: "Đã xóa thành công!" });
          fetchAssets();
        } catch (error) {
          notification.error({
            message: "Lỗi xóa file",
            description: error?.response?.data?.message,
          });
        }
      },
    });
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "var(--bg-void)" }}>
      <TopBar title="Kho Tài Nguyên" subtitle={`Asset Library · ${assets.length} files`} />

      <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 16, background: "var(--bg-base)", flexWrap: "wrap" }}>
        <div style={{ display: "flex", background: "var(--bg-raised)", borderRadius: 8, padding: 4, border: "1px solid var(--border)" }}>
          {[["all", "Tất cả"], ["image", "Hình ảnh"], ["audio", "Âm thanh"]].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              style={{
                padding: "6px 14px", borderRadius: 6, border: "none",
                background: filter === v ? "var(--bg-active)" : "transparent",
                color: filter === v ? "var(--accent-amber)" : "var(--text-secondary)",
                fontSize: 13, fontFamily: "'Lato', sans-serif", fontWeight: filter === v ? 700 : 500,
                cursor: "pointer", transition: "all 0.2s"
              }}>{l}</button>
          ))}
        </div>

        <Search placeholder="Tìm tên file hoặc #tag..." allowClear onSearch={(value) => fetchAssets(value)} onChange={(e) => setSearchText(e.target.value)} style={{ width: 250 }} />

        <Select defaultValue="newest" onChange={(value) => setSortOrder(value)} style={{ width: 140 }}>
          <Option value="newest">Mới nhất</Option>
          <Option value="oldest">Cũ nhất</Option>
        </Select>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 20 }}>
          
          {/* === THANH HIỂN THỊ DUNG LƯỢNG TRỞ THÀNH ĐỘNG === */}
          <div style={{ width: 200 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: 11, 
              color: 'var(--text-muted)', 
              marginBottom: 4, 
              fontFamily: "'JetBrains Mono', monospace" 
            }}>
              <span>Dung lượng:</span>
              <span style={{ color: percentUsed >= 90 ? '#ff4d4f' : 'var(--text-primary)' }}>
                {formatBytes(totalUsedBytes)} / {dynamicLimitMB} MB
              </span>
            </div>
            <Progress 
              percent={percentUsed} 
              showInfo={false} 
              size="small" 
              strokeColor={percentUsed >= 90 ? '#ff4d4f' : 'var(--accent-amber)'} 
              trailColor="rgba(255,255,255,0.1)"
            />
          </div>

          <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*,audio/*,video/*" />
          <button onClick={() => fileInputRef.current.click()} disabled={isUploading}
            style={{ 
              display: "flex", alignItems: "center", gap: 8, 
              background: isUploading ? "var(--text-muted)" : "var(--accent-amber)", 
              color: "#0d0d0f", border: "none", borderRadius: 8, padding: "8px 16px", 
              fontSize: 13, fontWeight: 700, cursor: isUploading ? "wait" : "pointer", 
              fontFamily: "'Lato', sans-serif" 
            }}
          >
            <Icon name="upload" size={14} color="#0d0d0f" />
            {isUploading ? "Đang tải..." : "Upload Media"}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "var(--bg-void)" }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
            {assets.map((a, i) => <AssetCard key={i} data={a} onClickCard={(asset) => { setSelectedAsset(asset); setIsModalVisible(true); }} onEdit={handleOpenEdit} onDelete={handleDelete} />)}
          </div>
        )}
        {!isLoading && assets.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", marginTop: 40, fontFamily: "'Lato', sans-serif", fontSize: 14 }}>
            Không tìm thấy tài nguyên nào.
          </div>
        )}
      </div>

      {/* Popup Chi Tiết & Xem Trước Trực Tiếp */}
      <Modal title="Chi tiết Tài nguyên" open={isModalVisible} onCancel={() => { setIsModalVisible(false); setTimeout(() => setSelectedAsset(null), 200); }} footer={null} centered destroyOnClose={true}>
        {selectedAsset && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              <p style={{ margin: 0 }}><strong>Tên file:</strong> {selectedAsset.fileName}</p>
              <p style={{ margin: 0 }}>
                <strong>Workspace:</strong> <span style={{ color: "var(--accent-ice)", fontWeight: "bold" }}>
                  {selectedAsset.workspaceId?.name || "Chưa xác định"}
                </span>
              </p>
              <p style={{ margin: 0 }}><strong>Loại định dạng:</strong> <span style={{ color: "var(--accent-amber)", fontWeight: "bold" }}>{selectedAsset.type}</span></p>
              <p style={{ margin: 0 }}><strong>Ngày tải lên:</strong> {new Date(selectedAsset.createdAt).toLocaleString('vi-VN')}</p>
              <p style={{ margin: 0 }}><strong>Tags:</strong> {selectedAsset.tags?.join(", ") || "Không có"}</p>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-hover)', borderRadius: 8, textAlign: 'center' }}>
              {selectedAsset.type === 'IMAGE' ? (
                <img src={getAssetUrl(selectedAsset.url)} alt={selectedAsset.fileName} style={{ maxWidth: "100%", maxHeight: "350px", objectFit: "contain", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
              ) : selectedAsset.type === 'AUDIO' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 0' }}>
                  <Icon name="music" size={48} color="var(--accent-ice)" />
                  <audio controls autoPlay src={getAssetUrl(selectedAsset.url)} style={{ width: "100%", outline: "none" }} controlsList="nodownload" />
                </div>
              ) : <div style={{ color: "var(--text-muted)" }}>Không hỗ trợ định dạng này.</div>}
            </div>
          </div>
        )}
      </Modal>

      {/* Popup Edit Tên & Tags */}
      <Modal
        title="Chỉnh sửa Tài nguyên"
        open={isEditModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        centered
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 10 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Tên file</label>
            <Input
              value={editFileName}
              onChange={(e) => setEditFileName(e.target.value)}
              placeholder="Nhập tên file..."
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Tags</label>
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Chọn tag có sẵn hoặc gõ từ khóa mới rồi nhấn Enter..."
              value={editTags}
              onChange={(value) => setEditTags(value)}
              options={availableTags.map(tag => ({ value: tag, label: tag }))}
            />
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default AssetLibraryPage;