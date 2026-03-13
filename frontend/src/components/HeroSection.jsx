import React, { useState, useEffect } from 'react';

const HeroSection = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // Slike sa CDN-ova koje sigurno rade
   // Zamijeni images niz sa ovim (Pixabay API)
const images = [
    {
        url: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1920',
        author: 'Pixabay'
    },
   
    {
        url: 'https://cdn.pixabay.com/photo/2012/11/02/13/02/car-63930_1280.jpg',
        author: 'Pixabay'
    },
    {
        url: 'https://cdn.pixabay.com/photo/2016/12/07/21/50/audi-1890494_1280.jpg',
        author: 'Pixabay'
    },
    {
        url: 'https://cdn.pixabay.com/photo/2016/04/01/12/16/car-1300629_1280.png',
        author: 'Pixabay'
    }
];

    useEffect(() => {
        // Promijeni sliku svake 3 sekunde
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => 
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            );
        }, 3000);

        return () => clearInterval(interval);
    }, [images.length]);

    // Funkcija za ručnu promjenu slike
    const goToSlide = (index) => {
        setCurrentImageIndex(index);
    };

    const goToNext = () => {
        setCurrentImageIndex((prevIndex) => 
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const goToPrev = () => {
        setCurrentImageIndex((prevIndex) => 
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    return (
        <div className="relative h-screen max-h-[800px] min-h-[600px] w-full overflow-hidden">
            {/* Pozadinske slike */}
            {images.map((image, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                        index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                        backgroundImage: `url(${image.url})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover'
                    }}
                >
                    {/* Tamni overlay za bolju čitljivost teksta */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
                </div>
            ))}

            {/* Glavni sadržaj */}
            <div className="relative h-full w-full flex items-center justify-center px-4">
                <div className="max-w-3xl text-white text-center">
                    {/* Naslov sa animacijom */}
                    <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in">
                        Rent-a-Car
                        <span className="block text-3xl md:text-4xl text-blue-400 mt-2">
                            Vaš pouzdani partner na putu
                        </span>
                    </h1>
                    
                    {/* Podnaslov */}
                    <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-fade-in animation-delay-200">
                        Pronađite savršeni automobil za vaše putovanje. 
                        <br />Luksuzni, ekonomični i sportski modeli na jednom mjestu.
                    </p>
                    
                    {/* CTA dugmad */}
                    <div className="flex flex-wrap gap-4 justify-center animate-fade-in animation-delay-400">
                        <button 
                            onClick={() => {
                                document.getElementById('cars-section')?.scrollIntoView({ 
                                    behavior: 'smooth',
                                    block: 'start'
                                });
                            }}
                            className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg"
                        >
                            <span>Pogledaj automobile</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                        
                        <button className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all border-2 border-white/30 hover:border-white/50 flex items-center gap-2">
                            <span>Kontaktirajte nas</span>
                            <span className="group-hover:translate-x-1 transition-transform">📞</span>
                        </button>
                    </div>

                    {/* Statistika */}
                    <div className="mt-12 grid grid-cols-3 gap-4 md:gap-8 max-w-lg mx-auto animate-fade-in animation-delay-600">
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-blue-400">50+</div>
                            <div className="text-sm md:text-base text-gray-300">Automobila</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-blue-400">1000+</div>
                            <div className="text-sm md:text-base text-gray-300">Zadovoljnih klijenata</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-blue-400">24/7</div>
                            <div className="text-sm md:text-base text-gray-300">Podrška</div>
                        </div>
                    </div>

                    {/* Brze akcije */}
                    <div className="mt-8 flex flex-wrap gap-4 justify-center animate-fade-in animation-delay-800">
                        <button className="text-sm text-gray-300 hover:text-white flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full hover:bg-white/10 transition-all">
                            <span>⚡</span> Brza rezervacija
                        </button>
                        <button className="text-sm text-gray-300 hover:text-white flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full hover:bg-white/10 transition-all">
                            <span>💰</span> Najbolje cijene
                        </button>
                        <button className="text-sm text-gray-300 hover:text-white flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full hover:bg-white/10 transition-all">
                            <span>🛡️</span> Osiguranje uključeno
                        </button>
                    </div>
                </div>

                {/* Indikatori slika (tačkice) */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`transition-all duration-300 ${
                                index === currentImageIndex 
                                    ? 'w-10 h-3 bg-blue-500' 
                                    : 'w-3 h-3 bg-white/50 hover:bg-white/80'
                            } rounded-full`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Navigacione strelice */}
                <button 
                    onClick={goToPrev}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all backdrop-blur-sm z-20"
                    aria-label="Previous slide"
                >
                    ←
                </button>
                <button 
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all backdrop-blur-sm z-20"
                    aria-label="Next slide"
                >
                    →
                </button>
            </div>

            {/* Gradient na dnu za glatki prelaz */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-100 to-transparent z-10" />
        </div>
    );
};

export default HeroSection;