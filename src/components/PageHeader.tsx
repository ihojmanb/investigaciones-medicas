import { useState, useEffect, ReactNode, useRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
  backButton?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
  className?: string
}

export default function PageHeader({ 
  title, 
  subtitle, 
  action, 
  backButton, 
  className 
}: PageHeaderProps) {
  const [isSticky, setIsSticky] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      // Find the main scrolling container
      const mainElement = document.querySelector('main')
      if (mainElement && headerRef.current) {
        const scrollTop = mainElement.scrollTop
        setIsSticky(scrollTop > 80)
      }
    }

    const mainElement = document.querySelector('main')
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll, { passive: true })
      return () => mainElement.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      {/* Original Header */}
      <div ref={headerRef} className={cn("pb-4", className)}>
        <div className="space-y-4 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {backButton && (
                <Button 
                  variant="ghost" 
                  onClick={backButton.onClick}
                  className="mb-2 p-2 -ml-2"
                >
                  {backButton.icon}
                  <span className="ml-2">{backButton.label}</span>
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 break-words">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-gray-600 mt-1 break-words">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {action && (
            <div className="flex justify-end">
              <Button onClick={action.onClick}>
                {action.icon}
                <span className="ml-2">{action.label}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Header - positioned below mobile header */}
      <div className={cn(
        "md:hidden fixed top-16 left-0 right-0 bg-white border-b border-gray-200 z-30 transition-all duration-300 ease-out",
        isSticky ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      )}>
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {backButton && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={backButton.onClick}
                className="p-1 -ml-1"
              >
                {backButton.icon}
              </Button>
            )}
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {title}
            </h1>
          </div>
          
          {action && (
            <Button 
              onClick={action.onClick} 
              size="sm"
              className="flex-shrink-0"
            >
              {action.icon}
              <span className="ml-1">{action.label}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Spacer for sticky header when active */}
      <div className={cn(
        "md:hidden transition-all duration-300",
        isSticky ? "h-14" : "h-0"
      )} />
    </>
  )
}