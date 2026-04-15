import { Link } from "react-router-dom";

const stats = [
  { value: "10K+", label: "Developer Profiles" },
  { value: "25K+", label: "Connections Made" },
  { value: "6K+", label: "Tech Posts Shared" },
  { value: "24/7", label: "Collaboration Flow" },
];

const features = [
  {
    title: "Developer Profiles",
    description:
      "Show your headline, skills, projects, tech stack, and availability in one clean profile.",
  },
  {
    title: "Post And Share",
    description:
      "Publish updates, code snippets, images, and repost useful developer content from your network.",
  },
  {
    title: "Connect Smarter",
    description:
      "Explore developers, send requests, follow people, and build the right collaboration circle.",
  },
  {
    title: "Real-Time Chat",
    description:
      "Chat instantly with accepted connections, see message status, and stay active with live presence.",
  },
];

const steps = [
  {
    number: "01",
    title: "Build Your Profile",
    description: "Add your bio, projects, skills, links, and the tech stack you want to be known for.",
  },
  {
    number: "02",
    title: "Discover Developers",
    description: "Search and explore people by headline, skills, and availability to find your kind of builders.",
  },
  {
    number: "03",
    title: "Connect, Post, And Chat",
    description: "Grow your network, share ideas, and start real conversations around development work.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-dark-900 text-slate-100">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.22),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(165,180,252,0.12),_transparent_28%),linear-gradient(180deg,_rgba(20,20,31,0.96),_rgba(8,8,16,1))]" />
        <div className="absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute right-[-6rem] top-64 h-80 w-80 rounded-full bg-brand-300/10 blur-3xl" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <header className="rounded-3xl border border-dark-500 bg-dark-700/70 px-5 py-4 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold tracking-tight text-white">DevNetwork</p>
                <p className="text-sm text-slate-400">The social platform built for developers</p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="rounded-full border border-dark-400 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-brand-500 hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.35)] transition hover:bg-brand-600"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 pt-14 lg:pt-20">
            <section>
              <div className="mx-auto max-w-4xl text-center">
                <span className="inline-flex rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-300">
                  Build Your Developer Circle
                </span>
                <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
                  One place to show your work, find developers, and start real tech conversations.
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
                  DevNetwork helps developers create strong profiles, share posts, connect with the right people,
                  and chat in real time around projects, learning, and collaboration.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Link
                    to="/signup"
                    className="rounded-2xl bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(99,102,241,0.25)] transition hover:bg-brand-600"
                  >
                    Create Your Account
                  </Link>
                  <Link
                    to="/login"
                    className="rounded-2xl border border-dark-400 bg-dark-700/60 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-brand-500 hover:text-white"
                  >
                    Explore Your Network
                  </Link>
                </div>
              </div>

              <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {features.map((feature, index) => (
                  <article
                    key={feature.title}
                    className="rounded-[1.75rem] border border-dark-500 bg-dark-700/75 p-6 shadow-[0_16px_40px_rgba(8,8,16,0.24)] backdrop-blur"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-500/15 text-sm font-semibold text-brand-300">
                        0{index + 1}
                      </span>
                      <h2 className="text-lg font-semibold text-white">{feature.title}</h2>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-400">{feature.description}</p>
                  </article>
                ))}
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-dark-500 bg-dark-700/55 p-5 text-center backdrop-blur">
                    <p className="text-3xl font-semibold text-brand-300">{item.value}</p>
                    <p className="mt-2 text-sm text-slate-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-24">
              <div className="text-center">
                <h2 className="text-4xl font-semibold tracking-tight text-white">
                  How <span className="text-brand-300">DevNetwork</span> Works
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
                  A simple flow for developers who want to present themselves well, build meaningful connections,
                  and collaborate faster.
                </p>
              </div>

              <div className="mt-12 grid gap-6 lg:grid-cols-3">
                {steps.map((step) => (
                  <article
                    key={step.number}
                    className="rounded-[2rem] border border-dark-500 bg-dark-700/75 p-8 shadow-[0_16px_40px_rgba(8,8,16,0.28)] backdrop-blur"
                  >
                    <p className="text-5xl font-semibold leading-none text-brand-500">{step.number}</p>
                    <h3 className="mt-8 text-2xl font-semibold text-white">{step.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-slate-400">{step.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-24 rounded-[2rem] border border-dark-500 bg-gradient-to-r from-dark-700 via-dark-700 to-dark-800 px-6 py-10 text-center shadow-[0_18px_50px_rgba(8,8,16,0.32)] sm:px-10">
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                Start building your developer presence today.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
                Create your profile, share what you know, find other developers, and grow a network that is built for real work.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  to="/signup"
                  className="rounded-2xl bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Join DevNetwork
                </Link>
                <Link
                  to="/login"
                  className="rounded-2xl border border-dark-400 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-brand-500 hover:text-white"
                >
                  Already have an account?
                </Link>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
