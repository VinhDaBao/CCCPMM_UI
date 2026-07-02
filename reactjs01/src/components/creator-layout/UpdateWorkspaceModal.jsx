import { useEffect } from 'react';
import { Form, Input, Modal } from 'antd';
import useUpdateWorkspace from '../../hooks/useUpdateWorkspace';
import { useTranslation } from 'react-i18next';

const UpdateWorkspaceModal = ({ open, onCancel, workspace }) => {
  const [form] = Form.useForm();
  const updateWorkspaceMutation = useUpdateWorkspace();
  const { t } = useTranslation();

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
      title={t('workspace_modal.update_title')}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={t('workspace_modal.update_ok')}
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
          label={t('workspace_modal.workspace_name_label')}
          name="name"
          rules={[
            {
              required: true,
              message: t('workspace_modal.workspace_name_required'),
            },
          ]}
        >
          <Input placeholder={t('workspace_modal.workspace_name_placeholder')} maxLength={120} />
        </Form.Item>

        <Form.Item label={t('workspace_modal.description_label')} name="description">
          <Input.TextArea
            placeholder={t('workspace_modal.description_placeholder')}
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
