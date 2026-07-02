<<<<<<< HEAD
import { notification, Table } from "antd";

import { useEffect } from "react";

import {
  useDispatch,
  useSelector
} from "react-redux";

import { getUserApi } from "../util/api";

import {

  getProfileStart,
  getProfileSuccess,
  getProfileFail,

} from "../redux/profileSlice";

const UserPage = () => {

  const dispatch = useDispatch();


  const {

    profileLoading,

    profileData,

    profileError,

  } = useSelector(
    state => state.profile
  );


  useEffect(() => {

    const fetchUser = async () => {

      try {

        dispatch(getProfileStart());

        const res = await getUserApi();

        if (res && res.user) {

          console.log(
            "FETCH USER RESPONSE:",
            res.user.user
          );

          dispatch(
            getProfileSuccess(
              res.user.user
            )
          );

        } else {

          dispatch(
            getProfileFail(
              res?.message ??
              "Failed to fetch profile"
            )
          );

          notification.error({

            message: "Unauthorized",

            description:
              res?.message ??
              "Cannot fetch profile",
          });
        }

      } catch (error) {

        dispatch(
          getProfileFail(
            error.message
          )
        );

        notification.error({

          message: "Error",

          description:
            error.message,
        });
      }
    };

    fetchUser();

  }, [dispatch]);


  const columns = [

    {
      title: "Id",
      dataIndex: "_id",
    },

    {
      title: "Email",
      dataIndex: "email",
    },

    {
      title: "Name",
      dataIndex: "name",
    },

    {
      title: "Role",
      dataIndex: "role",
    },
  ];

  return (

    <div style={{ padding: 30 }}>

      {
        profileError && (

          <p
            style={{
              color: "red",
              marginBottom: 20
            }}
          >
            {profileError}
          </p>
        )
      }

      <Table

        bordered

        loading={profileLoading}

        dataSource={
          profileData
            ? [profileData]
            : []
        }

        columns={columns}

        rowKey={"_id"}
      />

    </div>
  );
=======
import { notification, Table, Tag, Switch, Space, Typography, Card, Input, Select, Button } from "antd"; 
import { useEffect, useState } from "react";
import { getAllUsersApi, toggleUserStatusApi, sendSystemNotificationApi } from "../util/api"; 
import TopBar from "../components/creator-layout/TopBar"; 
import { useTranslation } from 'react-i18next';

const { Title } = Typography;
const { Search } = Input;

const UserPage = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const [systemNotiTitle, setSystemNotiTitle] = useState('');
    const [systemNotiMessage, setSystemNotiMessage] = useState('');
    const [isSendingNoti, setIsSendingNoti] = useState(false);

    const handleSendSystemNotification = async () => {
        if (!systemNotiTitle.trim() || !systemNotiMessage.trim()) {
            notification.error({ message: t('user_page.error'), description: t('user_page.title_and_message_required') });
            return;
        }

        setIsSendingNoti(true);
        try {
            const res = await sendSystemNotificationApi({
                title: systemNotiTitle,
                message: systemNotiMessage
            });

            if (res && res.errCode === 0) {
                notification.success({ message: t('user_page.success'), description: t('user_page.system_notification_sent') });
                setSystemNotiTitle('');
                setSystemNotiMessage('');
            } else {
                notification.error({ message: t('user_page.send_failed'), description: res?.message });
            }
        } catch (error) {
            notification.error({ message: t('user_page.system_error'), description: error.message });
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
                notification.error({ message: t('user_page.data_loading_error'), description: res?.message });
            }
        } catch (error) {
            notification.error({ message: t('user_page.system_error'), description: error.message });
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
                notification.error({ message: t('user_page.failed'), description: res?.message });
            }
        } catch (error) {
            fetchUsers(); 
            notification.error({ message: t('user_page.status_change_error') });
        }
    };

    const columns = [
        {
            title: t('user_page.full_name'),
            dataIndex: "fullName",
            key: "fullName",
            fontWeight: "bold",
            render: (text) => <strong>{text}</strong>
        },
        {
            title: t('user_page.email'),
            dataIndex: "email",
            key: "email",
        },
        {
            title: t('user_page.role'),
            dataIndex: "role",
            key: "role",
            render: (role) => (
                <Tag color={role === 'admin' ? "volcano" : "geekblue"}>
                    {role.toUpperCase()}
                </Tag>
            )
        },
        {
            title: t('user_page.plan'),
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
            title: t('user_page.status'),
            dataIndex: "isActivated",
            key: "isActivated",
            render: (isActivated) => (
                <Tag color={isActivated ? "success" : "error"}>
                    {isActivated ? t('user_page.active') : t('user_page.locked')}
                </Tag>
            )
        },
        {
            title: t('user_page.action'),
            key: "action",
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Switch
                        checkedChildren={t('user_page.unlock')}
                        unCheckedChildren={t('user_page.lock')}
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
            <TopBar title={t('user_page.title')} subtitle={t('user_page.subtitle')} />
            
            <div style={{ padding: "24px", flex: 1, overflowY: "auto" }}>
                <Card 
                    bordered={false} 
                    style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 24 }}
                    title={<span style={{ fontWeight: 700, fontSize: 16 }}>📣 {t('user_page.send_system_notification')}</span>}
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div>
                            <div style={{ marginBottom: 4, fontWeight: 600 }}>{t('user_page.notification_title')}</div>
                            <Input 
                                placeholder={t('user_page.notification_title_placeholder')} 
                                value={systemNotiTitle}
                                onChange={(e) => setSystemNotiTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <div style={{ marginBottom: 4, fontWeight: 600 }}>{t('user_page.message')}</div>
                            <Input.TextArea 
                                placeholder={t('user_page.message_placeholder')} 
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
                                                                {t('user_page.send_all_users')}
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                    <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <Title level={4} style={{ margin: 0 }}>{t('user_page.account_list')}</Title>
                            <p style={{ color: "var(--text-muted)", margin: 0 }}>{t('user_page.total_users', { count: totalUsers })}</p>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Select
                                defaultValue="createdAt_desc"
                                style={{ width: 160 }}
                                onChange={handleSortChange}
                                options={[
                                    { value: 'createdAt_desc', label: t('user_page.newest') },
                                    { value: 'createdAt_asc', label: t('user_page.oldest') },
                                    { value: 'fullName_asc', label: t('user_page.name_az') },
                                    { value: 'fullName_desc', label: t('user_page.name_za') },
                                ]}
                            />
                            
                            <Search 
                                placeholder={t('user_page.search_placeholder')} 
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
>>>>>>> 46e75d21f45e5f272338458849bcf7e1b5f87b74
};

export default UserPage;