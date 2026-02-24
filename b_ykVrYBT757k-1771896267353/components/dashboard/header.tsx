import { Bell, ChevronDown, LogOut, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { supabase } from "@/lib/supabase"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

interface HeaderProps {
  title: string
  subtitle?: string
}

interface Notification {
  id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export function DashboardHeader({ title, subtitle }: HeaderProps) {
  const { user, signOut } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fullName = user?.user_metadata?.full_name || "Admin User"
  const agencyName = user?.user_metadata?.agency_name || "Agency Admin"
  const initials = fullName
    .split(" ")
    .map((p: string) => p[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('agency_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.is_read).length)
      }
    }

    fetchNotifications()

    // Subscribe to new notifications
    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `agency_id=eq.${user.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev].slice(0, 10))
        setUnreadCount(prev => prev + 1)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('agency_id', user?.id)
      .eq('is_read', false)

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-card-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
              aria-label="View notifications"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-0 text-xs text-primary hover:bg-transparent">
                  Mark all as read
                </Button>
              )}
            </div>
            <ScrollArea className="h-80">
              {notifications.length > 0 ? (
                <div className="flex flex-col">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex flex-col gap-1 p-4 border-b border-border last:border-0 transition-colors hover:bg-accent/50 ${!n.is_read ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold">{n.title}</span>
                        {!n.is_read && (
                          <button onClick={() => markAsRead(n.id)} className="text-primary hover:text-primary/80">
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 p-4 text-center">
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div className="h-8 w-px bg-border" />

        {/* User profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent outline-none">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage src="" alt={fullName} />
                <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-card-foreground">{fullName}</p>
                <p className="text-[11px] text-muted-foreground">{agencyName}</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
