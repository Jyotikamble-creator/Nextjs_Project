import Link from "next/link";
import { Video, Mail, Phone, MapPin } from "lucide-react";

const footerLinkClasses = "hover:text-purple-400 transition-colors";
const socialLinkClasses = "text-gray-400 hover:text-purple-400 transition-colors text-sm";

const footerSections = [
  {
    title: "Explore",
    links: [
      { href: "/", text: "Home", isNextLink: true },
      { href: "/videos", text: "Videos" },
      { href: "/categories", text: "Categories" },
      { href: "/trending", text: "Trending" }
    ]
  },
  {
    title: "Account",
    links: [
      { href: "/login", text: "Login" },
      { href: "/register", text: "Register" },
      { href: "/dashboard", text: "Dashboard" },
      { href: "/profile", text: "Profile" }
    ]
  },
  {
    title: "Support",
    links: [
      { href: "/help", text: "Help Center" },
      { href: "/contact", text: "Contact Us" },
      { href: "/privacy", text: "Privacy Policy" },
      { href: "/terms", text: "Terms of Service" }
    ]
  }
];

const socialLinks = [
  { href: "#", text: "Facebook" },
  { href: "#", text: "Twitter" },
  { href: "#", text: "Instagram" },
  { href: "#", text: "YouTube" }
];

export function Footer() {
  return (
    <footer className="bg-slate-900/50 backdrop-blur-lg border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-linear-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Video className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">VidoraFrameForge</h3>
            </div>
            <p className="text-gray-400 mb-4">
              The ultimate platform for creators to share their stories and connect with audiences worldwide.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Phone className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <MapPin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation Sections */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-2 text-gray-400">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.isNextLink ? (
                      <Link href={link.href} className={footerLinkClasses}>
                        {link.text}
                      </Link>
                    ) : (
                      <a href={link.href} className={footerLinkClasses}>
                        {link.text}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; 2024 VidoraFrameForge. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {socialLinks.map((link, index) => (
                <a key={index} href={link.href} className={socialLinkClasses}>
                  {link.text}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}