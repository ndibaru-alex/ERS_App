import React, { useState} from 'react'
import { Search } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { toast } from 'sonner'

export const HomeSearch: any = () => {
  const [searchTerm, setSearchTerm] = useState<string>('')

  const handleTextSearch = (e: any) => {
    e.preventDefault()

    if (!searchTerm) {
      toast.error('Please enter search term')
      return
    }

    // plain React redirect
    const encoded = encodeURIComponent(searchTerm)
    window.location.href = `/home/MobileSearch?search=${encoded}`
  }

  return (
    <form onSubmit={handleTextSearch}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-5 h-5" />
        <Input
          type="text"
          placeholder="Please Enter Your Mobile Number "
          value={searchTerm}
          onChange={(e:any) => setSearchTerm(e.target.value)}
          className=" py-6 w-full text-center rounded-full border-gray-300 bg-white/95 backdrop-blur-sm"
        />
        <Button type="submit" className="absolute right-2 rounded-full text-blue-300">
          Search
        </Button>
      </div>
    </form>
  )
}
