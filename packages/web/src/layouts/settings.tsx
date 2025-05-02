// import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <>
      <main className="container mx-auto flex flex-row max-w-full px-6 flex-grow pt-4">
      <aside className="min-w-64">
        <nav className="space-y-4">
          <Link to="/settings" data-nav data-nav-group="default" className="block">General</Link>
          <Link to="/settings" data-nav data-nav-group="default" className="block">Account</Link>
          <Link to="/settings" data-nav data-nav-group="default" className="block">Video / Audio</Link>
          <Link to="/settings" data-nav data-nav-group="default" className="block">Streaming</Link>
          <Link to="/settings" data-nav data-nav-group="default" className="block">Info</Link>
        </nav>
      </aside>


      <section className="flex flex-col flex-grow px-6">
          {children}
      </section>
      </main>
    </>
  );
}
