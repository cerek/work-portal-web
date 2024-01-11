import Layout from "@/layout/layout"
import serverSideFetch from '@/lib/serverFetchData/page'


export default async function NewLayout({ children }){
    const menuData = await serverSideFetch('/menu/generate/')
    return <Layout children={children} menuData={menuData}></Layout>
}