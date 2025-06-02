/* components/Header.tsx */
import React from 'react';
import { Link,NavLink } from 'react-router-dom';
import logoSrc from '/somqat.jpeg';
import { Button } from '../ui/button';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from '../ui/sheet';
import { CloudSnowIcon, Menu } from 'lucide-react';



export interface NavItem {
  label: string;
  to: string;
}

const navItems: NavItem[] = [
  { label: 'Home', to: '/home' },
  { label: 'Apply', to: '/apply' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export const PublicHeader: React.FC = () => {
  return (
    <header className="fixed top-0 w-full bg-white shadow-md z-50 border-b">
      <div className="max-w-7xl mx-auto flex items-center h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img
            src={logoSrc}
            alt="Employment Application System"
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex justify-between mx-auto px-4 items-center space-x-6">
          {navItems.map((item) => (
            
            <NavLink
  to={item.to}
  end                       // ensures exact matching
  className={({ isActive }) =>
    isActive
      ? 'text-red-800 font-medium'
      : 'text-gray-700 hover:text-blue-600 font-medium'
  }
>
  {item.label}
    </NavLink>
          ))}
        </nav>

        {/* Login Button (desktop) */}
        <div className="hidden lg:block">
          <Link to="/login">
            <Button variant="outline" className="rounded-3xl">
              Login
            </Button>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="lg:hidden ml-auto">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="p-2">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <Link to="/">
                    <img
                      src={logoSrc}
                      alt="Employment Application System"
                      className="h-8 w-auto object-contain"
                    />
                  </Link>
                  <SheetClose asChild>
                    <Button variant="outline" className="p-2">
                      <CloudSnowIcon/>
                    </Button>
                  </SheetClose>
                </div>
                <SheetTitle className="mt-4 mb-1">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-3 ml-5">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-gray-800 hover:text-blue-600 font-medium"
                    onClick={() => {
                      // sheet will auto-close because of SheetClose wrapping trigger
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link to="/login" className="mt-4 " >
                  <Button variant="outline" className="w-auto rounded-3xl">
                    Login
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
