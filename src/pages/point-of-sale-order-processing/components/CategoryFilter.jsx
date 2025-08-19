import React from 'react';
import Button from '../../../components/ui/Button';

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="bg-card border-b border-border p-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange('all')}
          className="touch-feedback"
        >
          All Items
        </Button>
        {categories?.map((category) => (
          <Button
            key={category?.id}
            variant={activeCategory === category?.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(category?.id)}
            className="touch-feedback"
          >
            {category?.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;