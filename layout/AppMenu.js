import React from "react"
import AppMenuitem from "./AppMenuitem"
import { MenuProvider } from "./context/menucontext"


export default function AppMenu({ menuData }) {
  return (
    <MenuProvider>
      <ul className="layout-menu">
        {menuData.map((item, i) => {
          return !item?.seperator ? (
            <AppMenuitem item={item} root={true} index={i} key={item.label} />
          ) : (
            <li className="menu-separator"></li>
          )
        })}
      </ul>
    </MenuProvider>
  )
}
