import React, { useState } from 'react';
import { Button, Col, Form, Row } from 'antd';
import { DebounceSelect } from 'components/search';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import productService from 'services/seller/product';
import MediaUpload from 'components/upload';

export default function StoryForm({ form, handleSubmit }) {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { myShop: shop } = useSelector((state) => state.myShop, shallowEqual);

  //states
  const [image, setImage] = useState(activeMenu.data?.image ?? []);
  const [loadingBtn, setLoadingBtn] = useState(false);

  //functions
  function fetchProductsStock(search) {
    const data = {
      search,
      shop_id: shop.id,
      status: 'published',
      active: 1,
      rest: 1,
    };

    return productService.getAll(data).then((res) =>
      res.data.map((product) => ({
        label: product.translation.title,
        value: product.id,
        key: product.id,
      })),
    );
  }

  //submit form
  const onFinish = (values) => {
    setLoadingBtn(true);
    handleSubmit(values, image).finally(() => setLoadingBtn(false));
  };
  return (
    <Form
      name='story-form'
      layout='vertical'
      onFinish={onFinish}
      form={form}
      initialValues={{ active: true, ...activeMenu.data }}
      className='d-flex flex-column h-100'
    >
      <Row gutter={12}>
        <Col span={24}>
          <Form.Item
            label={t('image')}
            name='images'
            rules={[
              {
                required: image.length === 0,
                message: t('required'),
              },
            ]}
          >
            <MediaUpload
              type='categories'
              imageList={image}
              setImageList={setImage}
              form={form}
              multiple={false}
            />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item
            label={t('products')}
            name={'products'}
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <DebounceSelect
              fetchOptions={fetchProductsStock}
              debounceTimeout={200}
            />
          </Form.Item>
        </Col>
      </Row>
      <div className='flex-grow-1 d-flex flex-column justify-content-end'>
        <div className='pb-5'>
          <Button type='primary' htmlType='submit' loading={loadingBtn}>
            {t('submit')}
          </Button>
        </div>
      </div>
    </Form>
  );
}
