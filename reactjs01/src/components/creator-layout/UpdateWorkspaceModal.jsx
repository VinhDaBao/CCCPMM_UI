import { useEffect } from 'react';
import { Form, Input, Modal } from 'antd';
import useUpdateWorkspace from '../../hooks/useUpdateWorkspace';

const UpdateWorkspaceModal = ({ open, onCancel, workspace }) => {
  const [form] = Form.useForm();
  const updateWorkspaceMutation = useUpdateWorkspace();

  useEffect(() => {
    if (open && workspace) {
      form.setFieldsValue({
        name: workspace.name,
        description: workspace.description,
      });
    }
  }, [open, workspace, form]);

  const handleUpdateWorkspaceSubmit = async (values) => {
    try {
      if (!workspace) return;
      await updateWorkspaceMutation.mutateAsync({
        workspaceId: workspace._id || workspace.id,
        data: values,
      });
      onCancel();
    } catch (error) {
      return error;
    }
  };

  return (
    <Modal
      title="Update workspace"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Update workspace"
      confirmLoading={updateWorkspaceMutation.isPending}
      destroyOnClose
      afterClose={() => form.resetFields()}
    >
      <Form
        key={workspace?._id || workspace?.id || 'empty'}
        form={form}
        layout="vertical"
        onFinish={handleUpdateWorkspaceSubmit}
        initialValues={{
          name: workspace?.name,
          description: workspace?.description,
        }}
        preserve={false}
      >
        <Form.Item
          label="Workspace name"
          name="name"
          rules={[
            {
              required: true,
              message: 'Please enter a workspace name',
            },
          ]}
        >
          <Input placeholder="e.g. Story Universe" maxLength={120} />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea
            placeholder="Optional workspace description"
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateWorkspaceModal;
