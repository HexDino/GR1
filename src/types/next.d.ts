import { ReactNode } from 'react'
import { NextApiRequest } from 'next'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}

declare module 'next' {
  interface NextApiRequest {
    user?: {
      id: string;
      email: string;
      role: string;
      name: string;
      avatar: string;
      permissions: string[];
    };
  }
}

export interface LayoutProps {
  children: ReactNode
} 