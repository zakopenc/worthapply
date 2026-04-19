import type { Metadata } from 'next';
import SupportClient from './SupportClient';

export const metadata: Metadata = {
  title: 'Help & Support — WorthApply',
  description: 'Report issues and attach screenshots',
};

export default function SupportPage() {
  return <SupportClient />;
}
