import { Square } from 'ldrs/react'

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Square
        size="35"
        stroke="5"
        strokeLength="0.25"
        bgOpacity="0.1"
        speed="1.2"
        color="black" 
      />
    </div>
  )
}
