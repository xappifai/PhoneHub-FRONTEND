import React from 'react'
import Link from 'next/link'
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VH</span>
              </div>
              <span className="text-xl font-bold">VendorHub</span>
            </div>
            <p className="text-gray-400 text-sm">
              Empowering Pakistani vendors with digital solutions for electronics business growth.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-primary cursor-pointer" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-primary cursor-pointer" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-primary cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-400 hover:text-primary">About Us</Link></li>
              <li><Link href="/features" className="text-gray-400 hover:text-primary">Features</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-primary">Pricing</Link></li>
              <li><Link href="/help" className="text-gray-400 hover:text-primary">Help Center</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-primary">Contact</Link></li>
            </ul>
          </div>

          {/* For Vendors */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">For Vendors</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/register" className="text-gray-400 hover:text-primary">Get Started</Link></li>
              <li><Link href="/vendor/dashboard" className="text-gray-400 hover:text-primary">Dashboard</Link></li>
              <li><Link href="/vendor/dashboard/inventory" className="text-gray-400 hover:text-primary">Inventory</Link></li>
              <li><Link href="/vendor/dashboard/ledger" className="text-gray-400 hover:text-primary">Ledger</Link></li>
              <li><Link href="/support" className="text-gray-400 hover:text-primary">Support</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-gray-400">+92-21-1234-5678</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-gray-400">support@vendorhub.pk</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-gray-400">Karachi, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2024 VendorHub Pakistan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}