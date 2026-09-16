import {
  Calendar,
  CalendarDays,
  LayoutDashboard,
  Bell,
  Heart,
  Bot,
  Settings,
} from "lucide-react";

export const primaryNavItems = [
  {
    name: "Dashboard",
    link: "/loggedin",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    name: "Today",
    link: "/loggedin/today",
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    name: "Upcoming",
    link: "/loggedin/upcoming",
    icon: <CalendarDays className="h-4 w-4" />,
  },
  {
    name: "Reminders",
    link: "/loggedin/reminders",
    icon: <Bell className="h-4 w-4" />,
  },
  {
    name: "Wellness",
    link: "/loggedin/wellness",
    icon: <Heart className="h-4 w-4" />,
  },
  {
    name: "Virtual Me",
    link: "/loggedin/virtual-me",
    icon: <Bot className="h-4 w-4" />,
    isSection: true,
  },
  {
    name: "Settings",
    link: "/loggedin/settings",
    icon: <Settings className="h-4 w-4" />,
  },
];
