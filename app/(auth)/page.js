"use client"
import React, { useContext, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { signIn, useSession } from 'next-auth/react'
import { Checkbox } from "primereact/checkbox"
import { Button } from "primereact/button"
import { Password } from "primereact/password"
import { LayoutContext } from "@/layout/context/layoutcontext"
import { InputText } from "primereact/inputtext"
import { classNames } from "primereact/utils"
import { Messages } from 'primereact/messages';


export default function AuthLogin() {
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [checked, setChecked] = useState(false)
  const { layoutConfig } = useContext(LayoutContext)
  const errMsg = useRef(null)
  const router = useRouter()
  const { data: session, status } = useSession()
  if (status === "authenticated") {
    router.push('/employee/profile/' + session?.user?.user.employee)
  }
  const searchParams = useSearchParams()
  let callbackUrl = searchParams.get('callbackUrl') || '/employee/profile/' + session?.user?.user.employee
  
  const containerClassName = classNames(
    "surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden",
    { "p-input-filled": layoutConfig.inputStyle === "filled" }
  )

  const onSubmit = async e => {
    e.preventDefault()
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: email,
        password: password,
        callbackUrl,
      })

      if (res?.error) {
        errMsg.current.replace([
          { severity: 'error', summary: 'Error', detail: 'Invalid Email or Password', sticky: true, closable: true }
        ]);
      }
    } catch (error) {
      
    }
  }

  return (
    <div className={containerClassName}>
      <div className="flex flex-column align-items-center justify-content-center">
        <Messages ref={errMsg} />
        <img
          src={`/layout/images/logo-${
            layoutConfig.colorScheme === "light" ? "dark" : "white"
          }.svg`}
          alt="Sakai logo"
          className="mb-5 w-6rem flex-shrink-0"
        />
        <div
          style={{
            borderRadius: "56px",
            padding: "0.3rem",
            background:
              "linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)"
          }}
        >
          <div
            className="w-full surface-card py-8 px-5 sm:px-8"
            style={{ borderRadius: "53px" }}
          >
            <div className="text-center mb-5">
              {/* <img
                src="/demo/images/login/avatar.png"
                alt="Image"
                height="50"
                className="mb-3"
              /> */}
              <div className="text-900 text-3xl font-medium mb-3">
                <b>Work Portal</b>
              </div>
              <span className="text-600 font-medium">Sign in to start your Career</span>
            </div>
            <form onSubmit={onSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-900 text-xl font-medium mb-2"
                >
                  Email
                </label>
                <InputText
                  id="email"
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full md:w-30rem mb-5"
                  style={{ padding: "1rem" }}
                />

                <label
                  htmlFor="password"
                  className="block text-900 font-medium text-xl mb-2"
                >
                  Password
                </label>
                <Password
                  inputId="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  toggleMask
                  className="w-full mb-5"
                  inputClassName="w-full p-3 md:w-30rem"
                  feedback={false}
                ></Password>

                <div className="flex align-items-center justify-content-between mb-5 gap-5">
                  <div className="flex align-items-center">
                    <Checkbox
                      inputId="rememberme"
                      checked={checked}
                      onChange={e => setChecked(e.checked ?? false)}
                      className="mr-2"
                    ></Checkbox>
                    <label htmlFor="rememberme">Remember me</label>
                  </div>
                  <a
                    className="font-medium no-underline ml-2 text-right cursor-pointer"
                    style={{ color: "var(--primary-color)" }}
                  >
                    Forgot password?
                  </a>
                </div>
                <Button
                  label="Sign In"
                  type="submit"
                  className="w-full p-3 text-xl"
                ></Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
