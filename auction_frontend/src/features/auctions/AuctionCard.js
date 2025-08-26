import React from 'react';
import { Link } from 'react-router-dom';
import './AuctionCard.css'; // We'll add styling

const AuctionCard = ({ item }) => {
    return (
        <div className="card">
            <img src={item.image_url || 'https://via.placeholder.com/300'} alt={item.title} className="card-image" />
            <div className="card-content">
                <h3 className="card-title">{item.title}</h3>
                <p className="card-price">Current Bid: ${parseFloat(item.current_highest_bid).toFixed(2)}</p>
                <p className="card-seller">Seller: {item.seller}</p>
                <Link to={`/auctions/${item.id}`} className="card-button">
                    View Details
                </Link>
            </div>
        </div>
    );
};

export default AuctionCard;