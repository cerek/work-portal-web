import Link from "next/link"
import { classNames } from "primereact/utils"
import React, {
  forwardRef,
  useContext,
  useImperativeHandle,
  useRef
} from "react"
import { LayoutContext } from "./context/layoutcontext"
import { signOut } from 'next-auth/react'


const AppTopbar = forwardRef((props, ref) => {
  const {
    layoutConfig,
    layoutState,
    onMenuToggle,
    showProfileSidebar
  } = useContext(LayoutContext)
  const menubuttonRef = useRef(null)
  const topbarmenuRef = useRef(null)
  const topbarmenubuttonRef = useRef(null)

  useImperativeHandle(ref, () => ({
    menubutton: menubuttonRef.current,
    topbarmenu: topbarmenuRef.current,
    topbarmenubutton: topbarmenubuttonRef.current
  }))

  return (
    <div className="layout-topbar">
      <Link href="/" className="layout-topbar-logo">
        <img
          src={`/layout/images/logo-${
            layoutConfig.colorScheme !== "light" ? "white" : "dark"
          }.svg`}
          width="47.22px"
          height={"35px"}
          alt="logo"
        />
        <span>WORK PORTAL</span>
      </Link>

      <button
        ref={menubuttonRef}
        type="button"
        className="p-link layout-menu-button layout-topbar-button"
        onClick={onMenuToggle}
      >
        <i className="pi pi-bars" />
      </button>

      <button
        ref={topbarmenubuttonRef}
        type="button"
        className="p-link layout-topbar-menu-button layout-topbar-button"
        onClick={showProfileSidebar}
      >
        <i className="pi pi-ellipsis-v" />
      </button>

      <div
        ref={topbarmenuRef}
        className={classNames("layout-topbar-menu", {
          "layout-topbar-menu-mobile-active": layoutState.profileSidebarVisible
        })}
      >
        <button type="button" className="p-link layout-topbar-button">
          <i className="pi pi-calendar"></i>
          <span>Calendar</span>
        </button>
        <button type="button" className="p-link layout-topbar-button">
          <i className="pi pi-user"></i>
          <span>Profile</span>
        </button>
        <Link href="#">
          <button type="button" className="p-link layout-topbar-button" onClick={() => signOut()}>
            <i className="pi pi-sign-out"></i>
            <span>Logout</span>
          </button>
        </Link>
      </div>
    </div>
  )
})

AppTopbar.displayName = "AppTopbar"

export default AppTopbar
