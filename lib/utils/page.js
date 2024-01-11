import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const dirtyValues = (dirtyFields, allValues) => {
  if (dirtyFields === true || Array.isArray(dirtyFields)) {
    return allValues
  }
  return Object.fromEntries(
    Object.keys(dirtyFields).map((key) => [
      key,
      dirtyValues(dirtyFields[key], allValues[key]),
    ])
  )
}

const getEmployeeInfo = async () => {
  const session = await getServerSession(authOptions)
  return session.user.user
}

const searchList = async (module, searchKey) => {
  const data = await fetch('/api/' + module + '?search=' + searchKey)
  const searchResult = await data.json()
  return searchResult
}

const pageControl = async (module, currentPage, pageSize) => {
  const data = await fetch(
    '/api/' + module + '?page=' + currentPage + '&page_size=' + pageSize
  )
  const pageResult = await data.json()
  return pageResult
}

const delInsConfirm = async (module, id) => {
  const data = await fetch('/api/' + module + '/' + id, {
    method: 'DELETE',
  })
  const delRes = await data.json()
  return delRes
}

const getFormErrorMessage = (name, err) => {
  const nameArr = name.split('.');
  const errMsg = nameArr.reduce((obj, key) => obj && obj[key], err);
  return errMsg ? (
    <small className="p-error">{errMsg.message}</small>
  ) : (
    <small className="p-error">&nbsp;</small>
  )
}

const getObjectDiff = (oldobj, newobj) => {
  const diff = Object.entries({...oldobj, ...newobj}).filter(([key]) => ( typeof oldobj[key] === 'object' ? JSON.stringify(oldobj[key]) !== JSON.stringify(newobj[key]) : oldobj[key] !== newobj[key]));
  return Object.fromEntries(diff);
}


export {
  dirtyValues,
  getEmployeeInfo,
  searchList,
  pageControl,
  delInsConfirm,
  getFormErrorMessage,
  getObjectDiff,
}
