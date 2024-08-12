import React, { useState } from 'react';
import { Button, Col, Form, Input, InputNumber, Row, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { DebounceSelect } from 'components/search';
import MediaUpload from 'components/upload';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import categoryService from 'services/seller/category';

export default function CategoryForm({
  form,
  handleSubmit,
  error,
  type = 'add',
}) {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );
  const { state } = useLocation();

  //state
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [image, setImage] = useState(
    activeMenu.data?.image ? activeMenu.data?.image : [],
  );

  //functions
  async function fetchUserCategoryList(search) {
    const params = {
      perPage: 100,
      type: state?.parentId ? 'main' : 'sub_shop',
      active: 1,
      search,
    };

    return categoryService.selectMyCategoryPaginate(params).then((res) =>
      res.data.map((item) => ({
        label: item.translation?.title,
        value: item.id,
        key: item.id,
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
      name='category-form'
      layout='vertical'
      onFinish={onFinish}
      initialValues={{
        active: true,
        ...activeMenu.data,
      }}
      form={form}
    >
      <Row gutter={12}>
        <Col span={12}>
          {languages.map((item, index) => (
            <Form.Item
              key={item.title + index}
              label={t('name')}
              name={
                type === 'edit'
                  ? ['title', item.locale]
                  : `title[${item.locale}]`
              }
              help={
                error
                  ? error[`title.${defaultLang}`]
                    ? error[`title.${defaultLang}`][0]
                    : null
                  : null
              }
              validateStatus={error ? 'error' : 'success'}
              rules={[
                {
                  required: item.locale === defaultLang,
                  message: t('required'),
                },
              ]}
              hidden={item.locale !== defaultLang}
            >
              <Input placeholder={t('name')} />
            </Form.Item>
          ))}
        </Col>

        <Col span={12}>
          {languages.map((item, index) => (
            <Form.Item
              key={item.locale + index}
              label={t('description')}
              name={
                type === 'edit'
                  ? ['description', item.locale]
                  : `description[${item.locale}]`
              }
              rules={[
                {
                  required: item.locale === defaultLang,
                  message: t('required'),
                },
              ]}
              hidden={item.locale !== defaultLang}
            >
              <TextArea rows={4} />
            </Form.Item>
          ))}
        </Col>

        <Col span={12}>
          <Form.Item
            label={t('keywords')}
            name='keywords'
            rules={[{ required: true, message: t('required') }]}
          >
            <Select mode='tags' style={{ width: '100%' }}></Select>
          </Form.Item>
        </Col>
        {!state?.parentId && (
          <Col span={12}>
            <Form.Item
              label={t('parent.category')}
              name='parent_id'
              rules={[{ required: true, message: t('required') }]}
            >
              <DebounceSelect fetchOptions={fetchUserCategoryList} />
            </Form.Item>
          </Col>
        )}
        <Col span={12}>
          <Form.Item
            name='input'
            label={t('input')}
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <InputNumber
              min={0}
              parser={(value) => parseInt(value, 10)}
              max={9999999}
              className='w-100'
            />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item label={t('image')}>
            <MediaUpload
              type='categories'
              imageList={image}
              setImageList={setImage}
              form={form}
              multiple={false}
            />
          </Form.Item>
        </Col>
      </Row>
      <Button type='primary' htmlType='submit' loading={loadingBtn}>
        {t('submit')}
      </Button>
    </Form>
  );
}
