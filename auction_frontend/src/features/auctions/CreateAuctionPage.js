import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axios';
import './CreateAuctionPage.css'; // For styling

const CreateAuctionPage = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [basePrice, setBasePrice] = useState('');
    const [endTime, setEndTime] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Basic validation
        if (!title || !basePrice || !endTime) {
            setError('Title, Base Price, and End Time are required.');
            return;
        }

        const auctionData = {
            title,
            description,
            base_price: parseFloat(basePrice),
            // The backend expects start_time, let's set it to now
            start_time: new Date().toISOString(),
            end_time: new Date(endTime).toISOString(),
            image_url: imageUrl,
        };

        try {
            const response = await apiClient.post('/items/', auctionData);
            setSuccess('Auction created successfully! Redirecting...');
            // Redirect to the new item's detail page after a short delay
            setTimeout(() => {
                navigate(`/auctions/${response.data.id}`);
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create auction. You may not have seller permissions.');
            console.error(err);
        }
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit} className="auction-form">
                <h2>List a New Item for Auction</h2>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="basePrice">Base Price ($)</label>
                    <input type="number" id="basePrice" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required step="0.01" />
                </div>
                <div className="form-group">
                    <label htmlFor="endTime">Auction End Time</label>
                    <input type="datetime-local" id="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="imageUrl">Image URL (Optional)</label>
                    <input type="url" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                </div>
                <button type="submit" className="submit-button">Create Auction</button>
            </form>
        </div>
    );
};

export default CreateAuctionPage;