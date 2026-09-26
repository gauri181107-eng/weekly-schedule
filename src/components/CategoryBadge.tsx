import React from 'react';
import {
  BookOpen,
  Code,
  GraduationCap,
  Activity,
  User,
  RotateCcw,
  Tag,
  Briefcase,
  Heart,
  Coffee,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Category } from '../types';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
  onClick?: () => void;
}

export const CategoryIcon: React.FC<{ iconName: string; className?: string }> = ({
  iconName,
  className = 'w-3.5 h-3.5',
}) => {
  switch (iconName?.toLowerCase()) {
    case 'bookopen':
    case 'study':
      return <BookOpen className={className} />;
    case 'code':
    case 'coding':
      return <Code className={className} />;
    case 'graduationcap':
    case 'college':
      return <GraduationCap className={className} />;
    case 'activity':
    case 'health':
      return <Activity className={className} />;
    case 'user':
    case 'personal':
      return <User className={className} />;
    case 'rotateccw':
    case 'revision':
      return <RotateCcw className={className} />;
    case 'briefcase':
      return <Briefcase className={className} />;
    case 'heart':
      return <Heart className={className} />;
    case 'coffee':
      return <Coffee className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    default:
      return <Layers className={className} />;
  }
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  showIcon = true,
  className = '',
  onClick,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-medium px-3 py-1.5 gap-2',
  }[size];

  const clickableClasses = onClick
    ? 'cursor-pointer hover:opacity-90 active:scale-95 transition-all'
    : '';

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center rounded-md border font-medium transition-colors ${category.bgLight} ${category.textLight} ${category.borderLight} ${category.bgDark} ${category.textDark} ${category.borderDark} ${sizeClasses} ${clickableClasses} ${className}`}
    >
      {showIcon && <CategoryIcon iconName={category.iconName} className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{category.name}</span>
    </span>
  );
};
