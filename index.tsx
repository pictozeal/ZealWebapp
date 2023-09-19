import * as React from 'react'
import getTokenSilent from '@app/auth/AuthService'
import { useAccount, useMsal } from '@azure/msal-react'
import { parse } from 'query-string'
import { useHistory, useLocation } from 'react-router-dom'
import { Header } from 'semantic-ui-react'

import searchFields from '@app/schema/accounting/smaDashboard/searchFields'
import modelDelivery from '@app/schema/accounting/smaDashboard/modelDelivery'

import DataModel from '@models/grid/DataModel'
import { ModelDeliveryModel } from '@models/smaDashboard/ModelDeliveryModel'
import { formatDate } from '@utils/formatters'

import ViewSearch from '@shared-components/Search'
import GridWithHeader from '@shared-components/GridWithHeader'
import MetaData from '@shared-components/MetaData'

interface ISmaDashboardStateProps {
  modelDeliveryGridInfo: any
  modelDeliveryErrorInfo: any
  modelDeliveryFormInfo: any
}

export interface ISmaDashboardDispatchProps {
  fetchModelDeliveryData: (accessToken: any, params?: string) => void
}

type ISmaDashboardProps = ISmaDashboardStateProps & ISmaDashboardDispatchProps

const SmaDashboard = (props: ISmaDashboardProps) => {
  const {
    modelDeliveryGridInfo,
    modelDeliveryErrorInfo,
    modelDeliveryFormInfo,
    fetchModelDeliveryData,
  } = props
  const { instance, accounts, inProgress } = useMsal()
  const account = useAccount(accounts[0] || {})
  const location = useLocation()
  const history = useHistory()

  const params = parse(location.search)

  // asOfDate format 'YYYY-MM-DD'
  const [asOfDate, setAsOfDate] = React.useState<string>(() => {
    const today = new Date()
    const searchDate = params?.AsOfDate
      ? new Date(params.AsOfDate)
      : new Date(today.getFullYear(), today.getMonth(), 0)
    return formatDate(searchDate, 'YYYY-MM-DD')
  })
  const [category, setCategory] = React.useState<string>(params?.Category || '')

  const GetData = (asOfDate: string) => {
    getTokenSilent(instance, account, inProgress).then((response: any) => {
      if (response) {
        fetchModelDeliveryData(response.accessToken, `AsOfDate=${asOfDate}`)
      }
    })
  }

  React.useEffect(() => {
    if (!modelDeliveryGridInfo) {
      history.push(`?AsOfDate=${asOfDate}`)
      GetData(asOfDate)
    }
  }, [])

  const onSearch = (params: string) => history.push(`?${params}`)

  const onSearchConstraints = (search: any) => {
    const { AsOfDate, Category } = search
    // Only fetch data if asOfDate changes
    if (AsOfDate && AsOfDate !== asOfDate) {
      setAsOfDate(AsOfDate)
      GetData(AsOfDate)
    }
    setCategory(Category || '')
  }

  const hasGridData = (gridInfo: any) =>
    Array.isArray(gridInfo?.data) && gridInfo.data.length > 0

  const searchSchema = new DataModel(searchFields)
  const modelDeliverySchema = new DataModel(modelDelivery)

  let formattedModelData: ModelDeliveryModel[] = []
  if (hasGridData(modelDeliveryGridInfo)) {
    // Format SMA data and add totals row
    // const smaData = modelDeliveryGridInfo.data.filter(
    //   (data: any) =>
    //     data.Type?.toUpperCase() === 'SMA' ||
    //     data.Type?.toUpperCase() === 'CIT',
    // )

    // Format Model data and add totals row
    const modelData = modelDeliveryGridInfo.data.filter(
      (data: any) => data.Type?.toUpperCase() === 'MODEL',
    )
    if (modelData.length > 0) {
      formattedModelData = modelData.map(
        (data: any) => new ModelDeliveryModel(data),
      )
    }
  }

  return (
    <div>
      <MetaData title="Seperate Account and Model Delivery Total AUM and AUA" />
      <Header
        as="h1"
        size="large"
        content="Seperate Account and Model Delivery Total AUM and AUA"
      />
      <ViewSearch
        searchBox={searchSchema.SearchBox}
        fields={searchSchema.Search}
        onSubmit={onSearch}
        onSubmitConstraints={onSearchConstraints}
        searchParams={location.search}
        formClassName="form--assets-dashboard"
        isClearable={false}
      />
      <div className="ui medium header">
        Total Seperate Account and Model Delivery Total AUM and AUA & Assets
        Under Advisory as of {formatDate(new Date(asOfDate), 'MM/DD/YYYY')}
      </div>

      <GridWithHeader
        title={modelDeliverySchema.GridTitle}
        shouldDisplayDate={false}
        schema={modelDeliverySchema}
        gridInfo={{ ...modelDeliveryGridInfo, data: formattedModelData }}
        errorInfo={modelDeliveryErrorInfo}
        isBannerErrorMessage={true}
      />
    </div>
  )
}

export default React.memo(SmaDashboard)
