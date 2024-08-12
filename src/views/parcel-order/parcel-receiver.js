import React, { useState } from 'react';
import { Button, Col, Form, Input, InputNumber, Row, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { RefetchSearch } from 'components/refetch-search';
import Map from 'components/map';
import userService from 'services/user';

const ParcelReceiver = ({ form, next, prev, location, setLocation }) => {
  const { t } = useTranslation();

  const [userRefetch, setUserRefetch] = useState(null);
  const [userList, setUserList] = useState([]);

  async function fetchUserList(search) {
    const params = { search, roles: 'user', 'empty-shop': 1 };
    setUserRefetch(false);
    return userService.search(params).then((res) => {
      setUserList(res.data);
      return res.data.map((item) => ({
        label: [item.firstname, item.lastname].join(' '),
        value: item.id,
      }));
    });
  }

  const handleChange = (item) => {
    const userData = userList.find((el) => el.id === item.value);
    form.setFieldsValue({
      username_to: [userData.firstname, userData.lastname].join(' '),
      phone_to: userData.phone,
    });
  };

  return (
    <>
      <Row gutter={24}>
        <Col span={12}>
          {/* <Form.Item label={t('user')} name='user_to'>
            <RefetchSearch
              fetchOptions={fetchUserList}
              refetch={userRefetch}
              onChange={handleChange}
            />
          </Form.Item> */}
          <Form.Item
            label={t('username')}
            name='username_to'
            rules={[
              {
                validator(_, value) {
                  if (!value) {
                    return Promise.reject(new Error(t('required')));
                  } else if (value && value?.trim() === '') {
                    return Promise.reject(new Error(t('no.empty.space')));
                  } else if (value && value?.trim().length < 2) {
                    return Promise.reject(new Error(t('must.be.at.least.2')));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t('phone')}
            name='phone_to'
            rules={[
              {
                validator(_, value) {
                  if (!value) {
                    return Promise.reject(new Error(t('required')));
                  } else if (value && value < 0) {
                    return Promise.reject(new Error(t('must.be.positive')));
                  } else if (value && value?.toString().length < 7) {
                    return Promise.reject(new Error(t('min.7.numbers')));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber className='w-100' />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item
                label={t('house')}
                name='house_to'
                rules={[
                  {
                    validator(_, value) {
                      if (!value) {
                        return Promise.reject(new Error(t('required')));
                      } else if (value && value?.trim() === '') {
                        return Promise.reject(new Error(t('no.empty.space')));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t('stage')}
                name='stage_to'
                rules={[
                  {
                    validator(_, value) {
                      if (!value) {
                        return Promise.reject(new Error(t('required')));
                      } else if (value && value?.trim() === '') {
                        return Promise.reject(new Error(t('no.empty.space')));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t('room')}
                name='room_to'
                rules={[
                  {
                    validator(_, value) {
                      if (!value) {
                        return Promise.reject(new Error(t('required')));
                      } else if (value && value?.trim() === '') {
                        return Promise.reject(new Error(t('no.empty.space')));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Form.Item
            label={t('address')}
            name='address_to'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Map
            location={location}
            setLocation={setLocation}
            setAddress={(value) => form.setFieldsValue({ address_to: value })}
          />
        </Col>
      </Row>
      <Space>
        <Button type='default' htmlType='button' onClick={prev}>
          {t('prev')}
        </Button>
        <Button type='primary' htmlType='button' onClick={next}>
          {t('next')}
        </Button>
      </Space>
    </>
  );
};
export default ParcelReceiver;
