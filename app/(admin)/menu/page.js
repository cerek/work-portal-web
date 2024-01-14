import MenuList from './menuList'
import serverSideFetch from '@/lib/serverFetchData/page'
import NewBreadCrumb from '@/components/breadCrumb/page'

export default async function MenuPage() {
  const menuList = await serverSideFetch('/menu/')
  
  const permissionListRes = await serverSideFetch('/permission/?page_size=500')
  const permissionList = permissionListRes.results.map(function (element) {
    return { value: element.id, label: element.name }
  })

  const parentMenuListRes = await serverSideFetch('/menu/?page_size=500')
  const parentMenuList = parentMenuListRes.results.map(function (element) {
    return { value: element.id, label: element.menu_name }
  })

  return (
    <div className="grid">
      <NewBreadCrumb />
      <div className="col-12">
        <MenuList menuList={menuList} permissionList={permissionList} parentMenuList={parentMenuList} />
      </div>
    </div>
  )
}
