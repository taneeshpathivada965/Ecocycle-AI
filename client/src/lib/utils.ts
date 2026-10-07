import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RouteDecision, ConditionGrade } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: 'INR' | 'USD' = 'INR'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDateTime(isoString?: string | null): string {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return isoString;
  }
}

export function getRouteBadge(route: RouteDecision) {
  switch (route) {
    case 'RESALE':
      return {
        bg: 'bg-emerald-500/15',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        label: 'Resale'
      };
    case 'REPAIR':
      return {
        bg: 'bg-amber-500/15',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        label: 'Repair'
      };
    case 'RECYCLE':
      return {
        bg: 'bg-cyan-500/15',
        text: 'text-cyan-400',
        border: 'border-cyan-500/30',
        label: 'Recycle'
      };
  }
}

export function getConditionGradeBadge(grade: ConditionGrade) {
  switch (grade) {
    case 'A':
      return { bg: 'bg-emerald-500/20', text: 'text-emerald-300', label: 'Grade A (Mint)' };
    case 'B':
      return { bg: 'bg-teal-500/20', text: 'text-teal-300', label: 'Grade B (Good)' };
    case 'C':
      return { bg: 'bg-amber-500/20', text: 'text-amber-300', label: 'Grade C (Fair)' };
    case 'BROKEN':
    case 'DEAD':
      return { bg: 'bg-red-500/20', text: 'text-red-300', label: 'Broken / Scrap' };
    default:
      return { bg: 'bg-slate-800', text: 'text-slate-300', label: 'Unknown' };
  }
}
