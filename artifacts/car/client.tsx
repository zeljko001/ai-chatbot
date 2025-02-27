import { Artifact } from "@/components/create-artifact";
import { toast } from "sonner";
import { CopyIcon, RedoIcon, UndoIcon } from '@/components/icons';
import { useState, useEffect, useCallback } from 'react';

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

// Add a useWindowSize hook for responsive design
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    // Only execute on the client
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
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
  car?: {
    id: number;
    name: string;
    price: string;
    transmission: string;
    horsepower: string;
    year: string;
    mileage: string;
    photo_url: string;
    damage: string;
    fuel: string;
    cubic_capacity: string;
    url: string;
    created_at: string;
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

// Image Slideshow Component
const ImageSlideshow = ({ images }: { images: string[] }) => {
  const { width } = useWindowSize();
  const isMobile = width < 768;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  
  // Convert single image to array
  const imageArray = Array.isArray(images) ? images : [images].filter(Boolean);
  
  // For demo purposes, duplicate the image to show a gallery effect
  const displayImages = imageArray.length ? [
    imageArray[0], 
    imageArray[0], 
    imageArray[0], 
    imageArray[0], 
    imageArray[0]
  ] : [];

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

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setShowPreview(false);
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  }, []);

  useEffect(() => {
    if (showPreview) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [showPreview, handleKeyPress]);

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: '16px', 
        padding: '16px', 
        height: isMobile ? 'auto' : '50%' 
      }}>
        {/* Main large image - left side or top on mobile */}
        <div style={{ 
          width: isMobile ? '100%' : '50%',
          backgroundColor: '#f3f4f6',
          borderRadius: '12px',
          position: 'relative'
        }}>
          {displayImages.length > 0 ? (
            <img
              src={displayImages[currentIndex]}
              alt="Main car view"
              onClick={() => openPreview(currentIndex)}
              style={{
                width: '100%',
                height: isMobile ? '250px' : '400px',
                objectFit: 'cover',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
              onError={() => handleImageError(`main-${currentIndex}`)}
            />
          ) : (
            <div style={{
              width: '100%',
              height: isMobile ? '250px' : '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              borderRadius: '12px'
            }}>
              No image available
            </div>
          )}
        </div>

        {/* Right side 2x2 grid or bottom grid on mobile */}
        {!isMobile && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gridTemplateRows: '1fr 1fr',
            gap: '8px', 
            width: isMobile ? '100%' : '50%',
            height: isMobile ? 'auto' : '400px'
          }}>
            {[1, 2, 3].map((offset) => (
              <div key={`grid-${offset}`} style={{ 
                height: '196px',
                backgroundColor: '#f3f4f6',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                {displayImages.length > 0 ? (
                  <img
                    src={displayImages[0]}
                    alt={`Car view ${offset}`}
                    onClick={() => openPreview(0)}
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
            ))}
            
            {/* Last image with overlay */}
            <div style={{ 
              height: '196px', 
              position: 'relative',
              backgroundColor: '#f3f4f6',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              {displayImages.length > 0 ? (
                <>
                  <img
                    src={displayImages[0]}
                    alt="Car view 4"
                    onClick={() => openPreview(0)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'brightness(0.7)',
                      cursor: 'pointer'
                    }}
                    onError={() => handleImageError(`last-${currentIndex}`)}
                  />
                  {displayImages.length > 4 && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '24px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      +{displayImages.length - 4}
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

      {/* Full screen preview */}
      {showPreview && displayImages.length > 0 && (
        <div 
          onClick={() => setShowPreview(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}
        >
          <div onClick={e => e.stopPropagation()}>
            <img
              src={displayImages[previewIndex]}
              alt="Preview"
              style={{
                maxHeight: '90vh',
                maxWidth: '90vw',
                objectFit: 'contain'
              }}
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            style={{
              position: 'absolute',
              left: isMobile ? '12px' : '24px',
              backgroundColor: 'white',
              borderRadius: '50%',
              padding: isMobile ? '8px' : '12px',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            <ChevronLeft size={isMobile ? 18 : 24} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            style={{
              position: 'absolute',
              right: isMobile ? '12px' : '24px',
              backgroundColor: 'white',
              borderRadius: '50%',
              padding: isMobile ? '8px' : '12px',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            <ChevronRight size={isMobile ? 18 : 24} />
          </button>
        </div>
      )}
    </div>
  );
};

const CarDetails = ({ content }: { content: string }) => {
  const { width } = useWindowSize();
  const isMobile = width < 768;
  
  try {
    if (!content) {
      return <div className="p-4 text-red-500">No car data available</div>;
    }

    const data = typeof content === 'string' ? JSON.parse(content) : content;
    
    if (!data || !data.found) {
      return (
        <div className="p-4 text-red-500">
          {data?.message || 'No matching car found'}
          {data?.description && <p className="mt-2 text-gray-600">{data.description}</p>}
        </div>
      );
    }

    if (!data.car) {
      return (
        <div className="p-4 text-red-500">
          {data.message || 'Car details not available'}
          {data.description && <p className="mt-2 text-gray-600">{data.description}</p>}
        </div>
      );
    }

    const { car, analysis } = data;

    return (
      <div style={{ 
        minHeight: '100vh', 
        paddingBottom: isMobile ? '24px' : '48px' 
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          flexDirection: 'column',
          height: isMobile ? 'auto' : 'calc(100vh - 48px)',
          position: 'relative'
        }}>
          {/* Top Half - Image Gallery */}
          <div style={{ 
            height: isMobile ? 'auto' : '35%', 
            width: '100%', 
            minHeight: isMobile ? '0' : '300px',
            marginBottom: isMobile ? '30px' : '0'
          }}>
            <ImageSlideshow images={[car.photo_url]} />
          </div>

          {/* Bottom Half - Content */}
          <div style={{ 
            height: isMobile ? 'auto' : '65%',
            overflowY: isMobile ? 'visible' : 'auto',
            position: 'relative',
            marginTop: isMobile ? '40px' : '15%',
            paddingBottom: isMobile ? '30px' : '0'
          }}>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '16px',
              paddingLeft: '16px',
              paddingRight: '16px'
            }}>
              {/* Left Column - Car Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between', 
                  alignItems: isMobile ? 'stretch' : 'flex-start',
                  gap: isMobile ? '16px' : '0'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #fafafa 0%, #f3f4f6 100%)',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    border: '1px solid #e5e7eb',
                    flex: 1,
                    marginRight: isMobile ? '0' : '1rem'
                  }}>
                    <h1 style={{ 
                      fontSize: isMobile ? '1.375rem' : '1.675rem', 
                      fontWeight: 500, 
                      marginBottom: '0.5rem', 
                      lineHeight: '1.2',
                      color: '#111827'
                    }}>{car.name}</h1>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      background: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #e5e7eb',
                      width: 'fit-content',
                      fontSize: '0.875rem',
                      letterSpacing: '0.025em'
                    }}>
                      <span style={{ color: '#6b7280', fontWeight: 400 }}>ID:</span>
                      <span style={{ color: '#4b5563', fontWeight: 600 }}>{car.id}</span>
                    </div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '0.75rem',
                    background: 'linear-gradient(135deg, #fafafa 0%, #f3f4f6 100%)',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    border: '1px solid #e5e7eb',
                    minWidth: isMobile ? '100%' : '200px'
                  }}>
                    <p style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 700, 
                      lineHeight: '1.2', 
                      color: '#111827',
                      textAlign: 'center'
                    }}>
                      {car.price}
                    </p>
                    <div className={`flex items-center justify-center px-4 py-2 rounded-full ${getScoreColor(data.score)}`}>
                      <span className="font-semibold">{Math.round(data.score)}</span>
                    </div>
                  </div>
                </div>

                {/* Car Specifications */}
                <div style={{
                  background: 'linear-gradient(135deg, #fafafa 0%, #f3f4f6 100%)',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <h2 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 600, 
                    marginBottom: '0.75rem',
                    color: '#111827'
                  }}>Specifications</h2>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '1rem',
                    background: 'white',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Year:</span>
                        <span style={{ fontWeight: 500, color: '#111827' }}>{car.year}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Mileage:</span>
                        <span style={{ fontWeight: 500, color: '#111827' }}>{car.mileage}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Engine:</span>
                        <span style={{ fontWeight: 500, color: '#111827' }}>{car.cubic_capacity}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Horsepower:</span>
                        <span style={{ fontWeight: 500, color: '#111827' }}>{car.horsepower}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Fuel:</span>
                        <span style={{ fontWeight: 500, color: '#111827' }}>{car.fuel}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Transmission:</span>
                        <span style={{ fontWeight: 500, color: '#111827' }}>{car.transmission}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Damage:</span>
                        <span style={{ fontWeight: 500, color: '#111827' }}>{car.damage}</span>
                      </div>
                      {car.url && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                          <a
                            href={car.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              color: '#3b82f6',
                              fontSize: '0.875rem',
                              textDecoration: 'none',
                              padding: '0.5rem 0.75rem',
                              borderRadius: '0.5rem',
                              transition: 'all 0.2s',
                              backgroundColor: '#f9fafb',
                              border: '1px solid #e5e7eb'
                            }}
                          >
                            View listing
                            <span className="ml-1">↗</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Analysis and Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Analysis Card */}
                {analysis && (
                  <div style={{
                    background: 'linear-gradient(135deg, #fafafa 0%, #f3f4f6 100%)',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h2 style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 600, 
                      marginBottom: '0.75rem',
                      color: '#111827'
                    }}>Analysis</h2>
                    <div style={{ 
                      background: 'white',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Value:</span>
                        <span style={{ fontWeight: 500, color: '#111827' }}>{analysis.value}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Age:</span>
                        <span style={{ fontWeight: 500, color: '#111827' }}>{analysis.age}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Condition:</span>
                        <span style={{ fontWeight: 500, color: '#111827' }}>{analysis.condition}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Engine:</span>
                        <span style={{ fontWeight: 500, color: '#111827' }}>{analysis.engine}</span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        padding: '0.5rem',
                        backgroundColor: '#f0fdf4',
                        borderRadius: '0.375rem',
                        border: '1px solid #dcfce7'
                      }}>
                        <span style={{ color: '#166534', fontSize: '0.875rem', fontWeight: 500 }}>Potential Savings:</span>
                        <span style={{ fontWeight: 600, color: '#166534' }}>${analysis.savings}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #fafafa 0%, #f3f4f6 100%)',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  border: '1px solid #e5e7eb',
                  flex: 1
                }}>
                  <h2 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 600, 
                    marginBottom: '0.75rem',
                    color: '#111827'
                  }}>Description</h2>
                  <div style={{ 
                    background: 'white',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    border: '1px solid #e5e7eb',
                    color: '#4b5563',
                    fontSize: '0.9375rem',
                    lineHeight: '1.6',
                    textAlign: 'justify',
                    height: isMobile ? 'auto' : '100%', 
                    minHeight: isMobile ? '150px' : 'auto',
                    overflow: 'auto'
                  }}>
                    {data.description || "No detailed description available for this vehicle."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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

