import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios'; // Your centralized API client
import AuctionCard from './AuctionCard';
import './AuctionListPage.css';

const AuctionListPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchItems = async () => {
            try {
                // Fetch active auction items from the backend
                const response = await apiClient.get('/items/');
                setItems(response.data);
            } catch (err) {
                setError('Failed to fetch auction items.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []); // The empty array ensures this runs only once when the component mounts

    if (loading) return <p>Loading auctions...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="auction-list-container">
            <h1>Active Auctions</h1>
            <div className="auction-grid">
                {items.length > 0 ? (
                    items.map(item => <AuctionCard key={item.id} item={item} />)
                ) : (
                    <p>No active auctions at the moment.</p>
                )}
            </div>
        </div>
    );
};

export default AuctionListPage;