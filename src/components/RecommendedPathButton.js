import React from 'react';

function RecommendedPathButton({ onClick }) {
    return (
        <button className="recommend-button" onClick={onClick}>
            Recommended Path
        </button>
    );
}

export default RecommendedPathButton;
