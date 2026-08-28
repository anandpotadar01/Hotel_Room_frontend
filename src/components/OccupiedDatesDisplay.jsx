import React, { useState, useEffect, useContext } from "react";
import "./OccupiedDatesDisplay.css";
import { UserContext } from "./UserContext";

const OccupiedDatesDisplay = () => {
  const [groupedDates, setGroupedDates] = useState({});
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    console.log(user);
    if (!user) {
      return;
    }

    const baseURL = "https://deployed-hotel-room-1.onrender.com";
    async function fetchDates() {
      try {
        const response = await fetch(`${baseURL}/occupied-dates/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Fetch failed");
        }
        console.log(user.token);
        const data = await response.json(); // Parse the JSON response
        console.log(data);
        return data;
      } catch (error) {
        console.error("Error during fetching dates:", error);
        return []; // Return an empty array if fetch fails
      }
    }

    async function processAndSetDates() {
      const fetchedDates = await fetchDates(); // Wait for fetchDates to resolve

      // Process dates into grouped ranges
      const processDates = (dates) => {
        // Extract only the date strings
        const dateStrings = dates.map((entry) => entry.date);

        // Ensure dates are sorted chronologically
        const sortedDates = dateStrings.sort();

        const ranges = {};
        let currentMonth = "";
        let currentRange = null;

        sortedDates.forEach((dateStr) => {
          const date = new Date(`${dateStr}T00:00:00`); 

          if (isNaN(date.getTime())) {
            console.error("Invalid date:", dateStr);
            return; 
          }

          const month = date.toLocaleString("en-IN", {
            month: "long",
            year: "numeric",
          });

          if (month !== currentMonth) {
          
            if (currentRange) {
              if (!ranges[currentMonth]) ranges[currentMonth] = [];
              ranges[currentMonth].push(currentRange);
            }
            currentMonth = month;
            currentRange = { startDate: dateStr, endDate: dateStr };
          } else {
          
            const prevDate = new Date(`${currentRange.endDate}T00:00:00`);
            prevDate.setDate(prevDate.getDate() + 1);

            if (
              date.toISOString().split("T")[0] ===
              prevDate.toISOString().split("T")[0]
            ) {

              currentRange.endDate = dateStr;
            } else {
           
              if (!ranges[currentMonth]) ranges[currentMonth] = [];
              ranges[currentMonth].push(currentRange);
              currentRange = { startDate: dateStr, endDate: dateStr };
            }
          }
        });

        
        if (currentRange) {
          if (!ranges[currentMonth]) ranges[currentMonth] = [];
          ranges[currentMonth].push(currentRange);
        }

        return ranges;
      };

      setGroupedDates(processDates(fetchedDates));
    }

    processAndSetDates(); 
  }, [user]);

  return (
    <div className="occupied-dates-container">
      {Object.keys(groupedDates).map((month) => (
        <div key={month} className="month-section">
          <h2 className="month-title">{month}</h2>
          <div className="date-cards">
            {groupedDates[month].map((range, index) => (
              <div key={index} className="date-card">
                <p className="date-range">
                  {new Date(range.startDate).toLocaleDateString("en-IN")} -{" "}
                  {new Date(range.endDate).toLocaleDateString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OccupiedDatesDisplay;