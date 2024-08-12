import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  Space,
  Table,
  Card,
  Tabs,
  Tag,
  DatePicker,
  Tooltip,
  Dropdown,
  Menu,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ClearOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setMenuData } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import useDidUpdate from 'helpers/useDidUpdate';
import { clearItems } from 'redux/slices/orders';
import { fetchParcelOrders } from 'redux/slices/parcelOrders';
import formatSortType from 'helpers/formatSortType';
import SearchInput from 'components/search-input';
import { clearOrder } from 'redux/slices/order';
import { DebounceSelect } from 'components/search';
import userService from 'services/user';
import FilterColumns from 'components/filter-column';
import { toast } from 'react-toastify';
import DeleteButton from 'components/delete-button';
// import orderService from 'services/order';
import parcelOrderService from '../../services/parcelOrder';
import { Context } from 'context/context';
import CustomModal from 'components/modal';
import moment from 'moment';
import { export_url } from 'configs/app-global';
import { BiMap } from 'react-icons/bi';
import { FaTrashRestoreAlt } from 'react-icons/fa';
import { CgExport } from 'react-icons/cg';
import ResultModal from 'components/result-modal';
import { batch } from 'react-redux';
import { useQueryParams } from 'helpers/useQueryParams';
import useDemo from 'helpers/useDemo';
import getFullDateTime from 'helpers/getFullDateTime';
import getFullDate from 'helpers/getFullDate';
import ParcelStatus from './parcel-status';
import statusList from './statuses';
import ShowLocationsMap from './show-locations-map';
import ShowParcelDetails from './show-parcel-details';
import ParcelDeliveryman from './parcel-deliveryman';
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

export default function ParserOrders() {
  const { type } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDemo } = useDemo();
  const [orderDetails, setOrderDetails] = useState(null);
  const [locationsMap, setLocationsMap] = useState(null);
  const [parcelDeliveryDetails, setOrderDeliveryDetails] = useState(null);
  const [parcelId, setParcelId] = useState(null);
  const statuses = [
    { name: 'all', id: '7', active: true },
    ...statusList,
    { name: 'deleted_at', id: '8', active: true },
  ];
  const [restore, setRestore] = useState(null);

  const goToEdit = (row) => {
    dispatch(clearOrder());
    dispatch(
      addMenu({
        url: `parcel-orders/${row.id}`,
        id: 'edit_parcel_order',
        name: t('edit.parcel.order'),
      })
    );
    navigate(`/parcel-orders/${row.id}`);
  };

  const goToShow = (row) => {
    setParcelId(row.id);
  };

  const [columns, setColumns] = useState([
    {
      title: t('id'),
      is_show: true,
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: t('client'),
      is_show: true,
      dataIndex: 'user',
      key: 'user',
      render: (user) => (
        <div>
          {user?.firstname} {user?.lastname || ''}
        </div>
      ),
    },
    {
      title: t('status'),
      is_show: true,
      dataIndex: 'status',
      key: 'status',
      render: (status, row) => (
        <div className='cursor-pointer'>
          {status === 'new' ? (
            <Tag color='blue'>{t(status)}</Tag>
          ) : status === 'canceled' ? (
            <Tag color='error'>{t(status)}</Tag>
          ) : (
            <Tag color='cyan'>{t(status)}</Tag>
          )}
          {status !== 'delivered' &&
          status !== 'canceled' &&
          !row.deleted_at ? (
            <EditOutlined
              onClick={(e) => {
                e.stopPropagation();
                setOrderDetails(row);
              }}
              disabled={row.deleted_at}
            />
          ) : (
            ''
          )}
        </div>
      ),
    },
    {
      title: t('deliveryman'),
      is_show: true,
      dataIndex: 'deliveryman',
      key: 'deliveryman',
      render: (deliveryman, row) => (
        <div>
          {row.status === 'ready' && row.delivery_type !== 'pickup' ? (
            <Button
              disabled={row.deleted_at}
              type='link'
              onClick={() => setOrderDeliveryDetails(row)}
            >
              <Space>
                {deliveryman
                  ? `${deliveryman.firstname} ${deliveryman.lastname}`
                  : t('add.deliveryman')}
                <EditOutlined />
              </Space>
            </Button>
          ) : (
            <div>
              {deliveryman?.firstname} {deliveryman?.lastname}
            </div>
          )}
        </div>
      ),
    },
    {
      title: t('payment.type'),
      is_show: true,
      dataIndex: 'transaction',
      key: 'transaction',
      render: (transaction) => t(transaction?.payment_system?.tag) || '-',
    },
    {
      title: t('created.at'),
      is_show: true,
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => getFullDateTime(date),
    },
    {
      title: t('delivery.date'),
      is_show: true,
      dataIndex: 'delivery_date',
      key: 'delivery_date',
      render: (date) => getFullDate(date),
    },
    {
      title: t('options'),
      is_show: true,
      key: 'options',
      render: (_, row) => {
        return (
          <Space>
            <Button
              disabled={row.deleted_at}
              icon={<BiMap />}
              onClick={(e) => {
                e.stopPropagation();
                setLocationsMap(row.id);
              }}
            />
            <Button
              disabled={row.deleted_at}
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                goToShow(row);
              }}
            />
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                goToEdit(row);
              }}
              disabled={
                row.status === 'delivered' ||
                row.status === 'canceled' ||
                row.deleted_at
              }
            />
            <DeleteButton
              disabled={row.deleted_at}
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
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

  const { setIsModalVisible } = useContext(Context);
  const [downloading, setDownloading] = useState(false);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const querryParams = useQueryParams();
  const [role, setRole] = useState(querryParams.values.status || 'all');
  const immutable = activeMenu.data?.role || role;
  const data = activeMenu.data;

  const [id, setId] = useState(null);
  const [text, setText] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [dateRange, setDateRange] = useState(
    moment().subtract(1, 'months'),
    moment()
  );
  const {
    data: orders,
    loading,
    params,
    meta,
  } = useSelector((state) => state.parcelOrders, shallowEqual);

  const paramsData = {
    search: data?.search,
    sort: data?.sort,
    column: data?.column,
    perPage: data?.perPage,
    page: data?.page,
    user_id: data?.user_id,
    status:
      immutable === 'deleted_at'
        ? undefined
        : immutable === 'all'
        ? undefined
        : immutable,
    deleted_at: immutable === 'deleted_at' ? 'deleted_at' : undefined,
    shop_id:
      activeMenu.data?.shop_id !== null ? activeMenu.data?.shop_id : null,
    delivery_type: type !== 'scheduled' ? type : undefined,
    delivery_date_from:
      type === 'scheduled'
        ? moment().add(1, 'day').format('YYYY-MM-DD')
        : undefined,
    date_from: dateRange ? dateRange[0]?.format('YYYY-MM-DD') : null,
    date_to: dateRange ? dateRange[1]?.format('YYYY-MM-DD') : null,
  };

  function onChangePagination(pagination, filters, sorter) {
    const { pageSize: perPage, current: page } = pagination;
    const { field: column, order } = sorter;
    const sort = formatSortType(order);
    dispatch(
      setMenuData({
        activeMenu,
        data: { ...data, perPage, page, column, sort },
      })
    );
  }

  const orderDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        }))
      ),
    };

    parcelOrderService
      .delete(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        setIsModalVisible(false);
        dispatch(fetchParcelOrders(paramsData));
        setText(null);
      })
      .finally(() => {
        setId(null);
        setLoadingBtn(false);
      });
  };

  const orderDropAll = () => {
    setLoadingBtn(true);
    parcelOrderService
      .dropAll()
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchParcelOrders(paramsData));
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const orderRestoreAll = () => {
    setLoadingBtn(true);
    parcelOrderService
      .restoreAll()
      .then(() => {
        toast.success(t('it.will.take.some.time.to.return.the.files'));
        dispatch(fetchParcelOrders(paramsData));
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  useDidUpdate(() => {
    dispatch(fetchParcelOrders(paramsData));
  }, [data, dateRange, type]);

  const handleFilter = (item, name) => {
    dispatch(
      setMenuData({
        activeMenu,
        data: { ...data, ...{ [name]: item } },
      })
    );
  };

  async function getUsers(search) {
    const params = {
      search,
      perPage: 10,
    };
    return userService.search(params).then(({ data }) => {
      return data.map((item) => ({
        label: `${item.firstname} ${item.lastname}`,
        value: item.id,
      }));
    });
  }

  const goToOrderCreate = () => {
    dispatch(clearOrder());
    dispatch(
      addMenu({
        id: 'parcel-orders/add',
        url: 'parcel-orders/add',
        name: 'add.parcel.order',
      })
    );
    navigate('/parcel-orders/add');
  };

  const excelExport = () => {
    setDownloading(true);
    const params =
      role !== 'all'
        ? {
            status: role,
          }
        : null;

    parcelOrderService
      .export(params)
      .then((res) => {
        const body = export_url + res.data.file_name;
        window.location.href = body;
      })
      .finally(() => setDownloading(false));
  };

  const onChangeTab = (status) => {
    const orderStatus = statuses.find((el) => el.id === status)?.name;
    dispatch(setMenuData({ activeMenu, data: { role: orderStatus, page: 1 } }));
    setRole(orderStatus);
    navigate(`?status=${orderStatus}`);
  };

  const handleCloseModal = () => {
    setOrderDetails(null);
    setOrderDeliveryDetails(null);
    setLocationsMap(null);
    setParcelId(null);
  };

  useEffect(() => {
    if (activeMenu?.refetch) {
      dispatch(fetchParcelOrders(paramsData));
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu?.refetch]);

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.product'));
    } else {
      setIsModalVisible(true);
      setText(false);
    }
  };

  const handleClear = () => {
    batch(() => {
      dispatch(clearItems());
      dispatch(
        setMenuData({
          activeMenu,
          data: null,
        })
      );
      dispatch(
        fetchParcelOrders({
          status: undefined,
          page: data?.page,
          perPage: 20,
        })
      );
    });
    setDateRange(undefined);
  };

  const menu = (
    <Menu>
      {role !== 'deleted_at' ? (
        <Menu.Item
          onClick={() => {
            if (isDemo) {
              toast.warning(t('cannot.work.demo'));
              return;
            }
            setRestore({ delete: true });
          }}
        >
          <Space>
            <DeleteOutlined />
            {t('delete.all')}
          </Space>
        </Menu.Item>
      ) : (
        <Menu.Item
          onClick={() => {
            if (isDemo) {
              toast.warning(t('cannot.work.demo'));
              return;
            }
            setRestore({ restore: true });
          }}
        >
          <Space>
            <FaTrashRestoreAlt />
            {t('restore.all')}
          </Space>
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <>
      <Space className='justify-content-end w-100 mb-3'>
        <Button
          type='primary'
          icon={<PlusCircleOutlined />}
          onClick={goToOrderCreate}
          style={{ width: '100%' }}
        >
          {t('add.parcel.order')}
        </Button>
      </Space>
      <Card>
        <Space wrap className='order-filter'>
          <SearchInput
            defaultValue={data?.search}
            resetSearch={!data?.search}
            placeholder={t('search')}
            handleChange={(search) => handleFilter(search, 'search')}
          />
          <DebounceSelect
            placeholder={t('select.client')}
            fetchOptions={getUsers}
            onSelect={(user) => handleFilter(user.value, 'user_id')}
            onDeselect={() => handleFilter(null, 'user_id')}
            style={{ width: '100%' }}
            value={data?.user_id}
          />
          <RangePicker
            value={dateRange}
            onChange={(values) => setDateRange(values)}
            disabledDate={(current) => {
              return current && current > moment().endOf('day');
            }}
            style={{ width: '100%' }}
          />
          {role !== 'deleted_at' && (
            <Button
              onClick={excelExport}
              loading={downloading}
              style={{ width: '100%' }}
            >
              <CgExport className='mr-2' />
              {t('export')}
            </Button>
          )}
          <Button
            onClick={handleClear}
            style={{ width: '100%' }}
            icon={<ClearOutlined />}
          >
            {t('clear')}
          </Button>
        </Space>
      </Card>

      <Card>
        <Space className='justify-content-between align-items-start w-100'>
          <Tabs onChange={onChangeTab} type='card' activeKey={immutable}>
            {statuses.map((item) => (
              <TabPane tab={t(item.name)} key={item.id} />
            ))}
          </Tabs>
          <Space>
            {id !== null && id.length !== 0 && (
              <Tooltip title={t('delete.selected')}>
                <DeleteButton type='primary' onClick={allDelete} danger />
              </Tooltip>
            )}
            <FilterColumns setColumns={setColumns} columns={columns} iconOnly />

            <Dropdown overlay={menu}>
              <Button>{t('options')}</Button>
            </Dropdown>
          </Space>
        </Space>
        <Table
          scroll={{ x: true }}
          rowSelection={rowSelection}
          columns={columns?.filter((items) => items.is_show)}
          dataSource={orders}
          loading={loading}
          pagination={{
            pageSize: params.perPage,
            page: activeMenu.data?.page || 1,
            total: meta.total,
            defaultCurrent: activeMenu.data?.page,
            current: activeMenu.data?.page,
          }}
          rowKey={(record) => record.id}
          onChange={onChangePagination}
        />
      </Card>

      {orderDetails && (
        <ParcelStatus
          orderDetails={orderDetails}
          handleCancel={handleCloseModal}
          status={statusList}
        />
      )}
      {parcelDeliveryDetails && (
        <ParcelDeliveryman
          orderDetails={parcelDeliveryDetails}
          handleCancel={handleCloseModal}
        />
      )}
      {locationsMap && (
        <ShowLocationsMap id={locationsMap} handleCancel={handleCloseModal} />
      )}
      {!!parcelId && (
        <ShowParcelDetails id={parcelId} handleCancel={handleCloseModal} />
      )}
      <CustomModal
        click={orderDelete}
        text={text ? t('delete') : t('all.delete')}
        loading={loadingBtn}
        setText={setId}
      />
      {restore && (
        <ResultModal
          open={restore}
          handleCancel={() => setRestore(null)}
          click={restore.restore ? orderRestoreAll : orderDropAll}
          text={restore.restore ? t('restore.modal.text') : t('read.carefully')}
          subTitle={restore.restore ? '' : t('confirm.deletion')}
          loading={loadingBtn}
          setText={setId}
        />
      )}
    </>
  );
}
