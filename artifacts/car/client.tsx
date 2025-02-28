import { Artifact } from "@/components/create-artifact";
import { toast } from "sonner";
import { CopyIcon, RedoIcon, UndoIcon } from '@/components/icons';
import { useState, useEffect, useCallback } from 'react';
import { ExternalLink } from 'lucide-react';

// Define missing icons inline
const ChevronLeft = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRight = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

// Enhanced useWindowSize hook with responsive breakpoints
const useWindowSize = () => {
  // Default to desktop values for SSR
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    isMobile: false,      // < 480px
    isTablet: false,      // 481px - 768px
    isLaptop: false,      // 769px - 1024px
    isDesktop: false,     // > 1025px
  });

  useEffect(() => {
    // Only execute on the client
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({
        width,
        height,
        isMobile: width <= 480,
        isTablet: width > 480 && width <= 768,
        isLaptop: width > 768 && width <= 1024,
        isDesktop: width > 1024,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call initially

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

interface CarArtifactMetadata {
  found: boolean;
  cars?: {
    id: number;
    name: string;
    price: string;
    transmission: string;
    horsepower: string;
    year: string;
    mileage: string;
    photo_url?: string;
    damage: string;
    fuel: string;
    cubic_capacity: string;
    url: string;
    created_at: string;
    location: string;
    all_photos: string[];
  }[];
  analysis?: {
    value: string;
    age: string;
    condition: string;
    engine: string;
    savings: number;
  };
  description: string;
  message: string;
  score: number;
}

// Define the expected structure of carData
interface CarResult {
  car: {
    id: number;
    name: string;
    price: string;
    transmission: string;
    horsepower: string;
    year: string;
    mileage: string;
    photo_url?: string;
    damage: string;
    fuel: string;
    cubic_capacity: string;
    url: string;
    created_at: string;
    location: string;
    all_photos: string[];
  };
  analysis?: {
    value: string;
    age: string;
    condition: string;
    engine: string;
    savings: number;
  };
  description: string;
  message: string;
  score: number;
}

const getScoreColor = (score: number) => {
  const normalizedScore = score / 100;
  if (normalizedScore >= 0.95) return "bg-emerald-500/20 text-emerald-700";
  if (normalizedScore >= 0.80) return "bg-blue-500/20 text-blue-700";
  if (normalizedScore >= 0.60) return "bg-yellow-500/20 text-yellow-700";
  if (normalizedScore >= 0.40) return "bg-orange-500/20 text-orange-700";
  return "bg-red-500/20 text-red-700";
};

// Enhanced responsive ImageSlideshow Component
const ImageSlideshow = ({ images }: { images: string[] }) => {
  const { isMobile, isTablet, width } = useWindowSize();
  const isSmallScreen = isMobile || isTablet;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  
  // Use all available images
  const displayImages = images && images.length > 0 ? images : [];

  const handleImageError = (key: string) => {
    setFailedImages(prev => new Set([...prev, key]));
  };

  const openPreview = (index: number) => {
    if (displayImages.length > 0) {
      setPreviewIndex(index);
      setShowPreview(true);
    }
  };

  const nextImage = () => setPreviewIndex((i) => (i + 1) % displayImages.length);
  const prevImage = () => setPreviewIndex((i) => (i - 1 + displayImages.length) % displayImages.length);

  // Handle keyboard navigation for image preview
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setShowPreview(false);
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  }, []);

  // Touch event handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    
    const touchEnd = e.touches[0].clientX;
    const diff = touchStart - touchEnd;
    
    // Minimum distance to be considered a swipe (in pixels)
    const minSwipeDistance = 50;
    
    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swipe left, go to next image
        nextImage();
      } else {
        // Swipe right, go to previous image
        prevImage();
      }
      setTouchStart(null);
    }
  };

  useEffect(() => {
    if (showPreview) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [showPreview, handleKeyPress]);

  // Main container style with responsive adjustments
  const containerStyle = {
    width: '100%',
    position: 'relative' as const,
  };

  // Gallery layout style based on screen size
  const galleryStyle = {
    display: 'flex' as const,
    flexDirection: isSmallScreen ? 'column' as const : 'row' as const,
    gap: '1rem',
    padding: isSmallScreen ? '0.75rem' : '1rem',
    height: isSmallScreen ? 'auto' : '50%',
  };

  // Main image container style 
  const mainImageContainerStyle = {
    width: isSmallScreen ? '100%' : '50%',
    backgroundColor: '#f3f4f6',
    borderRadius: '0.75rem',
    position: 'relative' as const,
  };

  // Main image style with responsive height
  const mainImageStyle = {
    width: '100%',
    height: isSmallScreen ? '15rem' : '25rem',
    objectFit: 'cover' as const,
    borderRadius: '0.75rem',
    cursor: 'pointer',
  };

  // No image placeholder style
  const noImageStyle = {
    width: '100%',
    height: isSmallScreen ? '15rem' : '25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    borderRadius: '0.75rem',
  };

  // Thumbnail grid container style
  const thumbnailGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '0.5rem',
    width: isSmallScreen ? '100%' : '50%',
    height: isSmallScreen ? 'auto' : '25rem',
  };

  // Thumbnail container style
  const thumbnailStyle = {
    height: isSmallScreen ? '10rem' : '12.25rem',
    backgroundColor: '#f3f4f6',
    borderRadius: '0.75rem',
    overflow: 'hidden',
  };

  // Preview modal style
  const previewModalStyle = {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  };

  // Preview image style
  const previewImageStyle = {
    maxHeight: '85vh',
    maxWidth: '90vw',
    objectFit: 'contain' as const,
  };

  // Navigation button base style
  const navButtonBaseStyle = {
    position: 'absolute' as const,
    backgroundColor: 'white',
    borderRadius: '50%',
    padding: isSmallScreen ? '0.5rem' : '0.75rem',
    cursor: 'pointer',
    border: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  };

  // Left arrow button style
  const prevButtonStyle = {
    ...navButtonBaseStyle,
    left: isSmallScreen ? '0.75rem' : '1.5rem',
  };

  // Right arrow button style
  const nextButtonStyle = {
    ...navButtonBaseStyle,
    right: isSmallScreen ? '0.75rem' : '1.5rem',
  };

  return (
    <div style={containerStyle}>
      <div style={galleryStyle}>
        {/* Main large image - left side or top on smaller screens */}
        <div style={mainImageContainerStyle}>
          {displayImages.length > 0 ? (
            <img
              src={displayImages[currentIndex]}
              alt="Main car view"
              onClick={() => openPreview(currentIndex)}
              style={mainImageStyle}
              onError={() => handleImageError(`main-${currentIndex}`)}
            />
          ) : (
            <div style={noImageStyle}>
              No image available
            </div>
          )}
        </div>

        {/* Thumbnail grid - right side or hidden on very small screens */}
        {!isMobile && (
          <div style={thumbnailGridStyle}>
            {[1, 2, 3].map((offset, index) => {
              const imgIndex = (currentIndex + offset) % displayImages.length;
              return (
                <div key={`grid-${offset}`} style={thumbnailStyle}>
                  {displayImages.length > imgIndex ? (
                    <img
                      src={displayImages[imgIndex]}
                      alt={`Car view ${offset}`}
                      onClick={() => openPreview(imgIndex)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        cursor: 'pointer'
                      }}
                      onError={() => handleImageError(`thumb-${offset}`)}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6b7280'
                    }}>
                      No image
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Last image with overlay for additional images */}
            <div style={{ 
              ...thumbnailStyle,
              position: 'relative',
            }}>
              {displayImages.length > 4 ? (
                <>
                  <img
                    src={displayImages[4]}
                    alt="Car view 4"
                    onClick={() => openPreview(4)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'brightness(0.7)',
                      cursor: 'pointer'
                    }}
                    onError={() => handleImageError(`last-4`)}
                  />
                  {displayImages.length > 5 && (
                    <div 
                      onClick={() => openPreview(4)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      +{displayImages.length - 5}
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280'
                }}>
                  No image
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Full screen preview with touch navigation */}
      {showPreview && displayImages.length > 0 && (
        <div 
          onClick={() => setShowPreview(false)}
          style={previewModalStyle}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <div onClick={e => e.stopPropagation()}>
            <img
              src={displayImages[previewIndex]}
              alt="Preview"
              style={previewImageStyle}
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            style={prevButtonStyle}
            aria-label="Previous image"
          >
            <ChevronLeft size={isSmallScreen ? 18 : 24} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            style={nextButtonStyle}
            aria-label="Next image"
          >
            <ChevronRight size={isSmallScreen ? 18 : 24} />
          </button>
        </div>
      )}
    </div>
  );
};

// Add a media query helper for laptops
const useLaptopMediaQuery = () => {
  const [isLaptopExact, setIsLaptopExact] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(min-width: 1000px) and (max-width: 1100px) and (min-height: 800px) and (max-height: 900px)');
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsLaptopExact(e.matches);
    };
    
    handleChange(mediaQuery); // Initial check
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return isLaptopExact;
};

// Responsive CarDetails component
const CarDetails = ({ content }: { content: string }) => {
  const { isMobile, isTablet, isLaptop, width } = useWindowSize();
  const isLaptopExact = useLaptopMediaQuery(); // Use our exact laptop size detector
  const isSmallScreen = isMobile || isTablet;
  
  try {
    if (!content) {
      return (
        <div className="p-4 flex flex-col items-center justify-center h-full">
          <div className="text-center p-6 max-w-md">
            <div className="text-3xl mb-4">🚫</div>
            <h2 className="text-xl font-semibold mb-2 text-red-500">Car Not Found</h2>
            <p className="text-gray-600">
              The requested car could not be found. This may be because:
            </p>
            <ul className="text-gray-600 mt-2 list-disc list-inside">
              <li><strong>Car model/brand was not specified</strong></li>
              <li><strong>Budget information was not provided</strong></li>
              <li><strong>No matching cars exist for the given criteria</strong></li>
            </ul>
            <p className="text-gray-600 mt-2">
              Please ensure you provide both the car model and your budget to get relevant results.
            </p>
          </div>
        </div>
      );
    }
    
    const data = typeof content === 'string' ? JSON.parse(content) : content;
    
    if (!data.found || !data.cars || data.cars.length === 0) {
      return (
        <div className="p-4 flex flex-col items-center justify-center h-full">
          <div className="text-center p-6 max-w-md">
            <div className="text-3xl mb-4">🚗</div>
            <h2 className="text-xl font-semibold mb-2">{data.message || "No cars found"}</h2>
            <p className="text-gray-600">{data.description || "Try adjusting your search parameters."}</p>
          </div>
        </div>
      );
    }

    // Update container style for laptop
    const containerStyle = {
      minHeight: '100vh',
      paddingBottom: isSmallScreen ? '1.5rem' : '3rem',
    };

    // Update car card style to be fully auto-sized for laptop
    const carCardStyle = {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isSmallScreen ? '0.75rem' : '1rem',
      display: 'flex',
      flexDirection: 'column' as 'column',
      height: isLaptopExact ? 'auto' : (isSmallScreen ? 'auto' : 'calc(100vh - 3rem)'),
      position: 'relative' as const,
      marginBottom: '1.5rem',
      border: '2px solid rgb(157, 182, 217)',
      borderRadius: '0.5rem',
      boxShadow: '0 6px 8px rgba(0, 0, 0, 0.1)',
    };

    // Gallery section style - fixed height for laptops
    const galleryStyle = {
      height: isLaptopExact ? '400px' : (isSmallScreen ? 'auto' : '35%'),
      width: '100%',
      minHeight: isSmallScreen || isLaptopExact ? '0' : '18.75rem',
      marginBottom: isLaptopExact ? '2rem' : (isSmallScreen ? '1.875rem' : '0'),
    };

    // Content section style
    const contentStyle = {
      height: isLaptopExact ? 'auto' : (isSmallScreen ? 'auto' : '65%'),
      overflowY: isLaptopExact ? 'visible' as const : (isSmallScreen ? 'visible' as const : 'auto' as const),
      position: 'relative' as const,
      marginTop: isLaptopExact ? '0' : (isSmallScreen ? '2.5rem' : '15%'),
      paddingBottom: isSmallScreen ? '1.875rem' : '0',
    };

    // Card layout style for name & price
    const cardLayoutStyle = {
      display: 'flex',
      flexDirection: isSmallScreen ? 'column' as const : 'row' as const,
      gap: '1rem',
      marginBottom: '1rem',
      position: 'relative' as const,
    };

    // Car name card style
    const nameCardStyle = {
      flex: 2,
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)',
      borderRadius: '0.75rem',
      padding: '1.25rem',
      paddingBottom: isLaptopExact ? '3.5rem' : (isSmallScreen ? '3rem' : '2.5rem'),
      paddingRight: isLaptopExact ? '2rem' : '1.25rem',
      border: '1px solid #bae6fd',
      marginBottom: isSmallScreen ? '0.75rem' : '0',
      position: 'relative' as const,
    };

    // Car name heading style
    const nameHeadingStyle = {
      fontSize: isSmallScreen ? '1.25rem' : '1.5rem',
      fontWeight: 700,
      color: '#0369a1',
      marginBottom: '0.5rem',
    };

    // Location style
    const locationStyle = {
      display: 'flex',
      alignItems: 'center',
      color: '#0284c7',
      fontSize: '0.875rem',
      marginTop: '0.5rem',
    };

    // External link style with enhanced responsive positioning
    const externalLinkStyle = {
      position: 'absolute' as const,
      bottom: '0.625rem',
      right: '0.625rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.25rem',
      color: '#3b82f6',
      fontSize: isLaptopExact ? '0.75rem' : (isSmallScreen ? '0.75rem' : '0.875rem'),
      textDecoration: 'none',
      padding: isLaptopExact ? '0.375rem 0.5rem' : (isSmallScreen ? '0.375rem 0.5rem' : '0.5rem 0.75rem'),
      borderRadius: '0.5rem',
      transition: 'all 0.2s',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      zIndex: 2,
      minWidth: isLaptopExact ? '80px' : (isSmallScreen ? '80px' : 'auto'),
      whiteSpace: isSmallScreen ? 'nowrap' as const : 'normal' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: isLaptopExact ? '120px' : (isSmallScreen ? '100px' : '150px'),
    };

    // Price card style
    const priceCardStyle = {
      display: 'flex',
      flexDirection: 'column' as 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      background: 'linear-gradient(135deg, #fafafa 0%, #f3f4f6 100%)',
      borderRadius: '0.75rem',
      padding: '1.25rem',
      border: '1px solid #e5e7eb',
      minWidth: isSmallScreen ? '100%' : '12.5rem',
    };

    // Price text style
    const priceTextStyle = {
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#111827',
      textAlign: 'center' as const,
    };

    // Section card style (specifications, analysis, description)
    const sectionCardStyle = {
      background: 'linear-gradient(135deg, #fafafa 0%, #f3f4f6 100%)',
      borderRadius: '0.75rem',
      padding: '1.25rem',
      border: '1px solid #e5e7eb',
      marginBottom: '1rem',
    };

    // Section heading style
    const sectionHeadingStyle = {
      fontSize: '1.25rem',
      fontWeight: 600,
      marginBottom: '0.75rem',
      color: '#111827',
    };

    // Content card style (inner white card)
    const contentCardStyle = {
      background: 'white',
      borderRadius: '0.5rem',
      padding: '1rem',
      border: '1px solid #e5e7eb',
    };

    // Specifications grid style
    const specificationsGridStyle = {
      ...contentCardStyle,
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(2, 1fr)',
      gap: '1rem',
    };

    // Specification row style
    const specRowStyle = {
      display: 'flex',
      justifyContent: 'space-between',
    };

    // Specification label style
    const specLabelStyle = {
      color: '#6b7280',
      fontSize: '0.875rem',
    };

    // Specification value style
    const specValueStyle = {
      fontWeight: 500,
      color: '#111827',
    };

    // Analysis content style
    const analysisContentStyle = {
      ...contentCardStyle,
      display: 'flex',
      flexDirection: 'column' as 'column',
      gap: '0.75rem',
    };

    // Savings row style
    const savingsRowStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.5rem',
      backgroundColor: '#f0fdf4',
      borderRadius: '0.375rem',
      border: '1px solid #dcfce7',
    };

    // Description content style
    const descriptionContentStyle = {
      ...contentCardStyle,
      color: '#4b5563',
      fontSize: '0.9375rem',
      lineHeight: 1.6,
      textAlign: 'justify' as const,
      height: isSmallScreen ? 'auto' : '100%',
      minHeight: isSmallScreen ? '9.375rem' : 'auto',
      overflow: 'auto',
    };

    return (
      <div style={containerStyle}>
        {data.cars.map((carData: CarResult, index: number) => {
          const car = carData.car;
          const carImages = car.all_photos && Array.isArray(car.all_photos) 
            ? car.all_photos 
            : (car.photo_url ? [car.photo_url] : []);
          
          return (
            <div key={index} style={carCardStyle}>
              {/* Top Half - Image Gallery */}
              <div style={galleryStyle}>
                <ImageSlideshow images={carImages} />
              </div>

              {/* Bottom Half - Content */}
              <div style={contentStyle}>
                {/* Car Name & Price Cards */}
                <div style={cardLayoutStyle}>
                  {/* Car Name Card */}
                  <div style={nameCardStyle}>
                    <h1 style={nameHeadingStyle}>{car.name}</h1>
                    
                    {/* Location */}
                    <div style={locationStyle}>
                      <span style={{ marginRight: '6px' }}>📍</span>
                      <span>{car.location || "Nije navedeno"}</span>
                    </div>

                    {/* External Link */}
                    <a
                      href={car.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={externalLinkStyle}
                    >
                      Visit Website
                      <ExternalLink size={14} />
                    </a>
                  </div>

                  {/* Price Card */}
                  <div style={priceCardStyle}>
                    <p style={priceTextStyle}>
                      {car.price}
                    </p>
                    <div className={`flex items-center justify-center px-4 py-2 rounded-full ${getScoreColor(carData.score)}`}>
                      <span className="font-semibold">{Math.round(carData.score)}</span>
                    </div>
                  </div>
                </div>

                {/* Car Specifications */}
                <div style={sectionCardStyle}>
                  <h2 style={sectionHeadingStyle}>Specifications</h2>
                  <div style={specificationsGridStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={specRowStyle}>
                        <span style={specLabelStyle}>Year:</span>
                        <span style={specValueStyle}>{car.year}</span>
                      </div>
                      <div style={specRowStyle}>
                        <span style={specLabelStyle}>Mileage:</span>
                        <span style={specValueStyle}>{car.mileage}</span>
                      </div>
                      <div style={specRowStyle}>
                        <span style={specLabelStyle}>Engine:</span>
                        <span style={specValueStyle}>{car.cubic_capacity}</span>
                      </div>
                      <div style={specRowStyle}>
                        <span style={specLabelStyle}>Horsepower:</span>
                        <span style={specValueStyle}>{car.horsepower}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={specRowStyle}>
                        <span style={specLabelStyle}>Transmission:</span>
                        <span style={specValueStyle}>{car.transmission}</span>
                      </div>
                      <div style={specRowStyle}>
                        <span style={specLabelStyle}>Fuel:</span>
                        <span style={specValueStyle}>{car.fuel}</span>
                      </div>
                      <div style={specRowStyle}>
                        <span style={specLabelStyle}>Damage:</span>
                        <span style={specValueStyle}>{car.damage}</span>
                      </div>
                      <div style={specRowStyle}>
                        <span style={specLabelStyle}>Location:</span>
                        <span style={specValueStyle}>{car.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis Card */}
                {carData.analysis && (
                  <div style={sectionCardStyle}>
                    <h2 style={sectionHeadingStyle}>Analysis</h2>
                    <div style={analysisContentStyle}>
                      <div style={specRowStyle}>
                        <span style={specLabelStyle}>Value:</span>
                        <span style={specValueStyle}>{carData.analysis.value}</span>
                      </div>
                      <div style={specRowStyle}>
                        <span style={specLabelStyle}>Age:</span>
                        <span style={specValueStyle}>{carData.analysis.age}</span>
                      </div>
                      <div style={specRowStyle}>
                        <span style={specLabelStyle}>Condition:</span>
                        <span style={specValueStyle}>{carData.analysis.condition}</span>
                      </div>
                      <div style={specRowStyle}>
                        <span style={specLabelStyle}>Engine:</span>
                        <span style={specValueStyle}>{carData.analysis.engine}</span>
                      </div>
                      <div style={savingsRowStyle}>
                        <span style={{ color: '#166534', fontSize: '0.875rem', fontWeight: 500 }}>Potential Savings:</span>
                        <span style={{ fontWeight: 600, color: '#166534' }}>${carData.analysis.savings}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description Card */}
                <div style={sectionCardStyle}>
                  <h2 style={sectionHeadingStyle}>Description</h2>
                  <div style={descriptionContentStyle}>
                    {carData.description || "No detailed description available for this vehicle."}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  } catch (e) {
    console.error('Failed to parse car data:', e);
    return (
      <div className="p-4 text-red-500">
        Failed to load car details. Please try again.
      </div>
    );
  }
};

export const carArtifact = new Artifact<"car", CarArtifactMetadata>({
  kind: "car",
  description: "A car artifact for displaying vehicle information and analysis.",
  
  initialize: async ({ documentId, setMetadata }) => {
    setMetadata({
      found: false,
      message: "No car data loaded yet.",
      description: "",
      score: 0
    });
  },

  onStreamPart: ({ streamPart, setMetadata, setArtifact }) => {
    if (streamPart.type === "car-delta") {
      try {
        const data = typeof streamPart.content === 'string' 
          ? JSON.parse(streamPart.content)
          : streamPart.content;
        setMetadata(data);
        setArtifact((draftArtifact) => ({
          ...draftArtifact,
          content: JSON.stringify(data, null, 2),
          status: "streaming",
        }));
      } catch (e) {
        console.error('Failed to parse metadata:', e);
      }
    }
  },

  content: ({
    mode,
    isLoading,
    content,
  }) => {
    if (isLoading) {
      return <div className="p-4">Loading car information...</div>;
    }

    return (
      <div className="car-artifact">
        <CarDetails content={content} />
      </div>
    );
  },

  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: "View Previous version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("prev");
      },
      isDisabled: ({ currentVersionIndex }) => {
        return currentVersionIndex === 0;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: "View Next version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("next");
      },
      isDisabled: ({ isCurrentVersion }) => {
        return isCurrentVersion;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: "Copy car details",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!");
      },
    },
  ],
  
  toolbar: [], // Empty array satisfies the type requirement without adding buttons
});

