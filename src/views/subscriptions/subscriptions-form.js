import React from 'react';
import { Col, Form, Input, InputNumber, Row, Switch } from 'antd';
import { useTranslation } from 'react-i18next';

export default function SubscriptionForm({ form, onFinish }) {
  const { t } = useTranslation();

  return (
    <Form form={form} layout='vertical' onFinish={onFinish}>
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            label={t('title')}
            name='title'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label={t('period')}
            name='month'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <InputNumber min={0} max={12} className='w-100' />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label={t('product_limit')}
            name='product_limit'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <InputNumber min={0} className='w-100' />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label={t('order_limit')}
            name='order_limit'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <InputNumber min={0} className='w-100' />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label={t('price')}
            name='price'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <InputNumber min={0} className='w-100' />
          </Form.Item>
        </Col>
        <Col span={12} />

        <Col span={12}>
          <Form.Item
            label={t('with_report')}
            name='with_report'
            valuePropName='checked'
          >
            <Switch />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label={t('active')} name='active' valuePropName='checked'>
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
