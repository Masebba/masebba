import React, { useEffect, useMemo, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  MenuIcon,
  XIcon,
  MoonIcon,
  SunIcon,
  GithubIcon,
  TwitterIcon,
  LinkedinIcon,
  DownloadIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ArrowUpIcon,
  GlobeIcon,
  YoutubeIcon,
  InstagramIcon,
  FacebookIcon,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useSiteSettings } from "../../lib/hooks/useSiteSettings";
import { useSocialLinks } from "../../lib/hooks/useSocialLinks";
import { Button } from "../ui/Button";

function getSocialIcon(platform: string) {
  const key = platform.toLowerCase();
  if (key.includes("github")) return GithubIcon;
  if (key.includes("twitter") || key.includes("x")) return TwitterIcon;
  if (key.includes("linkedin")) return LinkedinIcon;
  if (key.includes("instagram")) return InstagramIcon;
  if (key.includes("facebook")) return FacebookIcon;
  if (key.includes("youtube")) return YoutubeIcon;
  return GlobeIcon;
}

export function PublicLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const { settings } = useSiteSettings();
  const { links: socialLinks } = useSocialLinks(true);

  useEffect(() => {
    document.title = settings.siteName || "Masebba";
    const existing =
      document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const href = settings.faviconUrl || "/favicon.svg";
    if (existing) {
      existing.href = href;
    } else {
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = href;
      document.head.appendChild(link);
    }
  }, [settings.siteName, settings.faviconUrl]);

  const navLinks = useMemo(
    () => [
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
      { name: "Portfolio", path: "/portfolio" },
      { name: "Blog", path: "/blog" },
      { name: "Contact", path: "/contact" },
    ],
    [],
  );

  const isActive = (path: string) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cvUrl = settings.resumeUrl || "";
  const headerButtonHref = cvUrl || "/contact";
  const headerButtonLabel = "Download CV";
  const Logo = settings.logoUrl ? (
    <img
      src={settings.logoUrl}
      alt={"Masebba"}
      className="h-8 w-auto object-cover bg-transparent"
    />
  ) : (
    <span className="text-xl font-bold text-main tracking-tight">
      {settings.siteName || "Masebba"}
      <span className="text-primary">.</span>
    </span>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-3">
                {Logo}
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${isActive(link.path) ? "text-primary" : "text-muted"}`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="w-px h-4 bg-border mx-1"></div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-surface text-muted hover:text-main transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "warm" ? (
                  <MoonIcon className="w-5 h-5" />
                ) : (
                  <SunIcon className="w-5 h-5" />
                )}
              </button>
              <a
                href={headerButtonHref}
                target={cvUrl ? "_blank" : undefined}
                rel="noreferrer"
                download={Boolean(cvUrl)}
              >
                <Button size="sm" className="gap-2">
                  <DownloadIcon className="w-4 h-4" />
                  {headerButtonLabel}
                </Button>
              </a>
            </nav>

            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-surface text-muted hover:text-main transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "warm" ? (
                  <MoonIcon className="w-5 h-5" />
                ) : (
                  <SunIcon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-main"
              >
                {isMobileMenuOpen ? (
                  <XIcon className="w-6 h-6" />
                ) : (
                  <MenuIcon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="space-y-1 px-4 pb-3 pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block rounded-md px-3 py-2 text-base font-medium ${isActive(link.path) ? "bg-surface text-primary" : "text-muted hover:bg-surface hover:text-main"}`}
                >
                  {link.name}
                </Link>
              ))}
              <a
                href={headerButtonHref}
                target={cvUrl ? "_blank" : undefined}
                rel="noreferrer"
                download={Boolean(cvUrl)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <DownloadIcon className="w-4 h-4" />
                {headerButtonLabel}
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center text-center items-center">
            <div className="lg:col-span-1 ">
              <Link to="/" className="flex mb-4 text-center justify-center ">
                {Logo}
              </Link>
              <p className="text-sm text-muted leading-relaxed mb-6">
                {settings.siteDescription ||
                  "Web and Mobile Application Developer. Leave the Designing and Development to me."}
              </p>
              <div className="flex gap-3 flex-wrap text-center justify-center ">
                {socialLinks.slice(0, 4).map((link) => {
                  const Icon = getSocialIcon(link.platform);
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-colors"
                      aria-label={link.platform}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

        
            <div>
              <h4 className="text-sm font-bold text-main uppercase tracking-wider mb-4">
                Services
              </h4>
              <ul className="space-y-3">
                <li>
                  <span className="text-sm text-muted">Web Development</span>
                </li>
                <li>
                  <span className="text-sm text-muted">App Development</span>
                </li>
                <li>
                  <span className="text-sm text-muted">Graphic Design</span>
                </li>
                <li>
                  <span className="text-sm text-muted">
                    Backend Development
                  </span>
                </li>
                <li>
                  <span className="text-sm text-muted">Cloud Solutions</span>
                </li>
                <li>
                  <span className="text-sm text-muted">IT Consulting</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-main uppercase tracking-wider mb-4">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-main uppercase tracking-wider mb-4">
                Get In Touch
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MailIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="text-sm text-muted hover:text-primary transition-colors"
                  >
                    {settings.contactEmail}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <PhoneIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-muted">
                    {settings.contactPhone}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPinIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-muted">
                    {settings.contactLocation}
                  </span>
                </li>
              </ul>
              <div className="mt-6">
                <a
                  href={headerButtonHref}
                  target={cvUrl ? "_blank" : undefined}
                  rel="noreferrer"
                  download={Boolean(cvUrl)}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 w-full justify-center"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    Download CV
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted">
              © {new Date().getFullYear()}{" "}
              {settings.siteName || "Masebba A. Nasser"}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                to="/about"
                className="text-xs text-muted hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/about"
                className="text-xs text-muted hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
              <button
                onClick={scrollToTop}
                className="w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center hover:opacity-80 transition-opacity"
                aria-label="Scroll to top"
              >
                <ArrowUpIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
