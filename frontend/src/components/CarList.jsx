import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import BookingModal from './BookingModal';

const CarList = () => {
    const [cars, setCars] = useState([]);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
    const [pickupTime, setPickupTime] = useState('10:00');
    const [returnTime, setReturnTime] = useState('10:00');
    const [loading, setLoading] = useState(false);
    const [selectedCar, setSelectedCar] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);

    useEffect(() => {
        fetchAvailableCars();
    }, [startDate, endDate]);

    const fetchAvailableCars = async () => {
        setLoading(true);
        try {
            const formattedStart = startDate.toISOString().split('T')[0];
            const formattedEnd = endDate.toISOString().split('T')[0];
            
            const response = await fetch(
                `http://localhost:5000/api/available-cars?start_date=${formattedStart}&end_date=${formattedEnd}`
            );
            const data = await response.json();
            setCars(data);
        } catch (error) {
            console.error('Greška pri učitavanju automobila:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async (bookingData) => {
        try {
            const response = await fetch('http://localhost:5000/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    car_id: selectedCar.id,
                    ...bookingData,
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0]
                }),
            });
            
            const result = await response.json();
            if (result.success) {
                alert('Rezervacija uspješno kreirana!');
                setShowBookingModal(false);
                fetchAvailableCars();
            } else {
                alert('Greška: ' + result.error);
            }
        } catch (error) {
            console.error('Greška pri kreiranju rezervacije:', error);
            alert('Došlo je do greške pri kreiranju rezervacije');
        }
    };

    return (
        <div id="cars-section" className="container mx-auto px-4 py-8">
            {/* Date picker za pretragu */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
                    <div className="w-full max-w-sm flex flex-col items-center">
                        <label className="block w-48 text-sm font-medium text-gray-700 mb-2 text-center">
                            📅 Od datuma
                        </label>
                        <DatePicker
                            selected={startDate}
                            onChange={date => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            minDate={new Date()}
                            className="w-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            dateFormat="dd.MM.yyyy"
                        />
                        <label className="block w-48 text-sm font-medium text-gray-700 mb-2 mt-4 text-center">
                            ⏰ Vrijeme preuzimanja
                        </label>
                        <input
                            type="time"
                            value={pickupTime}
                            onChange={(e) => setPickupTime(e.target.value)}
                            className="w-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="w-full max-w-sm flex flex-col items-center">
                        <label className="block w-48 text-sm font-medium text-gray-700 mb-2 text-center">
                            📅 Do datuma
                        </label>
                        <DatePicker
                            selected={endDate}
                            onChange={date => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            className="w-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            dateFormat="dd.MM.yyyy"
                        />
                        <label className="block w-48 text-sm font-medium text-gray-700 mb-2 mt-4 text-center">
                            ⏰ Vrijeme vraćanja
                        </label>
                        <input
                            type="time"
                            value={returnTime}
                            onChange={(e) => setReturnTime(e.target.value)}
                            className="w-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Lista automobila */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            ) : cars.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg">Nema dostupnih automobila za izabrani period.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cars.map(car => (
                        <div key={car.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                            <img 
                                src={car.image_url || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400'} 
                                alt={`${car.brand} ${car.model}`}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                                <h3 className="text-xl font-semibold mb-2">
                                    {car.brand} {car.model} ({car.year})
                                </h3>
                                <div className="space-y-2 text-gray-600">
                                    <p>🚗 Mjenjač: {car.transmission === 'manual' ? 'Manuelni' : 'Automatski'}</p>
                                    <p>⛽ Gorivo: {car.fuel_type === 'petrol' ? 'Benzin' : 
                                                    car.fuel_type === 'diesel' ? 'Dizel' : 
                                                    car.fuel_type === 'electric' ? 'Električni' : 'Hibrid'}</p>
                                    <p>👥 Sjedišta: {car.seats}</p>
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    <div>
                                        <span className="text-2xl font-bold text-blue-600">
                                            €{car.price_per_day}
                                        </span>
                                        <span className="text-gray-500 text-sm">/dan</span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setSelectedCar(car);
                                            setShowBookingModal(true);
                                        }}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Rezerviši
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal za rezervaciju */}
            {showBookingModal && (
                <BookingModal
                    car={selectedCar}
                    startDate={startDate}
                    endDate={endDate}
                    onClose={() => setShowBookingModal(false)}
                    onSubmit={handleBooking}
                />
            )}
        </div>
    );
};

export default CarList;