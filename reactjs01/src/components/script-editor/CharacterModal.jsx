import { useState, useEffect } from 'react';
import { Form, Input, Modal, Button, Select } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const CharacterModal = ({ open, onCancel, onSave, character, loading }) => {
  const [form] = Form.useForm();
  const [attributes, setAttributes] = useState([{ key: '', value: '' }]);

  useEffect(() => {
    if (open) {
      if (character) {
        form.setFieldsValue({
          name: character.name,
          description: character.description,
          tags: Array.isArray(character.tags) ? character.tags : [],
        });
        setAttributes(
          character.attributes && character.attributes.length > 0
            ? [...character.attributes, { key: '', value: '' }]
            : [{ key: '', value: '' }]
        );
      } else {
        form.resetFields();
        setAttributes([{ key: '', value: '' }]);
      }
    }
  }, [open, character, form]);

  const handleAttributeChange = (index, field, val) => {
    const updated = [...attributes];
    updated[index][field] = val;

    // If typing in the last row, automatically append a new empty row
    if (index === updated.length - 1 && (updated[index].key.trim() || updated[index].value.trim())) {
      updated.push({ key: '', value: '' });
    }

    setAttributes(updated);
  };

  const handleRemoveAttribute = (index) => {
    if (attributes.length <= 1) return; // Keep at least one row
    const updated = attributes.filter((_, i) => i !== index);
    setAttributes(updated);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      // Filter out completely empty rows
      const cleanAttributes = attributes
        .map(attr => ({ key: attr.key.trim(), value: attr.value.trim() }))
        .filter(attr => attr.key || attr.value);

      const data = {
        name: values.name,
        description: values.description,
        tags: Array.isArray(values.tags) ? values.tags : [],
        attributes: cleanAttributes,
      };

      onSave(data);
    });
  };

  return (
    <Modal
      title={character ? 'Edit Character' : 'Create Character'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      width={600}
      centered
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label="Character Name"
          rules={[{ required: true, message: 'Please enter character name' }]}
        >
          <Input placeholder="e.g. John Doe, Detective" />
        </Form.Item>

        <Form.Item name="description" label="Description / Biography">
          <Input.TextArea placeholder="Enter character background..." rows={3} />
        </Form.Item>

        <Form.Item
          name="tags"
          label="Tags"
          help="Type a tag and press Enter"
        >
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="Type tag and press Enter..."
            tokenSeparators={[',']}
          />
        </Form.Item>

        <div style={{ marginBottom: 8, fontWeight: 500, color: 'var(--text-primary)' }}>
          Attributes (Key / Value)
        </div>

        <div style={{ maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
          {attributes.map((attr, index) => (
            <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <Input
                placeholder="Key (e.g. Age, Weapon)"
                value={attr.key}
                onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                style={{ flex: 1 }}
              />
              <Input
                placeholder="Value (e.g. 30, Revolver)"
                value={attr.value}
                onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                style={{ flex: 1 }}
              />
              {attributes.length > 1 && (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveAttribute(index)}
                />
              )}
            </div>
          ))}
        </div>
      </Form>
    </Modal>
  );
};

export default CharacterModal;
