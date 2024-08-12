import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, removeFromMenu, setMenuData } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import storeisService from 'services/seller/storeis';
import { fetchStoreis } from 'redux/slices/storeis';
import Loading from 'components/loading';
import StoryForm from './story-form';

const StoreisEdit = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const { myShop: shop } = useSelector((state) => state.myShop, shallowEqual);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createImages = (items) =>
    items.map((item) => ({
      name: item,
      url: item,
    }));

  const getStory = (alias) => {
    setLoading(true);
    storeisService
      .getById(alias)
      .then(({ data }) => {
        const body = {
          ...data,
          image: createImages(data?.file_urls),
          products: {
            label: data?.product?.translation?.title,
            value: data?.product?.id,
          },
        };
        dispatch(setMenuData({ activeMenu, data: body }));
        form.setFieldsValue({ ...body });
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

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

    return storeisService.update(id, body).then(() => {
      const data = {
        shop_id: shop.id,
      };
      toast.success(t('successfully.updated'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchStoreis(data));
      });
      navigate(`/${nextUrl}`);
    });
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      getStory(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  return (
    <Card title={t('edit.story')} className='h-100'>
      {!loading ? (
        <StoryForm form={form} handleSubmit={handleSubmit} />
      ) : (
        <Loading />
      )}
    </Card>
  );
};

export default StoreisEdit;
