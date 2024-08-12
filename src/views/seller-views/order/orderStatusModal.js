import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Row, Select } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import orderService from '../../../services/seller/order';
import { setRefetch } from '../../../redux/slices/menu';

export default function OrderStatusModal({ orderDetails: data, handleCancel }) {
  const { statusList } = useSelector(
    (state) => state.orderStatus,
    shallowEqual
  );
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState([
    { id: 0, name: 'all', active: true, sort: 0 },
    ...statusList,
    { id: statusList?.length + 1, name: 'canceled', active: true, sort: 8 },
  ]);

  useEffect(() => {
    const statusIndex = statuses.findIndex(
      (item) => item.name === data?.status
    );

    let newStatuses = [
      statuses[statusIndex],
      statuses[statusIndex + 1],
      statuses[statusList?.length + 1],
    ];

    if (statusIndex < 0) {
      newStatuses = [
        statuses[statusIndex + 1],
        statuses[statusList?.length + 1],
      ];
    }

    newStatuses.map((status, idx, array) => {
      if (status.name === data?.status) {
        setStatuses(array.slice(idx));
      }
    });
  }, [data]);

  const onFinish = (values) => {
    setLoading(true);
    const params = { ...values };
    orderService
      .updateStatus(data.id, params)
      .then(() => {
        handleCancel();
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      visible={!!data}
      title={data.title}
      onCancel={handleCancel}
      footer={[
        <Button type='primary' onClick={() => form.submit()} loading={loading}>
          {t('save')}
        </Button>,
        <Button type='default' onClick={handleCancel}>
          {t('cancel')}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={onFinish}
        initialValues={{ status: data.status }}
      >
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              label={t('status')}
              name='status'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <Select>
                {statuses?.map((item) => (
                  <Select.Option key={item.id} value={item.name}>
                    {t(item.name)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
