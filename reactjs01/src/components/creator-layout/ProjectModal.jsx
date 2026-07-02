import { useEffect } from 'react';
import { Form, Input, Modal, Select } from 'antd';
import { useTranslation } from 'react-i18next';

// Bổ sung thêm prop existingTags (mặc định là mảng rỗng)
const ProjectModal = ({ open, onCancel, onSave, project, loading, initialValues, existingTags = [] }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

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
      title={project ? t('project_modal.edit_title') : t('project_modal.create_title')}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      destroyOnClose
      centered
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="title" label={t('project_modal.project_title_label')} rules={[{ required: true, message: t('project_modal.project_title_required') }]}>
          <Input placeholder={t('project_modal.project_title_placeholder')} />
        </Form.Item>

        <Form.Item name="description" label={t('project_modal.description_label')}>
          <Input.TextArea placeholder={t('project_modal.description_placeholder')} rows={3} />
        </Form.Item>

        <Form.Item name="status" label={t('project_modal.status_label')} rules={[{ required: true, message: t('project_modal.status_required') }]}>
          <Select placeholder={t('project_modal.status_placeholder')}>
            <Select.Option value="IDEA">{t('project_modal.status_idea')}</Select.Option>
            <Select.Option value="WRITING">{t('project_modal.status_writing')}</Select.Option>
            <Select.Option value="MEDIA">{t('project_modal.status_media')}</Select.Option>
            <Select.Option value="PUBLISHED">{t('project_modal.status_published')}</Select.Option>
          </Select>
        </Form.Item>

        {/* 👇 CẬP NHẬT TRƯỜNG TAGS TẠI ĐÂY 👇 */}
        <Form.Item name="tags" label={t('project_modal.tags_label')} help={t('project_modal.tags_help')}>
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder={t('project_modal.tags_placeholder')}
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