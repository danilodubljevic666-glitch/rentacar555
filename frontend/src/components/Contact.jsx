import React, { useState } from 'react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        carType: ''
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simulacija slanja forme
        setTimeout(() => {
            setIsLoading(false);
            setIsSubmitted(true);
            setFormData({
                name: '',
                email: '',
                phone: '',
                message: '',
                carType: ''
            });
            
            // Resetuj poruku nakon 5 sekundi
            setTimeout(() => setIsSubmitted(false), 5000);
        }, 1500);
    };

    const contactInfo = {
        phone: '+382 68 048 655',
        email: 'danilo.dubljevic666@gmail.com',
        city: 'Nikšić',
        address: 'Nikšić, Crna Gora',
        workingHours: 'Pon - Ned: 00-24h',
        social: {
            facebook: '#',
            instagram: '#',
            viber: '#',
            whatsapp: 'https://wa.me/38268048655'
        }
    };

    return (
        <section id="contact" className="py-20 bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4">
                {/* Naslov sekcije */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        Kontaktirajte nas
                    </h2>
                    <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Imate pitanja? Tu smo da vam pomognemo. Pošaljite nam poruku ili nas kontaktirajte direktno.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Kontakt informacije - Lijeva strana */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Telefon */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 p-4 rounded-full">
                                    <span className="text-3xl">📞</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-1">Telefon</h3>
                                    <a 
                                        href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                                        className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                        {contactInfo.phone}
                                    </a>
                                    <p className="text-gray-500 mt-1">Dostupni 24/7</p>
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
                            <div className="flex items-start gap-4">
                                <div className="bg-green-100 p-4 rounded-full">
                                    <span className="text-3xl">✉️</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-1">Email</h3>
                                    <a 
                                        href={`mailto:${contactInfo.email}`}
                                        className="text-xl font-bold text-green-600 hover:text-green-700 transition-colors break-all"
                                    >
                                        {contactInfo.email}
                                    </a>
                                    <p className="text-gray-500 mt-1">Odgovaramo u roku od 1h</p>
                                </div>
                            </div>
                        </div>

                        {/* Lokacija */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
                            <div className="flex items-start gap-4">
                                <div className="bg-red-100 p-4 rounded-full">
                                    <span className="text-3xl">📍</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-1">Lokacija</h3>
                                    <p className="text-xl font-bold text-red-600">{contactInfo.city}</p>
                                    <p className="text-gray-600">{contactInfo.address}</p>
                                    <p className="text-gray-500 mt-1">{contactInfo.workingHours}</p>
                                </div>
                            </div>
                        </div>

                        {/* Social media */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg p-6 text-white">
                            <h3 className="text-lg font-semibold mb-4">Pratite nas</h3>
                            <div className="flex gap-3">
                                <a 
                                    href={contactInfo.social.viber} 
                                    className="bg-white/20 hover:bg-white/30 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all hover:scale-110"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    💬
                                </a>
                                <a 
                                    href={contactInfo.social.whatsapp} 
                                    className="bg-white/20 hover:bg-white/30 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all hover:scale-110"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    📱
                                </a>
                                <a 
                                    href={contactInfo.social.facebook} 
                                    className="bg-white/20 hover:bg-white/30 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all hover:scale-110"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    📘
                                </a>
                                <a 
                                    href={contactInfo.social.instagram} 
                                    className="bg-white/20 hover:bg-white/30 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all hover:scale-110"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    📷
                                </a>
                            </div>
                            <p className="text-sm text-blue-200 mt-4">
                                Kliknite za brzi kontakt putem Vibera ili WhatsAppa
                            </p>
                        </div>

                    </div>

                    {/* Kontakt forma - Desna strana */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">
                                Pošaljite nam poruku
                            </h3>

                            {isSubmitted && (
                                <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                                    <span>✅</span>
                                    <span>Poruka je uspješno poslata! Odgovorićemo u najkraćem roku.</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Ime */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ime i prezime *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Vaše ime"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="vas@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Telefon */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Telefon *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="+382 68 048 655"
                                        />
                                    </div>

                                    {/* Tip auta */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tip automobila
                                        </label>
                                        <select
                                            name="carType"
                                            value={formData.carType}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            <option value="">Izaberite tip</option>
                                            <option value="economy">Ekonomični</option>
                                            <option value="sedan">Sedan</option>
                                            <option value="suv">SUV</option>
                                            <option value="luxury">Luksuzni</option>
                                            <option value="sports">Sportski</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Poruka */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Poruka *
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="5"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Unesite vašu poruku..."
                                    ></textarea>
                                </div>

                                {/* Submit dugme */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 ${
                                        isLoading ? 'opacity-75 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                            <span>Slanje...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>📨</span>
                                            <span>Pošalji poruku</span>
                                        </>
                                    )}
                                </button>

                                <p className="text-sm text-gray-500 text-center mt-4">
                                    Polja označena sa * su obavezna
                                </p>
                            </form>

                            {/* Direktni kontakt */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <p className="text-center text-gray-600 mb-3">
                                    Ili nas kontaktirajte direktno:
                                </p>
                                <div className="flex flex-wrap justify-center gap-3">
                                    <a 
                                        href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                                        className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-full transition-colors flex items-center gap-2"
                                    >
                                        <span>📞</span>
                                        {contactInfo.phone}
                                    </a>
                                    <a 
                                        href={`mailto:${contactInfo.email}`}
                                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-full transition-colors flex items-center gap-2"
                                    >
                                        <span>✉️</span>
                                        {contactInfo.email}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;