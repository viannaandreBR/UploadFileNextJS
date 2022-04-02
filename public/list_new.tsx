import React, { useCallback, useState } from 'react'
import useLocalStorageState from 'use-local-storage-state'
import { useSelector } from 'react-redux'
import { Space, Menu } from 'antd'
import { withRouter } from 'react-router'
import TableView from '@wastehero/storybook/lib/components/Views/Table'
import Dropdown from '@wastehero/storybook/lib/components/Form/Elements/Dropdown'
import DeleteModal from '@wastehero/storybook/lib/components/Modal/Modals/Delete'
import { useModalWithButton } from '@wastehero/storybook/lib/components'
import { IModal } from '@wastehero/storybook/lib/components/Modal/types'
import { useApolloClient } from '@apollo/client'
import { T } from '@transifex/react'
import { getSavedActiveProjects } from '../../../../../shared/utils'
import DepotTypeFilter from '../../../../../design-system/elements/filters/DepotType'
import LogoContainer from '../../components/logo'
import { DELETE_DEPOT, GET_ALL_DEPOTS, K_GET_ALL_DEPOTS } from './api'
import { useLastSavedActiveProjectsSnapshotFn } from '../../../../hooks'
import CreateOrUpdateDepot from './create-update-depot/index'

const withfiltersPersistentKeyPrefix = (str: string) =>
  `FleetManagement.Locations.Table.filters.`.concat(str)

const Depots = ({ history }: $TSFixMe): JSX.Element => {
  /* API */
  const apolloClient = useApolloClient()

  /* Filters state */
  const [selectedTypes, setSelectedTypes] = useLocalStorageState(
    withfiltersPersistentKeyPrefix(`selectedTypes`),
    []
  )

  const resetFilters = useCallback(() => {
    setSelectedTypes([])
  }, [setSelectedTypes])

  useLastSavedActiveProjectsSnapshotFn(
    withfiltersPersistentKeyPrefix(`meta.useLastSavedActiveProjectsSnapshot`),
    resetFilters,
    [resetFilters]
  )

  /* Filters state end */
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedLocationId, setSelectedLocationId] = useState<$TSFixMe>(null)

  // @ts-expect-error ts-migrate(2339) FIXME: Property 'logoSize' does not exist on type '[strin... Remove this comment to see the full error message
  const { logoSize } = useState('Small')

  const savedActiveProjects = useSelector((state) =>
    getSavedActiveProjects(state)
  )
  const commonModalProps: Partial<IModal> = {
    width: 800,
    footer: null,
  }
  const {
    jsx: { modal: jsxCreateOrUpdateDepotModal },
    utils: { openModal: openCreateOrUpdateDepotModal },
  } = useModalWithButton<Record<string, $TSFixMe>, string>({
    children: ({ closeModal }) => (
      <CreateOrUpdateDepot onClose={closeModal} state={selectedLocationId} />
    ),
    initialState: ``,
    modelProps: {
      title: selectedLocationId ? (
        <T _str="Edit Location" />
      ) : (
        <T _str="Create Location" />
      ),
      ...commonModalProps,
    },
  })
  const columns = [
    {
      title: <T _str="Logo" />,
      dataIndex: ['node', 'logo'],
      key: 'logo',
      sorter: false,
      defaultHidden: true,
      render: (_: $TSFixMe, record: $TSFixMe) => (
        <Space size="middle">
          <LogoContainer
            variant={logoSize}
            src={record?.node?.logo}
            name={record?.node.name}
            onClick={() =>
              history.push(`/app/fleet-management/locations/${record.node.id}`)
            }
          />
        </Space>
      ),
    },
    {
      title: <T _str="Name" />,
      dataIndex: ['node', 'name'],
      key: 'name',
      sorter: true,
      render: (_: $TSFixMe, record: $TSFixMe) => (
        <Space size="middle">
          <span> {record?.node?.name} </span>
        </Space>
      ),
    },
    {
      title: <T _str="Status" />,
      dataIndex: ['node', 'status'],
      key: 'status',
      sorter: false,
      render: (_: $TSFixMe, record: $TSFixMe) => (
        <Space size="middle">
          <span> {record?.node.name} </span>
        </Space>
      ),
    },
    {
      title: <T _str="Type" />,
      dataIndex: ['node', 'type'],
      key: 'type',
      sorter: true,
      render: (_: $TSFixMe, record: $TSFixMe) => (
        <Space size="middle">
          <span>
            {record?.node.depotType === 'waste_station' ? (
              <T _str="Waste Station" />
            ) : (
              <T _str="Depot" />
            )}
          </span>
        </Space>
      ),
    },
    {
      title: <T _str="Opening hours" />,
      dataIndex: ['node', 'openingHours'],
      key: 'openingHours',
      sorter: true,
      render: (_: $TSFixMe, record: $TSFixMe) => (
        <Space size="middle">
          <span>
            {record?.node.openingTime} -{record?.node.closingTime}
          </span>
        </Space>
      ),
    },
    {
      title: <T _str="Contact" />,
      dataIndex: ['node', 'contact'],
      key: 'contact',
      sorter: true,
      render: (_: $TSFixMe, record: $TSFixMe) => (
        <Space size="middle">
          <span>{record?.node?.contactPerson?.name}</span>
        </Space>
      ),
    },
    {
      title: <T _str="Address" />,
      dataIndex: ['node', 'name'],
      key: 'location',
      sorter: true,
      render: (_: $TSFixMe, record: $TSFixMe) => (
        <Space size="middle">
          <span>{record?.node?.location?.name}</span>
        </Space>
      ),
    },
    {
      title: '',
      key: 'action',
      render: (_: $TSFixMe, record: $TSFixMe) => (
        <Space size="middle">
          <Dropdown
            overlay={
              <Menu
                onClick={(e) => {
                  switch (e.key) {
                    case '1':
                      setSelectedLocationId(record.node.id)
                      openCreateOrUpdateDepotModal()
                      break
                    case '2':
                      setSelectedLocationId(record.node.id)
                      setShowDeleteModal(true)
                      break
                    default:
                      break
                  }
                }}
              >
                <Menu.Item key="1">Edit</Menu.Item>
                <Menu.Item key="2">Delete</Menu.Item>
              </Menu>
            }
          />
        </Space>
      ),
    },
  ]

  const breadcrumbBar = {
    title: <T _str="Locations" />,
    createButtonTitle: <T _str="Create Location" />,
    createButtonAction: () => {
      setSelectedLocationId(undefined)
      openCreateOrUpdateDepotModal()
    },
    breadcrumbsLinks: [
      {
        label: <T _str="Fleet Management" />,
        path: '/route1',
      },
      {
        label: <T _str="Locations" />,
        path: '/route2',
      },
    ],
  }

  const queryVariablesFormatter = (
    queryVariables: $TSFixMe,
    filterValues: $TSFixMe,
    pagination: $TSFixMe,
    filters: $TSFixMe,
    sorter: $TSFixMe
  ) => {
    const sortBy = {}
    const dataPagination = { pageSize: 10 }

    if (sorter) {
      ;(sortBy as $TSFixMe).orderBy = sorter.columnKey

      if (sorter.order) {
        ;(sortBy as $TSFixMe).order =
          sorter.order === 'descend' ? 'desc' : 'asc'
      }
    }

    if (pagination) {
      dataPagination.pageSize = pagination.pageSize
      ;(dataPagination as $TSFixMe).offset =
        pagination.pageSize * (pagination.current - 1)
    }

    const search = filterValues.find(
      (filter: $TSFixMe) => filter.key === 'search'
    )
    const searchFilter = search
      ? {
          search: search.value,
        }
      : {}

    return {
      ...searchFilter,
      ...queryVariables,
      ...sortBy,
      ...dataPagination,
    }
  }

  const queryResultFormatter = (values: $TSFixMe) => ({
    data: values?.allDepots?.edges || [],

    pagination: {
      total: values?.allDepots?.totalCount,
    },
  })

  const queryVariables = {
    activeProjects: savedActiveProjects,
    type: selectedTypes.join(','),
  }

  const tableProps = {
    antdTableProps: {
      columns,
      rowKey: (record: $TSFixMe) => record.node.id,
    },
  }

  const queryTableProps = {
    query: GET_ALL_DEPOTS,
    queryResultFormatter,
    queryVariablesFormatter,
    queryVariables,
    tableProps,
  }

  return (
    <>
      {jsxCreateOrUpdateDepotModal}

      <TableView
        name="fleetManagementLocations"
        queryTableProps={queryTableProps}
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ title: JSX.Element; createButtonTitle: JSX... Remove this comment to see the full error message
        breadcrumbBar={breadcrumbBar}
        hasFilterBar
        filterBarConfig={{ hideCustomDatePicker: true }}
        filterListeners={{
          reset: resetFilters,
        }}
        filters={[
          <DepotTypeFilter
            onChange={(value: $TSFixMe) => {
              setSelectedTypes(value)
            }}
            variables={{
              activeProjects: savedActiveProjects,
              type: selectedTypes.join(','),
            }}
            mode="multiple"
            // @ts-expect-error Something wrong here.
            value={selectedTypes}
          />,
        ]}
      />
      <DeleteModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        mutation={DELETE_DEPOT}
        mutationVariables={{ selfId: selectedLocationId }}
        onSubmit={() => {
          apolloClient.refetchQueries({
            include: [K_GET_ALL_DEPOTS],
          })
          setShowDeleteModal(false)
        }}
        type="location"
      />
    </>
  )
}

export default withRouter(Depots)
