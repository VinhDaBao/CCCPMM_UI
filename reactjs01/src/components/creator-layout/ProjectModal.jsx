import { useEffect } from 'react';
import { Form, Input, Modal, Select } from 'antd';

// Bổ sung thêm prop existingTags (mặc định là mảng rỗng)
const ProjectModal = ({ open, onCancel, onSave, project, loading, initialValues, existingTags = [] }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (project) {
        form.setFieldsValue({
          title: project.title,
          description: project.description,
          tags: Array.isArray(project.tags) ? project.tags : [],
          status: project.status || 'IDEA',
        });
      } else {
        form.resetFields();
        if (initialValues) {
          form.setFieldsValue(initialValues);
        } else {
          form.setFieldsValue({ status: 'IDEA' });
        }
      }
    }
  }, [open, project, form, initialValues]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      const data = {
        title: values.title,
        description: values.description,
        tags: Array.isArray(values.tags) ? values.tags : [],
        status: values.status,
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
        <Form.Item name="title" label="Project Title" rules={[{ required: true, message: 'Please enter project title' }]}>
          <Input placeholder="Enter project title" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea placeholder="Enter description" rows={3} />
        </Form.Item>

        <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select a status' }]}>
          <Select placeholder="Select project status">
            <Select.Option value="IDEA">IDEA (Concept)</Select.Option>
            <Select.Option value="WRITING">WRITING (In progress)</Select.Option>
            <Select.Option value="MEDIA">MEDIA (Media work)</Select.Option>
            <Select.Option value="PUBLISHED">PUBLISHED (Published)</Select.Option>
          </Select>
        </Form.Item>

        {/* 👇 CẬP NHẬT TRƯỜNG TAGS TẠI ĐÂY 👇 */}
        <Form.Item name="tags" label="Tags" help="Select an existing tag from the list or type a new tag and press Enter">
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="Type tag and press Enter..."
            tokenSeparators={[',']}
            // Nạp danh sách các tag cũ vào để Antd hiển thị danh sách Dropdown
            options={existingTags.map(tag => ({ value: tag, label: tag }))}
          />
        </Form.Item>
        {/* 👆 KẾT THÚC CẬP NHẬT 👆 */}

      </Form>
    </Modal>
  );
};

export default ProjectModal;