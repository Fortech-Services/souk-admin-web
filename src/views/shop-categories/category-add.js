import React, { useState, useEffect } from 'react';
import { Card, Form } from 'antd';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LanguageList from '../../components/language-list';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../redux/slices/menu';
import categoryService from '../../services/category';
import { fetchShopCategories } from '../../redux/slices/shopCategory';
import { useTranslation } from 'react-i18next';
import ShopCategoryForm from './category-form';

const CategoryAdd = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const [form] = Form.useForm();
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (values, image) => {
    const body = {
      ...values,
      type: values.parent_id?.value ? 'sub_shop' : 'shop',
      active: values.active ? 1 : 0,
      keywords: values.keywords.join(','),
      parent_id: values.parent_id?.value,
      'images[0]': image[0]?.name,
    };
    const nextUrl = 'catalog/shop/categories';

    return categoryService
      .create(body)
      .then(() => {
        toast.success(t('successfully.created'));
        batch(() => {
          dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
          dispatch(fetchShopCategories({}));
        });
        navigate(`/${nextUrl}`);
      })
      .catch((err) => setError(err.response.data.params));
  };

  return (
    <Card title={t('add.category')} extra={<LanguageList />}>
      <ShopCategoryForm form={form} handleSubmit={handleSubmit} error={error} />
    </Card>
  );
};
export default CategoryAdd;
