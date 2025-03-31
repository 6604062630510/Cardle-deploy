import React from 'react';
import { TradeCardProps } from './Interface/CardProps';
import { Link } from 'react-router-dom';
import fullfav from "../assets/fill-fav-icon.png";

const TradeCard: React.FC<TradeCardProps> = ({
  id_post,
  title,
  description,
  image,
  acc_name,
  created_at,
  hashtags,
  hashtags_want,
  isFavorite,
  onToggleFavorite,
}) => {
  return (
    <div className="col-md-6 d-flex justify-content-center mt-5 mb-5">
       
      <div className="card shadow" style={{ width: '450px', height: '620px' }}>
        <img
          src={image}
          alt={`Product ${title}`}
          className="card-img-top"
          style={{
            width: "100%", 
            height: "250px",
            objectFit: "cover",   
            borderRadius: "10px", 
            padding: "10px",
          }}
        />
         <Link to={`/trade/product/${id_post}`} className="no-link-style">
        <div className="card-body d-flex flex-column" style={{ height: "230px"}}>
          <h3 className="card-title">{title.length > 24 ? title.slice(0, 21) + "..." : title}</h3>
          <h5 className="card-text custom-line-height mt-2">
            {description.length > 70 ? description.slice(0, 67) + "..." : description}
          </h5>
          <div className="d-flex flex-wrap gap-2 mb-3 justify-content-start">
            <div className="d-flex flex-wrap gap-2 mt-1 mb-1 justify-content-start w-100">
                {hashtags.length > 0
                ? hashtags.slice(0, 4).map((hashtag, index) => (
                    <span key={index} className="badge custom-badge">
                        #{hashtag.length > 20 ? hashtag.slice(0, 17) + "..." : hashtag}
                    </span>
                    ))
                : 'No hashtags available'}
            </div>
            <div className="d-flex flex-wrap gap-2 mt-2 mb-2 justify-content-start w-100">
                {hashtags_want && (
                    hashtags_want.slice(0, 4).map((hashtag, index) => (
                        <span key={index} className="badge custom-badge-want">
                            #{hashtag.length > 20 ? hashtag.slice(0, 17) + "..." : hashtag}
                        </span>
                    ))
                )}
            </div>
          </div>
          </div>
          </Link>

          <div className="card-footer bg-white border-0  d-flex flex-column p-2">
          <div className="d-flex flex-column align-items-start m-3">
            <div className="d-flex justify-content-between w-100">
              <p className="card-text mb-0">
                <strong>โดย: {acc_name.length > 40 ? acc_name.slice(0, 37) + "..." : acc_name}</strong>
              </p>
<button
                className="btn btn-fav btn-lg me-3"
                onClick={() => onToggleFavorite(id_post)}
              >
                {isFavorite ? (
                  <img src={fullfav} alt="Remove Fav" style={{ width: '30px' }} />
                ) : (
                  <img src="/emt-fav-icon.png" alt="Add Fav" style={{ width: '30px' }} />
                )}
              </button>
            </div>
            <div className="d-flex justify-content-between w-100">
              <p className="card-text mb-0">
                <small>Created at: {new Date(created_at).toLocaleString()}</small>
              </p>
            </div>
          </div>
        </div>
      </div>
 
    </div>
  );
};

export default TradeCard;
