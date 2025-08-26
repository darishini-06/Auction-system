import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../api/axios';
import './AuctionDetailPage.css';

const AuctionDetailPage = () => {
    const { id } = useParams(); // Get the item ID from the URL
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bidAmount, setBidAmount] = useState('');
    const [bidError, setBidError] = useState('');

    // --- 1. Fetch Initial Data ---
    useEffect(() => {
        const fetchItem = async () => {
            try {
                const response = await apiClient.get(`/items/${id}/`);
                setItem(response.data);
                // Set initial bid amount suggestion
                const suggestedBid = parseFloat(response.data.current_highest_bid) + 1.00;
                setBidAmount(suggestedBid.toFixed(2));
            } catch (err) {
                setError('Could not fetch auction details. The item may not exist or the auction may have ended.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    // --- 2. Set Up Real-Time WebSocket Connection ---
    useEffect(() => {
        // Ensure we have an item before trying to connect
        if (!id) return;

        // The WebSocket URL must match your Django Channels routing
        const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const ws = new WebSocket(`${wsProtocol}${window.location.host}/ws/auction/${id}/`);

        ws.onopen = () => {
            console.log('WebSocket connected');
        };

        // This is where we receive real-time updates from the server
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received new bid:', data);
            // Update the item's state with the new bid data
            setItem(prevItem => ({
                ...prevItem,
                current_highest_bid: data.amount,
                highest_bidder: data.bidder, // Assuming your backend sends this
            }));
            // Update the suggested bid amount in the form
            const newSuggestedBid = parseFloat(data.amount) + 1.00;
            setBidAmount(newSuggestedBid.toFixed(2));
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        // CRITICAL: Cleanup function to close the connection when the component unmounts
        return () => {
            ws.close();
        };
    }, [id]); // Reconnect if the item ID changes

    // --- 3. Handle Bid Submission ---
    const handleBidSubmit = async (e) => {
        e.preventDefault();
        setBidError('');
        try {
            // Send the new bid to the backend via HTTP POST
            await apiClient.post('/bids/', {
                item: id,
                amount: bidAmount,
            });
            // The actual UI update will come from the WebSocket message
            // so we don't strictly need to do anything here after a successful POST.
        } catch (err) {
            const errorMsg = err.response?.data?.detail || err.response?.data[0] || 'Your bid was not successful.';
            setBidError(errorMsg);
        }
    };
    
    // --- 4. Render Logic with Guard Clauses ---
    if (loading) {
        return <p className="status-message">Loading item details...</p>;
    }

    if (error || !item) {
        return <p className="error-message">{error || "Auction item not found."}</p>;
    }

    return (
        <div className="detail-container">
            <div className="detail-image-container">
                <img src={item.image_url || 'https://via.placeholder.com/600x400'} alt={item.title} />
            </div>
            <div className="detail-info-container">
                <h1>{item.title}</h1>
                <p className="description">{item.description}</p>
                <div className="price-info">
                    <p>Seller: <strong>{item.seller}</strong></p>
                    <p>Highest Bidder: <strong>{item.highest_bidder || 'None'}</strong></p>
                    <p className="current-bid">Current Highest Bid: <span>${parseFloat(item.current_highest_bid).toFixed(2)}</span></p>
                </div>
                
                <form onSubmit={handleBidSubmit} className="bid-form">
                    <h3>Place Your Bid</h3>
                    <div className="bid-input-group">
                        <span>$</span>
                        <input
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            step="0.01"
                            min={parseFloat(item.current_highest_bid) + 0.01}
                        />
                        <button type="submit">Place Bid</button>
                    </div>
                     {bidError && <p className="error-message">{bidError}</p>}
                </form>

                <p className="end-time">Auction ends at: {new Date(item.end_time).toLocaleString()}</p>
            </div>
        </div>
    );
};

export default AuctionDetailPage;