import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import subscriptionService from '../../services/subscriptions';
import SubscriptionForm from './subscriptions-form';

export default function SubscriptionEditModal({
  modal,
  handleCancel,
  refetch,
}) {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [loadingBtn, setLoadingBtn] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      with_report: false,
      active: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFinish = (values) => {
    const payload = {
      ...values,
      active: Number(values.active),
      with_report: Number(values.with_report),
      type: 'shop',
    };
    setLoadingBtn(true);
    subscriptionService
      .create(payload)
      .then(() => {
        handleCancel();
        refetch();
      })
      .finally(() => setLoadingBtn(false));
  };

  return (
    <Modal
      visible={!!modal}
      title={t('add.subscription')}
      onCancel={handleCancel}
      style={{ minWidth: 800 }}
      footer={[
        <Button
          type='primary'
          onClick={() => form.submit()}
          loading={loadingBtn}
          key='save-btn'
        >
          {t('save')}
        </Button>,
        <Button type='default' onClick={handleCancel} key='cancel-btn'>
          {t('cancel')}
        </Button>,
      ]}
    >
      <SubscriptionForm form={form} onFinish={onFinish} />
    </Modal>
  );
}
