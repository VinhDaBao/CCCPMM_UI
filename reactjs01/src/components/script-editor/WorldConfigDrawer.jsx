import React from 'react';
import { Drawer, Input, Button, Select } from 'antd';

const { TextArea } = Input;

const WorldConfigDrawer = ({
  open,
  onClose,
  elementType,
  selectedElement,
  assetImages,
  relationSideA,
  relationSideB,
  handleUpdateNodeField,
  handleUpdateBidirectionalEdge,
  handleUpdateEdgeColor,
  handleDeleteNode,
  handleDeleteEdge,
  sourceNodeName,
  targetNodeName
}) => {
  return (
    <Drawer
      title={elementType === 'node' ? "Character Configuration" : "Relationship Line Configuration"}
      placement="right"
      width={360}
      onClose={onClose}
      open={open}
      className="font-sans"
    >
      {elementType === 'node' ? (
        <div className="flex flex-col h-full justify-between">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">CHARACTER NAME</label>
              <Input
                value={selectedElement?.data?.label || ''}
                onChange={(e) => handleUpdateNodeField('label', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">CHOOSE FROM ASSET LIBRARY</label>
              <Select
                className="w-full"
                placeholder="Select character portrait"
                value={selectedElement?.data?.avatarUrl || undefined}
                onChange={(value) => handleUpdateNodeField('avatarUrl', value)}
                allowClear
              >
                {assetImages.map((img) => (
                  <Select.Option key={img._id} value={img.url}>{img.fileName}</Select.Option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">ROLE / TAG</label>
              <Input
                value={selectedElement?.data?.role || ''}
                onChange={(e) => handleUpdateNodeField('role', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">CHARACTER BIOGRAPHY</label>
              <TextArea
                rows={4}
                value={selectedElement?.data?.description || ''}
                onChange={(e) => handleUpdateNodeField('description', e.target.value)}
              />
            </div>
          </div>
          <div className="pt-6 border-t border-gray-100 mt-auto">
            <Button type="primary" danger className="w-full h-10 font-bold rounded-lg" onClick={handleDeleteNode}>
              DELETE CHARACTER
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full justify-between">
          <div className="flex flex-col gap-5">
            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
              <label className="text-xs font-bold text-blue-600 block mb-1 uppercase">
                Perspective from {sourceNodeName} --&gt; {targetNodeName}
              </label>
              <Input
                value={relationSideA}
                onChange={(e) => handleUpdateBidirectionalEdge('A', e.target.value)}
                placeholder="e.g. Idolized, secretly in love..."
              />
            </div>
            <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100">
              <label className="text-xs font-bold text-purple-600 block mb-1 uppercase">
                Perspective from {targetNodeName} --&gt; {sourceNodeName}
              </label>
              <Input
                value={relationSideB}
                onChange={(e) => handleUpdateBidirectionalEdge('B', e.target.value)}
                placeholder="e.g. Sees as a tool, Resentful..."
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">THREAD COLOR</label>
              <div className="flex gap-3 items-center">
                <Input
                  type="color"
                  className="w-16 h-10 p-1 cursor-pointer"
                  value={selectedElement?.style?.stroke || '#3b82f6'}
                  onChange={(e) => handleUpdateEdgeColor(e.target.value)}
                />
                <span className="text-sm font-mono uppercase text-gray-600">
                  {selectedElement?.style?.stroke || '#3b82f6'}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-100 mt-auto">
            <Button type="primary" danger className="w-full h-10 font-bold rounded-lg" onClick={handleDeleteEdge}>
              DELETE RELATIONSHIP
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default WorldConfigDrawer;