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

  // === PROFILE UPDATE FORM STATE ===
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [fileObject, setFileObject] = useState(null);
  const fileInputRef = useRef(null);

  // === BILLING & STORAGE STATE ===
  const [billingInfo, setBillingInfo] = useState(null);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // === PAYMENT DETAILS MODAL STATE ===
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Initialize Profile data
  useEffect(() => {
    setFullName(user.fullName && user.fullName !== "undefined" ? user.fullName : "");
    if (user.avatar) {
      setAvatarPreview(user.avatar.startsWith("data:") ? user.avatar : `${BACKEND_URL}${user.avatar}`);
    }
  }, [user]);

  // Fetch billing info when switching to "Plan & Storage" tab
  useEffect(() => {
    if (tab === "package" && !billingInfo) {
      const fetchBilling = async () => {
        setLoadingBilling(true);
        try {
          const res = await getBillingInfoApi();
          setBillingInfo(res.data?.data || res.data); 
        } catch (error) {
          notification.error({ message: "Error loading billing data" });
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
      notification.success({ message: "Success", description: "Account profile updated successfully!" });
      dispatch(loginSuccess(res.user));
      setFileObject(null);
    } catch (error) {
      notification.error({ message: "Update Error", description: "Failed to update profile!" });
    } finally {
      setLoading(false);
    }
  };

  const planName = billingInfo?.plan?.name || "FREE PLAN";
  const limitMB = billingInfo?.plan?.storageLimitMB || 500;
  const workspaceLimit = billingInfo?.plan?.workspaceLimit === 9999 ? "Unlimited" : billingInfo?.plan?.workspaceLimit || 3;
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
        notification.error({ message: "Could not generate payment link!" });
      }
    } catch (error) {
      notification.error({
        message: "Payment Initialization Error",
        description: error?.response?.data?.message || "Could not connect to the payment gateway"
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const openPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setIsPaymentModalVisible(true);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "var(--bg-void)" }}>
      <TopBar title="Settings" subtitle="Account & Billing" />
      
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 700 }}>
          
          <div style={{ display: "flex", gap: 8, marginBottom: 32, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
            {[["account", "Account"], ["package", "Plan & Storage"]].map(([v, l]) => (
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

          {/* TAB 1: ACCOUNT */}
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
                  <button onClick={() => fileInputRef.current.click()} style={{ marginTop: 10, fontSize: 12, color: "var(--accent-amber)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Change avatar →</button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>FULL NAME</div>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: "100%", background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 9, padding: "10px 14px", color: "var(--text-primary)", outline: "none" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>EMAIL</div>
                  <input defaultValue={displayEmail} disabled style={{ width: "100%", background: "var(--bg-raised)", border: "1px solid var(--border)", opacity: 0.7, borderRadius: 9, padding: "10px 14px", color: "var(--text-primary)", outline: "none", cursor: "not-allowed" }} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 12 }}>DISPLAY MODE</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[["light", "Light Mode"], ["dark", "Dark Mode"], ["system", "System Default"]].map(([v, l]) => (
                    <button key={v} onClick={() => setDisplayMode(v)} style={{ padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, border: "1px solid", fontWeight: displayMode === v ? 700 : 400, borderColor: displayMode === v ? "var(--accent-amber)" : "var(--border)", background: displayMode === v ? "rgba(232,166,66,0.1)" : "var(--bg-raised)", color: displayMode === v ? "var(--accent-amber)" : "var(--text-secondary)" }}>{l}</button>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, marginTop: 10 }}>
                <button onClick={handleUpdateProfile} disabled={loading} style={{ background: loading ? "var(--text-muted)" : "linear-gradient(135deg, var(--accent-amber), var(--accent-rust))", color: "#fff", border: "none", borderRadius: 9, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  {loading && <Spin size="small" />} {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PLAN & STORAGE */}
          {tab === "package" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }} className="fade-up">
              {loadingBilling ? (
                <div style={{ padding: 40, textAlign: "center" }}><Spin size="large" tip="Loading storage data..." /></div>
              ) : (
                <>
                  <div style={{ background: "var(--bg-raised)", borderRadius: 12, padding: "20px 24px", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em" }}>YOUR CURRENT PLAN</div>
                      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: "var(--text-primary)", marginTop: 4, textTransform: "uppercase" }}>
                        {planName}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                        {limitMB} MB storage · Limit: {workspaceLimit} Workspace(s)
                        
                        {(() => {
                          if (planName.includes("FREE")) return null;
                          
                          const latestSuccessPayment = billingInfo?.payments?.find(p => p.status === 'SUCCESS');
                          let expireDate = subscription?.endDate;
                          
                          if (!expireDate && latestSuccessPayment) {
                            const createdDate = new Date(latestSuccessPayment.createdAt);
                            createdDate.setDate(createdDate.getDate() + 30);
                            expireDate = createdDate;
                          }

                          if (expireDate) {
                            return (
                              <div style={{ marginTop: 6, color: "var(--accent-sage)", fontWeight: 600, fontSize: 12 }}>
                                ⏳ Valid until: {new Date(expireDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {new Date(expireDate).toLocaleDateString('en-US')}
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
                        {isUpgrading ? "Generating Link..." : "Upgrade to PRO ✦"}
                      </button>
                    )}
                  </div>

                  <div style={{ background: "var(--bg-raised)", borderRadius: 12, padding: "24px", border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", marginBottom: 16 }}>TOTAL STORAGE CAPACITY</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 14, color: "var(--text-primary)" }}>Used: <strong style={{ color: pct > 90 ? "var(--accent-rust)" : "inherit" }}>{totalUsedMB} MB</strong></span>
                      <span style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>{limitMB} MB total</span>
                    </div>
                    
                    <div style={{ height: 10, background: "var(--bg-active)", borderRadius: 5, overflow: "hidden", marginBottom: 20 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: pct > 80 ? "var(--accent-rust)" : "linear-gradient(90deg, var(--accent-amber), var(--accent-rust))", borderRadius: 5, transition: "width 0.6s ease" }} />
                    </div>
                    
                    <div style={{ display: "flex", gap: 20 }}>
                      {[["Audio & Video", audioMB, "var(--accent-ice)"], ["Images & Others", imageMB, "var(--accent-sage)"]].map(([label, mb, color]) => (
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

                  {/* PAYMENT HISTORY */}
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", marginBottom: 12, marginTop: 8 }}>PAYMENT HISTORY (Click to view details)</div>
                    
                    <div style={{ background: "var(--bg-raised)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>FREE Plan — Initial Registration</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>Started upon account creation</div>
                        </div>
                        <span style={{ fontSize: 11, color: "var(--accent-sage)", background: "rgba(90,138,106,0.1)", padding: "4px 10px", borderRadius: 6, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                          {planName.includes("FREE") ? "ACTIVE" : "EXPIRED"}
                        </span>
                      </div>

                      {billingInfo?.payments && billingInfo.payments.length > 0 ? (
                        billingInfo.payments.map((payment, idx) => {
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
                              onClick={() => openPaymentDetails(payment)}
                              style={{ 
                                padding: "16px 20px", 
                                borderBottom: idx !== billingInfo.payments.length -1 ? "1px solid var(--border)" : "none", 
                                display: "flex", justifyContent: "space-between", alignItems: "center", 
                                background: "rgba(255,255,255,0.02)",
                                cursor: "pointer", 
                                transition: "background 0.2s"
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                            >
                              <div>
                                <div style={{ fontSize: 13, color: payment.status === 'CANCELLED' ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: 600, textDecoration: payment.status === 'CANCELLED' ? 'line-through' : 'none' }}>
                                  Upgrade to {payment.planSnapshot?.name || "Premium Plan"} — {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payment.amount)}
                                </div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                                  Txn Ref: {payment.transactionRef || "N/A"} · {new Date(payment.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {new Date(payment.createdAt).toLocaleDateString('en-US')}
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
                          No upgrade transactions found. <button style={{ background: "none", border: "none", color: "var(--accent-amber)", cursor: "pointer", fontSize: 13, fontFamily: "'Lato', sans-serif", fontWeight: 600 }}>Learn more about PRO →</button>
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

      {/* PAYMENT DETAILS MODAL */}
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
              <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 4 }}>Payment Amount</div>
              <div style={{ fontSize: 28, fontFamily: "'Instrument Serif', serif", fontWeight: 700 }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedPayment.amount)}
              </div>
              <Tag color={selectedPayment.status === 'SUCCESS' ? 'success' : (selectedPayment.status === 'PENDING' ? 'warning' : 'error')} style={{ marginTop: 12, borderRadius: 16, padding: "2px 12px", fontFamily: "'JetBrains Mono', monospace" }}>
                {selectedPayment.status}
              </Tag>
            </div>

            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Transaction ID</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 500 }}>{selectedPayment.transactionRef}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Service Plan</span>
                <span style={{ fontWeight: 600, color: "var(--accent-amber)" }}>{selectedPayment.planSnapshot?.name || "Premium"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Payment Gateway</span>
                <span style={{ fontWeight: 500 }}>{selectedPayment.method}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Created At</span>
                <span style={{ fontSize: 13 }}>{new Date(selectedPayment.createdAt).toLocaleTimeString('en-US')} - {new Date(selectedPayment.createdAt).toLocaleDateString('en-US')}</span>
              </div>
            </div>

            <div style={{ padding: "16px 24px", background: "var(--bg-base)", textAlign: "center" }}>
              <Button type="primary" onClick={() => setIsPaymentModalVisible(false)} style={{ background: "var(--accent-amber)", color: "#000", fontWeight: 600, borderRadius: 8, width: "100%" }}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default SettingsPage;