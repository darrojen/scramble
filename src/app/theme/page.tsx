'use client';

import * as React from 'react';
import { Moon, Sun, Monitor, Palette, Cpu, Circle } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // 👇 Ensure theme applies instantly without reload
  React.useEffect(() => {
    if (!mounted || !theme) return;

    const root = document.documentElement;

    // Remove any previous theme classes
    root.classList.remove('light', 'dark', 'system', 'custom', 'tech');

    // Apply the active theme as a class to <html>
    root.classList.add(theme);
  }, [theme, mounted]);

  const renderIcon = () => {
    if (!mounted) return <Circle className="h-[1.2rem] w-[1.2rem]" />;

    switch (theme) {
      case 'light':
        return <Sun className="h-[1.2rem] w-[1.2rem]" />;
      case 'dark':
        return <Moon className="h-[1.2rem] w-[1.2rem]" />;
      case 'system':
        return <Monitor className="h-[1.2rem] w-[1.2rem]" />;
      case 'custom':
        return <Palette className="h-[1.2rem] w-[1.2rem]" />;
      case 'tech':
        return <Cpu className="h-[1.2rem] w-[1.2rem]" />;
      default:
        return <Circle className="h-[1.2rem] w-[1.2rem]" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="top-[20px] cursor-pointer right-[20px] absolute"
        >
          {renderIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('custom')}>Custom</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('tech')}>Tech</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
