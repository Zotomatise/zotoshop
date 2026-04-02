"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react"

export type TestUserType =
  | "standard"
  | "locked_out"
  | "slow"
  | "error"
  | "visual"
  | null

type TestUserContextType = {
  userType: TestUserType
  isSlowUser: boolean
  isErrorUser: boolean
  isVisualUser: boolean
  setUserType: (type: TestUserType) => void
  clearUserType: () => void
  mayFail: <T>(action: () => Promise<T>, probability?: number) => Promise<T>
}

const TestUserContext = createContext<TestUserContextType>({
  userType: null,
  isSlowUser: false,
  isErrorUser: false,
  isVisualUser: false,
  setUserType: () => {},
  clearUserType: () => {},
  mayFail: async (action) => action(),
})

const COOKIE_NAME = "_zoto_test_user"

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, days: number = 7) {
  if (typeof document === "undefined") return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`
}

function removeCookie(name: string) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
}

export function emailToUserType(email: string): TestUserType {
  const map: Record<string, TestUserType> = {
    "standard_user@zotoshop.com": "standard",
    "locked_out_user@zotoshop.com": "locked_out",
    "slow_user@zotoshop.com": "slow",
    "error_user@zotoshop.com": "error",
    "visual_user@zotoshop.com": "visual",
  }
  return map[email.toLowerCase()] || null
}

export function TestUserProvider({ children }: { children: ReactNode }) {
  const [userType, setUserTypeState] = useState<TestUserType>(null)

  // Read cookie on mount
  useEffect(() => {
    const cookie = getCookie(COOKIE_NAME)
    if (cookie) {
      setUserTypeState(cookie as TestUserType)
    }
  }, [])

  // Apply visual bugs attribute on body
  useEffect(() => {
    if (typeof document === "undefined") return
    if (userType === "visual") {
      document.body.setAttribute("data-visual-bugs", "true")
    } else {
      document.body.removeAttribute("data-visual-bugs")
    }
  }, [userType])

  const setUserType = useCallback((type: TestUserType) => {
    setUserTypeState(type)
    if (type) {
      setCookie(COOKIE_NAME, type)
    } else {
      removeCookie(COOKIE_NAME)
    }
  }, [])

  const clearUserType = useCallback(() => {
    setUserTypeState(null)
    removeCookie(COOKIE_NAME)
    document.body.removeAttribute("data-visual-bugs")
  }, [])

  const mayFail = useCallback(
    async <T,>(action: () => Promise<T>, probability: number = 0.4): Promise<T> => {
      if (userType === "error" && Math.random() < probability) {
        throw new Error("Une erreur inattendue s'est produite. Réessayez.")
      }
      return action()
    },
    [userType]
  )

  return (
    <TestUserContext.Provider
      value={{
        userType,
        isSlowUser: userType === "slow",
        isErrorUser: userType === "error",
        isVisualUser: userType === "visual",
        setUserType,
        clearUserType,
        mayFail,
      }}
    >
      {children}
    </TestUserContext.Provider>
  )
}

export const useTestUser = () => useContext(TestUserContext)
