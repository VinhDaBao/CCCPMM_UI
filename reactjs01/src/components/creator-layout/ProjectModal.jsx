import { useEffect } from 'react';
import { Form, Input, Modal } from 'antd';

const ProjectModal = ({ open, onCancel, onSave, project, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (project) {
        form.setFieldsValue({
          title: project.title,
          description: project.description,
          tags: Array.isArray(project.tags) ? project.tags.join(', ') : '',
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, project, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      const data = {
        title: values.title,
        description: values.description,
        tags: values.tags
          ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      };
      onSave(data);
    });
  };

  return (
    <Modal
      title={project ? 'Edit Project' : 'Create Project'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      destroyOnClose
      centered
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="title"
          label="Project Title"
          rules={[{ required: true, message: 'Please enter project title' }]}
        >
          <Input placeholder="Enter project title" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea placeholder="Enter description" rows={3} />
        </Form.Item>

        <Form.Item
          name="tags"
          label="Tags (comma-separated)"
          help="Example: Series, Comedy, Action"
        >
          <Input placeholder="Series, Comedy, Action" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProjectModal;
