"use client"
import {
  Badge,
  Card,
  Divider,
  LogoutButton,
  NavigationItem,
} from "@/components/atoms"
import { useMatrixUnreads } from "@/components/providers/Matrix/MatrixProvider"
import { usePathname } from "next/navigation"

const navigationItems = [
  {
    label: "Orders",
    href: "/user/orders",
  },
  {
    label: "Messages",
    href: "/user/messages",
  },
  {
    label: "Returns",
    href: "/user/returns",
  },
  {
    label: "Addresses",
    href: "/user/addresses",
  },
  {
    label: "Reviews",
    href: "/user/reviews",
  },
  {
    label: "Wishlist",
    href: "/user/wishlist",
  },
]

export const UserNavigation = () => {
  const unreads = useMatrixUnreads()
  const path = usePathname()

  return (
    <Card className="h-min">
      {navigationItems.map((item) => (
        <NavigationItem
          key={item.label}
          href={item.href}
          active={path === item.href}
          className="relative"
        >
          {item.label}
          {item.label === "Messages" && unreads > 0 && (
            <Badge className="absolute top-3 left-24 w-4 h-4 p-0">
              {unreads}
            </Badge>
          )}
        </NavigationItem>
      ))}
      <Divider className="my-2" />
      <NavigationItem
        href={"/user/settings"}
        active={path === "/user/settings"}
      >
        Settings
      </NavigationItem>
      <LogoutButton className="w-full text-left" />
    </Card>
  )
}
