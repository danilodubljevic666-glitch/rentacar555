import React, { useState, useEffect } from 'react';

const AdminPanel = ({ admin, onLogout }) => {
    const [reservations, setReservations] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    const [selectedCar, setSelectedCar] = useState(null);
    const [showCarDetails, setShowCarDetails] = useState(false);

    // API URL iz environment varijable
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchReservations();
        fetchStats();
    }, []);

    const getAuthHeader = () => ({
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
    });

    const fetchReservations = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/reservations`, {
                headers: getAuthHeader()
            });
            
            if (response.status === 401 || response.status === 403) {
                // Token nije validan, odjavi se
                handleLogout();
                return;
            }
            
            const data = await response.json();
            setReservations(data);
        } catch (error) {
            console.error('Greška pri učitavanju rezervacija:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/stats`, {
                headers: getAuthHeader()
            });
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Greška pri učitavanju statistike:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCarDetails = async (carId) => {
        try {
            const response = await fetch(`${API_URL}/api/admin/cars/${carId}`, {
                headers: getAuthHeader()
            });
            const data = await response.json();
            setSelectedCar(data);
            setShowCarDetails(true);
        } catch (error) {
            console.error('Greška pri učitavanju detalja auta:', error);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
           const response = await fetch(`${API_URL}/api/admin/reservations/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (response.ok) {
                // Uvijek refresh-uj listu rezervacija nakon ažuriranja statusa
                fetchReservations();
                fetchStats();
                
                if (newStatus === 'completed') {
                    alert('Rezervacija je završena! Auto je sada dostupan za rezervisanje na home page-u.');
                }
            } else {
                alert('Greška pri ažuriranju statusa rezervacije.');
            }
        } catch (error) {
            console.error('Greška pri ažuriranju statusa:', error);
            alert('Došlo je do greške pri ažuriranju statusa.');
        }
    };

    const deleteReservation = async (id) => {
        if (window.confirm('Da li ste sigurni da želite obrisati ovu rezervaciju?')) {
            try {
                const response = await fetch(`${API_URL}/api/admin/reservations/${id}`, {
                    method: 'DELETE',
                    headers: getAuthHeader()
                });
                
                if (response.ok) {
                    fetchReservations();
                    fetchStats();
                }
            } catch (error) {
                console.error('Greška pri brisanju rezervacije:', error);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        onLogout();
    };

    const filteredReservations = reservations.filter(res => {
        if (filter === 'all') return true;
        return res.status === filter;
    }).filter(res => {
        if (!dateFilter) return true;
        return res.start_date.includes(dateFilter) || res.end_date.includes(dateFilter);
    });

    const getStatusBadge = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
            'completed': 'bg-blue-100 text-blue-800'
        };
        const statusText = {
            'pending': 'Na čekanju',
            'confirmed': 'Potvrđeno',
            'cancelled': 'Otkazano',
            'completed': 'Završeno'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100'}`}>
                {statusText[status] || status}
            </span>
        );
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Automobil', 'Kupac', 'Email', 'Telefon', 'Od datuma', 'Do datuma', 'Cijena', 'Status', 'Rezervisano'];
        const csvData = filteredReservations.map(r => [
            r.id,
            r.car_name,
            r.customer_name,
            r.customer_email,
            r.customer_phone,
            r.start_date,
            r.end_date,
            r.total_price,
            r.status,
            r.created_at
        ]);
        
        const csvContent = [headers, ...csvData]
            .map(row => row.join(','))
            .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rezervacije_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header sa info o adminu */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Admin Panel</h1>
                    <p className="text-gray-600">Prijavljeni ste kao: {admin?.username}</p>
                </div>
                <button
                    onClick={() => { fetchReservations(); fetchStats(); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    🔄 Osvježi
                </button>
            </div>
            
            {/* Statistika */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-gray-500 text-sm">Ukupno rezervacija</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats.total_reservations}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-gray-500 text-sm">Ukupna zarada</h3>
                        <p className="text-3xl font-bold text-green-600">€{(parseFloat(stats.total_earnings) || 0).toFixed(2)}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-gray-500 text-sm">Aktivne rezervacije</h3>
                        <p className="text-3xl font-bold text-orange-600">{stats.active_reservations}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-gray-500 text-sm">Statusi</h3>
                        <div className="space-y-1">
                            {stats.status_breakdown?.map(s => (
                                <div key={s.status} className="flex justify-between text-sm">
                                    <span>{s.status}:</span>
                                    <span className="font-bold">{s.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Filteri */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2"
                        >
                            <option value="all">Sve rezervacije</option>
                            <option value="pending">Na čekanju</option>
                            <option value="confirmed">Potvrđene</option>
                            <option value="completed">Završene</option>
                            <option value="cancelled">Otkazane</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                        <input
                            type="month"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2"
                        />
                    </div>
                    
                    <button 
                        onClick={() => {
                            fetchReservations();
                            fetchStats();
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mt-6"
                    >
                        Osvježi
                    </button>
                </div>
            </div>
            
            {/* Tabela rezervacija */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Automobil
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kupac
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Period
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cijena
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rezervisano
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Akcije
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredReservations.map(res => (
                                <tr key={res.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        #{res.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => fetchCarDetails(res.car_id)}
                                            className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline"
                                        >
                                            {res.car_name}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 font-medium">{res.customer_name}</div>
                                        <div className="text-sm text-gray-500">{res.customer_email}</div>
                                        <div className="text-sm text-gray-500">{res.customer_phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {res.start_date}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            do {res.end_date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                        €{parseFloat(res.total_price).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(res.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {res.created_at}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex gap-2">
                                            <select 
                                                value={res.status}
                                                onChange={(e) => updateStatus(res.id, e.target.value)}
                                                className="text-xs border border-gray-300 rounded px-2 py-1"
                                            >
                                                <option value="pending">Na čekanju</option>
                                                <option value="confirmed">Potvrdi</option>
                                                <option value="completed">Završi</option>
                                                <option value="cancelled">Otkaži</option>
                                            </select>
                                            <button
                                                onClick={() => deleteReservation(res.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Obriši"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {filteredReservations.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        Nema rezervacija za prikaz
                    </div>
                )}
            </div>

            {/* Modal za detalje auta */}
            {showCarDetails && selectedCar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">
                                {selectedCar.car.brand} {selectedCar.car.model}
                            </h2>
                            <button
                                onClick={() => setShowCarDetails(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="mb-4 p-4 bg-gray-50 rounded">
                            <p><strong>Godište:</strong> {selectedCar.car.year}</p>
                            <p><strong>Cijena po danu:</strong> €{selectedCar.car.price_per_day}</p>
                            <p><strong>Mjenjač:</strong> {selectedCar.car.transmission}</p>
                            <p><strong>Gorivo:</strong> {selectedCar.car.fuel_type}</p>
                            <p><strong>Sjedišta:</strong> {selectedCar.car.seats}</p>
                        </div>
                        
                        <h3 className="font-bold mb-2">Sve rezervacije za ovaj auto:</h3>
                        <div className="space-y-2">
                            {selectedCar.reservations.map(r => (
                                <div key={r.id} className="p-3 border rounded">
                                    <p><strong>{r.customer_name}</strong> - {r.start_date} do {r.end_date}</p>
                                    <p className="text-sm text-gray-600">Status: {r.status}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;