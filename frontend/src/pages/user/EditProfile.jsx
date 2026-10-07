import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserNavbar from "../../components/common/UserNavbar";
import "./EditProfile.css";

const EditProfile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
  });

  useEffect(() => {
    const savedUser =
      JSON.parse(localStorage.getItem("user") || "null") ||
      JSON.parse(
        localStorage.getItem("registeredUser") || "null"
      );

    if (savedUser) {
      setFormData({
        name: savedUser.name || "",
        email: savedUser.email || "",
        mobile: savedUser.mobile || "",
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!formData.email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (!formData.mobile.trim()) {
      alert("Please enter your mobile number.");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    const updatedUser = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      mobile: formData.mobile.trim(),
    };

    // Update logged-in user
    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    // Also update registered user if it exists
    const registeredUser = JSON.parse(
      localStorage.getItem("registeredUser") || "null"
    );

    if (registeredUser) {
      localStorage.setItem(
        "registeredUser",
        JSON.stringify({
          ...registeredUser,
          ...updatedUser,
        })
      );
    }

    window.dispatchEvent(new Event("userUpdated"));

    alert("Profile updated successfully!");

    navigate("/account");
  };

  return (
    <>
      <UserNavbar />

      <main className="edit-profile-page">

        {/* HEADER */}

        <section className="edit-profile-header">

          <div>
            <span className="edit-profile-label">
              ACCOUNT SETTINGS
            </span>

            <h1>Edit Profile</h1>

            <p>
              Update your personal information and keep
              your account details up to date.
            </p>
          </div>

          <Link
            to="/account"
            className="back-account-btn"
          >
            ← Back to Account
          </Link>

        </section>

        {/* CONTENT */}

        <div className="edit-profile-container">

          <div className="edit-profile-card">

            {/* PROFILE PREVIEW */}

            <div className="edit-profile-preview">

              <div className="edit-avatar">
                {formData.name
                  ? formData.name
                      .charAt(0)
                      .toUpperCase()
                  : "U"}
              </div>

              <div>
                <span>
                  PROFILE
                </span>

                <h2>
                  {formData.name || "Your Name"}
                </h2>

                <p>
                  {formData.email ||
                    "your@email.com"}
                </p>
              </div>

            </div>

            {/* FORM */}

            <form
              className="profile-form"
              onSubmit={handleSubmit}
            >

              <div className="form-section-title">
                <span>
                  PERSONAL INFORMATION
                </span>

                <h2>
                  Your Details
                </h2>
              </div>

              {/* NAME */}

              <div className="form-group">

                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />

              </div>

              {/* EMAIL */}

              <div className="form-group">

                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />

              </div>

              {/* MOBILE */}

              <div className="form-group">

                <label htmlFor="mobile">
                  Mobile Number
                </label>

                <input
                  id="mobile"
                  type="tel"
                  name="mobile"
                  placeholder="Enter 10-digit mobile number"
                  maxLength="10"
                  value={formData.mobile}
                  onChange={handleChange}
                />

              </div>

              {/* ACTIONS */}

              <div className="profile-form-actions">

                <Link
                  to="/account"
                  className="cancel-profile-btn"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="save-profile-btn"
                >
                  Save Changes
                </button>

              </div>

            </form>

          </div>

          {/* SIDE INFO */}

          <aside className="profile-help-card">

            <div className="help-icon">
              🔐
            </div>

            <h3>
              Keep Your Account Updated
            </h3>

            <p>
              Make sure your name, email and mobile
              number are correct so your account
              information stays up to date.
            </p>

            <div className="help-list">

              <div>
                <span>✓</span>
                <p>Use your real name</p>
              </div>

              <div>
                <span>✓</span>
                <p>Keep your email accessible</p>
              </div>

              <div>
                <span>✓</span>
                <p>Use a valid mobile number</p>
              </div>

            </div>

          </aside>

        </div>

      </main>
    </>
  );
};

export default EditProfile;