"use client"
import { useState } from "react"
import ProcurementSearch from "./procurement-search"


export default function Layout() {
  const [showInner, setShowInner] = useState(false)

  const handleToggle = () => {
    setShowInner((prev) => !prev)
  }

  return (
    <>
      <ProcurementSearch onSend={handleToggle} />
    </>
  )
}
