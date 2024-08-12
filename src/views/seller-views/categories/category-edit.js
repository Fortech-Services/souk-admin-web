import React, { useState, useEffect } from 'react';
import { Card, Form, Spin } from 'antd';
import { toast } from 'react-toastify';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import LanguageList from 'components/language-list';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, removeFromMenu, setMenuData } from 'redux/slices/menu';
import sellerCategory from 'services/seller/category';
import { IMG_URL } from 'configs/app-global';
import { useTranslation } from 'react-i18next';
import requestModelsService from 'services/seller/request-models';
import SellerCategories from './index';
import { fetchSellerCategory } from 'redux/slices/category';
import CategoryForm from './category-form';

const SellerCategoryEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [categoryId, setCategoryId] = useState(null);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { params } = useSelector((state) => state.requestModels, shallowEqual);
  const { user } = useSelector((state) => state.auth, shallowEqual);
  const { state } = useLocation();

  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [error, setError] = useState(null);

  const { uuid } = useParams();

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      batch(() => {
        dispatch(setMenuData({ activeMenu, data }));
        dispatch(
          fetchSellerCategory({
            ...params,
            type: state?.parentId ? 'sub_main' : 'main',
            parent_id: state?.parentId,
            shop_id: user?.shop_id,
          }),
        );
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createImage = (name) => {
    return {
      name,
      url: IMG_URL + name,
    };
  };

  const getLanguageField = (list) => Object.assign({}, ...list);

  const getCategory = (alias) => {
    setLoading(true);
    sellerCategory
      .getById(alias)
      .then((res) => {
        let category = res.data;
        const body = {
          ...category,
          title: getLanguageField(
            category?.translations.map((translation) => ({
              [translation?.locale]: translation?.title,
            })),
          ),
          description: getLanguageField(
            category?.translations.map((translation) => ({
              [translation?.locale]: translation?.description,
            })),
          ),
          image: [createImage(category?.img)],
          keywords: category?.keywords.split(','),
          id: category?.id,
          input: category?.input,
          parent_id: {
            label: category?.parent?.translation?.title,
            value: category?.parent_id,
            key: category?.parent_id,
          },
        };
        setCategoryId(category.id);
        dispatch(setMenuData({ activeMenu, data: body }));
        form.setFieldsValue(body);
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

  const handleSubmit = (values, image) => {
    const body = {
      id: values.id,
      type: 'category',
      data: {
        ...values,
        type: state?.parentId ? 'sub_main' : 'main',
        active: values.active ? 1 : 0,
        keywords: values.keywords.join(','),
        parent_id: state?.parentId || values.parent_id?.value,
        images: image?.map((img) => img.name),
      },
    };
    const paramsData = {
      ...params,
      shop_id: user?.shop_id,
      type: state?.parentId ? 'sub_main' : 'main',
      parent_id: state?.parentId,
    };
    const nextUrl = state?.parentId
      ? `seller/category/${state?.parentUuid}`
      : 'seller/categories';

    return requestModelsService
      .requestChange(body)
      .then(() => {
        toast.success(t('successfully.updated'));
        batch(() => {
          dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
          dispatch(fetchSellerCategory(paramsData));
        });
        navigate(`/${nextUrl}`, { state: { tab: 'request' } });
      })
      .catch((err) => setError(err.response.data.params));
  };

  useEffect(() => {
    getCategory(uuid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch, uuid, state?.parentId]);

  return (
    <>
      <Card
        title={state?.parentId ? t('edit.sub.category') : t('edit.category')}
        extra={<LanguageList />}
      >
        {!loading ? (
          <CategoryForm
            form={form}
            handleSubmit={handleSubmit}
            error={error}
            type='edit'
          />
        ) : (
          <div className='d-flex justify-content-center align-items-center py-5'>
            <Spin size='large' className='mt-5 pt-5' />
          </div>
        )}
      </Card>
      {!!categoryId && !state?.parentId && (
        <SellerCategories type='sub_main' parentId={categoryId} />
      )}
    </>
  );
};
export default SellerCategoryEdit;
