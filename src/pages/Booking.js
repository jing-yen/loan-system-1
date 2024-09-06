import React from 'react';

function OutlookBooking() {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <iframe
        src="https://outlook.office365.com/book/InnovationDesignHubMediaRoom@nusu.onmicrosoft.com"
        title="Innovation Design Hub Media Room Booking"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        allowFullScreen
      />
    </div>
  );
}

export default OutlookBooking;