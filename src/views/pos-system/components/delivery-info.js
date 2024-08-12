import React, { useEffect } from 'react';
import { Card, Col, DatePicker, Form, Row, Select } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import shopService from 'services/restaurant';
import { setMenuData } from 'redux/slices/menu';
import { getCartData } from 'redux/selectors/cartSelector';
import { setCartData } from 'redux/slices/cart';

const DeliveryInfo = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const data = useSelector((state) => getCartData(state.cart));
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { currentBag } = useSelector((state) => state.cart, shallowEqual);
  const cartData = useSelector((state) => getCartData(state.cart));
  const filter = activeMenu.data?.CurrentShop?.shop_closed_date?.map(
    (date) => date.day,
  );

  function disabledDate(current) {
    const a = filter?.find(
      (date) => date === moment(current).format('YYYY-MM-DD'),
    );
    const b = moment().add(-1, 'days') >= current;
    if (a) {
      return a;
    } else {
      return b;
    }
  }

  const range = (start, end) => {
    const x = parseInt(start);
    const y = parseInt(end);
    const number = [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23, 24,
    ];
    for (let i = x; i <= y; i++) {
      delete number[i];
    }
    return number;
  };

  const disabledDateTime = () => ({
    disabledHours: () =>
      range(
        moment(cartData?.delivery_date).format('YYYYMMDD') ===
          moment(new Date()).format('YYYYMMDD')
          ? moment(new Date()).add(1, 'hour').format('HH')
          : 0,
        24,
      ),
    disabledMinutes: () => [],
    disabledSeconds: () => [],
  });

  const fetchShop = (uuid) => {
    shopService.getById(uuid).then((data) => {
      const currency_shop = data.data;
      dispatch(setCartData({ currency_shop, bag_id: currentBag }));
      dispatch(
        setMenuData({
          activeMenu,
          data: {
            ...activeMenu.data,
            CurrentShop: data.data,
          },
        }),
      );
    });
  };

  const delivery = [
    {
      label: t('delivery'),
      value: 'delivery',
      key: 1,
    },
    {
      label: t('pickup'),
      value: 'pickup',
      key: 0,
    },
  ];

  const setDeliveryPrice = (delivery) =>
    dispatch(setCartData({ delivery_fee: delivery.value, bag_id: currentBag }));

  useEffect(() => {
    if (cartData?.shop?.value) {
      fetchShop(cartData?.shop?.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartData?.shop]);

  return (
    <Card title={t('shipping.info')} className='p-0'>
      <Row gutter={12}>
        <Col span={24}>
          <Form.Item
            name='delivery'
            label={t('delivery')}
            rules={[{ required: true, message: t('required') }]}
          >
            <Select
              placeholder={t('delivery.type')}
              options={delivery}
              labelInValue
              onSelect={setDeliveryPrice}
              onChange={(deliveries) =>
                dispatch(
                  setCartData({
                    deliveries,
                    bag_id: currentBag,
                  }),
                )
              }
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name='delivery_date'
                label={t('delivery.date')}
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
                // valuePropName={'date'}
              >
                <DatePicker
                  placeholder={t('delivery.date')}
                  className='w-100'
                  format='YYYY-MM-DD'
                  disabledDate={disabledDate}
                  allowClear={false}
                  onChange={(e) => {
                    const delivery_date = moment(e).format('YYYY-MM-DD');
                    dispatch(
                      setCartData({
                        delivery_date,
                        bag_id: currentBag,
                      }),
                    );
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={`${t('delivery.time')} (${t('up.to')})`}
                name='delivery_time'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
                // valuePropName='date'
              >
                <DatePicker
                  disabled={!data.delivery_date}
                  picker='time'
                  placeholder={t('start.time')}
                  className='w-100'
                  format={'HH:mm:ss'}
                  showNow={false}
                  allowClear={false}
                  disabledTime={disabledDateTime}
                  onChange={(e) => {
                    const delivery_time = moment(e).format('HH:mm:ss');
                    dispatch(
                      setCartData({ delivery_time, bag_id: currentBag }),
                    );
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default DeliveryInfo;
