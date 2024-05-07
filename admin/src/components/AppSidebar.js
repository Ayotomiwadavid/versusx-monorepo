import React from 'react'
import { useSelector } from 'react-redux'

import { CSidebar, CSidebarBrand, CSidebarNav } from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'

import logoPng from '../assets/images/logo.png'

import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'

// sidebar nav config
import navigation from '../_nav'

const AppSidebar = () => {
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)

  return (
    <CSidebar
      position="fixed"
      unfoldable={unfoldable}
      // visible={sidebarShow}
      // onVisibleChange={(visible) => {
      //   dispatch({ type: 'set', sidebarShow: visible })
      // }}
    >
      <CSidebarBrand className="d-none d-md-flex" to="/">
        <img src={logoPng} style={{ width: '50%' }} alt="logo" />
      </CSidebarBrand>
      <CSidebarNav>
        <SimpleBar>
          <AppSidebarNav items={navigation} />
        </SimpleBar>
      </CSidebarNav>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
