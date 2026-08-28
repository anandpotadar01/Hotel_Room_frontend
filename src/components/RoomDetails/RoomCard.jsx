import React, { useContext } from "react";
import RoomImageSlider from "./RoomImageSlider";
import RoomInfo from "./RoomInfo";

import "./RoomDetails.css";
import { UserContext } from "../UserContext";
import { redirect, useNavigate } from "react-router-dom";

// Formats a Date as YYYY-MM-DD using LOCAL time (avoids toISOString's UTC shift)
const formatDateYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const RoomCard = ({ room, selectedDateRange, onBookingSuccess }) => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const handleBooking = async (roomId, userId, selectedDateRange) => {
    if (!user) {
      return navigate("/auth");
    }
    console.log(user.token);
    const baseURL = "https://deployed-hotel-room-1.onrender.com";
    const roomUrl = `${baseURL}/rooms/${roomId}/`;
    const userUrl = `${baseURL}/users/${userId}/`;

    if (selectedDateRange.startDate && !selectedDateRange.endDate) {
      selectedDateRange.endDate = selectedDateRange.startDate;
    }
    for (
      let currentDate = new Date(selectedDateRange.startDate);
      currentDate <= new Date(selectedDateRange.endDate);
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      try {
        const response = await fetch(`${baseURL}/occupied-dates/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${user.token}`,
          },
          body: JSON.stringify({
            room: roomUrl, // Full URL, e.g., /rooms/1/
            user: userUrl, // Full URL, e.g., /users/2/
            date:formatDateYYYYMMDD(currentDate)
          }),
        });
        console.log(user);
        console.log(response);
        console.log(
          roomUrl,
          userUrl,
          currentDate
        ); // Format date as YYYY-MM-DD)
        if (!response.ok) {
          throw new Error("Booking failed");
        }
        const data = await response.json(); // Parse the JSON response
        onBookingSuccess();
        console.log("Booking successful:", data);
      } catch (error) {
        console.error("Error during booking:", error);
      }
    }
  };
  return (
    <div className="room-card">
      <RoomImageSlider images={room.images} />
      <RoomInfo room={room} />
      {selectedDateRange ? (
        <button
          className="book-room-button"
          onClick={() =>
            handleBooking(room.id, user.user.id, selectedDateRange)
          }
          disabled={!selectedDateRange.startDate}
        >
          Book Room
        </button>
      ) : null}
    </div>
  );
};

export default RoomCard;