import { notification, Table, Tag, Switch, Space, Typography, Card, Input, Select, Button } from "antd"; 
import { useEffect, useState } from "react";
import { getAllUsersApi, toggleUserStatusApi, sendSystemNotificationApi } from "../util/api"; 
import TopBar from "../components/creator-layout/TopBar"; 

const { Title } = Typography;
const { Search } = Input;

const UserPage = () => {
    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const [systemNotiTitle, setSystemNotiTitle] = useState('');
    const [systemNotiMessage, setSystemNotiMessage] = useState('');
    const [isSendingNoti, setIsSendingNoti] = useState(false);

    const handleSendSystemNotification = async () => {
        if (!systemNotiTitle.trim() || !systemNotiMessage.trim()) {
            notification.error({ message: "Lỗi", description: "Vui lòng nhập đầy đủ tiêu đề và nội dung" });
            return;
        }

        setIsSendingNoti(true);
        try {
            const res = await sendSystemNotificationApi({
                title: systemNotiTitle,
                message: systemNotiMessage
            });

            if (res && res.errCode === 0) {
                notification.success({ message: "Thành công", description: "Thông báo hệ thống đã được gửi tới toàn bộ người dùng" });
                setSystemNotiTitle('');
                setSystemNotiMessage('');
            } else {
                notification.error({ message: "Gửi thất bại", description: res?.message });
            }
        } catch (error) {
            notification.error({ message: "Lỗi hệ thống", description: error.message });
        } finally {
            setIsSendingNoti(false);
        }
    };

    const [queryParams, setQueryParams] = useState({
        page: 1,
        limit: 10,
        search: '',
        sortBy: 'createdAt', 
        sortOrder: 'desc'    
    });

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await getAllUsersApi(queryParams);
            if (res && res.errCode === 0) {
                setUsers(res.data.users);
                setTotalUsers(res.data.pagination.totalItems);
            } else {
                notification.error({ message: "Lỗi tải dữ liệu", description: res?.message });
            }
        } catch (error) {
            notification.error({ message: "Lỗi hệ thống", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [queryParams]);

    const handleSearch = (value) => {
        setQueryParams({
            ...queryParams,
            search: value,
            page: 1 
        });
    };

    const handleSortChange = (value) => {
        const [sortBy, sortOrder] = value.split('_');
        setQueryParams({
            ...queryParams,
            sortBy: sortBy,
            sortOrder: sortOrder,
            page: 1 
        });
    };

    const handleTableChange = (pagination) => {
        setQueryParams({
            ...queryParams,
            page: pagination.current,
            limit: pagination.pageSize,
        });
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            setUsers(users.map(u => u._id === userId ? { ...u, isActivated: !currentStatus } : u));
            const res = await toggleUserStatusApi(userId);
            
            if (res && res.errCode === 0) {
                notification.success({ message: res.message });
                fetchUsers(); 
            } else {
                setUsers(users.map(u => u._id === userId ? { ...u, isActivated: currentStatus } : u));
                notification.error({ message: "Thất bại", description: res?.message });
            }
        } catch (error) {
            fetchUsers(); 
            notification.error({ message: "Lỗi hệ thống khi đổi trạng thái" });
        }
    };

    const columns = [
        {
            title: "Họ và Tên",
            dataIndex: "fullName",
            key: "fullName",
            fontWeight: "bold",
            render: (text) => <strong>{text}</strong>
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            render: (role) => (
                <Tag color={role === 'admin' ? "volcano" : "geekblue"}>
                    {role.toUpperCase()}
                </Tag>
            )
        },
        // 👇 CỘT GÓI DỊCH VỤ ĐÃ HOÀN THIỆN 👇
        {
            title: "Gói dịch vụ",
            key: "plan",
            align: "center",
            render: (_, record) => {
                const currentPlanName = record?.subscription?.planId?.name || "FREE";
                const isPro = currentPlanName.toUpperCase().includes("PRO");

                return (
                    <Tag 
                        color={isPro ? "gold" : "default"} 
                        style={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}
                    >
                        {isPro ? "PRO" : "FREE"}
                    </Tag>
                );
            }
        },
        {
            title: "Trạng thái",
            dataIndex: "isActivated",
            key: "isActivated",
            render: (isActivated) => (
                <Tag color={isActivated ? "success" : "error"}>
                    {isActivated ? "ĐANG HOẠT ĐỘNG" : "BỊ KHÓA"}
                </Tag>
            )
        },
        {
            title: "Hành động",
            key: "action",
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Switch
                        checkedChildren="Mở"
                        unCheckedChildren="Khóa"
                        checked={record.isActivated}
                        onChange={() => handleToggleStatus(record._id, record.isActivated)}
                        disabled={record.role === 'admin'} 
                    />
                </Space>
            )
        },
    ];

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "var(--bg-void)" }}>
            <TopBar title="Quản trị Hệ thống" subtitle="Quản lý Người dùng" />
            
            <div style={{ padding: "24px", flex: 1, overflowY: "auto" }}>
                <Card 
                    bordered={false} 
                    style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 24 }}
                    title={<span style={{ fontWeight: 700, fontSize: 16 }}>📣 Gửi Thông báo Hệ thống</span>}
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div>
                            <div style={{ marginBottom: 4, fontWeight: 600 }}>Tiêu đề thông báo:</div>
                            <Input 
                                placeholder="Nhập tiêu đề (vd: Bảo trì hệ thống)..." 
                                value={systemNotiTitle}
                                onChange={(e) => setSystemNotiTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <div style={{ marginBottom: 4, fontWeight: 600 }}>Nội dung thông báo:</div>
                            <Input.TextArea 
                                placeholder="Nhập nội dung thông báo hệ thống..." 
                                rows={3}
                                value={systemNotiMessage}
                                onChange={(e) => setSystemNotiMessage(e.target.value)}
                            />
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button 
                                type="primary" 
                                loading={isSendingNoti}
                                onClick={handleSendSystemNotification}
                                style={{ background: "var(--accent-rust)", borderColor: "var(--accent-rust)", color: "#fff", fontWeight: 600 }}
                              >
                                Gửi thông báo tới tất cả người dùng
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                    <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <Title level={4} style={{ margin: 0 }}>Danh sách Tài khoản</Title>
                            <p style={{ color: "var(--text-muted)", margin: 0 }}>Tổng số: {totalUsers} người dùng</p>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Select
                                defaultValue="createdAt_desc"
                                style={{ width: 160 }}
                                onChange={handleSortChange}
                                options={[
                                    { value: 'createdAt_desc', label: 'Mới nhất' },
                                    { value: 'createdAt_asc', label: 'Cũ nhất' },
                                    { value: 'fullName_asc', label: 'Tên: A - Z' },
                                    { value: 'fullName_desc', label: 'Tên: Z - A' },
                                ]}
                            />
                            
                            <Search 
                                placeholder="Tìm theo Tên hoặc Email..." 
                                allowClear 
                                onSearch={handleSearch} 
                                style={{ width: 250 }} 
                            />
                        </div>
                    </div>

                    <Table
                        bordered
                        loading={isLoading}
                        dataSource={users}
                        columns={columns}
                        rowKey={"_id"}
                        onChange={handleTableChange} 
                        pagination={{ 
                            current: queryParams.page, 
                            pageSize: queryParams.limit, 
                            total: totalUsers, 
                            showSizeChanger: true, 
                            pageSizeOptions: ['5', '10', '20', '50']
                        }} 
                    />
                </Card>
            </div>
        </div>
    );
};

export default UserPage;