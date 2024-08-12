import React, { useState, useEffect } from 'react';
import { Card, Form } from 'antd';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import LanguageList from '../../../components/language-list';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../../redux/slices/menu';
import categoryService from '../../../services/seller/category';
import { fetchSellerCategory } from '../../../redux/slices/category';
import { useTranslation } from 'react-i18next';
import CategoryForm from './category-form';

const SellerCategoryAdd = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { user } = useSelector((state) => state.auth, shallowEqual);
  const { state } = useLocation();

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
      type: state?.parentId ? 'sub_main' : 'main',
      active: 0,
      keywords: values.keywords.join(','),
      parent_id: state?.parentId || values.parent_id?.value,
      'images[0]': image?.[0]?.name,
    };
    const nextUrl = state?.parentId
      ? `seller/category/${state.parentUuid}`
      : 'seller/categories';
    const paramsData = {
      shop_id: user?.shop_id,
      type: state?.parentId ? 'sub_main' : 'main',
      parent_id: state?.parentId,
    };

    return categoryService
      .create(body)
      .then(() => {
        toast.success(t('successfully.created'));
        batch(() => {
          dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
          dispatch(fetchSellerCategory(paramsData));
        });
        navigate(`/${nextUrl}`);
      })
      .catch((err) => setError(err.response.data.params));
  };

  return (
    <Card
      title={state?.parentId ? t('add.sub.category') : t('add.category')}
      extra={<LanguageList />}
    >
      <CategoryForm form={form} handleSubmit={handleSubmit} error={error} />
    </Card>
  );
};
export default SellerCategoryAdd;
