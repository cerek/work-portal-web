'use client'
import React, { useState, useRef } from 'react'
import { Tooltip } from 'primereact/tooltip'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { Button } from 'primereact/button'
import { ProgressBar } from 'primereact/progressbar'
import { FileUpload } from 'primereact/fileupload'

export default function Uploader({ getAttachmentList }) {
  const [totalSize, setTotalSize] = useState(0)
  const fileUploadRef = useRef(null)
  const toast = useRef(null)
  let uploadedList = []
  let resAttachmentList = []
  const [uploadedListState, setUploadedListState] = useState([])
  const [resAttachmentListState, setResAttachmentListState] = useState([])

  const uploadAttachment = async (e) => {
    for (const element of e.files) {
      if (!uploadedListState.includes(element.name)) {
        const formData = new FormData()
        formData.append('file_url', element)
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        if (!res.ok) {
          const resData = await res.json()
          toast.current.show({
            severity: 'error',
            summary: 'Failed',
            detail: JSON.stringify(resData),
            life: 5000,
          })
        } else {
          const resData = await res.json()
          toast.current.show({
            severity: 'success',
            summary: 'Successfully',
            detail: JSON.stringify(resData.file_name) + 'upload successfully!',
            life: 5000,
          })
          uploadedList.push(element.name)
          resAttachmentList.push(resData)
        }
      }
    }
    setUploadedListState(uploadedListState.concat(uploadedList))
    setResAttachmentListState(resAttachmentListState.concat(resAttachmentList))
    getAttachmentList(
      resAttachmentListState.concat(resAttachmentList).map((obj) => obj.id)
    )
  }

  const onTemplateRemove = (file, callback) => {
    let fileName = file.name.split('.')
    fileName = fileName.splice(0, fileName.length - 1)
    const newResList = resAttachmentListState.filter(
      (item) => !item.file_name.includes(fileName)
    )
    setResAttachmentListState(newResList)
    getAttachmentList(newResList.map((item) => item.id))
    setTotalSize(totalSize - file.size)
    callback()
  }

  const onTemplateSelect = (e) => {
    let _totalSize = totalSize
    let files = e.files

    Object.keys(files).forEach((key) => {
      _totalSize += files[key].size || 0
    })

    setTotalSize(_totalSize)
  }

  const onTemplateClear = () => {
    setUploadedListState([])
    setResAttachmentListState([])
    getAttachmentList([])
    setTotalSize(0)
  }

  const headerTemplate = (options) => {
    const { className, chooseButton, uploadButton, cancelButton } = options
    const value = totalSize / 1000000
    const formatedValue =
      fileUploadRef && fileUploadRef.current
        ? fileUploadRef.current.formatSize(totalSize)
        : '0 B'

    return (
      <div
        className={className}
        style={{
          backgroundColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
        }}>
        {chooseButton}
        {uploadButton}
        {cancelButton}
        <div className="flex align-items-center gap-3 ml-auto">
          <span>{formatedValue} / 100 MB</span>
          <ProgressBar
            value={value}
            showValue={false}
            style={{ width: '10rem', height: '12px' }}></ProgressBar>
        </div>
      </div>
    )
  }

  const itemTemplate = (file, props) => {
    return (
      <div className="flex align-items-center flex-wrap">
        <div className="flex align-items-center" style={{ width: '40%' }}>
          <img
            alt={file.name}
            role="presentation"
            src={
              file.type.match('image.*')
                ? file.objectURL
                : `/layout/images/default-upload-icon.svg`
            }
            width={100}
          />
          <span className="flex flex-column text-left ml-3">
            {file.name}
            <small>{new Date().toLocaleDateString()}</small>
          </span>
        </div>
        <div className="flex flex-wrap justify-content-center gap-3">
          <Tag value={props.formatSize} severity="info" className="px-3 py-2" />
          <Tag
            value={
              uploadedListState.includes(file.name)
                ? 'Upload Completed.'
                : 'Pendding'
            }
            severity={
              uploadedListState.includes(file.name) ? 'success' : 'warning'
            }
            className="px-3 py-2"
          />
        </div>

        <Button
          type="button"
          icon="pi pi-times"
          className="p-button-outlined p-button-rounded p-button-danger ml-auto"
          onClick={() => onTemplateRemove(file, props.onRemove)}
        />
      </div>
    )
  }

  const emptyTemplate = () => {
    return (
      <div className="flex align-items-center flex-column">
        <i
          className="pi pi-image mt-3 p-5"
          style={{
            fontSize: '5em',
            borderRadius: '50%',
            backgroundColor: 'var(--surface-b)',
            color: 'var(--surface-d)',
          }}></i>
        <span
          style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }}
          className="my-5">
          Drag and Drop Image Here
        </span>
      </div>
    )
  }

  const chooseOptions = {
    icon: 'pi pi-fw pi-file',
    iconOnly: true,
    className: 'custom-choose-btn p-button-rounded p-button-outlined',
  }
  const uploadOptions = {
    icon: 'pi pi-fw pi-cloud-upload',
    iconOnly: true,
    className:
      'custom-upload-btn p-button-success p-button-rounded p-button-outlined',
  }
  const cancelOptions = {
    icon: 'pi pi-fw pi-times',
    iconOnly: true,
    className:
      'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined',
  }

  return (
    <>
      <Toast ref={toast} />
      <div className="field col-12">
        <label>
          <b>Ticket Attachments</b>
        </label>
        <Tooltip
          target=".custom-choose-btn"
          content="Choose"
          position="bottom"
        />
        <Tooltip
          target=".custom-upload-btn"
          content="Upload"
          position="bottom"
        />
        <Tooltip
          target=".custom-cancel-btn"
          content="Clear"
          position="bottom"
        />

        <FileUpload
          ref={fileUploadRef}
          multiple
          accept="*/*"
          maxFileSize={100000000}
          customUpload={true}
          uploadHandler={uploadAttachment}
          onSelect={onTemplateSelect}
          onError={onTemplateClear}
          onClear={onTemplateClear}
          headerTemplate={headerTemplate}
          itemTemplate={itemTemplate}
          emptyTemplate={emptyTemplate}
          chooseOptions={chooseOptions}
          uploadOptions={uploadOptions}
          cancelOptions={cancelOptions}
        />
      </div>
    </>
  )
}
