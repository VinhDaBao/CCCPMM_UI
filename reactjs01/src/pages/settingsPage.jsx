import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { notification, Spin, Modal, Input, Select, Button, Dropdown, Progress, Tag, Divider } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import TopBar from '../components/creator-layout/TopBar';
import { loginSuccess } from '../redux/authSlice';
import Icon from '../components/creator-layout/Icons';
import { updateProfileApi, getBillingInfoApi, createPayOSLinkApi } from '../util/api';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const SettingsPage = () => {
  const [tab, setTab] = useState("account");
  const [displayMode, setDisplayMode] = useState("light");
  
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  const user = auth?.user || {};

  // === STATE CHO FORM UPDATE PROFILE ===
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [fileObject, setFileObject] = useState(null);
  const fileInputRef = useRef(null);

  // === STATE CHO BILLING & DUNG LƯỢNG (DỮ LIỆU THẬT) ===
  const [billingInfo, setBillingInfo] = useState(null);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // === STATE CHO POPUP CHI TIẾT THANH TOÁN (MỚI THÊM) ===
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Khởi tạo dữ liệu Profile
  useEffect(() => {
    setFullName(user.fullName && user.fullName !== "undefined" ? user.fullName : "");
    if (user.avatar) {
      setAvatarPreview(user.avatar.startsWith("data:") ? user.avatar : `${BACKEND_URL}${user.avatar}`);
    }
  }, [user]);

  // Gọi API lấy dung lượng khi bấm qua Tab "Gói & Dung lượng"
  useEffect(() => {
    if (tab === "package" && !billingInfo) {
      const fetchBilling = async () => {
        setLoadingBilling(true);
        try {
          const res = await getBillingInfoApi();
          setBillingInfo(res.data?.data || res.data); 
        } catch (error) {
          notification.error({ message: "Lỗi tải dữ liệu gói cước" });
        } finally {
          setLoadingBilling(false);
        }
      };
      fetchBilling();
    }
  }, [tab, billingInfo]);

  const initial = user.fullName ? user.fullName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U');
  const displayEmail = user.email || "creator@studio.com";

  const toMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileObject(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      let avatarToSend = fileObject;
      if (!fileObject && typeof avatarPreview === "string" && !avatarPreview.startsWith("data:")) {
        avatarToSend = user.avatar; 
      }
      const res = await updateProfileApi(fullName, avatarToSend);
      notification.success({ message: "Thành công", description: "Đã cập nhật thông tin tài khoản!" });
      dispatch(loginSuccess(res.user));
      setFileObject(null);
    } catch (error) {
      notification.error({ message: "Lỗi cập nhật", description: "Không thể cập nhật hồ sơ!" });
    } finally {
      setLoading(false);
    }
  };

  const planName = billingInfo?.plan?.name || "FREE PLAN";
  const limitMB = billingInfo?.plan?.storageLimitMB || 500;
  const workspaceLimit = billingInfo?.plan?.workspaceLimit === 9999 ? "Không giới hạn" : billingInfo?.plan?.workspaceLimit || 3;
  const subscription = billingInfo?.subscription;
  
  const totalUsedMB = billingInfo ? toMB(billingInfo.storage.totalUsedBytes) : 0;
  const audioMB = billingInfo ? toMB(billingInfo.storage.audioVideoBytes) : 0;
  const imageMB = billingInfo ? toMB(billingInfo.storage.imageBytes) : 0;
  
  const pct = billingInfo ? Math.min(100, (billingInfo.storage.totalUsedBytes / billingInfo.storage.limitBytes) * 100) : 0;

  const handleUpgradePRO = async () => {
    setIsUpgrading(true);
    try {
      const fakePlanId = "6a3ce12a08a8e8991f3d1fb8";
      const amount = 2000;
      const res = await createPayOSLinkApi(fakePlanId, amount);

      const payload = res?.data?.data || res?.data || res;
      const checkoutUrl = payload?.checkoutUrl;

      if (checkoutUrl) {
        window.location.assign(checkoutUrl); 
      } else {
        notification.error({ message: "Không lấy được link thanh toán!" });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi tạo thanh toán",
        description: error?.response?.data?.message || "Không thể kết nối đến cổng thanh toán"
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  // HÀM MỞ POPUP CHI TIẾT
  const openPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setIsPaymentModalVisible(true);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "var(--bg-void)" }}>
      <TopBar title="Cài đặt" subtitle="Tài khoản & Gói dịch vụ" />
      
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 700 }}>
          
          <div style={{ display: "flex", gap: 8, marginBottom: 32, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
            {[["account", "Tài khoản"], ["package", "Gói & Dung lượng"]].map(([v, l]) => (
              <button key={v} onClick={() => setTab(v)}
                style={{
                  padding: "10px 20px", border: "none", cursor: "pointer",
                  background: "transparent", fontSize: 14, fontFamily: "'Lato', sans-serif",
                  fontWeight: tab === v ? 700 : 500,
                  color: tab === v ? "var(--accent-amber)" : "var(--text-secondary)",
                  borderBottom: tab === v ? "2px solid var(--accent-amber)" : "2px solid transparent",
                  marginBottom: -1, transition: "all 0.2s"
                }}>{l}</button>
            ))}
          </div>

          {/* TAB 1: TÀI KHOẢN */}
          {tab === "account" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }} className="fade-up">
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--border-lit)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} />
                ) : (
                  <div style={{ 
                    width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #4a3f8a, #7a5a9a)", 
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: "#e0d0f0", border: "3px solid var(--border-lit)",
                  }}>{initial}</div>
                )}
                <div>
                  <div style={{ fontSize: 18, fontFamily: "'Instrument Serif', serif", color: "var(--text-primary)" }}>{fullName || (user.email ? user.email.split('@')[0] : "Creator")}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>{displayEmail}</div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                  <button onClick={() => fileInputRef.current.click()} style={{ marginTop: 10, fontSize: 12, color: "var(--accent-amber)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Đổi ảnh đại diện →</button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>HỌ VÀ TÊN</div>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: "100%", background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 9, padding: "10px 14px", color: "var(--text-primary)", outline: "none" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>EMAIL</div>
                  <input defaultValue={displayEmail} disabled style={{ width: "100%", background: "var(--bg-raised)", border: "1px solid var(--border)", opacity: 0.7, borderRadius: 9, padding: "10px 14px", color: "var(--text-primary)", outline: "none", cursor: "not-allowed" }} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 12 }}>GIAO DIỆN MÀN HÌNH</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[["light", "Light Mode"], ["dark", "Dark Mode"], ["system", "Theo hệ thống"]].map(([v, l]) => (
                    <button key={v} onClick={() => setDisplayMode(v)} style={{ padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, border: "1px solid", fontWeight: displayMode === v ? 700 : 400, borderColor: displayMode === v ? "var(--accent-amber)" : "var(--border)", background: displayMode === v ? "rgba(232,166,66,0.1)" : "var(--bg-raised)", color: displayMode === v ? "var(--accent-amber)" : "var(--text-secondary)" }}>{l}</button>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, marginTop: 10 }}>
                <button onClick={handleUpdateProfile} disabled={loading} style={{ background: loading ? "var(--text-muted)" : "linear-gradient(135deg, var(--accent-amber), var(--accent-rust))", color: "#fff", border: "none", borderRadius: 9, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  {loading && <Spin size="small" />} {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: GÓI & DUNG LƯỢNG */}
          {tab === "package" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }} className="fade-up">
              {loadingBilling ? (
                <div style={{ padding: 40, textAlign: "center" }}><Spin size="large" tip="Đang tải dữ liệu dung lượng..." /></div>
              ) : (
                <>
                  <div style={{ background: "var(--bg-raised)", borderRadius: 12, padding: "20px 24px", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em" }}>GÓI HIỆN TẠI CỦA BẠN</div>
                      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: "var(--text-primary)", marginTop: 4, textTransform: "uppercase" }}>
                        {planName}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                        {limitMB} MB dung lượng · Giới hạn: {workspaceLimit} Workspace
                        
                        {/* Tính toán ngày hết hạn thông minh */}
                        {(() => {
                          if (planName.includes("FREE")) return null;
                          
                          // Tìm hóa đơn SUCCESS gần nhất
                          const latestSuccessPayment = billingInfo?.payments?.find(p => p.status === 'SUCCESS');
                          let expireDate = subscription?.endDate;
                          
                          // Nếu Backend không trả về endDate, tự động tính = Ngày mua + 30 ngày
                          if (!expireDate && latestSuccessPayment) {
                            const createdDate = new Date(latestSuccessPayment.createdAt);
                            createdDate.setDate(createdDate.getDate() + 30);
                            expireDate = createdDate;
                          }

                          if (expireDate) {
                            return (
                              <div style={{ marginTop: 6, color: "var(--accent-sage)", fontWeight: 600, fontSize: 12 }}>
                                ⏳ Hiệu lực đến: {new Date(expireDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(expireDate).toLocaleDateString('vi-VN')}
                              </div>
                            );
                          }
                          return null;
                        })()}
                        
                      </div>
                    </div>
                    {planName.includes("FREE") && (
                      <button 
                        onClick={handleUpgradePRO}
                        disabled={isUpgrading}
                        style={{ 
                          background: isUpgrading ? "var(--text-muted)" : "linear-gradient(135deg, var(--accent-amber), var(--accent-rust))", 
                          color: "#fff", border: "none", borderRadius: 9, padding: "12px 24px", fontSize: 13, fontWeight: 700, 
                          cursor: isUpgrading ? "wait" : "pointer", fontFamily: "'Lato', sans-serif", 
                          boxShadow: isUpgrading ? "none" : "0 4px 12px rgba(176, 58, 34, 0.2)",
                          transition: "all 0.2s"
                        }}
                      >
                        {isUpgrading ? "Đang tạo Link..." : "Nâng cấp PRO ✦"}
                      </button>
                    )}
                  </div>

                  <div style={{ background: "var(--bg-raised)", borderRadius: 12, padding: "24px", border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", marginBottom: 16 }}>DUNG LƯỢNG LƯU TRỮ TỔNG</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 14, color: "var(--text-primary)" }}>Đã dùng: <strong style={{ color: pct > 90 ? "var(--accent-rust)" : "inherit" }}>{totalUsedMB} MB</strong></span>
                      <span style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>{limitMB} MB tổng</span>
                    </div>
                    
                    <div style={{ height: 10, background: "var(--bg-active)", borderRadius: 5, overflow: "hidden", marginBottom: 20 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: pct > 80 ? "var(--accent-rust)" : "linear-gradient(90deg, var(--accent-amber), var(--accent-rust))", borderRadius: 5, transition: "width 0.6s ease" }} />
                    </div>
                    
                    <div style={{ display: "flex", gap: 20 }}>
                      {[["Âm thanh & Video", audioMB, "var(--accent-ice)"], ["Hình ảnh & Khác", imageMB, "var(--accent-sage)"]].map(([label, mb, color]) => (
                        <div key={label} style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                              {label}
                            </span>
                            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>{mb} MB</span>
                          </div>
                          <div style={{ height: 4, background: "var(--bg-active)", borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${limitMB > 0 ? (mb / limitMB) * 100 : 0}%`, background: color, borderRadius: 2 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* LỊCH SỬ THANH TOÁN CÓ THỂ CLICK */}
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", marginBottom: 12, marginTop: 8 }}>LỊCH SỬ THANH TOÁN (Click để xem chi tiết)</div>
                    
                    <div style={{ background: "var(--bg-raised)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>Gói FREE — Đăng ký lần đầu</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>Bắt đầu từ lúc tạo tài khoản</div>
                        </div>
                        <span style={{ fontSize: 11, color: "var(--accent-sage)", background: "rgba(90,138,106,0.1)", padding: "4px 10px", borderRadius: 6, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                          {planName.includes("FREE") ? "ACTIVE" : "EXPIRED"}
                        </span>
                      </div>

                      {billingInfo?.payments && billingInfo.payments.length > 0 ? (
                        billingInfo.payments.map((payment, idx) => {
                          // Setup màu sắc theo trạng thái
                          let statusColor = "var(--text-muted)";
                          let statusBg = "rgba(255,255,255,0.05)";
                          if (payment.status === 'SUCCESS') {
                            statusColor = "var(--accent-sage)";
                            statusBg = "rgba(90,138,106,0.1)";
                          } else if (payment.status === 'PENDING') {
                            statusColor = "var(--accent-amber)";
                            statusBg = "rgba(232,166,66,0.1)";
                          } else if (payment.status === 'CANCELLED') {
                            statusColor = "var(--accent-rust)";
                            statusBg = "rgba(176,58,34,0.1)";
                          }

                          return (
                            <div 
                              key={idx} 
                              onClick={() => openPaymentDetails(payment)} // THÊM SỰ KIỆN CLICK VÀO ĐÂY
                              style={{ 
                                padding: "16px 20px", 
                                borderBottom: idx !== billingInfo.payments.length -1 ? "1px solid var(--border)" : "none", 
                                display: "flex", justifyContent: "space-between", alignItems: "center", 
                                background: "rgba(255,255,255,0.02)",
                                cursor: "pointer", // ĐỔI CHUỘT THÀNH HÌNH BÀN TAY
                                transition: "background 0.2s"
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                            >
                              <div>
                                <div style={{ fontSize: 13, color: payment.status === 'CANCELLED' ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: 600, textDecoration: payment.status === 'CANCELLED' ? 'line-through' : 'none' }}>
                                  Nâng cấp {payment.planSnapshot?.name || "Gói Premium"} — {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payment.amount)}
                                </div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                                  Mã GD: {payment.transactionRef || "N/A"} · {new Date(payment.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(payment.createdAt).toLocaleDateString('vi-VN')}
                                </div>
                              </div>
                              <span style={{ fontSize: 11, color: statusColor, background: statusBg, padding: "4px 10px", borderRadius: 6, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                                {payment.status}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                          Chưa có giao dịch nâng cấp nào. <button style={{ background: "none", border: "none", color: "var(--accent-amber)", cursor: "pointer", fontSize: 13, fontFamily: "'Lato', sans-serif", fontWeight: 600 }}>Tìm hiểu thêm gói PRO →</button>
                        </div>
                      )}
                    </div>
                  </div>

                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* POPUP HIỂN THỊ CHI TIẾT THANH TOÁN */}
      <Modal
        title={null}
        open={isPaymentModalVisible}
        onCancel={() => setIsPaymentModalVisible(false)}
        footer={null}
        centered
        width={400}
        bodyStyle={{ padding: 0, borderRadius: 12, overflow: 'hidden' }}
      >
        {selectedPayment && (
          <div style={{ background: "var(--bg-raised)", color: "var(--text-primary)" }}>
            <div style={{ padding: "24px", textAlign: "center", borderBottom: "1px dashed var(--border)" }}>
              <div style={{ 
                width: 50, height: 50, borderRadius: "50%", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center",
                background: selectedPayment.status === 'SUCCESS' ? "rgba(90,138,106,0.1)" : (selectedPayment.status === 'PENDING' ? "rgba(232,166,66,0.1)" : "rgba(176,58,34,0.1)"),
                color: selectedPayment.status === 'SUCCESS' ? "var(--accent-sage)" : (selectedPayment.status === 'PENDING' ? "var(--accent-amber)" : "var(--accent-rust)"),
                fontSize: 24
              }}>
                {selectedPayment.status === 'SUCCESS' ? "✓" : (selectedPayment.status === 'PENDING' ? "⏳" : "✕")}
              </div>
              <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 4 }}>Số tiền thanh toán</div>
              <div style={{ fontSize: 28, fontFamily: "'Instrument Serif', serif", fontWeight: 700 }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedPayment.amount)}
              </div>
              <Tag color={selectedPayment.status === 'SUCCESS' ? 'success' : (selectedPayment.status === 'PENDING' ? 'warning' : 'error')} style={{ marginTop: 12, borderRadius: 16, padding: "2px 12px", fontFamily: "'JetBrains Mono', monospace" }}>
                {selectedPayment.status}
              </Tag>
            </div>

            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Mã giao dịch</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 500 }}>{selectedPayment.transactionRef}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Gói dịch vụ</span>
                <span style={{ fontWeight: 600, color: "var(--accent-amber)" }}>{selectedPayment.planSnapshot?.name || "Premium"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Cổng thanh toán</span>
                <span style={{ fontWeight: 500 }}>{selectedPayment.method}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Thời gian tạo</span>
                <span style={{ fontSize: 13 }}>{new Date(selectedPayment.createdAt).toLocaleTimeString('vi-VN')} - {new Date(selectedPayment.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            <div style={{ padding: "16px 24px", background: "var(--bg-base)", textAlign: "center" }}>
              <Button type="primary" onClick={() => setIsPaymentModalVisible(false)} style={{ background: "var(--accent-amber)", color: "#000", fontWeight: 600, borderRadius: 8, width: "100%" }}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default SettingsPage;