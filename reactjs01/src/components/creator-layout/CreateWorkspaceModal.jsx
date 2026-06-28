import { Form, Input, Modal, notification } from 'antd';
import useCreateWorkspace from '../../hooks/useCreateWorkspace';

const CreateWorkspaceModal = ({ open, onCancel, ownerId }) => {
  const [form] = Form.useForm();
  const createWorkspaceMutation = useCreateWorkspace(ownerId);

  const handleCreateWorkspace = async (values) => {
    try {
      const res = await createWorkspaceMutation.mutateAsync(values);
      
      // Nếu Backend vẫn cứng đầu trả 200 nhưng có errCode = 1
      if (res && res.errCode && res.errCode !== 0) {
        notification.error({ message: 'Lỗi tạo Workspace', description: res.message });
        return; 
      }

      form.resetFields();
      onCancel();
    } catch (submitError) {
      // Khi Backend trả 400, nó sẽ nhảy thẳng xuống đây
      const errorMsg = submitError?.response?.data?.message || 'Không thể tạo Workspace do lỗi máy chủ';
      notification.error({ 
        message: 'Từ chối tạo', 
        description: errorMsg 
      });
    }
  };

  return (
    <Modal
      title="Create workspace"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Create workspace"
      confirmLoading={createWorkspaceMutation.isPending}
      destroyOnClose
      afterClose={() => form.resetFields()}
    >
      <Form form={form} layout="vertical" onFinish={handleCreateWorkspace} preserve={false}>
        <Form.Item
          label="Workspace name"
          name="name"
          rules={[{ required: true, message: 'Please enter a workspace name' }]}
        >
          <Input placeholder="e.g. Story Universe" maxLength={120} />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea placeholder="Optional workspace description" rows={4} maxLength={500} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateWorkspaceModal;