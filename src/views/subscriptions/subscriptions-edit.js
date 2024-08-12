import React, { useState, useEffect } from 'react';
import { Button, Form, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import subscriptionService from '../../services/subscriptions';
import Loading from '../../components/loading';
import SubscriptionForm from './subscriptions-form';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { setMenuData } from '../../redux/slices/menu';

export default function SubscriptionEditModal({
  modal,
  handleCancel,
  refetch,
}) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [loading, setLoading] = useState(false);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const onFinish = (values) => {
    const payload = {
      ...values,
      active: Number(values.active),
      with_report: Number(values.with_report),
      type: 'shop',
    };
    setLoadingBtn(true);

    subscriptionService
      .update(modal.id, payload)
      .then(() => {
        handleCancel();
        refetch();
      })
      .finally(() => setLoadingBtn(false));
  };

  const fetchSubscriptionList = () => {
    setLoading(true);
    subscriptionService
      .getById(modal.id)
      .then((res) => {
        const data = {
          ...res.data,
          with_report: !!res?.data?.with_report,
          active: !!res?.data?.active,
        };
        form.setFieldsValue({
          ...data,
        });
        dispatch(setMenuData({ activeMenu, data }));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubscriptionList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal]);

  return (
    <React.Fragment>
      <Modal
        visible={!!modal}
        title={t('edit.subscription')}
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
        {loading ? (
          <Loading />
        ) : (
          <SubscriptionForm form={form} onFinish={onFinish} />
        )}
      </Modal>
    </React.Fragment>
  );
}
