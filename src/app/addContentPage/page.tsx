import { Suspense } from 'react'
import AddContentComponent from "./AddContentComponent";

export default function AddContentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddContentComponent /> 
    </Suspense>
  )
}