import { Card, Col, Form, Modal, Radio, Row } from 'antd';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { shallowEqual } from 'react-redux';
import { toast } from 'react-toastify';
import { setMenuData } from '../../../redux/slices/menu';
import settingService from '../../../services/settings';
import { fetchSettings as getSettings } from '../../../redux/slices/globalSettings';
import { InputCard } from 'components/radio-card';
import '../../../assets/scss/components/radio-card.scss';
import { ExclamationCircleFilled } from '@ant-design/icons';

const { confirm } = Modal;
const uiTypes = [
  {
    title: 'View 1',
    value: 1,
    img: '/img/ui-type1.png',
  },
  {
    title: 'View 2',
    value: 2,
    img: '/img/ui-type2.png',
  },
  {
    title: 'View 3',
    value: 3,
    img: '/img/ui-type3.png',
  },
  {
    title: 'View 4',
    value: 4,
    img: '/img/ui-type4.png',
  },
];

const UiType = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [value, setValue] = useState(
    activeMenu.data?.ui_type || uiTypes[0].value
  );

  const showConfirm = (type) => {
    confirm({
      title: t('do_you_want_to_change_ui_type'),
      centered: true,
      icon: <ExclamationCircleFilled />,
      onOk() {
        setValue(type);
        updateSettings({ui_type: type})
      },
    });
  };

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateSettings(data) {
    settingService
      .update(data)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(getSettings());
      })
  }

  return (
    <Form
      layout='vertical'
      form={form}
      name='global-settings'
      initialValues={{
        ui_type: Number(value)
      }}
    >
      <Card title={t('ui')}>
        <Row gutter={12}>
            {uiTypes.map((type) => (
              <Col key={type.value} span={12}>
                <InputCard
                  title={type.title}
                  onClick={() => showConfirm(type.value)} 
                  checked={Number(value) === type.value}
                  imgPath={type.img}
                />
              </Col>
            ))}
        </Row>
      </Card>
    </Form>
  );
};

export default UiType;
