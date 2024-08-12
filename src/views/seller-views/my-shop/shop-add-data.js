import React, { useState } from 'react';
import {
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Tag,
  TreeSelect,
} from 'antd';
import { DebounceSelect } from '../../../components/search';
import TextArea from 'antd/es/input/TextArea';
import { shallowEqual, useSelector } from 'react-redux';
import Map from '../../../components/map';
import { useTranslation } from 'react-i18next';
import categoryService from '../../../services/seller/category';
import MediaUpload from '../../../components/upload';
import shopTagService from 'services/shopTag';
import { AsyncTreeSelect } from 'components/async-tree-select-category';
import { MAP_API_KEY } from 'configs/app-global';
import useGoogle from 'react-google-autocomplete/lib/usePlacesAutocompleteService';
import getAddress from 'helpers/getAddress';

const { SHOW_ALL } = TreeSelect;

const ShopAddData = ({
  logoImage,
  setLogoImage,
  backImage,
  setBackImage,
  form,
  location,
  setLocation,
}) => {
  const { t } = useTranslation();
  const categories = Form.useWatch('categories', form);
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );
  const [value, setValue] = useState('');

  const { placePredictions, getPlacePredictions, isPlacePredictionsLoading } =
    useGoogle({
      apiKey: MAP_API_KEY,
      libraries: ['places', 'geocode'],
    });

  async function fetchShopCategory(search) {
    const params = { search, type: 'shop', active: 1, lang: defaultLang };
    return categoryService.selectPaginate(params).then(({ data }) =>
      data.map((item) => ({
        label: item.translation?.title || 'no name',
        value: item.id,
        disabled: item.children?.length === 0,
        children: item.children?.map((child) => ({
          label: child.translation?.title,
          value: child.id,
          parent: {
            label: item.translation?.title || 'no name',
            value: item.id,
          },
        })),
      })),
    );
  }
  async function fetchShopTag(search) {
    const params = { search };
    return shopTagService.getAllSeller(params).then(({ data }) =>
      data.map((item) => ({
        label: item.translation?.title || 'no name',
        value: item.id,
      })),
    );
  }

  const handleCategorySelect = (node) => {
    if (node.children) {
      if (categories.some((category) => category.value === node.value)) {
        const categoriesWithoutParent = categories.filter(
          (category) => category.value !== node.value,
        );
        const filteredCategories = categoriesWithoutParent.filter(
          (category) =>
            !node.children.some((child) => child.value === category.value),
        );
        form.setFieldsValue({ categories: filteredCategories });
      } else {
        form.setFieldsValue({
          categories: categories.concat([
            { label: node.label, value: node.value },
            ...node.children.map((child) => ({
              label: child.label,
              value: child.value,
            })),
          ]),
        });
      }
    } else {
      if (categories?.some((category) => category.value === node.value)) {
        form.setFieldsValue({
          categories: categories.filter(
            (category) => category.value !== node.value,
          ),
        });
      } else {
        form.setFieldsValue({
          categories: categories.concat([
            node.parent,
            { label: node.label, value: node.value },
          ]),
        });
      }
    }
  };

  const tagRender = (props) => {
    const { label, onClose } = props;
    const onPreventMouseDown = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        onMouseDown={onPreventMouseDown}
        onClose={onClose}
        style={{ marginRight: 3 }}
      >
        {label}
      </Tag>
    );
  };

  return (
    <Row gutter={12}>
      <Col span={24}>
        <Card>
          <Row gutter={12}>
            <Col span={4}>
              <Form.Item label={t('logo.image')}>
                <MediaUpload
                  type='shops/logo'
                  imageList={logoImage}
                  setImageList={setLogoImage}
                  form={form}
                  multiple={false}
                  name='logo_img'
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label={t('background.image')}>
                <MediaUpload
                  type='shops/background'
                  imageList={backImage}
                  setImageList={setBackImage}
                  form={form}
                  multiple={false}
                  name='background_img'
                />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item label={t('status.note')} name='status_note'>
                <TextArea rows={4} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name='status' label={t('status')}>
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Col>

      <Col span={24}>
        <Card title={t('general')}>
          <Row gutter={12}>
            <Col span={12}>
              <Row gutter={12}>
                <Col span={24}>
                  {languages.map((item, idx) => (
                    <Form.Item
                      key={'title' + idx}
                      label={t('title')}
                      name={`title[${item.locale}]`}
                      rules={[
                        {
                          required: item.locale === defaultLang,
                          message: t('required'),
                        },
                        { min: 2, message: t('title.required') },
                      ]}
                      hidden={item.locale !== defaultLang}
                    >
                      <Input />
                    </Form.Item>
                  ))}
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={t('phone')}
                    name='phone'
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <InputNumber min={0} className='w-100' />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            <Col span={12}>
              {languages.map((item, idx) => (
                <Form.Item
                  key={'desc' + idx}
                  label={t('description')}
                  name={`description[${item.locale}]`}
                  rules={[
                    {
                      required: item.locale === defaultLang,
                      message: t('required'),
                    },
                    { min: 3, message: t('required') },
                  ]}
                  hidden={item.locale !== defaultLang}
                >
                  <TextArea rows={4} />
                </Form.Item>
              ))}
            </Col>

            <Col span={12}>
              <Form.Item
                label={t('shop.tags')}
                name='tags'
                rules={[{ required: false, message: t('required') }]}
              >
                <DebounceSelect
                  mode='multiple'
                  fetchOptions={fetchShopTag}
                  style={{ minWidth: 150 }}
                />
              </Form.Item>
            </Col>

            <Col span={8} hidden>
              <Form.Item
                label={t('seller')}
                name='user'
                rules={[{ required: true, message: t('required') }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={t('categories')}
                name='categories'
                rules={[{ required: true, message: t('required') }]}
              >
                <AsyncTreeSelect
                  treeCheckable
                  tagRender={tagRender}
                  showCheckedStrategy={SHOW_ALL}
                  treeCheckStrictly
                  refetch
                  onSelect={(value, node) => handleCategorySelect(node)}
                  onDeselect={(value, node) => handleCategorySelect(node)}
                  fetchOptions={fetchShopCategory}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Col>

      <Col span={8}>
        <Card title={t('delivery')}>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item
                name='price'
                label={t('min.price')}
                rules={[{ required: true, message: t('required') }]}
              >
                <InputNumber className='w-100' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='price_per_km'
                label={t('price.per.km')}
                rules={[{ required: true, message: t('required') }]}
              >
                <InputNumber className='w-100' />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Col>
      <Col span={8}>
        <Card title={t('delivery.time')}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name='delivery_time_type'
                label={t('delivery_time_type')}
                rules={[{ required: true, message: t('required') }]}
              >
                <Select className='w-100'>
                  <Select.Option value='minute' label={t('minutes')} />
                  <Select.Option value='hour' label={t('hour')} />
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='delivery_time_from'
                label={t('delivery_time_from')}
                rules={[{ required: true, message: t('required') }]}
              >
                <InputNumber className='w-100' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='delivery_time_to'
                label={t('delivery_time_to')}
                rules={[{ required: true, message: t('required') }]}
              >
                <InputNumber className='w-100' />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Col>
      <Col span={8}>
        <Card title={t('order.info')}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label={t('min.amount')}
                name='min_amount'
                rules={[{ required: true, message: t('required') }]}
              >
                <InputNumber min={0} className='w-100' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('tax')}
                name='tax'
                rules={[{ required: true, message: t('required') }]}
              >
                <InputNumber min={0} addonAfter={'%'} className='w-100' />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Col>

      <Col span={24}>
        <Card title={t('address')}>
          <Row gutter={12}>
            <Col span={12}>
              {languages.map((item, idx) => (
                <Form.Item
                  key={'address' + idx}
                  label={t('address')}
                  name={`address[${item.locale}]`}
                  rules={[
                    {
                      required: item.locale === defaultLang,
                      message: t('required'),
                    },
                  ]}
                  hidden={item.locale !== defaultLang}
                >
                  <Select
                    allowClear
                    searchValue={value}
                    showSearch
                    autoClearSearchValue
                    loading={isPlacePredictionsLoading}
                    options={placePredictions?.map((prediction) => ({
                      label: prediction.description,
                      value: prediction.description,
                    }))}
                    onSearch={(searchValue) => {
                      setValue(searchValue);
                      if (searchValue.length > 0) {
                        getPlacePredictions({ input: searchValue });
                      }
                    }}
                    onSelect={async (value) => {
                      const address = await getAddress(value);
                      setLocation({
                        lat: address?.geometry.location.lat,
                        lng: address?.geometry.location.lng,
                      });
                    }}
                  />
                </Form.Item>
              ))}
            </Col>
            <Col span={24}>
              <Map
                location={location}
                setLocation={setLocation}
                setAddress={(value) =>
                  form.setFieldsValue({ [`address[${defaultLang}]`]: value })
                }
              />
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default ShopAddData;
