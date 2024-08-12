import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Modal, Select } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Map from '../../../components/map';
import getDefaultLocation from '../../../helpers/getDefaultLocation';
import { setCartData } from '../../../redux/slices/cart';
import { getCartData } from '../../../redux/selectors/cartSelector';
import useGoogle from 'react-google-autocomplete/lib/usePlacesAutocompleteService';
import getAddress from 'helpers/getAddress';
import { MAP_API_KEY } from 'configs/app-global';

export default function PosUserAddress({ uuid, handleCancel }) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const data = useSelector((state) => getCartData(state.cart));
  const { currentBag } = useSelector((state) => state.cart, shallowEqual);
  const { settings } = useSelector(
    (state) => state.globalSettings,
    shallowEqual
  );
  const [location, setLocation] = useState(
    data.address
      ? { lat: data.address.lat, lng: data.address.lng }
      : getDefaultLocation(settings)
  );
  const [value, setValue] = useState('');

  const { placePredictions, getPlacePredictions, isPlacePredictionsLoading } =
    useGoogle({
      apiKey: MAP_API_KEY,
      libraries: ['places', 'geocode'],
    });

  const onFinish = (values) => {
    const body = {
      ...values,
      active: 1,
      lat: location.lat,
      lng: location.lng,
    };
    dispatch(
      setCartData({
        address: body,
        bag_id: currentBag,
      })
    );
    handleCancel();
  };

  useEffect(() => {
    form.setFieldsValue({
      address: data.address.address || null,
    });
  }, [currentBag]);

  return (
    <Modal
      visible={!!uuid}
      title={t('create.address')}
      onCancel={handleCancel}
      footer={[
        <Button type='primary' key={'saveBtn'} onClick={() => form.submit()}>
          {t('save')}
        </Button>,
        <Button type='default' key={'cancelBtn'} onClick={handleCancel}>
          {t('cancel')}
        </Button>,
      ]}
    >
      <Form
        layout='vertical'
        name='user-address'
        form={form}
        onFinish={onFinish}
      >
        <Form.Item
          name='address'
          label={t('address')}
          rules={[{ required: true, message: t('required') }]}
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
        <Form.Item label={t('map')}>
          <Map
            location={location}
            setLocation={setLocation}
            setAddress={(value) => form.setFieldsValue({ address: value })}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
