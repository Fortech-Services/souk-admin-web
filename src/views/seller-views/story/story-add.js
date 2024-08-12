import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import storeisService from '../../../services/seller/storeis';
import { fetchStoreis } from '../../../redux/slices/storeis';
import StoryForm from './story-form';

const StoresAdd = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { myShop: shop } = useSelector((state) => state.myShop, shallowEqual);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (values, image) => {
    const body = {
      ...Object.assign(
        {},
        ...image.map((item, index) => ({
          [`file_urls[${index}]`]: item.name,
        })),
      ),
      product_id: values.products.value,
    };
    const nextUrl = 'seller/stories';

    return storeisService.create(body).then(() => {
      const data = {
        shop_id: shop.id,
      };
      toast.success(t('successfully.created'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchStoreis(data));
      });
      navigate(`/${nextUrl}`);
    });
  };

  return (
    <Card title={t('add.story')} className='h-100'>
      <StoryForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
};

export default StoresAdd;
