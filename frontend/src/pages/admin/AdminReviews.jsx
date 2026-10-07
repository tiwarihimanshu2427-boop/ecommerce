import React, { useMemo, useState } from "react";
import "./AdminReviews.css";

const initialReviews = [
  {
    id: 1,
    customer: "Rahul Kumar",
    email: "rahul@gmail.com",
    product: "Wireless Headphones",
    rating: 5,
    review:
      "Very good product. Sound quality is excellent and battery backup is also great.",
    date: "2026-09-28",
    status: "Approved",
  },
  {
    id: 2,
    customer: "Priya Singh",
    email: "priya@gmail.com",
    product: "Smart Watch",
    rating: 4,
    review:
      "Good watch with useful features. Delivery was also fast.",
    date: "2026-09-26",
    status: "Approved",
  },
  {
    id: 3,
    customer: "Amit Kumar",
    email: "amit@gmail.com",
    product: "Running Shoes",
    rating: 3,
    review:
      "The product is okay but the size could have been better.",
    date: "2026-09-24",
    status: "Pending",
  },
  {
    id: 4,
    customer: "Neha Sharma",
    email: "neha@gmail.com",
    product: "Cotton T-Shirt",
    rating: 5,
    review:
      "Nice quality and comfortable material. Loved the product.",
    date: "2026-09-22",
    status: "Approved",
  },
  {
    id: 5,
    customer: "Vikas Gupta",
    email: "vikas@gmail.com",
    product: "Laptop Backpack",
    rating: 2,
    review:
      "The product arrived late and the quality was not as expected.",
    date: "2026-09-20",
    status: "Pending",
  },
];

function AdminReviews() {
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem("adminReviews");

    if (saved) {
      return JSON.parse(saved);
    }

    localStorage.setItem(
      "adminReviews",
      JSON.stringify(initialReviews)
    );

    return initialReviews;
  });

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedReview, setSelectedReview] = useState(null);

  const saveReviews = (updatedReviews) => {
    setReviews(updatedReviews);

    localStorage.setItem(
      "adminReviews",
      JSON.stringify(updatedReviews)
    );
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        review.customer.toLowerCase().includes(searchText) ||
        review.email.toLowerCase().includes(searchText) ||
        review.product.toLowerCase().includes(searchText) ||
        review.review.toLowerCase().includes(searchText);

      const matchesRating =
        ratingFilter === "All" ||
        review.rating === Number(ratingFilter);

      const matchesStatus =
        statusFilter === "All" ||
        review.status === statusFilter;

      return (
        matchesSearch &&
        matchesRating &&
        matchesStatus
      );
    });
  }, [reviews, search, ratingFilter, statusFilter]);

  const totalReviews = reviews.length;

  const approvedReviews = reviews.filter(
    (review) => review.status === "Approved"
  ).length;

  const pendingReviews = reviews.filter(
    (review) => review.status === "Pending"
  ).length;

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (sum, review) => sum + review.rating,
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  const updateStatus = (id, status) => {
    const updatedReviews = reviews.map((review) =>
      review.id === id
        ? {
            ...review,
            status,
          }
        : review
    );

    saveReviews(updatedReviews);

    const updatedReview = updatedReviews.find(
      (review) => review.id === id
    );

    if (selectedReview?.id === id) {
      setSelectedReview(updatedReview);
    }
  };

  const deleteReview = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) {
      return;
    }

    const updatedReviews = reviews.filter(
      (review) => review.id !== id
    );

    saveReviews(updatedReviews);
    setSelectedReview(null);
  };

  const renderStars = (rating) => {
    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={
              star <= rating
                ? "star filled"
                : "star"
            }
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="reviews-page">

      {/* Header */}
      <div className="reviews-header">
        <div>
          <h1>Reviews</h1>
          <p>
            Manage customer reviews and ratings.
          </p>
        </div>

        <button
          className="reviews-refresh-btn"
          onClick={() => window.location.reload()}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="reviews-stats">

        <div className="review-stat-card">
          <div className="review-stat-icon">
            ⭐
          </div>

          <div>
            <span>Total Reviews</span>
            <h2>{totalReviews}</h2>
          </div>
        </div>

        <div className="review-stat-card">
          <div className="review-stat-icon approved">
            ✓
          </div>

          <div>
            <span>Approved</span>
            <h2>{approvedReviews}</h2>
          </div>
        </div>

        <div className="review-stat-card">
          <div className="review-stat-icon pending">
            ⏳
          </div>

          <div>
            <span>Pending</span>
            <h2>{pendingReviews}</h2>
          </div>
        </div>

        <div className="review-stat-card">
          <div className="review-stat-icon rating">
            ★
          </div>

          <div>
            <span>Average Rating</span>
            <h2>{averageRating}</h2>
          </div>
        </div>

      </div>

      {/* Filters */}
      <div className="reviews-toolbar">

        <div className="reviews-search">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Search customer, product or review..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <select
          value={ratingFilter}
          onChange={(e) =>
            setRatingFilter(e.target.value)
          }
        >
          <option value="All">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="All">All Status</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
        </select>

      </div>

      {/* Review Table */}
      <div className="reviews-table-card">

        <div className="reviews-table-title">
          <div>
            <h3>Customer Reviews</h3>

            <p>
              {filteredReviews.length} reviews found
            </p>
          </div>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="reviews-empty">
            <div>⭐</div>

            <h3>No reviews found</h3>

            <p>
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="reviews-table-wrapper">

            <table className="reviews-table">

              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredReviews.map((review) => (
                  <tr key={review.id}>

                    <td>
                      <div className="review-customer">

                        <div className="review-avatar">
                          {review.customer.charAt(0)}
                        </div>

                        <div>
                          <strong>
                            {review.customer}
                          </strong>

                          <small>
                            {review.email}
                          </small>
                        </div>

                      </div>
                    </td>

                    <td>
                      <strong>
                        {review.product}
                      </strong>
                    </td>

                    <td>
                      {renderStars(review.rating)}
                    </td>

                    <td>
                      <div className="review-text">
                        {review.review}
                      </div>
                    </td>

                    <td>
                      {new Date(
                        review.date
                      ).toLocaleDateString("en-IN")}
                    </td>

                    <td>
                      <span
                        className={`review-status ${review.status.toLowerCase()}`}
                      >
                        {review.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="view-review-btn"
                        onClick={() =>
                          setSelectedReview(review)
                        }
                      >
                        View
                      </button>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* Review Modal */}
      {selectedReview && (
        <div
          className="review-modal-overlay"
          onClick={() =>
            setSelectedReview(null)
          }
        >
          <div
            className="review-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="review-modal-header">

              <div>
                <h2>Review Details</h2>
                <p>
                  Review #{selectedReview.id}
                </p>
              </div>

              <button
                className="review-close-btn"
                onClick={() =>
                  setSelectedReview(null)
                }
              >
                ×
              </button>

            </div>

            <div className="review-profile">

              <div className="large-review-avatar">
                {selectedReview.customer.charAt(0)}
              </div>

              <div>
                <h3>
                  {selectedReview.customer}
                </h3>

                <p>
                  {selectedReview.email}
                </p>
              </div>

            </div>

            <div className="review-detail-box">

              <span>Product</span>

              <strong>
                {selectedReview.product}
              </strong>

            </div>

            <div className="review-detail-box">

              <span>Rating</span>

              {renderStars(selectedReview.rating)}

            </div>

            <div className="review-detail-box">

              <span>Customer Review</span>

              <p className="full-review">
                {selectedReview.review}
              </p>

            </div>

            <div className="review-detail-box">

              <span>Status</span>

              <strong>
                {selectedReview.status}
              </strong>

            </div>

            <div className="review-modal-actions">

              {selectedReview.status !== "Approved" && (
                <button
                  className="approve-review-btn"
                  onClick={() =>
                    updateStatus(
                      selectedReview.id,
                      "Approved"
                    )
                  }
                >
                  ✓ Approve
                </button>
              )}

              {selectedReview.status === "Approved" && (
                <button
                  className="pending-review-btn"
                  onClick={() =>
                    updateStatus(
                      selectedReview.id,
                      "Pending"
                    )
                  }
                >
                  Mark Pending
                </button>
              )}

              <button
                className="delete-review-btn"
                onClick={() =>
                  deleteReview(selectedReview.id)
                }
              >
                Delete
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default AdminReviews;