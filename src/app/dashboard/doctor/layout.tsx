"use client";

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { DoctorOnly } from '@/components/PermissionGate';
import Image from 'next/image';
import { BellIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 