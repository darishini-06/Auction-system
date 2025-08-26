// src/pages/ProfilePage.js (or wherever you placed it)

import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import AuctionCard from '../features/auctions/AuctionCard'; // Reuse the card component!
import './ProfilePage.css';

const ProfilePage = () => {
    const [myListings, setMyListings] = useState([]);
    const [myBids, setMyBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // Fetch both sets of data in parallel for efficiency
                const listingsPromise = apiClient.get('/items/my_listings/');
                const bidsPromise = apiClient.get('/items/my_bids/');

                const [listingsResponse, bidsResponse] = await Promise.all([
                    listingsPromise,
                    bidsPromise,
                ]);

                setMyListings(listingsResponse.data);
                setMyBids(bidsResponse.data);
            } catch (err) {
                setError('Failed to load profile data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    if (loading) return <p className="status-message">Loading your profile...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="profile-container">
            <h1>My Profile</h1>

            <section className="profile-section">
                <h2>📈 Items I'm Selling</h2>
                <div className="auction-grid">
                    {myListings.length > 0 ? (
                        myListings.map(item => <AuctionCard key={item.id} item={item} />)
                    ) : (
                        <p>You have not listed any items for auction.</p>
                    )}
                </div>
            </section>

            <section className="profile-section">
                <h2>🏆 Auctions I'm Winning</h2>
                <div className="auction-grid">
                    {myBids.length > 0 ? (
                        myBids.map(item => <AuctionCard key={item.id} item={item} />)
                    ) : (
                        <p>You are not the highest bidder on any active auctions.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default ProfilePage;