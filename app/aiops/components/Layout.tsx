"use client"
import { useState } from "react"
import TalentAcquisition from "./AiOpsChat"


export default function Layout() {
  const [showInner, setShowInner] = useState(false)

  const handleToggle = () => {
    setShowInner((prev) => !prev)
  }

  return (
    <>
      <TalentAcquisition onSend={handleToggle} />
    </>
  )
}
