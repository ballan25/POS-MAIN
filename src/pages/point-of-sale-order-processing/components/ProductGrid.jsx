import React from 'react';
import Button from '../../../components/ui/Button';

const ProductGrid = ({ products, onAddToCart, onProductSelect }) => {
  const formatPrice = (price) => {
    return `KES ${price?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  // Function to get product image based on product name/id
  const getProductImage = (product) => {
    const productName = product?.name?.toLowerCase() || '';
    
    // Map specific products to their images using correct public folder path
    // Using encodeURIComponent to properly handle spaces in URLs
    if (productName.includes('blueberry milkshake')) {
      return '/assets/images/blueberry%20milkshake.jpg';
    }
    if (productName.includes('strawberry') && productName.includes('milk tea')) {
      return '/assets/images/strawberry%20milk%20tea.jpg';
    }
    if (productName.includes('taro milk tea')) {
      return '/assets/images/taro%20milk%20tea.jpg';
    }
    
    // Return null for no image
    return null;
  };

  // Check if product has a specific image
  const hasSpecificImage = (product) => {
    const productName = product?.name?.toLowerCase() || '';
    return productName.includes('blueberry milkshake') || 
           (productName.includes('strawberry') && productName.includes('milk tea')) ||
           productName.includes('taro milk tea');
  };

  // Fixed green class with proper padding and sizing
  const greenClass = "border-green-700 bg-green-700 text-white font-semibold rounded transition-colors hover:bg-green-800 hover:border-green-800 px-4 py-3";

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {products?.map((product) => (
          <div
            key={product?.id}
            className="bg-card border border-border rounded-lg shadow-elevation-1 transition-all duration-200 hover:shadow-elevation-2 flex flex-col justify-between overflow-hidden min-h-[280px] w-full"
          >
            {/* Product Image */}
            <div className="w-full h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
              {hasSpecificImage(product) ? (
                <img
                  src={getProductImage(product)}
                  alt={product?.name}
                  className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                  onError={(e) => {
                    // Hide the image and show placeholder on error
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              
              {/* Placeholder - shown when no image or image fails to load */}
              <div 
                className={`w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${hasSpecificImage(product) ? 'hidden' : 'flex'}`}
                style={{ display: hasSpecificImage(product) ? 'none' : 'flex' }}
              >
                <div className="text-center text-gray-500">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-300 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xs">No Image</span>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex-1 flex flex-col p-6">
              <div className="flex-1">
                <h3 className="font-semibold text-base text-foreground mb-3 text-center break-words">
                  {product?.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-3 text-center break-words">
                  {product?.description}
                </p>
                {product?.sizes && (
                  <div className="mb-3 w-full text-xs text-muted-foreground text-center">
                    {product.sizes.map(size => (
                      <div key={size.id} className="mb-1">
                        {size.name}: {formatPrice(size.price)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-auto">
                {product?.sizes ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onProductSelect(product)}
                    iconName="Plus"
                    iconPosition="left"
                    iconSize={14}
                    className={`w-full mt-2 border-2 ${greenClass} min-h-[44px] flex items-center justify-center text-sm`}
                  >
                    Select Size
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onAddToCart(product)}
                    iconName="Plus"
                    iconPosition="left"
                    iconSize={14}
                    className={`w-full mt-2 border-2 ${greenClass} min-h-[44px] flex items-center justify-center text-sm`}
                  >
                    Add to Cart
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
