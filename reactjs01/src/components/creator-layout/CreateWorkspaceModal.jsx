import { Form, Input, Modal, notification } from 'antd';
import useCreateWorkspace from '../../hooks/useCreateWorkspace';
import { useTranslation } from 'react-i18next';

const CreateWorkspaceModal = ({ open, onCancel, ownerId }) => {
  const [form] = Form.useForm();
  const createWorkspaceMutation = useCreateWorkspace(ownerId);
  const { t } = useTranslation();

  const handleCreateWorkspace = async (values) => {
    try {
      const res = await createWorkspaceMutation.mutateAsync(values);
      
      // If the backend still returns 200 but includes errCode = 1
      if (res && res.errCode && res.errCode !== 0) {
        notification.error({ message: t('workspace_modal.create_failed'), description: res.message });
        return; 
      }

      form.resetFields();
      onCancel();
    } catch (submitError) {
      // When the backend returns 400, execution lands here directly
      const errorMsg = submitError?.response?.data?.message || t('workspace_modal.create_server_error');
      notification.error({ 
        message: t('workspace_modal.create_rejected'), 
        description: errorMsg 
      });
    }
  };

  return (
    <Modal
      title={t('workspace_modal.create_title')}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={t('workspace_modal.create_ok')}
      confirmLoading={createWorkspaceMutation.isPending}
      destroyOnClose
      afterClose={() => form.resetFields()}
    >
      <Form form={form} layout="vertical" onFinish={handleCreateWorkspace} preserve={false}>
        <Form.Item
          label={t('workspace_modal.workspace_name_label')}
          name="name"
          rules={[{ required: true, message: t('workspace_modal.workspace_name_required') }]}
        >
          <Input placeholder={t('workspace_modal.workspace_name_placeholder')} maxLength={120} />
        </Form.Item>

        <Form.Item label={t('workspace_modal.description_label')} name="description">
          <Input.TextArea placeholder={t('workspace_modal.description_placeholder')} rows={4} maxLength={500} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateWorkspaceModal;