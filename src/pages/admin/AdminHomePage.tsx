import { Link } from "react-router-dom";
import { BookOpen, CalendarCheck, Mail, Users, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { FadeInItem, FadeInStagger } from "@/components/motion/FadeIn";

const ACTIONS = [
  {
    title: "Courses",
    description: "Create, publish, and manage courses on the public site.",
    to: "/courses",
    icon: BookOpen,
  },
  {
    title: "Demo bookings",
    description: "View student demo reservations and update attendance status.",
    to: "/demo-bookings",
    icon: CalendarCheck,
  },
  {
    title: "User access",
    description: "Review accounts, revoke access, and manage portal roles.",
    to: "/users",
    icon: Users,
  },
  {
    title: "Contact messages",
    description: "Read inquiries submitted through the public contact form.",
    to: "/contact",
    icon: Mail,
  },
] as const;

export function AdminHomePage() {
  const { user } = useAuth();
  const firstName = user?.email?.split("@")[0];

  return (
    <FadeInStagger className="space-y-10">
      <FadeInItem>
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-foreground">
            {firstName ? `Welcome, ${firstName}` : "Welcome"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Choose an area to manage. Everything you need to run the academy is
            organized below.
          </p>
        </div>
      </FadeInItem>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ACTIONS.map(({ title, description, to, icon: Icon }) => (
          <FadeInItem key={to}>
            <Link
              to={to}
              className="group flex h-full flex-col rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:border-accent/40 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Icon size={22} />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-foreground">{title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {description}
              </p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                Open
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </FadeInItem>
        ))}
      </div>
    </FadeInStagger>
  );
}
