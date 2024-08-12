import React, { useContext, useEffect, useState } from 'react';
import { Card, Image, Table, Button, Space, Tag, Switch, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import getImage from '../../../helpers/getImage';
import CreateCategory from './createCategory';
import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { fetchSellerCategory } from '../../../redux/slices/category';
import {
  addMenu,
  disableRefetch,
  setMenuData,
} from '../../../redux/slices/menu';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomModal from '../../../components/modal';
import { Context } from '../../../context/context';
import sellerCategory from '../../../services/seller/category';
import { useNavigate, useParams } from 'react-router-dom';
import FilterColumns from '../../../components/filter-column';
import formatSortType from '../../../helpers/formatSortType';
import useDidUpdate from '../../../helpers/useDidUpdate';
import SearchInput from '../../../components/search-input';
import DeleteButton from 'components/delete-button';
const colors = ['blue', 'red', 'gold', 'volcano', 'cyan', 'lime'];

const roles = ['all', 'pending', 'published', 'unpublished', 'deleted_at'];

export default function SellerCategoryList({ parentId, type = 'main' }) {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setIsModalVisible } = useContext(Context);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [id, setId] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [text, setText] = useState(null);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const [active, setActive] = useState(null);
  const { user } = useSelector((state) => state.auth, shallowEqual);
  const { categories, meta, loading, params } = useSelector(
    (state) => state.category,
    shallowEqual
  );
  const data = activeMenu.data;
  const { uuid: parentUuid } = useParams();
  const [role, setRole] = useState('all');
  const immutable = activeMenu.data?.role || role;

  const paramsData = {
    search: data?.search,
    sort: data?.sort,
    column: data?.column,
    perPage: data?.perPage,
    page: data?.page,
    shop_id: user?.shop_id,
    type,
    parent_id: parentId,
    status:
      immutable === 'deleted_at'
        ? undefined
        : immutable === 'all'
        ? undefined
        : immutable,
    deleted_at: immutable === 'deleted_at' ? immutable : null,
  };

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `seller/category/${row.uuid}`,
        id: 'category_edit',
        name: t('category'),
      })
    );
    navigate(`/seller/category/${row.uuid}`, {
      state: { parentId, parentUuid },
    });
  };

  const [columns, setColumns] = useState([
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'name',
      is_show: true,
    },
    {
      title: t('created.by'),
      dataIndex: 'shop',
      key: 'shop',
      is_show: true,
      render: (shop) => (shop ? t('you') : t('admin')),
    },
    {
      title: t('translations'),
      dataIndex: 'locales',
      is_show: true,
      render: (_, row) => {
        return (
          <Space>
            {row.locales?.map((item, index) => (
              <Tag className='text-uppercase' color={[colors[index]]}>
                {item}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: t('active'),
      dataIndex: 'active',
      is_show: true,
      render: (active, row) => {
        return (
          <Switch
            onChange={() => {
              setIsModalVisible(true);
              setId(row.uuid);
              setActive(true);
            }}
            disabled={row.deleted_at || !row?.shop_id}
            checked={active}
          />
        );
      },
    },
    {
      title: t('status'),
      dataIndex: 'status',
      is_show: true,
      render: (status) => (
        <div>
          {status === 'pending' ? (
            <Tag color='blue'>{t(status)}</Tag>
          ) : status === 'unpublished' ? (
            <Tag color='error'>{t(status)}</Tag>
          ) : (
            <Tag color='cyan'>{t(status)}</Tag>
          )}
        </div>
      ),
    },
    {
      title: t('image'),
      dataIndex: 'img',
      key: 'img',
      is_show: true,
      render: (img, row) => {
        return (
          <Image
            src={getImage(img)}
            alt='img_gallery'
            width={100}
            className='rounded'
            preview
            placeholder
            key={img + row.id}
          />
        );
      },
    },
    {
      title: t('options'),
      key: 'options',
      dataIndex: 'options',
      is_show: true,
      render: (_, row) => {
        return (
          <Space>
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => goToEdit(row)}
              disabled={!row?.shop_id}
            />
             <DeleteButton
              disabled={row.deleted_at || !row?.shop_id}
              icon={<DeleteOutlined />}
              onClick={() => {
                setId([row.id]);
                setIsModalVisible(true);
                setText(true);
              }}
            />
          </Space>
        );
      },
    },
  ]);

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchSellerCategory(paramsData));
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    dispatch(fetchSellerCategory(paramsData));
  }, [activeMenu.data]);

  function onChangePagination(pagination, filter, sorter) {
    const { pageSize: perPage, current: page } = pagination;
    const { field: column, order } = sorter;
    const sort = formatSortType(order);
    dispatch(
      setMenuData({
        activeMenu,
        data: { ...activeMenu.data, perPage, page, column, sort },
      })
    );
  }

  const categoryDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        }))
      ),
    };
    sellerCategory
      .delete(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchSellerCategory(paramsData));
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  const handleCancel = () => setIsModalOpen(false);

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const goToAddCategory = () => {
    dispatch(
      addMenu({
        url: `seller/category/add`,
        id: 'seller/category/add',
        name: t('edit.category'),
      })
    );
    navigate(`/seller/category/add`, { state: { parentId, parentUuid } });
  };

  const handleFilter = (items) => {
    const data = activeMenu.data;
    dispatch(
      setMenuData({
        activeMenu,
        data: { ...data, ...items },
      })
    );
  };

  const handleActive = () => {
    setLoadingBtn(true);
    sellerCategory
      .setActive(id)
      .then(() => {
        setIsModalVisible(false);
        dispatch(fetchSellerCategory(paramsData));
        toast.success(t('successfully.updated'));
        setActive(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  return (
    <Card
      title={parentId ? t('sub.category') : t('categories')}
      extra={
        <Space wrap>
          <SearchInput
            placeholder={t('search')}
            handleChange={(e) => handleFilter({ search: e })}
            defaultValue={activeMenu.data?.search}
            resetSearch={!activeMenu.data?.search}
          />
          <Button
            size='small'
            type='primary'
            icon={<PlusCircleOutlined />}
            onClick={goToAddCategory}
          >
            {t('add.category')}
          </Button>
          <FilterColumns columns={columns} setColumns={setColumns} />
        </Space>
      }
    >
      <Tabs
        className='mt-3'
        activeKey={immutable}
        onChange={(key) => {
          handleFilter({ role: key, page: 1 });
          setRole(key);
        }}
        type='card'
      >
        {roles.map((item) => (
          <Tabs.TabPane tab={t(item)} key={item} />
        ))}
      </Tabs>
      <Table
        scroll={{ x: true }}
        rowSelection={rowSelection}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={categories}
        pagination={{
          pageSize: params.perPage,
          page: activeMenu.data?.page || 1,
          total: meta.total,
          defaultCurrent: activeMenu.data?.page,
          current: activeMenu.data?.page,
        }}
        rowKey={(record) => record.key}
        onChange={onChangePagination}
        loading={loading}
      />
      {isModalOpen && (
        <CreateCategory handleCancel={handleCancel} isModalOpen={isModalOpen} />
      )}
      <CustomModal
        click={active ? handleActive : categoryDelete}
        text={
          active
            ? t('set.active.category')
            : text
            ? t('delete')
            : t('all.delete')
        }
        setText={setId}
        loading={loadingBtn}
      />
    </Card>
  );
}
