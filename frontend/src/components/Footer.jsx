import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
                {/* Glavni footer grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    
                    {/* Kolona 1 - O nama */}
                    <div>
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <span className="text-blue-500">🚗</span> 
                            Rent-a-Car
                        </h3>
                        <p className="text-gray-400 mb-4">
                            Vaš pouzdani partner za iznajmljivanje automobila. 
                            Kvalitet, sigurnost i povoljne cijene na jednom mjestu.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="bg-gray-800 hover:bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                                <span className="text-xl">📘</span>
                            </a>
                            <a href="#" className="bg-gray-800 hover:bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                                <span className="text-xl">📷</span>
                            </a>
                            <a href="#" className="bg-gray-800 hover:bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                                <span className="text-xl">🐦</span>
                            </a>
                            <a href="#" className="bg-gray-800 hover:bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                                <span className="text-xl">📱</span>
                            </a>
                        </div>
                    </div>

                    {/* Kolona 2 - Brzi linkovi */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-blue-400">Brzi linkovi</h4>
                        <ul className="space-y-2">

                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                    <span className="text-blue-500">›</span> Početna
                                </a>
                            </li>
                            <li>
                                <a href="#cars-section" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                    <span className="text-blue-500">›</span> Naši automobili
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                    <span className="text-blue-500">›</span> Kako rezervisati
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                    <span className="text-blue-500">›</span> Uslovi korištenja
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                    <span className="text-blue-500">›</span> Politika privatnosti
                                </a>
                            </li>
                          
<li>
    <a href="#contact" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
        <span className="text-blue-500">›</span> Kontakt
    </a>
</li>
                        </ul>
                    </div>

                    {/* Kolona 3 - Kontakt */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-blue-400">Kontakt</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <span className="text-blue-500 mt-1">📍</span>
                                <span className="text-gray-400">
                                    Bulevar Oslobođenja 10,<br />
                                    21000 Novi Sad
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-blue-500">📞</span>
                                <a href="tel:+381601234567" className="text-gray-400 hover:text-white transition-colors">
                                    +381 60 123 4567
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-blue-500">✉️</span>
                                <a href="mailto:info@rentacar.rs" className="text-gray-400 hover:text-white transition-colors">
                                    info@rentacar.rs
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-blue-500">🕒</span>
                                <span className="text-gray-400">
                                    Pon - Ned: 00-24h
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Kolona 4 - Radno vrijeme */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-blue-400">Radno vrijeme</h4>
                        <div className="space-y-2 text-gray-400">
                            <div className="flex justify-between">
                                <span>Ponedeljak - Petak:</span>
                                <span className="text-white">08:00 - 20:00</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Subota:</span>
                                <span className="text-white">09:00 - 18:00</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Nedelja:</span>
                                <span className="text-white">10:00 - 16:00</span>
                            </div>
                            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                                <p className="text-sm text-gray-300">
                                    <span className="text-blue-400 font-bold">24/7</span> Podrška na telefon
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mapa (opciono) */}
                <div className="mb-12 h-64 bg-gray-800 rounded-lg overflow-hidden">
                    <iframe 
                        title="Mapa"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2243.421841987635!2d19.834570915930058!3d45.24671177909906!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x475b1068c8a5a5a5%3A0x5a5a5a5a5a5a5a5a!2sNovi%20Sad!5e0!3m2!1sen!2srs!4v1620000000000!5m2!1sen!2srs"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        className="opacity-80 hover:opacity-100 transition-opacity"
                    ></iframe>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-gray-800 pt-8 mt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-gray-400 text-sm">
                            © {currentYear} Rent-a-Car. Sva prava zadržana.
                        </div>
                        
                        <div className="flex gap-4 text-sm text-gray-400">
                            <a href="#" className="hover:text-white transition-colors">
                                Uslovi korištenja
                            </a>
                            <span>|</span>
                            <a href="#" className="hover:text-white transition-colors">
                                Politika privatnosti
                            </a>
                            <span>|</span>
                            <a href="#" className="hover:text-white transition-colors">
                                Cookies
                            </a>
                        </div>

                        <div className="flex gap-2 text-2xl">
                            <span className="text-gray-500 hover:text-white transition-colors cursor-pointer" title="Plaćanje karticom">💳</span>
                            <span className="text-gray-500 hover:text-white transition-colors cursor-pointer" title="Plaćanje pouzećem">💵</span>
                            <span className="text-gray-500 hover:text-white transition-colors cursor-pointer" title="Plaćanje na rate">📅</span>
                        </div>
                    </div>

                    {/* Powered by */}
                    <div className="text-center mt-6 text-gray-600 text-xs">
                        <p>Made with ❤️ in Niksic</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;