
import { Breadcrumbs } from './Breadcrumbs'
import { Plus, Upload } from 'lucide-react'

export default function Headbar() {
  return (
    <div className="border-b border-border bg-card/30">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="space-y-1">
          <Breadcrumbs />
        </div>
        <div className="flex items-center gap-2">
          {/* <button className="px-3 py-2 rounded-md bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition"> 
            <Plus className="w-4 h-4 inline-block mr-1"/> Aksi
          </button>
          <button className="px-3 py-2 rounded-md border border-border text-sm hover:bg-muted transition">
            <Upload className="w-4 h-4 inline-block mr-1"/> Import
          </button> */}
        </div>
      </div>
    </div>
  )
}
